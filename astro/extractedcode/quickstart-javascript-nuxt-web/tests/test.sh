#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_DIR/complete-application"
LOGS_PID=""
CREATED_ENV=""
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop nuxt 2>/dev/null || true
  [ -n "$CREATED_ENV" ] && rm -f "$APP_DIR/.env"
  # keeps build output out of snippet extraction; containers write it as root, so delete it from one
  docker run --rm -v "$APP_DIR":/app node:22 rm -rf /app/.nuxt /app/.output
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

# wait_for <description> <command...> - poll until the command succeeds or the
# timeout expires, failing loudly rather than hanging.
wait_for() {
  local description="$1"; shift
  local deadline=$(( SECONDS + READINESS_TIMEOUT ))
  until "$@" > /dev/null 2>&1; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "Timed out after ${READINESS_TIMEOUT}s waiting for ${description}." >&2
      return 1
    fi
    echo "  Waiting for ${description}..."
    sleep 5
  done
  echo "${description} is ready."
}

fusionauth_ready() {
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep "<title>Login" > /dev/null
}

nuxt_ready() {
  curl -sf http://localhost:3000
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

# the README has readers copy .env.example to .env
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  CREATED_ENV=1
fi

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Nuxt app..."
docker run --network host --name nuxt --rm -v "$APP_DIR":/app -w /app node:22 bash -c \
  "npm ci && npm run dev -- --host 0.0.0.0 --port 3000" &
until docker inspect nuxt > /dev/null 2>&1; do
  sleep 1
done
docker logs -f nuxt &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Waiting for Nuxt app to be ready..."
wait_for "Nuxt app" nuxt_ready

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
