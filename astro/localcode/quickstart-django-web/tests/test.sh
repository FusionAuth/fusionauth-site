#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Initialised up front so cleanup stays safe under `set -u` when an early step
# fails before the app has been started.
LOGS_PID=""

# Seconds to wait for a service to come up before giving up. Without this the
# readiness loops below can hang until the CI job's own time limit.
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop django 2>/dev/null || true
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

# Checks for the rendered login page rather than just an open port, so the test
# does not start before Kickstart has finished configuring FusionAuth.
fusionauth_ready() {
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "Login | FusionAuth"
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing dependencies and running Django checks..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app python:3.12 sh -c \
  "pip install -q -r requirements.txt && cd mysite && python manage.py check"

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Django app..."
docker run --network host --name django --rm -v "$PROJECT_DIR/complete-application":/app -w /app/mysite python:3.12 sh -c \
  "pip install -q -r ../requirements.txt && python manage.py migrate && python manage.py runserver 0.0.0.0:8000" &
DJANGO_PID=$!
until docker inspect django > /dev/null 2>&1; do
  sleep 1
done
docker logs -f django &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Waiting for Django app to be ready..."
wait_for "Django app" curl -sf http://localhost:8000

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
