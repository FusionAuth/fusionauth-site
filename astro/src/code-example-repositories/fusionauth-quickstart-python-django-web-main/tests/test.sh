#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cleanup() {
  echo "Cleaning up..."
  kill $LOGS_PID 2>/dev/null || true
  docker stop django 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing dependencies and running Django checks..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app python:3.8 sh -c \
  "pip install -q -r requirements.txt && cd mysite && python manage.py check"

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Django app..."
docker run --network host --name django --rm -v "$PROJECT_DIR/complete-application":/app -w /app/mysite python:3.8 sh -c \
  "pip install -q -r ../requirements.txt && python manage.py migrate && python manage.py runserver 0.0.0.0:8000" &
DJANGO_PID=$!
until docker inspect django > /dev/null 2>&1; do
  sleep 1
done
docker logs -f django &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
until curl -sf http://localhost:9011 > /dev/null 2>&1; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Waiting for Django app to be ready..."
until curl -sf http://localhost:8000 > /dev/null 2>&1; do
  echo "  Waiting for Django app..."
  sleep 5
done
echo "Django app is ready."

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.61.1 bash -c "npm install -g @playwright/test && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
