#!/usr/bin/env bash
set -euo pipefail

STATE=$1
shift || true

MARKER="<!-- fusionauth-preview -->"
# wraps the last successful preview, so building and failure updates can carry it forward
LINKS_START="<!-- fusionauth-preview-links -->"
LINKS_END="<!-- /fusionauth-preview-links -->"
NL=$'\n' # "\n" in double quotes stays a literal backslash-n
AUTH_HEADER="Authorization: token $GH_TOKEN"
API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$PR/comments"

# Find the existing comment and its body
EXISTING=$(curl -s -H "$AUTH_HEADER" "$API_URL" | \
  jq -c '[.[] | select(.body | contains("<!-- fusionauth-preview -->"))][0] // empty')
COMMENT_ID=$(jq -r '.id // empty' <<< "${EXISTING:-null}")
OLD_BODY=$(jq -r '.body // empty' <<< "${EXISTING:-null}")

# the last successful preview, markers included, or empty
previous_links() {
  awk -v start="$LINKS_START" -v end="$LINKS_END" \
    'index($0, start) { keep = 1 } keep { print } index($0, end) { exit }' <<< "$OLD_BODY"
}

# keep the previous preview visible while a new commit builds; the old build keeps serving until the new one replaces it
with_previous() {
  local links
  links=$(previous_links)
  if [ -n "$links" ]; then
    printf '%s\n\n<details open><summary>Previous preview, still available</summary>\n\n%s\n\n</details>' "$1" "$links"
  else
    printf '%s' "$1"
  fi
}

# Easily tweak comment formatting here
case "$STATE" in
  building)
    TITLE="⏳ Building Preview"
    BODY=$(with_previous "Commit \`${SHA:0:7}\` on \`${BRANCH}\` — [View build logs](${RUN_URL})")
    ;;
  success)
    PREVIEW_URL=$1
    PAGES_TEXT=$2
    TITLE="✅ Preview Ready"
    BODY="${LINKS_START}${NL}**URL:** ${PREVIEW_URL}${NL}${NL}${PAGES_TEXT}${NL}${NL}_Commit \`${SHA:0:7}\` · [View build logs](${RUN_URL})_${NL}${LINKS_END}"
    ;;
  failure)
    TITLE="❌ Build Failed"
    BODY=$(with_previous "Commit \`${SHA:0:7}\` failed to build. [View build logs](${RUN_URL})")
    ;;
  closed)
    TITLE="🧹 Preview Removed"
    BODY="PR closed, preview slot released."
    ;;
  *) exit 1 ;;
esac

# Create JSON payload using jq
PAYLOAD=$(jq -n --arg body "$MARKER${NL}### $TITLE${NL}$BODY" '{body: $body}')

if [ -n "$COMMENT_ID" ]; then
  curl -s -X PATCH -H "$AUTH_HEADER" -d "$PAYLOAD" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/issues/comments/$COMMENT_ID" > /dev/null
else
  curl -s -X POST -H "$AUTH_HEADER" -d "$PAYLOAD" "$API_URL" > /dev/null
fi
