#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Type-checking complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app node:20 sh -c "npm install && npx tsc --noEmit"

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
