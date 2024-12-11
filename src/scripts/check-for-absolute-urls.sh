#!/bin/sh

# we ignore 'open your browser and navigate to https://fusionauth.io/docs' because it is part of command output
# we ignore 'homepage "https://fusionauth.io"' because it is part of the homebrew formula
# we ignore "<a href='https://fusionauth.io/docs/'>Learn how this app works.</a>" because it is part of a react tutorial
find astro/src/content/ -type f -name "*.md*" | xargs grep 'https://fusionauth.io' | grep -v 'homepage "https://fusion' | grep -v 'open your browser and navigate to https://fusionauth.io/docs' |grep -v "<a href='https://fusionauth.io/docs/'>Learn how this app works.</a>" > absolute.out
#cat absolute.out
RES=`cat absolute.out | wc -l | sed 's/[ ]*//g'`

#echo $RES
exit $RES

