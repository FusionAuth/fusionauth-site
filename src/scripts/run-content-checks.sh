#!/bin/bash

# Run the script to check for blog posts that have incorrect categories
src/scripts/check-for-incorrect-categories.sh
if [ $? -ne 0 ]; then
  echo "check-for-incorrect-categories.sh failed"
  exit 1
fi

# Run the script to check for absolute URLs referencing FusionAuth.io
src/scripts/check-for-absolute-urls.sh
if [ $? -ne 0 ]; then
  echo "check-for-absolute-urls.sh failed"
  exit 1
fi

# Run the script to check for erroneous markdown references
src/scripts/check-for-incorrect-markdown-references.sh
if [ $? -ne 0 ]; then
  echo "check-for-incorrect-markdown-references.sh failed"
  exit 1
fi

# Run the script to make sure all docs have a full sentence in their description
src/scripts/check-for-full-sentences-in-docs-descriptions.sh
if [ $? -ne 0 ]; then
  echo "check-for-full-sentences-in-docs-descriptions.sh failed"
  exit 1
fi

# Run the script to check for APIFields with no name
src/scripts/check-for-api-fields-no-name.sh
if [ $? -ne 0 ]; then
  echo "check-for-api-fields-no-name.sh failed"
  exit 1
fi

# Run the script to check for the word 'edition' which we don't use any more
src/scripts/check-for-use-of-word-edition.sh
if [ $? -ne 0 ]; then
  echo "check-for-use-of-word-edition.sh failed"
  exit 1
fi

# Run the script to check for the proper casing of the word 'plan'
src/scripts/check-for-use-proper-casing-of-plan.sh
if [ $? -ne 0 ]; then
  echo "check-for-use-proper-casing-of-plan.sh failed"
  exit 1
fi

# Run the script to check unsorted vale keywords
src/scripts/check-vale-vocab-sorted.sh
if [ $? -ne 0 ]; then
  echo "check-vale-vocab-sorted.sh failed"
  exit 1
fi

echo "All scripts ran successfully"