#!/usr/bin/env bash

if [[ $# < 1 ]]; then
  echo "Usage: generate-release-notes-stub.sh milestone"
  exit 1
fi

# Issues should be labeled with exactly one of: "bug", "enhancement", "feature", "security", or "internals"
# Without one of these labels, they won't be included
# If an issue has multiple labels, it will be repeated
#
# An Issue's body should end with a '### Release Notes' section and list items to be included
# Otherwise, they default to the issue title

milestone=$1
date=$(date +"%B %-d, %Y" | sed 's/1,/1st,/;s/2,/2nd,/;s/3,/3rd,/;s/\([0-9]\),/\1th,/')

echo "[role=release-note]"
echo ""
echo "== Version ${milestone}"
echo "_${date}_"
echo ""
echo "include::docs/v1/tech/__database-migration-warning.adoc[]"
echo ""
echo "=== Known Issues"
echo ""

gh_issue_list() {
    label=$1
    header=$2
    echo "=== $header"
    set -o noglob # don't be globbing files in my backticks

    gh issue list --repo FusionAuth/fusionauth-issues -m $milestone -L 250 --label $label --search "sort:created-asc" --json number,body,title --jq ".[]|[.number,.body,.title] | @tsv" |
    while IFS=$'\t' read -r number body title; do
        generated_copy=`echo $body | awk -F'### Release Notes' '{print $2}'`
        if [[ "${generated_copy}" == "" ]]; then
            generated_copy=${title}
        else
            generated_copy=`echo $generated_copy | sed 's#\\\\r\\\\n#\n#g' | grep -o '[[:alpha:]].*'`
        fi
        echo "* ${generated_copy}"
        echo "** Resolves https://github.com/FusionAuth/fusionauth-issues/issues/$number[GitHub Issue #$number]"
    done
    echo ""
}
gh_issue_list "changed" "Changed"
gh_issue_list "feature" "New"
gh_issue_list "security" "Security"
gh_issue_list "bug" "Fixed"
gh_issue_list "enhancement" "Enhancements"
gh_issue_list "internals" "Internal"

echo ""
