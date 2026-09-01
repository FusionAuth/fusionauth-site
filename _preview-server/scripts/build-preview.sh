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

PR="$1"
SHA="$2"

PREVIEW_DIR=/opt/preview
REPO_DIR="$PREVIEW_DIR/repo"
SLOTS_DIR="$PREVIEW_DIR/slots"
BUILDS_DIR="$PREVIEW_DIR/builds"
NUM_SLOTS=25
BASE_PORT=4000

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

# Returns the slot number (without zero-padding) already assigned to this PR,
# or exits with status 1 if none.
find_slot() {
  for i in $(seq 1 $NUM_SLOTS); do
    p=$(printf "%02d" "$i")
    if [[ -f "$SLOTS_DIR/$p/.slot-pr" ]] && \
       [[ "$(cat "$SLOTS_DIR/$p/.slot-pr")" == "$PR" ]]; then
      echo "$i"; return 0
    fi
  done
  return 1
}

# Returns the number of the first free slot, or evicts the oldest if all full.
alloc_slot() {
  for i in $(seq 1 $NUM_SLOTS); do
    p=$(printf "%02d" "$i")
    if [[ ! -f "$SLOTS_DIR/$p/.slot-pr" ]]; then
      echo "$i"; return 0
    fi
  done
  # All slots occupied — evict the one whose lock file is oldest.
  oldest=$(find "$SLOTS_DIR" -name ".slot-pr" -printf '%T+ %p\n' \
    | sort | head -1 | awk '{print $2}' | xargs dirname | xargs basename)
  evicted_pr=$(cat "$SLOTS_DIR/$oldest/.slot-pr" 2>/dev/null || echo "unknown")
  log "All slots full. Evicting slot $oldest (was PR #$evicted_pr)."
  rm -f "$SLOTS_DIR/$oldest/.slot-pr"
  echo "$((10#$oldest))"
}

SLOT=$(find_slot 2>/dev/null || alloc_slot)
PADDED=$(printf "%02d" "$SLOT")
PORT=$((BASE_PORT + SLOT))
SLOT_DIR="$SLOTS_DIR/$PADDED"
BUILD_DIR="$BUILDS_DIR/$PADDED"

log "Using slot $PADDED (port $PORT) for PR #$PR @ $SHA"

# ── Fetch the PR ref and main ────────────────────────────────────────────────
# refs/pull/N/head is created by GitHub for every PR, including forks.
# Fetch main alongside the PR ref so origin/main:astro/package.json is current
# when the shared-node_modules staleness check runs below.
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

# ── Shared caches ──────────────────────────────────────────────────────────────
# node_modules: symlinked from master; concurrent installs serialized via flock.
# Remove any real directory left by a previous slot-specific npm ci — ln -sfn
# cannot replace a directory and would create the link inside it instead.
rm -rf "$SLOT_DIR/astro/node_modules"
ln -sfn "$REPO_DIR/astro/node_modules" "$SLOT_DIR/astro/node_modules"
# .content-cache: per-slot, NOT shared — different branches have different content
# and a shared cache causes one PR's compiled content to bleed into another's.
mkdir -p "$SLOT_DIR/astro/.content-cache"

# generated-code-snippets: pre-seed with a hard-linked copy from master so the
# hash check in generate-code-snippets.sh exits early when localcode/ is unchanged.
if [[ ! -d "$SLOT_DIR/astro/src/generated-code-snippets" ]]; then
  cp -al "$REPO_DIR/astro/src/generated-code-snippets" \
         "$SLOT_DIR/astro/src/generated-code-snippets" 2>/dev/null || true
fi

# Clear Astro's compiled-component cache so layout/component changes always take effect
rm -rf "$SLOT_DIR/astro/.astro"

# ── deps ──────────────────────────────────────────────────────────────────────
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

# The slot's node_modules is a symlink to the main repo's node_modules, so that
# shared directory must exist and match main's package.json before any build.
MAIN_NM_HASH_FILE="$PREVIEW_DIR/.main-nm-hash"
CACHED_NM_HASH=$(cat "$MAIN_NM_HASH_FILE" 2>/dev/null || echo "")
if [[ "$MAIN_PKG_HASH" != "$CACHED_NM_HASH" ]] || \
   [[ ! -x "$REPO_DIR/astro/node_modules/.bin/astro" ]]; then
  log "Shared node_modules missing or stale — running npm ci in main repo …"
  flock "$PREVIEW_DIR/.npm-lock" \
    npm ci --silent --prefix "$REPO_DIR/astro" >&2
  echo "$MAIN_PKG_HASH" > "$MAIN_NM_HASH_FILE"
fi

if [[ "$MAIN_PKG_HASH" != "$SLOT_PKG_HASH" ]]; then
  log "package.json changed — running npm ci for slot (serialized) …"
  # Serialize installs across concurrent slot builds so node_modules isn't corrupted.
  # npm ci removes the symlink and creates a real node_modules for this slot.
  flock "$PREVIEW_DIR/.npm-lock" \
    npm ci --silent --prefix "$SLOT_DIR/astro" >&2
else
  log "package.json unchanged — using shared node_modules."
fi

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

# Write slot lock after a successful build (so a failed build doesn't hold a slot)
echo "$PR" > "$SLOT_DIR/.slot-pr"

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
