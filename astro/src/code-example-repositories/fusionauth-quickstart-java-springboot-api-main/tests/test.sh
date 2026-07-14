#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$(pwd)/complete-application:/app" -w /app maven:3.9-eclipse-temurin-17 mvn -q package -DskipTests

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
