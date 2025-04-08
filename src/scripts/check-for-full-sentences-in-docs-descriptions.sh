#!/bin/sh

find astro/src/content/docs/ -type f -print|grep -v '/_' |xargs grep '^description: '|grep -v '\.$'
RES=`find astro/src/content/docs/ -type f -print|grep -v '/_' |xargs grep '^description: '|grep -v '\.$'|wc -l |sed 's/[ ]*//g'`
find astro/src/content/docs/ -type f -print|grep -v '/_' |xargs grep '^description: '|grep -v '\.$'
#echo $RES
exit $RES
