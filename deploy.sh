#!/usr/bin/env bash

# Note: if you make changes to this file, you will have to run sb push twice because the first execution will run the old version.

if [[ ! "$(hostname)" = "fusionauth" ]]; then
  echo "You are only supposed to run this on fusionauth.io, run sb push instead."
  exit 0
fi

set -e

cd /var/git/fusionauth-site

git pull

# Update dependencies
# bundle update

# Prevent dirty builds
bundle exec jekyll clean

bundle exec jekyll build

cp -R _site/* /var/www/fusionauth.io
