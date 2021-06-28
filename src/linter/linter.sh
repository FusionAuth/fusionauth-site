#!/bin/bash

CHANGED_FILES=$@

for linter in `pwd`./linters/*.sh; do
  for file in $CHANGED_FILES; do
    res=`$linter $file`
    if [ $res -ne 0 ] ; then
      echo "failed on $linter $file";
      exit $res
    fi
  done
done
