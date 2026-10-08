#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=33052c8a-c283-4e96-9d2a-eb1215c69f8f-not-for-prod
APPLICATION_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e
WORK_DIR="$(mktemp -d)"

cleanup() {
  status=$?
  echo "Cleaning up..."
  docker stop changebank-apis moneyscope 2>/dev/null || true
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
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"
}

# the tenant update is the last request in the kickstart
kickstart_done() {
  curl -sf http://localhost:9011/api/user/registration/00000000-0000-0000-0000-111111111111/$APPLICATION_ID -H "Authorization: $API_KEY"
}

scope_count() {
  curl -sf http://localhost:9011/api/application/$APPLICATION_ID -H "Authorization: $API_KEY" |
    python3 -c 'import json, sys; print(len(json.load(sys.stdin)["application"].get("scopes", [])))'
}

# start_app <container name> <dir> <command> - run one of the project's apps from a copy, with its .env.sample as .env
start_app() {
  docker run -d --network host --name "$1" --rm -v "$PROJECT_DIR/$2":/src:ro node:20 bash -c \
    "cp -r /src /app && cd /app && cp .env.sample .env && npm install --no-audit --no-fund --loglevel=error && $3" > /dev/null
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

for app in changebank-apis create-application; do
  echo "Checking $app syntax..."
  docker run --rm -v "$PROJECT_DIR/$app":/app:ro -w /app node:20 bash -c 'for f in $(find . -name "*.js" -not -path "./node_modules/*") bin/www; do [ -f "$f" ] && node --check "$f"; done; true'
done
echo "Type-checking MoneyScope..."
docker run --rm -v "$PROJECT_DIR/moneyscope-application":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && npm install --no-audit --no-fund --loglevel=error && npx tsc --noEmit --skipLibCheck"

# custom scopes need a paid plan; the kickstart's licenseId is a placeholder readers replace
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
[ "$(scope_count)" = 5 ] || { echo "Expected the kickstart to create 5 scopes, got $(scope_count)" >&2; exit 1; }

echo "Starting the Changebank APIs and MoneyScope..."
start_app changebank-apis changebank-apis "npm run dev"
start_app moneyscope moneyscope-application "npm run dev"
wait_for "the Changebank APIs" curl -sf http://localhost:3000/
wait_for "MoneyScope" curl -sf http://localhost:8080/

echo "Checking the APIs refuse a request without a token..."
status="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/read-balance)"
[ "$status" = 401 ] || [ "$status" = 403 ] || { echo "Expected 401 or 403 without a token, got $status" >&2; exit 1; }

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"

# the SDK script recreates what the kickstart made, so remove that first
echo "Recreating the application with the SDK script..."
curl -sf -X DELETE "http://localhost:9011/api/application/$APPLICATION_ID?hardDelete=true" -H "Authorization: $API_KEY"
docker run --rm --network host -v "$PROJECT_DIR/create-application":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && printf 'FUSIONAUTH_API_KEY=$API_KEY\nBASE_URL=http://localhost:9011\n' > .env && npm install --no-audit --no-fund --loglevel=error && npm run --silent create"
[ "$(scope_count)" = 5 ] || { echo "Expected create-application to create 5 scopes, got $(scope_count)" >&2; exit 1; }

echo "All API consents checks passed."
