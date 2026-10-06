#!/usr/bin/env bash
# Called by GitHub Actions via SSH.
# Args: <pr-number> <sha>
#
# Stdout: exactly two lines consumed by the Actions workflow:
#   PORT:<number>
#   URL:<http://...>
#
# Stderr: all build logs (visible in the Actions run log).

set -euo pipefail

# own process group, so a newer build for the same slot can kill this one and all its children
if [[ "${PREVIEW_PGRP:-}" != 1 ]]; then
  PREVIEW_PGRP=1 exec setsid -w "$0" "$@"
fi

PR="$1"
SHA="$2"

PREVIEW_DIR=/opt/preview
REPO_DIR="$PREVIEW_DIR/repo"
SLOTS_DIR="$PREVIEW_DIR/slots"
BUILDS_DIR="$PREVIEW_DIR/builds"
CLAIMS_DIR="$PREVIEW_DIR/claims"
LOCKS_DIR="$PREVIEW_DIR/locks"
NM_STORE="$PREVIEW_DIR/node_modules"
NUM_SLOTS=25
BASE_PORT=4000
mkdir -p "$CLAIMS_DIR" "$LOCKS_DIR" "$NM_STORE"

# Derive HTTPS URL via sslip.io.  setup.sh caches the domain so we don't hit
# IMDSv2 on every build; fall back to a live lookup if the cache is missing.
_CACHED_DOMAIN="$PREVIEW_DIR/.sslip-domain"
if [[ -f "$_CACHED_DOMAIN" ]]; then
  SSLIP_DOMAIN=$(cat "$_CACHED_DOMAIN")
