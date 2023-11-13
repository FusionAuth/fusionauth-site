#!/bin/sh

API_KEY=...
JSON_FILE_DIR=...
FA_HOST=...

for file in $JSON_FILE_DIR/*.json; do
  echo "Processing $file";
  RES=`curl --max-time 600 \
       -s -w "%{http_code}" \
       -H "Authorization: $API_KEY" \
       -H "Content-type: application/json" \
       -XPOST \
       $FA_HOST/api/user/import \
       -d@$file`
  if [ "$RES" -ne "200" ]; then
    echo "Error: $RES";
    exit 1;
  fi
done
