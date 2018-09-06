#!/usr/bin/env bash

HOSTNAME=`hostname`

if [ ! "$HOSTNAME" = "fusionauth" ]; then
  echo "You are only supposed to run this on fusionauth.io"
  exit 0
fi

set -e

cd /var/git/fusionauth-site

git pull

bundle exec jekyll build

cp -R _site/* /var/www/fusionauth.io
