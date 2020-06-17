#!/usr/bin/env bash

PATH=~/.rbenv/bin:$PATH

eval "$(rbenv init -)"

# Note: if you make changes to this file, you will have to run sb push twice because the first execution will run the old version.

if [[ ! "$(hostname)" = "www-1" ]]; then
  echo "You are only supposed to run this on fusionauth.io, run sb push instead."
  exit 0
fi

set -e

export JEKYLL_ENV=production

cd /var/git/fusionauth-site

git pull

# Update dependencies
bundle install

# Prevent dirty builds
bundle exec jekyll clean

# Build the site
bundle exec jekyll build

# Move to the Apache dir
rm -rf /var/www/fusionauth.io
mv _site /var/www/fusionauth.io
chown www-data:www-data /var/www/fusionauth.io

# Build a sym link for the login style, assuming only one website-style file
cd site/assets/css
ln -s `ls fusionauth-website-style*.css|head -n 1` fusionauth-login-style.css
