#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Initialised up front so cleanup stays safe under `set -u` if compose
# validation, app startup/build, or pulling fails. Otherwise cleanup aborts
# before docker compose down.
APP_PID=""
BACKEND_DIR="$PROJECT_DIR/backend_fusionauth"

cleanup() {
  echo "Cleaning up..."
  [ -n "$APP_PID" ] && kill "$APP_PID" 2>/dev/null || true
  docker stop angular-app-test 2>/dev/null || true
  (cd "$BACKEND_DIR" && docker compose down -v) 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
(cd "$BACKEND_DIR" && docker compose config > /dev/null)

# Verify build of every step.
for stepDir in "$PROJECT_DIR"/frontend_steps/*/; do
  stepName=$(basename "${stepDir%/}")
  echo "Building Angular step $stepName..."
  docker run --rm -v "$stepDir:/app" -w /app node:26 sh -c "npm ci && npx @angular/cli@22.2.6 build"
done

echo "Pulling latest FusionAuth image..."
(cd "$BACKEND_DIR" && docker compose pull)

echo "Starting FusionAuth..."
(cd "$BACKEND_DIR" && docker compose up -d)

echo "Waiting for FusionAuth to be ready..."
timeout 480 bash -c 'until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep "<title>Login" > /dev/null; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done'
echo "FusionAuth is ready."

# But test only the final step, 3.
echo "Starting Angular app (final step: 3_fetch_user_data)..."
docker run --network host --name angular-app-test --rm -v "$PROJECT_DIR/frontend_steps/3_fetch_user_data":/app -w /app node:26 sh -c "npm ci && npx @angular/cli@22.2.6 serve --host=0.0.0.0 --port=3000" &
APP_PID=$!

echo "Waiting for Angular app to be ready..."
timeout 120 bash -c 'until curl -sf http://localhost:3000 > /dev/null 2>&1; do
  echo "  Waiting for Angular app..."
  sleep 2
done'
echo "Angular app is ready."

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR:/tests" -w /tests mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
