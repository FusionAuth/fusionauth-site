#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app rust:1.90 sh -c \
  "apt-get update -qq && apt-get install -y -qq pkg-config libssl-dev >/dev/null 2>&1 && cargo build && rm -rf target Cargo.lock"

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
