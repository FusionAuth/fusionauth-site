#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FA_REPO_DIR="$(mktemp -d)/fusionauth-quickstart-app"

cleanup() {
  echo "Cleaning up..."
  kill $EXPRESS_PID 2>/dev/null || true
  docker stop express-web-test 2>/dev/null || true
  if [ -d "$FA_REPO_DIR" ]; then
    cd "$FA_REPO_DIR" && docker compose down -v 2>/dev/null || true
  fi
  rm -rf "$(dirname "$FA_REPO_DIR")" 2>/dev/null || true
  rm -rf "$TEST_APP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

echo "Checking syntax of each staged express-app.js..."
for STAGE_DIR in "$PROJECT_DIR"/0-start "$PROJECT_DIR"/1-fusionauth-added "$PROJECT_DIR"/2-multi-user; do
  STAGE_NAME=$(basename "$STAGE_DIR")
  echo "  Syntax-checking $STAGE_NAME..."
  docker run --rm -v "$STAGE_DIR:/app" -w /app node:26 node --check express-app.js
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
timeout 480 bash -c 'until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done'
echo "FusionAuth is ready."

TEST_APP_DIR="$(mktemp -d)"
echo "Setting up 2-multi-user stage for the live login test..."
cp "$PROJECT_DIR/2-multi-user/express-app.js" "$TEST_APP_DIR/"
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

echo "Installing Express app dependencies..."
docker run --rm -v "$TEST_APP_DIR:/app" -w /app node:26 \
  npm install express passport passport-oauth2 express-session dotenv jsonwebtoken

echo "Starting Express app..."
docker run --network host --name express-web-test --rm -v "$TEST_APP_DIR:/app" -w /app node:26 node express-app.js &
EXPRESS_PID=$!

echo "Waiting for Express app to be ready..."
timeout 120 bash -c 'until curl -sf http://localhost:3000 > /dev/null 2>&1; do
  echo "  Waiting for Express app..."
  sleep 2
done'
echo "Express app is ready."

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
