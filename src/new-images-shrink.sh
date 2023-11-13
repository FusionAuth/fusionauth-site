#!/bin/bash

for file in `gh pr diff --name-only`; do
  if [[ $file == *.png ]]; then
    ./src/shrink-images.sh $file
  fi
done

