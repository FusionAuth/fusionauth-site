#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Type-checking complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app node:22 sh -c "npm install && npm run typecheck"

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
