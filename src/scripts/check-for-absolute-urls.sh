#!/bin/sh

# Content should use root-relative paths (/docs/...) so links work across preview deploys.
# Fenced code blocks are skipped: CLI invocations and their output legitimately print absolute URLs.
#
# we ignore "https://fusionauth.io/blog/announcing-fusionauth-" because we use those links in the descriptions of release blog posts
HITS=$(find astro/src/content/ -type f -name "*.md*" -print0 \
  | xargs -0 awk '
      FNR == 1 { fence = 0 }
      /^[[:space:]]*(```|~~~)/ { fence = !fence; next }
      !fence { print FILENAME ":" FNR ": " $0 }
    ' \
  | grep 'https://fusionauth.io' \
  | grep -v "https://fusionauth.io/blog/announcing-fusionauth-" \
  | grep -v '\[https:')

if [ -z "$HITS" ]; then
  exit 0
fi

echo "Found absolute fusionauth.io URLs in content. Use root-relative paths (/docs/...) instead:"
echo ""
echo "$HITS"
exit 1
