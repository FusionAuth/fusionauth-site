#!/usr/bin/env bash

if [[ $# < 1 ]]; then
  echo "Usage: generate-release-notes-stub.sh milestone"
  exit 1
fi

which gh > /dev/null

if [[ $? -ne 0 ]]; then
  echo "GitHub CLI is required to run this script. Try running \"brew install gh\" first."
  exit 2
fi

# Issues should be labeled with exactly one of: "bug", "enhancement", "feature", "security", or "internals"
# Without one of these labels, they won't be included
# If an issue has multiple labels, it will be repeated
#
# An Issue's body should end with a '### Release Notes' section and list items to be included
# Otherwise, they default to the issue title

milestone=$1
date=$(date +"%B %-d, %Y" | sed 's/1,/1st,/;s/2,/2nd,/;s/3,/3rd,/;s/\([0-9]\),/\1th,/')

echo "<ReleaseNoteHeading version='${milestone}' releaseDate='${date}' />"
echo ""
echo "<DatabaseMigrationWarning/>"
echo ""
echo "### Known Issues"
echo ""

gh_issue_list() {
    label=$1
    header=$2
    echo "### $header"
    set -o noglob # don't be globbing files in my backticks

    gh issue list --repo FusionAuth/fusionauth-issues -m $milestone --state all -L 250 --label $label --search "sort:created-asc" --json number,body,title --jq ".[]|[.number,.body,.title] | @tsv" |
    while IFS=$'\t' read -r number body title; do
        generated_copy=`echo $body | awk 'BEGIN {FS = "### Release [Nn]otes"} {print $2}'`
        if [[ "${generated_copy}" == "" ]]; then
            generated_copy=${title}
        else
            generated_copy=`echo $generated_copy | sed 's#\\\\r\\\\n#\n#g'`
        fi
        echo "* ${generated_copy#[$'\r\t\n ']}"
        echo "  * Resolves [GitHub Issue #$number](https://github.com/FusionAuth/fusionauth-issues/issues/$number)"
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
