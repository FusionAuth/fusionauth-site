#!/usr/bin/env bash
# Called by GitHub Actions via SSH when a PR is closed.
# Args: <pr-number>

set -euo pipefail

PR="$1"
PREVIEW_DIR=/opt/preview
SLOTS_DIR="$PREVIEW_DIR/slots"
BUILDS_DIR="$PREVIEW_DIR/builds"
CLAIMS_DIR="$PREVIEW_DIR/claims"
LOCKS_DIR="$PREVIEW_DIR/locks"
NUM_SLOTS=25
mkdir -p "$CLAIMS_DIR" "$LOCKS_DIR"

log() { echo "[preview] $*" >&2; }

exec 7>"$LOCKS_DIR/slots.lock"
flock 7

for i in $(seq 1 $NUM_SLOTS); do
  p=$(printf "%02d" "$i")
  claim="$CLAIMS_DIR/$p"
  [[ -f "$claim" ]] || claim="$SLOTS_DIR/$p/.slot-pr"
  if [[ "$(cat "$claim" 2>/dev/null)" == "$PR" ]]; then
    log "Releasing slot $p (PR #$PR) …"

    # stop a build still running for this PR, then wait for it to let go of the slot
    pid=$(cat "$LOCKS_DIR/slot-$p.pid" 2>/dev/null || true)
    if [[ -n "$pid" ]] && grep -qs build-preview "/proc/$pid/cmdline"; then
      kill -TERM -- "-$pid" 2>/dev/null || true
    fi
    rm -f "$LOCKS_DIR/slot-$p.pid"
    exec 8>"$LOCKS_DIR/slot-$p.lock"
    flock 8

    rm -f "$claim"

    # Remove the worktree from git's tracking
    if git -C "$PREVIEW_DIR/repo" worktree list --porcelain \
       | grep -qF "worktree $SLOTS_DIR/$p"; then
      git -C "$PREVIEW_DIR/repo" worktree remove --force "$SLOTS_DIR/$p" >&2 || true
    fi

    # Drop the local preview ref
    git -C "$PREVIEW_DIR/repo" update-ref -d "refs/preview/pr-${PR}" 2>/dev/null || true

    # Clear the build output so nginx serves nothing on that port
    rm -rf "${BUILDS_DIR:?}/$p"
    mkdir -p "$BUILDS_DIR/$p"

    log "Slot $p released."
    exit 0
  fi
done

log "No slot found for PR #$PR (already released or never built)."
