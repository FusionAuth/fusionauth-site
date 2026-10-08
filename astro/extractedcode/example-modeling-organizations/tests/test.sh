#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=33052c8a-c283-4e96-9d2a-eb1215c69f8f-not-for-prod
WORK_DIR="$(mktemp -d)"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs awesomecrm 2>&1 | tail -40 || true
  fi
  echo "Cleaning up..."
  docker rm -f awesomecrm > /dev/null 2>&1 || true
  if [ "${status:-0}" -ne 0 ]; then (cd "$PROJECT_DIR" && docker compose logs --tail 80 2>&1) || true; fi
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
  rm -rf "$WORK_DIR"
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

# the tenant update is the last request in the kickstart
kickstart_done() {
  curl -sf http://localhost:9011/api/tenant/d7d09513-a3f5-401c-9685-34ab6c552453 -H "Authorization: $API_KEY" |
    python3 -c 'import json, sys; sys.exit(0 if json.load(sys.stdin)["tenant"].get("themeId") not in (None, "75a068fd-e94b-451a-9aeb-3ddb9a3b5987") else 1)'
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Checking AwesomeCRM syntax..."
docker run --rm -v "$PROJECT_DIR/complete-application":/app:ro -w /app node:20 bash -c \
  'for f in $(find . -name "*.js" -not -path "./node_modules/*" -not -path "./public/*") bin/www; do node --check "$f"; done'

# entities need a paid plan; the kickstart's licenseId is a placeholder readers replace
if [ -z "${FUSIONAUTH_LICENSE_KEY:-}" ]; then
  echo "FUSIONAUTH_LICENSE_KEY is not set, so skipping the checks that need a licensed FusionAuth."
  exit 0
fi
cp -r "$PROJECT_DIR/kickstart" "$WORK_DIR/kickstart"
python3 - "$WORK_DIR/kickstart/kickstart.json" <<'PY'
import json, os, sys
k = json.load(open(sys.argv[1]))
k['licenseId'] = os.environ['FUSIONAUTH_LICENSE_KEY']
json.dump(k, open(sys.argv[1], 'w'), indent=2)
PY
cat > "$WORK_DIR/license.yml" <<EOF
services:
  fusionauth:
    volumes:
      - $WORK_DIR/kickstart:/usr/local/fusionauth/kickstart
EOF

echo "Pulling images..."
docker compose -f docker-compose.yml -f "$WORK_DIR/license.yml" pull

echo "Starting FusionAuth..."
docker compose -f docker-compose.yml -f "$WORK_DIR/license.yml" up -d

wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done

# a copy keeps the sales, billing and report uploads the app writes out of the repo
echo "Starting AwesomeCRM..."
docker run -d --network host --name awesomecrm -v "$PROJECT_DIR/complete-application":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npm start" > /dev/null
wait_for "AwesomeCRM" curl -sf http://localhost:3000/

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
