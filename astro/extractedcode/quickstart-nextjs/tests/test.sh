#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FA_REPO_DIR="$(mktemp -d)/fusionauth-quickstart-app"

cleanup() {
  echo "Cleaning up..."
  kill $APP_PID 2>/dev/null || true
  docker stop nextjs-web-test 2>/dev/null || true
  if [ -d "$FA_REPO_DIR" ]; then
    cd "$FA_REPO_DIR" && docker compose down -v 2>/dev/null || true
  fi
  rm -rf "$(dirname "$FA_REPO_DIR")" 2>/dev/null || true
  rm -rf "$TEST_APP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

DEPS="next@16.4.6 react@19.3.1 react-dom@19.3.1 openid-client@6.9.0 iron-session@9.1.0"

echo "Building each staged app..."
for STAGE_DIR in "$PROJECT_DIR"/0-start "$PROJECT_DIR"/1-fusionauth-added "$PROJECT_DIR"/2-multi-user; do
  STAGE_NAME=$(basename "$STAGE_DIR")
  echo "  Building $STAGE_NAME..."
  BUILD_DIR="$(mktemp -d)"
  cp -R "$STAGE_DIR"/. "$BUILD_DIR"/
  docker run --rm -v "$BUILD_DIR:/app" -w /app node:24-slim sh -c "npm init -y > /dev/null && npm pkg set type=module && npm install --silent $DEPS && npx next build"
  rm -rf "$BUILD_DIR"
done

echo "Cloning the shared FusionAuth quickstart-app instance..."
git clone --depth 1 https://github.com/FusionAuth/fusionauth-quickstart-app.git "$FA_REPO_DIR"

echo "Validating docker compose config..."
(cd "$FA_REPO_DIR" && docker compose config > /dev/null)

echo "Pulling latest FusionAuth image..."
(cd "$FA_REPO_DIR" && docker compose pull)

echo "Starting FusionAuth..."
(cd "$FA_REPO_DIR" && docker compose up -d)

echo "Waiting for FusionAuth to be ready..."
timeout 480 bash -c 'until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep "<title>Login" > /dev/null; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done'
echo "FusionAuth is ready."

TEST_APP_DIR="$(mktemp -d)"
echo "Setting up 2-multi-user stage for the live login test..."
cp -R "$PROJECT_DIR/2-multi-user"/. "$TEST_APP_DIR/"
cp "$PROJECT_DIR/1-fusionauth-added/.env" "$TEST_APP_DIR/"

echo "Enabling self-service registration fields on the QuickStart App (matches guide's manual admin-UI step)..."
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
curl -sf -X PATCH http://localhost:9011/api/application/f0510a74-da7a-4101-a474-05e7f1d5ba7e \
  -H "Authorization: $API_KEY" -H "Content-Type: application/json" \
  -d '{
    "application": {
      "registrationConfiguration": {
        "birthDate": {"enabled": true, "required": true},
        "firstName": {"enabled": true, "required": true},
        "lastName": {"enabled": true, "required": true}
      }
    }
  }' > /dev/null


echo "Starting Next.js app..."
docker run --network host --name nextjs-web-test --rm -v "$TEST_APP_DIR:/app" -w /app node:24-slim sh -c \
  "npm init -y > /dev/null && npm pkg set type=module && npm install --silent $DEPS && npx next dev" &
APP_PID=$!

echo "Waiting for Next.js app to be ready..."
timeout 180 bash -c 'until curl -s -o /dev/null http://localhost:3000/login; do
  echo "  Waiting for Next.js app..."
  sleep 2
done'
echo "Next.js app is ready."

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
