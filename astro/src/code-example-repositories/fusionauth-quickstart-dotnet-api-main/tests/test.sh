#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app mcr.microsoft.com/dotnet/sdk:7.0 dotnet build

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
