#!/bin/bash

if [ $# -ne 1 ]; then
  echo "usage: $0 tagfile" 
  echo
  echo "Where tagfile has lines of the form SLUG:NEW_TAG_LIST:NEW_CATEGORY_LIST"
  exit 1
fi

IFS=:

exec 3< $1

while read -u 3 slug tags cats; do
  echo 
  echo "slug: ${slug}, tags: ${tags}, cats: ${cats}"
  filename="src/content/blog/${slug}.mdx"

  if [ ! -f $filename ]; then
    echo "Error, file not found: ${filename}, skipping"
  else
    echo "Modifying $filename"
    oldtags=$(grep '^tags:' $filename)
    newtags="tags: ${tags}"

    oldcats=$(grep '^categories:' $filename)
    newcats="categories: ${cats}"

    echo "Replacements:"
    echo "${oldtags} => ${newtags}"
    echo "${oldcats} => ${newcats}"
  fi

  read -p "Retag it (y/n)? " -n 1 answer
  echo

  if [ "${answer}" = "y" ]; then
    echo "retagging"
    sed -e "s/^tags:.*$/${newtags}/" -e "s/^categories:.*$/${newcats}/" $filename > tempfile
    mv tempfile $filename
  else
    echo "skipping"
  fi

done 
#< $1

