#!/bin/bash

API_KEY=this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works
BASE_URL=http://localhost:9011

tmpdir=tmp.$$
mkdir $tmpdir

results=$(curl -s -XPOST \
     -H 'Content-type: application/json' \
     -H "Authorization: $API_KEY" \
    $BASE_URL'/api/user/search' \
    -d '{
    "search": {
      "accurateTotal": true,
      "numberOfResults": 1000,
      "queryString": "*",
      "sortFields": [
        {
          "missing": "_first",
          "name": "email",
          "order": "asc"
        }
      ],
      "startRow": 0
    }
  }')

# output the first set of users
echo ${results} > $tmpdir/file.first 

users=$(echo ${results} | jq -r '.users')
usersCount=$(echo ${users} | jq -r length)

totalUsers=$(echo $results | jq -r .total)
totalUsers=$(($totalUsers - $usersCount))

nextResults=$(echo $results | jq -r .nextResults)

# get the next set of users
while [ $totalUsers -gt 0 ]
do
    printf "."
    results=$(curl -s -XPOST \
        -H 'Content-type: application/json' \
        -H "Authorization: $API_KEY" \
        $BASE_URL'/api/user/search' \
        -d '{
        "search": {
          "numberOfResults": 1000,
          "nextResults": "'${nextResults}'"
        }
    }')

    # output the next set of users
    echo ${results} > $tmpdir/file.${nextResults}

    users=$(echo ${results} | jq -r '.users')
    usersCount=$(echo ${users} | jq -r length)

    # update remaining user count to be retrieved
    totalUsers=$(($totalUsers - $usersCount))

    nextResults=$(echo $results | jq -r .nextResults)
done

jq 'reduce inputs as $i (.; .users += $i.users)| del(.total)|del(.nextResults)' $tmpdir/file*> users.json

rm -rf $tmpdir
