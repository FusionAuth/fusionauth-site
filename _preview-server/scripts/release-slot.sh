#!/usr/bin/env bash
# Called by GitHub Actions via SSH when a PR is closed.
# Args: <pr-number>

set -euo pipefail

PR="$1"
PREVIEW_DIR=/opt/preview
SLOTS_DIR="$PREVIEW_DIR/slots"
BUILDS_DIR="$PREVIEW_DIR/builds"
NUM_SLOTS=25

log() { echo "[preview] $*" >&2; }

for i in $(seq 1 $NUM_SLOTS); do
  p=$(printf "%02d" "$i")
  lock="$SLOTS_DIR/$p/.slot-pr"
  if [[ -f "$lock" ]] && [[ "$(cat "$lock")" == "$PR" ]]; then
    log "Releasing slot $p (PR #$PR) …"
    rm -f "$lock"

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
