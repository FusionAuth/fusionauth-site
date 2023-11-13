#!/bin/bash

echo "here"

for file in `gh pr diff --name-only`; do
  echo "processing $file"
  if [[ $file == *.png ]]; then
    ./src/shrink-images.sh $file
  fi
  echo "done processing $file"
done

