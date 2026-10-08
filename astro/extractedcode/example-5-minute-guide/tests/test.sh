#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_LOG="$(mktemp)"
APP_PID=""

cleanup() {
  if [ -n "$APP_PID" ]; then
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
  fi
  rm -f "$APP_LOG"
  docker rm -f five-minute-app > /dev/null 2>&1 || true
  docker compose -f "$PROJECT_DIR/tests/docker-compose.yml" down -v > /dev/null 2>&1 || true
}
trap cleanup EXIT

cd "$PROJECT_DIR"
npm ci --ignore-scripts --no-audit
node --check app.js
node --check < bin/www
node --check routes/index.js

PORT="$(node -e 'const server = require("node:net").createServer(); server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')"
PORT="$PORT" CLIENT_ID=test-client CLIENT_SECRET=test-secret BASE_URL=http://localhost:9011 node bin/www >"$APP_LOG" 2>&1 &
APP_PID=$!

for attempt in $(seq 1 30); do
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null | grep -q 'oauth2/authorize'; then
    break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    cat "$APP_LOG" >&2
    exit 1
  fi
  if [ "$attempt" -eq 30 ]; then
    cat "$APP_LOG" >&2
    echo "Example app did not start" >&2
    exit 1
  fi
  sleep 1
done

curl -fsS "http://127.0.0.1:$PORT/" | grep -q 'client_id=test-client'
curl -fsS "http://127.0.0.1:$PORT/" | grep -q 'code_challenge_method=S256'
test "$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/logout")" = 302

echo "Five-minute example install, syntax, login link, and logout smoke test passed"

# the guide has readers create the application and user by hand, so the login check brings its own FusionAuth (tests/kickstart)
echo "Starting FusionAuth..."
docker compose -f "$PROJECT_DIR/tests/docker-compose.yml" pull --quiet
docker compose -f "$PROJECT_DIR/tests/docker-compose.yml" up -d
for attempt in $(seq 1 60); do
  curl -fsS http://localhost:9011/api/user/registration/00000000-0000-0000-0000-111111111111/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
    -H "Authorization: five-minute-guide-test-api-key-not-for-production" > /dev/null 2>&1 && break
  [ "$attempt" -eq 60 ] && { echo "FusionAuth did not finish its kickstart" >&2; exit 1; }
  sleep 5
done

# port 3000 matches the redirect URL in the code; a copy keeps node_modules out of the repo
echo "Starting the app as readers run it..."
docker run -d --network host --name five-minute-app -v "$PROJECT_DIR":/src:ro \
  -e CLIENT_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e -e CLIENT_SECRET=super-secret-secret-that-should-be-regenerated-for-production \
  -e BASE_URL=http://localhost:9011 node:20 bash -c \
  "cp -r /src /app && cd /app && rm -rf node_modules && npm ci --no-audit --no-fund --loglevel=error && npm start" > /dev/null
for attempt in $(seq 1 60); do
  curl -fsS http://localhost:3000/ > /dev/null 2>&1 && break
  [ "$attempt" -eq 60 ] && { docker logs five-minute-app >&2; echo "Example app did not start on port 3000" >&2; exit 1; }
  sleep 2
done

echo "Running the login test..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$PROJECT_DIR/tests/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js" || {
  docker logs five-minute-app 2>&1 | tail -30
  exit 1
}

echo "Five-minute example login test passed"
