#!/usr/bin/env bash
set -euo pipefail

# Finds GitHub issue URLs referenced in the docs and reports any that are closed.
# Exits with the number of closed issues found (0 = success).
#
# Usage:
#   check-for-closed-github-issues-in-docs.sh [-v]
#
# Options:
#   -v  Print each closed issue URL as it is found

VERBOSE=false
if [ "${1:-}" = "-v" ]; then
  VERBOSE=true
fi

ISSUE_URLS=$(grep -r 'github.com/FusionAuth' astro/src/content/ --include="*.md" --include="*.mdx" -h \
  | grep -oE 'https://github\.com/FusionAuth/[^/]+/issues/[0-9]+' \
  | sort -u)

CLOSED_COUNT=0

while IFS= read -r url; do
  path="${url#https://github.com/}"  # FusionAuth/some-repo/issues/123
  REPO="${path%/issues/*}"           # FusionAuth/some-repo
  NUMBER="${path##*/}"               # 123

  STATE=$(gh issue view "$NUMBER" --repo "$REPO" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")

  if [ "$STATE" = "CLOSED" ]; then
    CLOSED_COUNT=$((CLOSED_COUNT + 1))
    if $VERBOSE; then
      echo "CLOSED: $url"
    fi
  fi
done <<< "$ISSUE_URLS"

if $VERBOSE; then
  echo "$CLOSED_COUNT closed issue(s) found in docs"
fi

exit $CLOSED_COUNT
