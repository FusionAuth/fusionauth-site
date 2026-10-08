#!/bin/sh
# Builds the Changebank Drupal site: downloads Drupal and its modules with Composer, installs the
# site from the exported configuration in config/sync, and creates its content.
# Run it inside the web container: docker compose exec web sh install.sh
set -e
cd "$(dirname "$0")"

# composer.lock pins openid_connect to a 3.x-dev commit, which Composer fetches with git,
# and the official drupal image ships without git or unzip
if ! command -v git > /dev/null || ! command -v unzip > /dev/null; then
  apt-get update -qq && apt-get install -y -qq git unzip > /dev/null
fi

composer install --no-interaction

mkdir -p web/sites/default/files
chown -R www-data:www-data web/sites/default/files

vendor/bin/drush site:install --existing-config --account-name=admin --account-pass=admin --yes
vendor/bin/drush php:script default-content/create-content.php
vendor/bin/drush cache:rebuild
