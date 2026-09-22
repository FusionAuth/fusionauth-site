#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

LOGS_PID=0
cleanup() {
  echo "Cleaning up..."
  kill $LOGS_PID 2>/dev/null || true
  docker stop ruby 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Pulling latest FusionAuth image..."
cd "$PROJECT_DIR"
docker compose pull

echo "Starting FusionAuth..."
cd "$PROJECT_DIR"
docker compose up -d

echo "Starting app..."
docker run --network host --name ruby --rm -v gems:/usr/local/bundle -v "$PROJECT_DIR/complete-app":/app -w /app ruby:4.0.5 bash -c "bundle install && OP_SECRET_KEY=super-secret-secret-that-should-be-regenerated-for-production bundle exec rails s -b 0.0.0.0" &
RAILS_PID=$!
until docker inspect ruby > /dev/null 2>&1; do
  sleep 1
done
docker logs -f ruby &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
until curl -sf http://localhost:9011/admin/ > /dev/null 2>&1; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Waiting for app to be ready..."
until curl -sf http://localhost:3000 > /dev/null 2>&1; do
  echo "  Waiting for app..."
  sleep 5
done
echo "App is ready."

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
