#!/bin/sh

find astro/src/content -type f|xargs egrep '(Enterprise|Community|Starter|Essentials) Plan' |grep -v '^##'
RES1=`find astro/src/content -type f|xargs egrep '(Enterprise|Community|Starter|Essentials) Plan'|grep -v '^##'|wc -l | sed 's/[ ]*//g'`

find astro/src/content -type f|xargs egrep '(enterprise|community|starter|essentials) plan'|grep -v '^##'
RES2=`find astro/src/content -type f|xargs egrep '(enterprise|community|starter|essentials) plan'|grep -v '^##' |wc -l | sed 's/[ ]*//g'`

exit $RES1 || $RES2

