#!/usr/bin/env python3
"""
check-external-links.py — External link checker for the FusionAuth docs site.

No external dependencies — uses only the Python standard library.

Requests to the same domain are rate-limited and concurrency-capped; requests
to different domains run fully in parallel via a thread pool.

The script locates the astro/src root from its own path, so it works from any
working directory — no need to cd anywhere before running.

Usage:
    ./src/scripts/check-external-links.py [options] [FILE ...]

If FILE arguments are given, only those files are checked (--root scanning
and --include-source are ignored). Useful for CI checks on changed files only.

A set of sensible default exclusions is built in (see _DEFAULT_EXCLUDE_DEST).
Any --exclude-dest patterns you pass are added on top of the defaults.

Run with --help for the full option list.
"""

import argparse
import http.client
import re
import ssl
import sys
import threading
import time
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urldefrag, urlparse

# ── URL extraction ─────────────────────────────────────────────────────────────

# Matches:
#   [label](https://url)                — Markdown link
#   href="https://url"  href='…'         — HTML / JSX attribute
#   any-prop="https://url"               — catch-all for component props like kickstartUri
_LINK_RE = re.compile(
    r"""
    \[(?:[^\]]*)\]\((https?://[^)\s]+)\)           # [label](url)
    |
    (?:[\w-]+)=(?:"(https?://[^"\s]+)"|'(https?://[^'\s]+)')   # attr="url" or attr='url'
    """,
    re.VERBOSE,
)

# Trailing punctuation that commonly leaks into extracted URLs
_TRAILING_JUNK = re.compile(r"[.,;:!?)\]>]+$")


