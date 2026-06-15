#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Building Go application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app golang:1.21 go build ./...

echo "All tests passed."
