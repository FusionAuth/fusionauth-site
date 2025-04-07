#!/bin/sh

find astro/src/content/blog/ -type f -name "*.md*" |grep -v swp | xargs grep '^categories:'|sed 's/.*categories: //'|sed 's/, /\n/g'|sort -u  > out
RES=`diff out config/contentcheck/known-blog-categories.txt|wc -l`
#echo $RES
exit $RES