else
  _imds_token=$(curl -sf --connect-timeout 2 -X PUT \
    "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
  PUBLIC_IP=$(curl -sf --connect-timeout 2 \
    -H "X-aws-ec2-metadata-token: ${_imds_token}" \
    "http://169.254.169.254/latest/meta-data/public-ipv4" 2>/dev/null \
    || curl -sf --connect-timeout 5 https://checkip.amazonaws.com | tr -d '[:space:]')
  SSLIP_DOMAIN=$(echo "$PUBLIC_IP" | tr '.' '-').sslip.io
fi

log() { echo "[preview] $*" >&2; }

# ── Slot management ──────────────────────────────────────────────────────────
# claims/NN holds the PR number that owns slot NN.  It lives outside the worktree
# so a slot can be claimed before its worktree exists, and it is written as soon
# as the slot is picked so two new PRs can never pick the same free slot.

# Returns the slot number (without zero-padding) already assigned to this PR,
# or exits with status 1 if none.
find_slot() {
  for i in $(seq 1 $NUM_SLOTS); do
    p=$(printf "%02d" "$i")
    if [[ "$(cat "$CLAIMS_DIR/$p" 2>/dev/null)" == "$PR" ]]; then
      echo "$i"; return 0
    fi
  done
  return 1
}

# Returns the number of the first free slot, or evicts the least recently built.
alloc_slot() {
  for i in $(seq 1 $NUM_SLOTS); do
    p=$(printf "%02d" "$i")
    if [[ ! -f "$CLAIMS_DIR/$p" ]]; then
      echo "$i"; return 0
    fi
  done
  oldest=$(ls -tr "$CLAIMS_DIR" | head -1)
  log "All slots full. Evicting slot $oldest (was PR #$(cat "$CLAIMS_DIR/$oldest"))."
  echo "$((10#$oldest))"
}

exec 7>"$LOCKS_DIR/slots.lock"
flock 7

# migrate claims from the old in-worktree .slot-pr markers
for i in $(seq 1 $NUM_SLOTS); do
  p=$(printf "%02d" "$i")
  if [[ -f "$SLOTS_DIR/$p/.slot-pr" ]]; then
    [[ -f "$CLAIMS_DIR/$p" ]] || cp -p "$SLOTS_DIR/$p/.slot-pr" "$CLAIMS_DIR/$p"
    rm -f "$SLOTS_DIR/$p/.slot-pr"
  fi
done

SLOT=$(find_slot || alloc_slot)
PADDED=$(printf "%02d" "$SLOT")
PORT=$((BASE_PORT + SLOT))
SLOT_DIR="$SLOTS_DIR/$PADDED"
BUILD_DIR="$BUILDS_DIR/$PADDED"
# rewriting also bumps the mtime that eviction orders by
echo "$PR" > "$CLAIMS_DIR/$PADDED"

# One build per slot.  GitHub cancels the Actions job on a new push, but that only
# drops the SSH connection, and the old build can keep running on this host.  Two
# builds sharing a worktree delete each other's dist/ (Cannot find module
# .../dist/.prerender/chunks/...), so the newest build kills whatever came before.
# Recording our pid under the slots lock means the latest arrival always wins,
# whether the earlier build is running or still waiting for the slot.
SLOT_PID_FILE="$LOCKS_DIR/slot-$PADDED.pid"
old_pid=$(cat "$SLOT_PID_FILE" 2>/dev/null || true)
if [[ -n "$old_pid" ]] && grep -qs build-preview "/proc/$old_pid/cmdline"; then
  log "Stopping earlier build in slot $PADDED (pid $old_pid) …"
  kill -TERM -- "-$old_pid" 2>/dev/null || true
fi
echo "$$" > "$SLOT_PID_FILE"

flock -u 7
exec 7>&-

exec 8>"$LOCKS_DIR/slot-$PADDED.lock"
flock 8

log "Using slot $PADDED (port $PORT) for PR #$PR @ $SHA"

# ── Fetch the PR ref and main ────────────────────────────────────────────────
# refs/pull/N/head is created by GitHub for every PR, including forks.
# Fetch main alongside the PR ref so origin/main:astro/package.json is current
# when the deps step below picks main's node_modules tree.
log "Fetching refs/pull/$PR/head and main …"
git -C "$REPO_DIR" fetch origin \
  "refs/pull/${PR}/head:refs/preview/pr-${PR}" main --force >&2

# ── Set up (or refresh) the worktree ─────────────────────────────────────────
if git -C "$REPO_DIR" worktree list --porcelain | grep -qF "worktree $SLOT_DIR"; then
  log "Updating worktree to PR #${PR} HEAD …"
  git -C "$SLOT_DIR" checkout --detach "refs/preview/pr-${PR}" >&2
  git -C "$SLOT_DIR" reset --hard "refs/preview/pr-${PR}" >&2
else
  log "Creating worktree for PR #${PR} …"
  git -C "$REPO_DIR" worktree add --detach "$SLOT_DIR" "refs/preview/pr-${PR}" >&2
fi
SLOT_SHA=$(git -C "$SLOT_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
log "Slot HEAD: $(git -C "$SLOT_DIR" log --oneline -1 2>&1)"
log "Expected SHA: ${SHA} | Got: ${SLOT_SHA}"
if [[ "$SLOT_SHA" != "$SHA" ]]; then
  log "WARNING: SHA mismatch — slot may be on wrong commit"
fi

# .content-cache: per-slot, NOT shared — different branches have different content
# and a shared cache causes one PR's compiled content to bleed into another's.
mkdir -p "$SLOT_DIR/astro/.content-cache"

# generated-code-snippets: pre-seed with a hard-linked copy from master so the
# hash check in generate-code-snippets.sh exits early when localcode/ is unchanged.
if [[ ! -d "$SLOT_DIR/astro/src/generated-code-snippets" ]]; then
  cp -al "$REPO_DIR/astro/src/generated-code-snippets" \
         "$SLOT_DIR/astro/src/generated-code-snippets" 2>/dev/null || true
fi

# Clear Astro's compiled-component cache so layout/component changes always take effect,
# and any half-written output from a build that got killed
rm -rf "$SLOT_DIR/astro/.astro" "$SLOT_DIR/astro/dist"

# ── deps ──────────────────────────────────────────────────────────────────────
# Main's dependencies get installed once per distinct package.json + lock, into
# node_modules/<hash>.  Its packages never change after it is marked complete,
# so slots keep building against it while a newer one installs alongside.  Build
# caches under its .cache/ (rendered mermaid diagrams) are content-keyed and
# written atomically, so every slot on that tree shares them safely.
#   - packages match main: symlink the slot to main's tree (no copy, no install)
#   - packages differ: copy main's tree into the slot, then npm install only
#     the difference; the slot keeps that tree until its packages change again
MAIN_PKG_HASH=$(
  { git -C "$REPO_DIR" show "origin/main:astro/package.json"
    git -C "$REPO_DIR" show "origin/main:astro/package-lock.json"
  } | sha256sum | cut -d' ' -f1
)
SLOT_PKG_HASH=$(
  { cat "$SLOT_DIR/astro/package.json"
    cat "$SLOT_DIR/astro/package-lock.json"
  } | sha256sum | cut -d' ' -f1
)
MAIN_NM="$NM_STORE/$MAIN_PKG_HASH"
SLOT_NM="$SLOT_DIR/astro/node_modules"
SLOT_NM_STAMP="$SLOT_NM/.preview-pkg-hash"

install_main_nm() {
  [[ -f "$MAIN_NM/.complete" ]] && return 0
  log "Installing main's dependencies into $MAIN_NM …"
  rm -rf "$MAIN_NM"
  mkdir -p "$MAIN_NM"
  git -C "$REPO_DIR" show "origin/main:astro/package.json" > "$MAIN_NM/package.json"
  git -C "$REPO_DIR" show "origin/main:astro/package-lock.json" > "$MAIN_NM/package-lock.json"
  npm ci --silent --no-audit --no-fund --prefix "$MAIN_NM" >&2
  touch "$MAIN_NM/.complete"
  prune_main_nm
}

# drop trees that are neither main's current one nor symlinked from a slot
prune_main_nm() {
  local in_use=" $MAIN_PKG_HASH " d target
  for d in "$SLOTS_DIR"/*/astro/node_modules; do
    target=$(readlink "$d" 2>/dev/null) || continue
    in_use+=" $(basename "$(dirname "$target")") "
  done
  for d in "$NM_STORE"/*; do
    [[ -d "$d" && "$in_use" != *" $(basename "$d") "* ]] || continue
    log "Removing unused dependency tree $d"
    rm -rf "$d"
  done
}

# install, prune, and the copy below all touch node_modules/<hash>, so they share one lock
exec 9>"$LOCKS_DIR/npm.lock"
flock 9
install_main_nm
if [[ "$MAIN_PKG_HASH" == "$SLOT_PKG_HASH" ]]; then
  rm -rf "$SLOT_NM"
  ln -s "$MAIN_NM/node_modules" "$SLOT_NM"
  flock -u 9
  log "Using main's node_modules (packages match main)."
elif [[ ! -L "$SLOT_NM" && "$(cat "$SLOT_NM_STAMP" 2>/dev/null)" == "$SLOT_PKG_HASH" ]]; then
  flock -u 9
  log "Reusing this slot's node_modules (packages unchanged since last build)."
else
  log "Packages differ from main, copying main's node_modules into the slot …"
  rm -rf "$SLOT_NM"
  cp -a "$MAIN_NM/node_modules" "$SLOT_NM"
  flock -u 9
  log "Installing changed packages …"
  npm install --silent --no-audit --no-fund --no-save --prefix "$SLOT_DIR/astro" >&2
  echo "$SLOT_PKG_HASH" > "$SLOT_NM_STAMP"
fi
exec 9>&-

# ── Build ─────────────────────────────────────────────────────────────────────
PREVIEW_URL="https://${PORT}.${SSLIP_DOMAIN}"
log "Building (SITE_URL=${PREVIEW_URL}) …"
cd "$SLOT_DIR/astro"
NODE_OPTIONS=--max_old_space_size=8192 \
  SITE_URL="${PREVIEW_URL}" \
  PROD=true \
  npm run build >&2

# ── Publish output ────────────────────────────────────────────────────────────
log "Publishing build output to slot $PADDED …"
rm -rf "$BUILD_DIR"
mv "$SLOT_DIR/astro/dist" "$BUILD_DIR"

log "Done. Serving at ${PREVIEW_URL}"

# Structured output consumed by GitHub Actions (stdout only).
# PORT/URL first, then one PAGE:url\ttitle line per changed page so that
# the Actions workflow can build the PR comment table without a separate
# git checkout on the runner.
echo "PORT:$PORT"
echo "URL:${PREVIEW_URL}"

log "Computing changed pages for PR #${PR}…"
cd "$SLOT_DIR"
BASE_REF=origin/main HEAD_REF=HEAD \
  node src/scripts/get-changed-pages.mjs 2>/dev/null \
  | sed 's/^/PAGE:/' || true
