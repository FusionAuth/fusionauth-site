#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Installing dependencies and running Django checks..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app python:3.8 sh -c \
  "pip install -q -r requirements.txt && cd mysite && python manage.py check"

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
