#!/bin/sh

HITS=`find astro/src/content/docs/ -type f -print | xargs grep '<APIField' | grep -v name`

if [ -z "$HITS" ]; then
  exit 0
fi

echo "Found <APIField> tags with no name attribute:"
echo ""
echo "$HITS"
exit 1
