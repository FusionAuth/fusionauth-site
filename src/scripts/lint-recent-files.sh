#!/bin/sh

# Get the list of changed files in the pull request
changed_files=$(gh api repos/FusionAuth/fusionauth-site/pulls/$PR_NUMBER/files -q '.[] | [.status,.filename] | @csv' |grep -v '"removed"'|awk -F, '{print $2}'|sed 's/"//g')

# Filter the files to match the specified patterns and directory
files_to_check=$(echo "$changed_files" | grep -E '^astro/src/.*\.(js|mjs|cjs|ts|md|mdx)$' | sed 's|^astro/||')

echo "Linting changed files: $files_to_check"

# Run eslint on the filtered files
if [ -n "$files_to_check" ]; then
  npm run lint -- $files_to_check
  lint_exit_code=$?
  if [ $lint_exit_code -ne 0 ]; then
    echo "Lint check failed."
    exit -1
  fi
else
  echo "No matching files to check."
fi