def extract_links(path: Path, exclude_dest: list) -> list:
    """Return [(url, lineno), ...] for every external link in the file."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []

    results = []
    seen = set()

    for lineno, line in enumerate(text.splitlines(), 1):
        for m in _LINK_RE.finditer(line):
            raw = m.group(1) or m.group(2) or m.group(3)
            if not raw:
                continue
            url = _TRAILING_JUNK.sub("", raw)
            url, _ = urldefrag(url)
            if not url or not url.startswith(("http://", "https://")):
                continue
            key = (lineno, url)
            if key in seen:
                continue
            seen.add(key)
            if any(p.search(url) for p in exclude_dest):
                continue
            results.append((url, lineno))

    return results


# ── HTTP checking ──────────────────────────────────────────────────────────────

_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

# Status codes that never indicate a broken link.
# 401/403 — resource exists, access restricted.
# 405     — HEAD not allowed; handled by GET retry below.
# 429     — rate limited; handled by Retry-After below.
# 999     — LinkedIn's "bot blocked" non-standard code.
_ALWAYS_OK = frozenset({401, 403, 405, 429, 999})

# Hostnames that are intentionally unreachable — used in tutorials so developers
# can click through to a locally-running service.  Exempt by default; opt out
# with --check-localhost.
_LOCAL_HOSTS = frozenset({"localhost", "127.0.0.1", "0.0.0.0", "::1"})

# Default destination-URL exclusions applied on every run.
# Any --exclude-dest args are appended to this list, not replacing it.
_DEFAULT_EXCLUDE_DEST = [
    r"example\.com",                # placeholder domain used in examples
    r"(?i)your-[a-z]",              # placeholders like YOUR-CLUSTER, your-tenant-id
    r"<%.*%>",                      # template syntax like <%=variable%>
    r"fusionauth\.io",              # own site — checked by other means
    r"STATUS_CODE",                 # literal string used as a placeholder in docs
    r"0\.0\.0\.0",                  # catch-all address in local-dev examples
    r"^https?://192\.168\.",        # private IP range
    r"^https?://10\.",              # private IP range
    r"^https?://[^./]+:\d+",       # docker-compose / internal hostnames (no dots before port)
    r"schemas\.xmlsoap\.org",       # blocks bots; site is fine
    r"schemas\.microsoft\.com",     # blocks bots; site is fine
    r"twgtl\.com",                  # known-broken third-party, intentionally linked
    r"some-third-party-server\.com",  # docs placeholder
    r"developers\.facebook\.com",   # blocks crawlers aggressively
    r"nvlpubs\.nist\.gov",          # blocks GitHub Actions IPs; works in browsers
    r"support\.google\.com",        # blocks GitHub Actions IPs; works in browsers
    r"spec\.modelcontextprotocol\.io",  # SSL handshake fails in CI; works in browsers
    r"cloud\.es\.io",               # Elastic Cloud cluster hostnames (customer placeholders)
    # ── Additional bot/crawler-hostile or placeholder domains ─────────────────
    r"googletagmanager\.com",       # GTM JS snippet URL; refuses non-browser connections
    r"remote\.url",                 # component example placeholder (RemoteValue)
    r"some\.address",               # component example placeholder (RemoteValue)
    r"application\.com",            # example domain used in SAML/SSO tutorials
    r"piedpiper\.",                  # fictional Silicon Valley company used in tutorials
    r"hooli\.",                      # fictional Silicon Valley company used in tutorials
    r"\.local(:|/|$)",              # .local TLD (local-dev hostnames like fusionauth.local)
    r"web\.archive\.org",           # Wayback Machine returns non-standard codes to crawlers
    r"^https?://(www\.)?facebook\.com(/|$)",  # Facebook main site blocks crawlers (HTTP 400)
    r"investopedia\.com",           # returns HTTP 402 to crawlers
    r"list-manage\.com",            # Mailchimp form-action URLs require POST, not GET
    r"accounts\.google\.com",       # Google auth/SAML endpoints require auth context
    r"\$\{",                         # URL contains a template variable like ${verificationId}
    r"hubspotusercontent\d*\.net",   # HubSpot CDN with TLS 1.0 (deprecated protocol)
    r"readymag\.com",               # site uses TLS 1.0 (deprecated protocol)
    r"docs\.alfresco\.com",         # TLS handshake incompatibility with Python urllib
    r"qos\.ch",                     # logback/slf4j project sites; time out for non-browser clients
    r"llms-txt\.org",               # llms.txt standard site; times out for crawlers
    r"gdpr\.eu",                    # GDPR reference site; times out for crawlers
    r"csrc\.nist\.gov",             # NIST CSRC publication portal; blocks crawlers
    r"website-files\.com",          # Webflow CDN; srcset attribute values trip the extractor
    r"rbi\.org\.in",                # Reserve Bank of India; returns HTTP 418 to crawlers
    r"globenewswire\.com",          # press release service; times out for non-browser clients
    r"www\.nuget\.org",             # NuGet.org blocks crawlers; framework packages return 404
    r"developer\.apple\.com",       # Apple docs block crawlers; method-signature URLs break extractors
    r"nvd\.nist\.gov",              # NIST blocks crawlers
    r"hacktoberfest\.com",          # registration links break in off-season
    r"Permit\.io",                  # times out regularly
]


def _is_local_url(url: str) -> bool:
    """True for loopback/local-dev addresses that are intentional in tutorials."""
    try:
        host = urlparse(url).netloc.split(":")[0].lower()
    except Exception:
        return False
    return host in _LOCAL_HOSTS


# Connection-level failure messages that are inherently noisy in CI environments
# (bot protection, transient DNS, slow servers).  They become warnings, not errors,
# unless --timeout-is-error is passed.
_TRANSIENT_MARKERS = (
    "timeout",
    "connection closed by server",
    "Temporary failure in name resolution",
    "Network is unreachable",
    "Connection reset by peer",
)


def _is_transient_error(error: str) -> bool:
    """True for connection-level failures that are CI-noise candidates."""
    return any(m in error for m in _TRANSIENT_MARKERS)


def _fetch(url: str, timeout: int, ok_statuses: frozenset,
           method: str = "HEAD", retries: int = 2, timeout_retries: int = 1):
    """Make one HTTP request; return (status_int, error_str_or_None)."""
    req = urllib.request.Request(
        url, method=method,
        headers={"User-Agent": _UA, "Accept": "text/html,*/*;q=0.8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            status = resp.status
            if status in ok_statuses or 200 <= status < 400:
                return (status, None)
            return (status, f"HTTP {status}")

    except urllib.error.HTTPError as exc:
        status = exc.code
        if status == 429 and retries > 0:
            wait = min(int(exc.headers.get("Retry-After", "5")), 30)
            time.sleep(wait)
            return _fetch(url, timeout, ok_statuses, method, retries - 1)
        if status == 405 and method == "HEAD":
            return _fetch(url, timeout, ok_statuses, "GET", retries)
        # Python's HTTPRedirectHandler handles 301-303 and 307 but not 308.
        # Follow 308 (and any unhandled 3xx) manually so we reach the final URL.
        if status in (301, 302, 303, 307, 308) and retries > 0:
            location = exc.headers.get("Location", "")
            if location:
                if not location.startswith(("http://", "https://")):
                    from urllib.parse import urljoin
                    location = urljoin(url, location)
                return _fetch(location, timeout, ok_statuses, "GET", retries - 1)
        # If retries are exhausted on a redirect, or there's no Location header,
        # the resource still exists — it's just redirecting.  Not a broken link.
        if 300 <= status < 400:
            return (status, None)
        if status in ok_statuses:
            return (status, None)
        return (status, f"HTTP {status}")

    except urllib.error.URLError as exc:
        reason = str(getattr(exc, "reason", exc))
        if "timed out" in reason.lower() or isinstance(getattr(exc, "reason", None), TimeoutError):
            if timeout_retries > 0:
                time.sleep(3)
                return _fetch(url, timeout, ok_statuses, method, retries, timeout_retries - 1)
            return (0, "timeout")
        return (0, f"connection error: {reason[:60]}")

    except http.client.RemoteDisconnected:
        if method == "HEAD":
            return _fetch(url, timeout, ok_statuses, "GET", retries)
        return (0, "connection closed by server")

    except http.client.HTTPException as exc:
        return (0, f"error: {str(exc)[:60]}")

    except (TimeoutError, OSError) as exc:
        if isinstance(exc, TimeoutError):
            if timeout_retries > 0:
                time.sleep(3)
                return _fetch(url, timeout, ok_statuses, method, retries, timeout_retries - 1)
            return (0, "timeout")
        return (0, f"error: {str(exc)[:60]}")

    except Exception as exc:
        return (0, f"error: {str(exc)[:60]}")


# Per-domain rate-limiting state, shared across all threads.
_domain_init_lock = threading.Lock()
_domain_sems: dict = {}
_domain_locks: dict = {}
_domain_last: dict = {}


def check_url(url: str, global_sem: threading.BoundedSemaphore,
              per_domain_concurrency: int, rate_limit_s: float,
              timeout: int, ok_statuses: frozenset):
    """
    Rate-limited, per-domain-concurrent URL check.

    global_sem   — caps total in-flight requests across all domains.
    domain_sems  — caps concurrent requests to a single domain.
    domain_locks — serializes the timing check/update per domain.
    rate_limit_s — minimum gap between the start of successive requests
                   to the same domain.
    """
    domain = urlparse(url).netloc

    with _domain_init_lock:
        if domain not in _domain_sems:
            _domain_sems[domain] = threading.BoundedSemaphore(per_domain_concurrency)
            _domain_locks[domain] = threading.Lock()
            _domain_last[domain] = 0.0

    with global_sem:
        with _domain_sems[domain]:
            with _domain_locks[domain]:
                now = time.monotonic()
                gap = rate_limit_s - (now - _domain_last[domain])
                if gap > 0:
                    time.sleep(gap)
                _domain_last[domain] = time.monotonic()
            return _fetch(url, timeout, ok_statuses)


# ── File scanning ──────────────────────────────────────────────────────────────

def scan_files(root: Path, extensions: set,
               include_src: list, exclude_src: list, exclude_dst: list) -> dict:
    """
    Walk root, return {path: [(url, lineno), ...]} for files that have links.

    include_src: if non-empty, only files whose path matches at least one pattern.
    exclude_src: files matching any pattern are always skipped.
    """
    results = {}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in extensions:
            continue
        try:
            rel_str = str(path.relative_to(root.parent))
        except ValueError:
            rel_str = str(path)
        if include_src and not any(p.search(rel_str) for p in include_src):
            continue
        if any(p.search(rel_str) for p in exclude_src):
            continue
        links = extract_links(path, exclude_dst)
        if links:
            results[path] = links
    return results


# ── Main ──────────────────────────────────────────────────────────────────────

def run(args) -> int:
    exclude_dst = [re.compile(p) for p in args.exclude_dest]

    # ── Collect files to check ────────────────────────────────────────────────
    if args.files:
        # Explicit file list — bypass root scanning entirely.
        file_links = {}
        for f in args.files:
            path = Path(f).resolve()
            if not path.is_file():
                print(f"warning: file not found: {f}", file=sys.stderr)
                continue
            links = extract_links(path, exclude_dst)
            if links:
                file_links[path] = links
        display_root = Path.cwd()
    else:
        root = Path(args.root).resolve() if args.root else (
            Path(__file__).resolve().parent.parent.parent / "astro" / "src"
        )
        if not root.is_dir():
            sys.exit(f"error: --root {args.root!r} is not a directory")

        extensions = {
            (e if e.startswith(".") else f".{e}") for e in args.ext.split(",")
        }
        include_src = [re.compile(p) for p in args.include_source]
        exclude_src = [re.compile(p) for p in args.exclude_source]

        print(f"Scanning {root} …")
        file_links = scan_files(root, extensions, include_src, exclude_src, exclude_dst)
        display_root = root.parent

    # ── Summarise what was found ──────────────────────────────────────────────
    occurrences = [
        (path, url, lineno)
        for path, links in file_links.items()
        for url, lineno in links
    ]

    if not args.check_localhost:
        occurrences = [
            (p, u, l) for p, u, l in occurrences if not _is_local_url(u)
        ]

    unique_urls = sorted({url for _, url, _ in occurrences})

    print(
        f"Found {len(occurrences)} link occurrence(s) "
        f"({len(unique_urls)} unique) across {len(file_links)} file(s)."
    )
    if not unique_urls:
        print("No external links to check.")
        return 0

    # ── Check URLs in parallel ────────────────────────────────────────────────
    ok_statuses = _ALWAYS_OK | frozenset(args.ignore_status)
    global_sem = threading.BoundedSemaphore(args.workers)
    rate_limit_s = args.rate_limit / 1000.0

    done_count = [0]
    done_lock = threading.Lock()

    print(f"Checking {len(unique_urls)} URL(s) …")
    start = time.monotonic()

    def check_and_track(url):
        result = check_url(url, global_sem, args.concurrency, rate_limit_s, args.timeout, ok_statuses)
        with done_lock:
            done_count[0] += 1
            d, n = done_count[0], len(unique_urls)
            if d % 25 == 0 or d == n:
                print(f"  {d}/{n} ({d * 100 // n}%) …", end="\r", flush=True)
        return result

    url_status: dict = {}
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(check_and_track, u): u for u in unique_urls}
        for future in as_completed(futures):
            url_status[futures[future]] = future.result()

    elapsed = time.monotonic() - start
    n = len(unique_urls)
    print(f"  {n}/{n} (100%) — done in {elapsed:.1f}s{' ' * 20}")

    # ── Collate broken links by file, split errors vs warnings ───────────────
    errors_by_file: dict = defaultdict(list)
    warnings_by_file: dict = defaultdict(list)
    for path, url, lineno in occurrences:
        _status, error = url_status.get(url, (0, "not checked"))
        if error is None:
            continue
        if _is_transient_error(error) and not args.timeout_is_error:
            warnings_by_file[path].append((lineno, url, error))
        else:
            errors_by_file[path].append((lineno, url, error))

    for d in (errors_by_file, warnings_by_file):
        for path in d:
            d[path].sort()

    # ── Report ────────────────────────────────────────────────────────────────
    if not errors_by_file and not warnings_by_file:
        print("\n✓  No broken external links found.")
        return 0

    def _display(path):
        try:
            return path.relative_to(display_root)
        except ValueError:
            return path

    if errors_by_file:
        total_errors = sum(len(v) for v in errors_by_file.values())
        print(f"\n✗  {total_errors} broken link(s) in {len(errors_by_file)} file(s):\n")
        for path in sorted(errors_by_file):
            print(f"{_display(path)}")
            for lineno, url, error in errors_by_file[path]:
                print(f"  line {lineno:<5}  {error:<35}  {url}")
            print()

    if warnings_by_file:
        total_warnings = sum(len(v) for v in warnings_by_file.values())
        print(f"\n⚠  {total_warnings} unverified link(s) in {len(warnings_by_file)} file(s)"
              f" (timeout/connection — may be bot protection or a flaky network):\n")
        for path in sorted(warnings_by_file):
            print(f"{_display(path)}")
            for lineno, url, error in warnings_by_file[path]:
                print(f"  line {lineno:<5}  {error:<35}  {url}")
            print()

    print("─" * 76)
    parts = []
    if errors_by_file:
        parts.append(f"{sum(len(v) for v in errors_by_file.values())} error(s)")
    if warnings_by_file:
        parts.append(f"{sum(len(v) for v in warnings_by_file.values())} warning(s)")
    print("  ".join(parts))
    if warnings_by_file and not errors_by_file:
        print("Pass --timeout-is-error to treat warnings as failures.")

    return 1 if errors_by_file else 0


def main():
    p = argparse.ArgumentParser(
        prog="check-external-links.py",
        description=(
            "Check all external HTTP(S) links in Astro source files. "
            "No external dependencies required."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  # full site scan — works from any directory, root is found from script location
  ./src/scripts/check-external-links.py

  # check specific files (e.g. from a PR diff) — skips --root scanning
  ./src/scripts/check-external-links.py \\
      astro/src/content/docs/foo.mdx astro/src/content/blog/bar.md

  # only scan files matching a regex pattern
  ./src/scripts/check-external-links.py --include-source '/blog/'

  # add an extra exclusion on top of the built-in defaults
  ./src/scripts/check-external-links.py --exclude-dest 'my-placeholder\\.com'

  # faster: more workers, shorter rate-limit window
  ./src/scripts/check-external-links.py \\
      --workers 40 --concurrency 5 --rate-limit 200
""",
    )

    p.add_argument(
        "files", nargs="*", metavar="FILE",
        help=(
            "Explicit file paths to check. When provided, --root and "
            "--include-source are ignored."
        ),
    )
    p.add_argument(
        "--root", metavar="DIR", default=None,
        help="Root directory to scan (default: <repo>/astro/src). Ignored when FILE args are given.",
    )
    p.add_argument(
        "--ext", metavar="LIST", default=".md,.mdx,.astro",
        help="Comma-separated file extensions to scan (default: %(default)s). Ignored when FILE args are given.",
    )
    p.add_argument(
        "--include-source", metavar="REGEX", action="append", default=[],
        help=(
            "Only process source files whose path matches this regex (repeatable). "
            "Ignored when FILE args are given."
        ),
    )
    p.add_argument(
        "--exclude-source", metavar="REGEX", action="append", default=[],
        help="Skip source files whose path matches this regex (repeatable).",
    )
    p.add_argument(
        "--exclude-dest", metavar="REGEX", action="append", default=list(_DEFAULT_EXCLUDE_DEST),
        help=(
            "Skip destination URLs matching this regex (repeatable). "
            "Added to the built-in default exclusion list, not replacing it."
        ),
    )
    p.add_argument(
        "--workers", metavar="N", type=int, default=20,
        help="Max total concurrent HTTP requests (default: %(default)s).",
    )
    p.add_argument(
        "--concurrency", metavar="N", type=int, default=3,
        help="Max concurrent requests per domain (default: %(default)s).",
    )
    p.add_argument(
        "--rate-limit", metavar="MS", type=int, default=500,
        help="Min milliseconds between requests to the same domain (default: %(default)s).",
    )
    p.add_argument(
        "--timeout", metavar="S", type=int, default=15,
        help="Per-request timeout in seconds (default: %(default)s).",
    )
    p.add_argument(
        "--ignore-status", metavar="CODE", type=int, action="append", default=[],
        help="Treat this HTTP status code as OK (repeatable).",
    )
    p.add_argument(
        "--check-localhost",
        action="store_true",
        help=(
            "Check localhost/127.0.0.1/0.0.0.0 URLs. "
            "Default: exempt them, since they appear intentionally in local-dev tutorials."
        ),
    )
    p.add_argument(
        "-v", "--verbose", action="store_true",
        help="Print every checked URL and its result.",
    )
    p.add_argument(
        "--timeout-is-error",
        action="store_true",
        help=(
            "Treat timeouts and connection errors as failures (exit 1). "
            "By default they are reported as warnings only."
        ),
    )

    args = p.parse_args()
    sys.exit(run(args))


if __name__ == "__main__":
    main()
