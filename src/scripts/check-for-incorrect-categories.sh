#!/bin/sh

# 1. Define your allowed categories (one per line)
ALLOWED="Community
Company
Compare
Customers
Education
Engineering
Events
News
Product
Release Updates
Security
Tutorial"

# 2. Extract unique categories from files
# We use tr to handle commas and sed to trim whitespace
ACTUAL=$(find astro/src/content/blog/ -type f -name "*.md*" | grep -v swp | xargs grep -h '^categories:' | sed 's/^categories: //' | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort -u)

# 3. Find items in ACTUAL that are NOT in ALLOWED
# We use grep -vxF to filter out lines that match the allowed list exactly
# -v: invert match (show what doesn't match)
# -x: match whole line only
# -F: treat pattern as fixed strings (not regex)
INVALID=$(echo "$ACTUAL" | grep -vxF "$ALLOWED")

# 4. Report and exit
if [ -z "$INVALID" ]; then
    exit 0
fi

echo "Found blog categories that are not in the allowed list:"
echo ""
echo "$INVALID"
echo ""
echo "Allowed categories:"
echo "$ALLOWED"
exit 1