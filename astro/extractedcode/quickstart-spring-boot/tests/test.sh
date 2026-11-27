#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WORK_DIR="$(mktemp -d)"
FA_REPO_DIR="$WORK_DIR/fusionauth-quickstart-app"
APP_DIR="$WORK_DIR/app"
APP_CONTAINER=""
BROWSER_CONTAINER=""

cleanup() {
  if [ -n "$APP_CONTAINER" ]; then
    docker rm -f "$APP_CONTAINER" >/dev/null || true
  fi
  if [ -n "$BROWSER_CONTAINER" ]; then
    docker rm -f "$BROWSER_CONTAINER" >/dev/null || true
  fi
  if [ -d "$FA_REPO_DIR" ]; then
    (cd "$FA_REPO_DIR" && docker compose down -v) || true
  fi
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

git clone --depth 1 https://github.com/FusionAuth/fusionauth-quickstart-app.git "$FA_REPO_DIR"
# Give each run its own Compose resources and expose the two services only
# inside their shared container network namespace.
export COMPOSE_PROJECT_NAME="notes-test-$(basename "$WORK_DIR" | tr '[:upper:].' '[:lower:]-')"
cat > "$FA_REPO_DIR/docker-compose.override.yml" <<'YAML'
services:
  search:
    ports: !reset []
  fusionauth:
    ports: !reset []
YAML
(cd "$FA_REPO_DIR" && docker compose pull && docker compose up -d)
FA_CONTAINER="$(cd "$FA_REPO_DIR" && docker compose ps -q fusionauth)"

BROWSER_CONTAINER="$(docker run -d --network "container:$FA_CONTAINER" \
  -v "$SCRIPT_DIR:/tests:ro" -w /tests -e NODE_PATH=/opt/quickstart-test/lib/node_modules \
  mcr.microsoft.com/playwright:v1.62.0 sleep infinity)"
docker exec "$BROWSER_CONTAINER" npm install -g --prefix /opt/quickstart-test @playwright/test@1.62.0
docker exec "$BROWSER_CONTAINER" timeout 480 bash -c \
  'until curl -fsS http://localhost:9011/.well-known/openid-configuration >/dev/null; do sleep 3; done'

mkdir "$APP_DIR"

for stage in 0-start 1-fusionauth-added 2-multi-user; do
  echo "Testing $stage"
  cp -R "$PROJECT_DIR/$stage/." "$APP_DIR/"
  APP_CONTAINER="$(docker run -d --network "container:$FA_CONTAINER" \
    -v "$APP_DIR:/app" -v "$WORK_DIR/maven:/root/.m2" -w /app maven:3.9-eclipse-temurin-21 \
    mvn -B spring-boot:run -Dspring-boot.run.arguments=--server.port=3000)"
  if ! docker exec "$BROWSER_CONTAINER" timeout 180 bash -c \
    'until curl -fsS http://localhost:3000/ >/dev/null; do sleep 2; done'; then
    docker logs "$APP_CONTAINER"
    exit 1
  fi
  if [ "$stage" = 2-multi-user ]; then
    # Match the guide's registration settings before creating the second user.
    docker exec "$BROWSER_CONTAINER" curl -fsS -X PATCH \
      http://localhost:9011/api/application/f0510a74-da7a-4101-a474-05e7f1d5ba7e \
      -H 'Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works' \
      -H 'Content-Type: application/json' \
      -d '{"application":{"registrationConfiguration":{"firstName":{"enabled":true,"required":true},"lastName":{"enabled":true,"required":true}}}}' >/dev/null
  fi
  if ! docker exec -e "QUICKSTART_STAGE=$stage" "$BROWSER_CONTAINER" /opt/quickstart-test/bin/playwright test integration.spec.js --output=/tmp/test-results; then
    docker logs "$APP_CONTAINER"
    exit 1
  fi
  docker rm -f "$APP_CONTAINER" >/dev/null
  APP_CONTAINER=""
done
