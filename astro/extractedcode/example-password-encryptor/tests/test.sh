#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if command -v mvn >/dev/null 2>&1; then
  mvn -B verify
elif command -v docker >/dev/null 2>&1; then
  docker run --rm -v "$PROJECT_DIR:/work" -w /work \
    maven:3.9.11-eclipse-temurin-8 mvn -B verify
else
  echo "Maven or Docker is required to test this example." >&2
  exit 1
fi
