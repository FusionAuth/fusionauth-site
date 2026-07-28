#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cleanup() {
  echo "Cleaning up..."
  kill $LOGS_PID 2>/dev/null || true
  docker stop rust-actix 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app rust:1.90 sh -c \
  "apt-get update -qq && apt-get install -y -qq pkg-config libssl-dev >/dev/null 2>&1 && cargo build"

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Rust Actix app..."
docker run --network host --name rust-actix --rm -v "$PROJECT_DIR/complete-application":/app -w /app rust:1.90 sh -c \
  "apt-get update -qq && apt-get install -y -qq pkg-config libssl-dev >/dev/null 2>&1 && ./target/debug/your-application" &
RUST_PID=$!
until docker inspect rust-actix > /dev/null 2>&1; do
  sleep 1
done
docker logs -f rust-actix &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "Login | FusionAuth"; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Waiting for Rust Actix app to be ready..."
until curl -sf http://localhost:9012 > /dev/null 2>&1; do
  echo "  Waiting for Rust Actix app..."
  sleep 5
done
echo "Rust Actix app is ready."

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
