#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$DIR/comment.sh" building

# the base branch comes from PR metadata a fork can write, and it goes into a remote shell command
BASE="${BASE:-main}"
if [[ ! "$BASE" =~ ^[A-Za-z0-9._/-]+$ ]] || ! git check-ref-format --branch "$BASE" >/dev/null 2>&1; then
  printf 'Refusing unexpected base branch name: %s\n' "$BASE" >&2
  "$DIR/comment.sh" failure
  exit 1
fi

install -m600 /dev/null /tmp/pk
printf '%s\n' "$SSH_KEY" > /tmp/pk

scp -o StrictHostKeyChecking=no -i /tmp/pk "$DIR"/*.sh preview@"$PREVIEW_HOST":/opt/preview/scripts/

set +e
ssh -o StrictHostKeyChecking=no -i /tmp/pk preview@"$PREVIEW_HOST" \
  "/opt/preview/scripts/build-preview.sh '$PR' '$SHA' '$BASE'" > /tmp/preview-out.txt
STATUS=$?
set -e
rm -f /tmp/pk

if [ $STATUS -ne 0 ]; then
  "$DIR/comment.sh" failure
  exit $STATUS
fi

URL=$(grep '^URL:' /tmp/preview-out.txt | sed 's/^URL://' || true)
PAGES=$(grep '^PAGE:' /tmp/preview-out.txt | sed 's/^PAGE://' || true)

MAX_PAGE_ROWS=100

# url<TAB>title<TAB>pct lines on stdin -> markdown table capped at MAX_PAGE_ROWS
# with "pct", a Δ% column sorted descending ("<1" sorts as 0); without, rows sort by title
page_table() {
  local rows count with_pct="${1:-}"
  rows=$(cat)
  count=$(printf '%s\n' "$rows" | grep -c .)
  if [ -n "$with_pct" ]; then
    printf '| Title | Preview | Δ%% |\n|-------|---------|----|\n'
  else
    printf '| Title | Preview |\n|-------|---------|\n'
  fi
  printf '%s\n' "$rows" \
    | sort -t $'\t' -k3,3rn -k2,2f \
    | head -n "$MAX_PAGE_ROWS" \
    | WITH_PCT="$with_pct" awk -F'\t' '{
        t = $2; gsub(/\|/, "\\|", t)
        row = "| " t " | [" $1 "](" ENVIRON["URL"] $1 ") |"
        if (ENVIRON["WITH_PCT"] != "") row = row " " ($3 != "" ? $3 "%" : "?") " |"
        print row
      }'
  if [ "$count" -gt "$MAX_PAGE_ROWS" ]; then
    printf '\n_Showing %d of %d pages%s._\n' "$MAX_PAGE_ROWS" "$count" "${with_pct:+, sorted by change percentage}"
  fi
}

if [ -n "$PAGES" ]; then
  export URL
  # a line without a kind comes from an older get-changed-pages.mjs and counts as edited
  EDITED=$(printf '%s\n' "$PAGES" | awk -F'\t' 'NF >= 2 && $3 != "shared" { print $1 "\t" $2 "\t" $4 }')
  SHARED=$(printf '%s\n' "$PAGES" | awk -F'\t' 'NF >= 2 && $3 == "shared" { print $1 "\t" $2 "\t" $4 }')
  PAGES_TEXT=""
  if [ -n "$EDITED" ]; then
    PAGES_TEXT="### Changed pages"$'\n\n'"$(printf '%s\n' "$EDITED" | page_table pct)"
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
