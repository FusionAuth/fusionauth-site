#!/usr/bin/env bash

set -e

cd /var/git/fusionauth-site

git pull

bundle exec jekyll build

cp -R _site/* /var/www/fusionauth.io