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

MAX_PAGE_ROWS=50

# url<TAB>title lines on stdin -> markdown table sorted by title. past the cap, takes the shallowest
# pages from each top-level section in turn, so every changed section shows up
page_table() {
  local rows count
  rows=$(cat)
  count=$(printf '%s\n' "$rows" | grep -c .)
  printf '| Title | Preview |\n|-------|---------|\n'
  printf '%s\n' "$rows" \
    | awk -F'\t' '{ u = $1; depth = gsub("/", "/", u); split($1, seg, "/"); print seg[2] "\t" depth "\t" $0 }' \
    | sort -t $'\t' -k1,1 -k2,2n -k3,3 \
    | awk -F'\t' '{ print ++rank[$1] "\t" $3 "\t" $4 }' \
    | sort -t $'\t' -k1,1n -k2,2 | head -n "$MAX_PAGE_ROWS" | cut -f2- \
    | sort -t $'\t' -k2,2f -k1,1 \
    | awk -F'\t' '{ t = $2; gsub(/\|/, "\\|", t); print "| " t " | [" $1 "](" ENVIRON["URL"] $1 ") |" }'
  if [ "$count" -gt "$MAX_PAGE_ROWS" ]; then
    printf '\n_Showing %d of %d pages, the top-level pages of each section._\n' "$MAX_PAGE_ROWS" "$count"
  fi
}

if [ -n "$PAGES" ]; then
  export URL
  # a line without a kind comes from an older get-changed-pages.mjs and counts as edited
  EDITED=$(printf '%s\n' "$PAGES" | awk -F'\t' 'NF >= 2 && $3 != "shared" { print $1 "\t" $2 }')
  SHARED=$(printf '%s\n' "$PAGES" | awk -F'\t' 'NF >= 2 && $3 == "shared" { print $1 "\t" $2 }')
  PAGES_TEXT=""
  if [ -n "$EDITED" ]; then
    PAGES_TEXT="### Changed pages"$'\n\n'"$(printf '%s\n' "$EDITED" | page_table)"
  fi
  if [ -n "$SHARED" ]; then
    [ -n "$PAGES_TEXT" ] && PAGES_TEXT+=$'\n\n'
    PAGES_TEXT+="<details><summary>$(printf '%s\n' "$SHARED" | grep -c .) page(s) that render changed components or code samples</summary>"$'\n\n'
    PAGES_TEXT+="$(printf '%s\n' "$SHARED" | page_table)"$'\n\n'"</details>"
  fi
else
  PAGES_TEXT="_No content files changed._"
fi

"$DIR/comment.sh" success "$URL" "$PAGES_TEXT"