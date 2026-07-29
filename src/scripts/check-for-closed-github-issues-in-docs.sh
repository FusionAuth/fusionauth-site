#!/usr/bin/env bash
set -euo pipefail

# Finds GitHub issue URLs referenced in the docs and reports any that are closed.
# Exits with the number of closed issues found (0 = success).
# Release notes and blog posts are excluded since they are expected to reference closed issues.
#
# Usage:
#   check-for-closed-github-issues-in-docs.sh

SEARCH_DIR="astro/src/content"

# Find all unique GitHub issue URLs, excluding release notes and blog posts
ISSUE_URLS=$(grep -r 'github.com/FusionAuth' "$SEARCH_DIR" \
    --include="*.md" --include="*.mdx" \
    --exclude-dir=releases \
    --exclude-dir=blog \
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
    echo "CLOSED: $url"
    grep -rn --include="*.md" --include="*.mdx" \
      --exclude-dir=releases --exclude-dir=blog \
      "$url" "$SEARCH_DIR" \
      | sed 's/^/  /'
  fi
done <<< "$ISSUE_URLS"

echo ""
echo "$CLOSED_COUNT closed issue(s) found in docs"

exit $CLOSED_COUNT
