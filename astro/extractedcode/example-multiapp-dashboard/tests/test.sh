#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs bank-app 2>&1 | tail -20 || true
    docker logs insurance-app 2>&1 | tail -20 || true
  fi
  echo "Cleaning up..."
  docker rm -f bank-app insurance-app > /dev/null 2>&1 || true
  if [ "${status:-0}" -ne 0 ]; then (cd "$PROJECT_DIR" && docker compose logs --tail 80 2>&1) || true; fi
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

echo "Pulling images..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done
python3 "$SCRIPT_DIR/check-kickstart.py"

# the guide has readers paste theme/index.ftl into the Bank theme's Index template; do the same through the API
echo "Adding the dashboard to the Bank theme..."
python3 - "$PROJECT_DIR/theme/index.ftl" "$API_KEY" <<'PY'
import json, sys, urllib.request
template, key = open(sys.argv[1]).read(), sys.argv[2]
def call(method, path, body=None):
    request = urllib.request.Request('http://localhost:9011' + path, method=method, data=json.dumps(body).encode() if body else None,
                                     headers={'Authorization': key, 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(request))
theme_id = call('GET', '/api/tenant/d7d09513-a3f5-401c-9685-34ab6c552453')['tenant']['themeId']
call('PATCH', f'/api/theme/{theme_id}', {'theme': {'templates': {'index': template}}})
PY

# the apps join the faNetwork the root compose file creates, as their own compose files do; copies keep node_modules out of the repo
echo "Starting Changebank and Changeinsurance..."
docker run -d --network faNetwork -p 3000:3000 -e PORT=3000 --name bank-app -v "$PROJECT_DIR/bankApp":/src:ro node:23-alpine3.19 sh -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npm run start" > /dev/null
docker run -d --network faNetwork -p 3001:3001 -e PORT=3001 --name insurance-app -v "$PROJECT_DIR/insuranceApp":/src:ro node:23-alpine3.19 sh -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npm run start" > /dev/null
wait_for "Changebank" curl -sf http://localhost:3000/
wait_for "Changeinsurance" curl -sf http://localhost:3001/

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
