#!/bin/bash

API_KEY=...
FA_HOSTNAME=http://localhost:9011

# expect fulluserdownload.sh to have been run and to have users.json in our cwd

userids=`cat users.json|jq '.users[]|.id'|sed 's/"//g'`

pw_count=0
fb_count=0  # 56abdcc7-8bd9-4321-9621-4e9bbebae494.
g_count=0  # 82339786-3dff-42a6-aac6-1f1ceecb6c46
other_count=0

for userid in $userids; do
  #echo $userid
  res=`curl -s -H 'Authorization: '$API_KEY $FA_HOSTNAME/api/identity-provider/link?userId=$userid`
  count=`echo $res|jq '.identityProviderLinks|length'`
  #echo $count
  if [ $count -eq 0 ]; then
    let "pw_count=pw_count+1"
  else
    linkids=`echo $res|jq '.identityProviderLinks[]|.identityProviderId'|sed 's/"//g'`
    for id in $linkids; do
      if [ $id == "56abdcc7-8bd9-4321-9621-4e9bbebae494" ]; then
        let "fb_count=fb_count+1"
      elif [ $id == "82339786-3dff-42a6-aac6-1f1ceecb6c46" ]; then
        let "g_count=g_count+1"
      else
        let "others_count=others_count+1"
      fi
    done
  fi
  # sleep random amount
  #sleep $((RANDOM % 2))
done

echo "passwords: $pw_count"
echo "fb: $fb_count"
echo "google: $g_count"
echo "others: $others_count"
