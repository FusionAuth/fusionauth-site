#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_PID=""
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop php 2>/dev/null || true
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
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "Login | FusionAuth"
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing dependencies and running Laravel checks..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app composer:2.10 sh -c \
  "composer install --no-interaction && php artisan config:clear && php artisan route:list > /dev/null"

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting PHP app..."
docker run --network host --name php --rm -v "$PROJECT_DIR/complete-application":/app -w /app composer:2.10 sh -c \
  "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000" &
PHP_PID=$!
until docker inspect php > /dev/null 2>&1; do
  sleep 1
done
docker logs -f php &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Waiting for PHP app to be ready..."
wait_for "PHP app" curl -sf http://localhost:8000

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
