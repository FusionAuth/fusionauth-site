#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
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
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"
}

kickstart_done() {
  curl -sf http://localhost:9011/api/application/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
    -H "Authorization: $(python3 -c "import json; print(json.load(open('$PROJECT_DIR/kickstart/kickstart.json'))['variables']['apiKey'])")"
}

mysql_ready() {
  docker compose exec -T db2 mysqladmin -u drupal -pverybadpassword -P 3307 --protocol=tcp ping
}

drupal_ready() {
  curl -sf http://localhost/ | grep -q "Welcome to Changebank"
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling images..."
docker compose pull

echo "Starting FusionAuth and Drupal..."
docker compose up -d

wait_for "Drupal's database" mysql_ready

# the same step the README has readers run
echo "Installing Drupal from config/sync..."
docker compose exec -T web sh install.sh

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done
wait_for "Drupal" drupal_ready

# Drupal's OpenID Connect client sends the browser to host.docker.internal:9011, so the
# browser container needs that name to reach the host, as the web container already does.
echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --add-host host.docker.internal:host-gateway --name playwright-test --rm \
  -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
