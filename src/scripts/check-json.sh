#!/bin/bash

# Target directory
DIRECTORY="astro/src/content/json"
EXIT_CODE=0

echo "Scanning $DIRECTORY for JSON files..."

# check if directory exists
if [ ! -d "$DIRECTORY" ]; then
  echo "Error: Directory $DIRECTORY does not exist."
  exit 1
fi

# find all .json files safely using print0 to handle any spaces in filenames
while IFS= read -r -d '' file; do
  
  # run jq. redirect stdout to /dev/null, but capture stderr (where parse errors go)
  error_msg=$(jq '.' "$file" 2>&1 >/dev/null)
  
  # if jq exits with a non-zero status code, it found an error
  if [ $? -ne 0 ]; then
    echo "❌ Invalid JSON detected in: $file"
    echo "Details: $error_msg"
    
    # clean the error message of newlines so it doesn't break GitHub's annotation syntax
    clean_error=$(echo "$error_msg" | tr '\n' ' ')
    
    # create a GitHub Action annotation so the error shows up inline on the PR
    echo "::error file=$file::$clean_error"
    
    EXIT_CODE=1
  fi

done < <(find "$DIRECTORY" -name "*.json" -print0)

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All JSON files are valid."
else
  echo "❌ Check failed: One or more JSON files are broken."
fi

exit $EXIT_CODE