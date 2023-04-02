#!/usr/bin/env bash

if [[ $# < 1 ]]; then
  echo "Usage: generate-release-notes-stub.sh milestone"
  exit 1
fi

# If we can get good at tagging things correctly "bug", "enhancement", "feature" we should be able to make this produce the stub
# for each section in the release notes - or get close.
#
milestone=$1
date=$(date +"%B %-d, %Y" | sed 's/1,/1st,/;s/2,/2nd,/;s/3,/3rd,/;s/\([0-9]\),/\1th,/')

echo "[role=release-note]"
echo "" 
echo "== Version ${milestone}"
echo "_${date}_"
echo ""
echo "=== Known Issues"
echo "=== Security"
echo "=== Changed"
echo "=== Fixed"
echo "=== Enhancements"
echo "=== New"
echo "=== Internal"
echo ""

gh issue list --repo FusionAuth/fusionauth-issues -m $milestone -L 250 --search "sort:created-asc" --json number,title --jq ".[]|[.number,.title] | @tsv" |
while IFS=$'\t' read -r number title; do
  echo "* $title"
  echo "** Resolves https://github.com/FusionAuth/fusionauth-issues/issues/$number[GitHub Issue #$number]"
done
