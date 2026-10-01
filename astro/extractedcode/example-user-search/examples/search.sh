#!/bin/sh

FILE=$1

API_KEY=90d8fb62-6f13-47d4-8ef6-1c3e687883c6
BASE_URL='http://localhost:9011'
#BASE_URL='https://sandbox.fusionauth.io'

curl -XPOST \
     -H 'Content-type: application/json' \
     -H "Authorization: $API_KEY" \
    $BASE_URL'/api/user/search' \
    -d @$FILE


