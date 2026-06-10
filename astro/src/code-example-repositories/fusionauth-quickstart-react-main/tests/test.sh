#!/usr/bin/env bash
set -euo pipefail

echo "Validating docker compose config..."
docker compose -f fusionauth-backend/docker-compose.yml config > /dev/null

for STEP_DIR in react-frontend-steps/*/; do
  STEP_NAME=$(basename "$STEP_DIR")
  echo "Type-checking $STEP_NAME..."
  docker run --rm -v "$(pwd)/$STEP_DIR:/app" -w /app node:24-alpine sh -c "npm install && npx tsc --noEmit"
done

echo "Basic syntax validation correct. TODO: write more comprehensive tests."
