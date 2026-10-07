#!/usr/bin/env bash
set -euo pipefail

STATE=$1
shift || true

MARKER="<!-- fusionauth-preview -->"
AUTH_HEADER="Authorization: token $GH_TOKEN"
API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$PR/comments"

# Easily tweak comment formatting here
case "$STATE" in
  building)
    TITLE="⏳ Building Preview"
    BODY="Commit \`${SHA:0:7}\` on \`${BRANCH}\` — [View build logs](${RUN_URL})"
    ;;
  success)
    PREVIEW_URL=$1
    PAGES_TEXT=$2
    TITLE="✅ Preview Ready"
    BODY="**URL:** ${PREVIEW_URL}\n\n${PAGES_TEXT}\n\n_Commit \`${SHA:0:7}\` · [View build logs](${RUN_URL})_"
    ;;
  failure)
    TITLE="❌ Build Failed"
    BODY="Commit \`${SHA:0:7}\` failed to build. [View build logs](${RUN_URL})"
    ;;
  closed)
    TITLE="🧹 Preview Removed"
    BODY="PR closed, preview slot released."
    ;;
  *) exit 1 ;;
esac

# Create JSON payload using jq
PAYLOAD=$(jq -n --arg body "$MARKER\n### $TITLE\n$BODY" '{body: $body}')

# Find existing comment ID
COMMENT_ID=$(curl -s -H "$AUTH_HEADER" "$API_URL" | \
  jq -r '.[] | select(.body | contains("<!-- fusionauth-preview -->")) | .id // empty' | head -n 1)

if [ -n "$COMMENT_ID" ]; then
  curl -s -X PATCH -H "$AUTH_HEADER" -d "$PAYLOAD" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/issues/comments/$COMMENT_ID" > /dev/null
else
  curl -s -X POST -H "$AUTH_HEADER" -d "$PAYLOAD" "$API_URL" > /dev/null
fi