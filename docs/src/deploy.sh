#!/usr/bin/env bash

set -e

cd /var/git/fusionauth-docs

git pull

bundle exec jekyll build

rm -rf /var/www/docs/*

cp -R _site/* /var/www/docs
