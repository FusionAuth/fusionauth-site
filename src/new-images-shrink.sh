#!/bin/bash

#echo "here"

for file in `gh pr diff --name-only`; do
  if [[ $file == *.png ]]; then
    echo "processing $file"
    #ls -l $file
    ./src/shrink-images.sh $file
    #ls -l $file
    echo "done processing $file"
  fi
done

