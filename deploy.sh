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
npm install

# Prevent dirty builds
bundle exec jekyll clean

# Build the site
bundle exec jekyll build

# Copy to the Apache dir
cp -R _site/* /var/www/fusionauth.io
cp _site/.* /var/www/fusionauth.io

# Setup the cron jobs
cp dockerhub-pull-count.rb /etc/cron.daily/dockerhub-pull-count
chmod +x /etc/cron.daily/dockerhub-pull-count
cp download-counts.rb /etc/cron.daily/download-counts
chmod +x /etc/cron.daily/download-counts
cp resource-download-counts.rb /etc/cron.daily/resource-download-counts
chmod +x /etc/cron.daily/resource-download-counts
