#!/bin/sh

find astro/src/content/ -type f -print|grep -v '/_' |xargs grep '^title: '|grep '\.$'
RES=`find astro/src/content/ -type f -print|grep -v '/_' |xargs grep '^title: '|grep '\.$'|wc -l |sed 's/[ ]*//g'`
# echo $RES
exit $RES
