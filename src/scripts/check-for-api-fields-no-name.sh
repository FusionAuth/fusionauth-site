#!/bin/sh

echo `grep -R \<APIField astro/src/content/docs | grep -v name`
exit `find astro/src/content/docs/ -type f -print|xargs grep \<APIField | grep -v name | wc -l | sed 's/[ ]*//g'`
