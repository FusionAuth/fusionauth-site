#!/bin/sh

RES=`find astro/src/content/ -type f -name "*.md*" | xargs grep ']()'| wc -l |sed 's/[ ]*//g'`
#echo $RES
exit $RES
