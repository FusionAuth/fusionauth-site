#!/bin/bash

API_KEY=...
FA_HOSTNAME=http://localhost:9011

# default to 30 days out. any keys expiring before this will be printed
DAYS_TILL_EXPIRATION=30

# finds current unix timestamp
lcdate=`LC_ALL=C date`
curdate=`date -j -f "%a %b %d %T %Z %Y" "$lcdate" "+%s"`

curdateinmillis=$(($curdate * 1000))
expdatemillis=$(($DAYS_TILL_EXPIRATION * 24 * 60 * 60 * 1000))
targetdateinmillis=$(($curdateinmillis + $expdatemillis))

start=0
increment=25

total=`curl -s -H "Authorization: $API_KEY" $FA_HOSTNAME'/api/key/search?orderBy=expiration%20ASC' | jq '.total'`

keysdata=""

# loop over requests to FusionAuth key search API
while [[ $start -lt $total ]]; do
  res=`curl -s -H "Authorization: $API_KEY" $FA_HOSTNAME'/api/key/search?orderBy=expiration%20ASC&startRow='$start'&numberOfResults='$increment | jq -r '.keys[]| select(.expirationInstant != null) |[.expirationInstant,.id]|@csv'`

  # for each set of results, loop over them and grab the expiration instant
  for row in $res; do
    exp=`echo $row|awk -F, '{print $1}'`
    if [[ $exp -gt $targetdateinmillis ]]; then
      # seen key far enough in the future, bail
      exit 0
    fi
    echo $row
  done

  # if we get here, there are more rows to pull and keys are still before our DAYS_TILL_EXPIRATION value
  start=$(($start + $increment))
done

exit
