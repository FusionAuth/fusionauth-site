#!/bin/sh

RES=`find astro/src/content/docs/ -type f -print|grep -v '/_' |xargs grep '^description: '|grep -v '\.$'|wc -l |sed 's/[ ]*//g'`
#echo $RES
exit $RES
