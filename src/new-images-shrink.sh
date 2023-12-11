#!/bin/bash

#echo "here"
git branch --show-current

for file in `gh pr diff --name-only`; do
  if [[ $file == *.png ]]; then
    echo "processing $file"
    #ls -l $file
    ./src/shrink-images.sh $file
    #ls -l $file
    echo "done processing $file"
  fi
done

