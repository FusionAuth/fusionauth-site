#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Installing gems for complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app ruby:2.7.5 sh -c "bundle install --quiet"

echo "Syntax-checking complete-application Ruby files..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app ruby:2.7.5 sh -c \
  "find app config -name '*.rb' -print0 | xargs -0 -n1 ruby -c"

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
