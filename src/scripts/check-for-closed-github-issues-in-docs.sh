#!/usr/bin/env bash
set -euo pipefail

# Finds GitHub issue URLs referenced in the docs and reports any that are closed.
# Exits with the number of closed issues found (0 = success).
# Release notes and blog posts are excluded since they are expected to reference closed issues.
#
# Usage:
#   check-for-closed-github-issues-in-docs.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEARCH_DIR="$SCRIPT_DIR/../../astro/src/content"

# Files to search: all .md/.mdx excluding release notes and blog posts
search_files() {
  find "$SEARCH_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) \
    ! -path "*/releases/*" \
    ! -path "*/blog/*"
}

# Find all unique GitHub issue URLs across those files
ISSUE_URLS=$(search_files | xargs grep -h 'github.com/FusionAuth' \
  | grep -oE 'https://github\.com/FusionAuth/[^/]+/issues/[0-9]+' \
  | sort -u)

CLOSED_COUNT=0

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
    search_files | xargs grep -HnE "${url}([^0-9]|$)" | sed 's/^/  /'
  fi
done <<< "$ISSUE_URLS"

echo ""
echo "$CLOSED_COUNT closed issue(s) found in docs"

exit $CLOSED_COUNT
