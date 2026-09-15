#!/bin/bash

API_KEY=this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works
FA_HOSTNAME=http://localhost:9011

max_total=0

# ES is not case sensitive

for fc in {a..z} {0..9}; do
    #echo "$fc"
    printf "."
    total=`curl -s -H "Authorization: $API_KEY" $FA_HOSTNAME'/api/user/search/?queryString=email:'$fc'*%20OR%20username:'$fc'*&accurateTotal=true' | jq '.total'`
    #echo $total
    if [ $total -gt $max_total ]; then
      max_total=$total
    fi
done

tmpdir=tmp.$$
mkdir $tmpdir

if [ $max_total -lt 10000 ]; then
  # all of our segments are less than 10k
  for fc in {a..z} {0..9}; do
    printf "."
    curl -s -H "Authorization: $API_KEY" $FA_HOSTNAME'/api/user/search/?queryString=email:'$fc'*%20OR%20username:'$fc'*&numberOfResults=10000' > $tmpdir/file.$fc
  done
else 
  # we handle two characters here, but you could do the same count check and go deeper
  for fc in {a..z} {0..9}; do
    for sc in {a..z} {0..9}; do
      printf "."
      curl -s -H "Authorization: $API_KEY" $FA_HOSTNAME'/api/user/search/?queryString=email:'$fc$sc'*%20OR%20username:'$fc$sc'*&numberOfResults=10000' > $tmpdir/file.$fc.$sc
    done
  done
fi

jq 'reduce inputs as $i (.; .users += $i.users)| del(.total)' $tmpdir/file* > users.json

rm -rf $tmpdir
