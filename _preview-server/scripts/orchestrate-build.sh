#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$DIR/comment.sh" building

install -m600 /dev/null /tmp/pk
printf '%s\n' "$SSH_KEY" > /tmp/pk

scp -o StrictHostKeyChecking=no -i /tmp/pk "$DIR"/*.sh preview@"$PREVIEW_HOST":/opt/preview/scripts/

set +e
ssh -o StrictHostKeyChecking=no -i /tmp/pk preview@"$PREVIEW_HOST" \
  "/opt/preview/scripts/build-preview.sh '$PR' '$SHA'" > /tmp/preview-out.txt
STATUS=$?
set -e
rm -f /tmp/pk

if [ $STATUS -ne 0 ]; then
  "$DIR/comment.sh" failure
  exit $STATUS
fi

URL=$(grep '^URL:' /tmp/preview-out.txt | sed 's/^URL://' || true)
PAGES=$(grep '^PAGE:' /tmp/preview-out.txt | sed 's/^PAGE://' || true)

if [ -n "$PAGES" ]; then
  export URL
  # Formats tab-delimited pages into markdown links
  PAGES_FORMATTED=$(echo "$PAGES" | awk -F'\t' '{print "- [" $2 "](" ENVIRON["URL"] $1 ")"}' | paste -sd '\n' -)
  PAGES_TEXT="**Changed Pages:**\n$PAGES_FORMATTED"
else
  PAGES_TEXT="_No content files changed._"
fi

"$DIR/comment.sh" success "$URL" "$PAGES_TEXT"