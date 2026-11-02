#!/usr/bin/env bash
set -euo pipefail

# Finds GitHub issue URLs referenced in the docs and reports any that are closed.
# Exits with the number of closed issues found (0 = success).
# Release notes and blog posts are excluded since they are expected to reference closed issues.
#
# Usage:
#   check-for-closed-github-issues-in-docs.sh
#
# Environment:
#   GH_TOKEN   optional GitHub token; without one, the GitHub API allows 60 requests an hour

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/run-locally.sh"
# run from the repo root so every reported path is repo-relative
cd "$SCRIPT_DIR/.."
SEARCH_DIR="astro/src/content"
# issue states are live, so the same command can report different results later
trap 'run_locally "bash scripts/check-for-closed-github-issues-in-docs.sh"' EXIT

# Files to search: all .md/.mdx excluding release notes and blog posts
search_files() {
  find "$SEARCH_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) \
    ! -path "*/releases/*" \
    ! -path "*/blog/*"
}

# Find all unique GitHub issue URLs across those files; GitHub ignores case in org and repo names
ISSUE_URLS=$(search_files | xargs grep -hi 'github.com/FusionAuth' \
  | grep -oiE 'https://github\.com/FusionAuth/[^/]+/issues/[0-9]+' \
  | sort -fu)

CLOSED_COUNT=0
SUMMARY=""

while IFS= read -r url; do
  [ -n "$url" ] || continue

  path="${url#https://github.com/}"  # FusionAuth/some-repo/issues/123
  REPO="${path%/issues/*}"           # FusionAuth/some-repo
  NUMBER="${path##*/}"               # 123

  STATE=$(curl -sf \
    ${GH_TOKEN:+-H "Authorization: Bearer $GH_TOKEN"} \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/issues/$NUMBER" \
    | grep -o '"state": *"[^"]*"' | grep -o '[^"]*"$' | tr -d '"' || echo "unknown")

  if [ "$STATE" = "closed" ]; then
    CLOSED_COUNT=$((CLOSED_COUNT + 1))
    echo "CLOSED: $url"
    refs=$(search_files | xargs grep -HniE "${url}([^0-9]|$)" || true)
    printf '%s\n' "$refs" | sed 's/^/  /'
    SUMMARY+="- $url"$'\n'
    SUMMARY+=$(printf '%s\n' "$refs" | awk -F: '{ print "  - `" $1 "` line " $2 }')$'\n'
  fi
done <<< "$ISSUE_URLS"

echo ""
echo "$CLOSED_COUNT closed issue(s) found in docs"

if [ "$CLOSED_COUNT" -gt 0 ] && [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    printf '## Docs reference closed GitHub issues\n\n'
    printf '%d closed issue(s). Update or remove each reference below, usually by linking to the docs for the shipped feature:\n\n' "$CLOSED_COUNT"
    printf '%s\n' "$SUMMARY"
  } >> "$GITHUB_STEP_SUMMARY"
fi

exit $CLOSED_COUNT
