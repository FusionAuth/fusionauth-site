#!/bin/bash

echo "here"

for file in `gh pr diff --name-only`; do
  echo "processing $file"
  if [[ $file == *.png ]]; then
    ls -l $file
    ./src/shrink-images.sh $file
    ls -l $file
  fi
  echo "done processing $file"
done

