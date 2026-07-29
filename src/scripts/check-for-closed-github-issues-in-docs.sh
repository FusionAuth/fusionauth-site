#!/usr/bin/env bash
set -euo pipefail

# Finds GitHub issue URLs referenced in the docs and reports any that are closed.
# Exits with the number of closed issues found (0 = success).
# Release notes are excluded since they are expected to reference closed issues.
#
# Usage:
#   check-for-closed-github-issues-in-docs.sh [-v]
#
# Options:
#   -v  Print each closed issue URL and the files that reference it

VERBOSE=false
if [ "${1:-}" = "-v" ]; then
  VERBOSE=true
fi

SEARCH_DIR="astro/src/content"

# Find all unique GitHub issue URLs, excluding release notes
ISSUE_URLS=$(grep -r 'github.com/FusionAuth' "$SEARCH_DIR" \
    --include="*.md" --include="*.mdx" \
    --exclude-dir=releases \
    -h \
  | grep -oE 'https://github\.com/FusionAuth/[^/]+/issues/[0-9]+' \
  | sort -u)

CLOSED_COUNT=0

while IFS= read -r url; do
  [ -n "$url" ] || continue

  path="${url#https://github.com/}"  # FusionAuth/some-repo/issues/123
  REPO="${path%/issues/*}"           # FusionAuth/some-repo
  NUMBER="${path##*/}"               # 123

  STATE=$(gh issue view "$NUMBER" --repo "$REPO" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")

  if [ "$STATE" = "CLOSED" ]; then
    CLOSED_COUNT=$((CLOSED_COUNT + 1))
    if $VERBOSE; then
      echo "CLOSED: $url"
      grep -rn --include="*.md" --include="*.mdx" --exclude-dir=releases \
        "$url" "$SEARCH_DIR" \
        | sed 's/^/  /'
    fi
  fi
done <<< "$ISSUE_URLS"

if $VERBOSE; then
  echo ""
  echo "$CLOSED_COUNT closed issue(s) found in docs"
fi

exit $CLOSED_COUNT
