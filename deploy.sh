#!/usr/bin/env bash

# Note: if you make changes to this file, you will have to run sb push twice because the first execution will run the old version.

if [[ ! "$(hostname)" = "fusionauth" ]]; then
  echo "You are only supposed to run this on fusionauth.io, run sb push instead."
  exit 0
fi

set -e

export GEM_HOME=/var/git/fusionauth-site/.gems
export JEKYLL_ENV=production

cd /var/git/fusionauth-site

git pull

# Update dependencies
bundle install
npm ci

# Prevent dirty builds
bundle exec jekyll clean

# Build the site
bundle exec jekyll build

# Move to the Apache dir
rm -rf /var/www/fusionauth.io
mv _site /var/www/fusionauth.io
chown www-data:www-data /var/www/fusionauth.io
