#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FA_REPO_DIR="$(mktemp -d)/fusionauth-quickstart-app"
WORK_DIR="$(mktemp -d)"

cleanup() {
  echo "Cleaning up..."
  kill $APP_PID 2>/dev/null || true
  docker stop rails-web-test 2>/dev/null || true
  if [ -d "$FA_REPO_DIR" ]; then
    cd "$FA_REPO_DIR" && docker compose down -v 2>/dev/null || true
  fi
  rm -rf "$(dirname "$FA_REPO_DIR")" 2>/dev/null || true
  docker run --rm -v "$WORK_DIR:/work" "$RUBY_IMAGE" find /work -mindepth 1 -delete 2>/dev/null || true
  rm -rf "$WORK_DIR" 2>/dev/null || true
}
RUBY_IMAGE="ruby:4.0"
GEMS_VOLUME="rails-quickstart-test-gems"
APP_PID=""
trap cleanup EXIT

echo "Generating a new Rails app..."
docker run --rm -v "$GEMS_VOLUME:/usr/local/bundle" -v "$WORK_DIR:/work" -w /work "$RUBY_IMAGE" sh -c \
  "gem install rails -v 8.1.4.1 --no-document && rails new base --minimal --skip-active-record --skip-git && chown -R $(id -u):$(id -g) base"

echo "Checking each staged app loads..."
for STAGE_DIR in "$PROJECT_DIR"/0-start "$PROJECT_DIR"/1-fusionauth-added "$PROJECT_DIR"/2-multi-user; do
  STAGE_NAME=$(basename "$STAGE_DIR")
  echo "  Checking $STAGE_NAME..."
  cp -R "$WORK_DIR/base" "$WORK_DIR/$STAGE_NAME"
  cp -R "$STAGE_DIR"/. "$WORK_DIR/$STAGE_NAME"/
  ADD_GEMS="true"
  if [ "$STAGE_NAME" != "0-start" ]; then
    ADD_GEMS="bundle add omniauth_openid_connect --version 0.8.0 && bundle add omniauth-rails_csrf_protection --version 2.0.1 && bundle add dotenv --version 3.2.0"
  fi
  docker run --rm -v "$GEMS_VOLUME:/usr/local/bundle" -v "$WORK_DIR/$STAGE_NAME:/app" -w /app "$RUBY_IMAGE" sh -c \
    "$ADD_GEMS && bin/rails zeitwerk:check"
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

echo "Setting up 2-multi-user stage for the live login test..."
cp "$PROJECT_DIR/1-fusionauth-added/.env" "$WORK_DIR/2-multi-user/"

echo "Starting Rails app..."
docker run --network host --name rails-web-test --rm -v "$GEMS_VOLUME:/usr/local/bundle" -v "$WORK_DIR/2-multi-user:/app" -w /app "$RUBY_IMAGE" \
  bin/rails server &
APP_PID=$!

echo "Waiting for Rails app to be ready..."
timeout 180 bash -c 'until curl -s -o /dev/null http://localhost:3000/login; do
  echo "  Waiting for Rails app..."
  sleep 2
done'
echo "Rails app is ready."

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
