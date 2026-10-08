#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=33052c8a-c283-4e96-9d2a-eb1215c69f8f-not-for-prod
WORK_DIR="$(mktemp -d)"

cleanup() {
  echo "Cleaning up..."
  docker stop m2m-apis 2>/dev/null || true
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

# the API entity's grant is the last thing Kickstart creates
kickstart_done() {
  curl -sf "http://localhost:9011/api/entity/dc99eb28-006c-480e-9854-f2d68cd72dcb/grant/search?recipientEntityId=f1ae8766-a4d8-4a92-acb6-869e47e9f38e" \
    -H "Authorization: $API_KEY" | grep -q '"grants"'
}

apis_ready() {
  curl -sf http://localhost:3000/ > /dev/null
}

# run_node <dir> <command> - run a script from a copy of one of the project's apps, with its .env.sample as .env
run_node() {
  docker run --rm --network host -v "$PROJECT_DIR/$1":/src:ro node:20 bash -c \
    "cp -r /src /app && cd /app && cp .env.sample .env && npm install --no-audit --no-fund --loglevel=error && $2"
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

for app in apis create-entity request-api update-plan; do
  echo "Checking $app syntax..."
  docker run --rm -v "$PROJECT_DIR/$app":/app:ro -w /app node:20 bash -c 'for f in $(find . -name "*.js" -not -path "./node_modules/*"); do node --check "$f"; done'
done

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

echo "Starting the APIs..."
docker run -d --network host --name m2m-apis --rm -v "$PROJECT_DIR/apis":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && cp .env.sample .env && npm install --no-audit --no-fund --loglevel=error && npm run dev" > /dev/null
wait_for "the APIs" apis_ready

echo "Requesting the news with a client credentials token..."
news="$(run_node request-api "npm run --silent request-news" 2>&1)"
echo "$news"
grep -q "news item" <<< "$news"

echo "Checking the API rejects a request without a token..."
status="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/news)"
[ "$status" = 401 ] || [ "$status" = 403 ] || { echo "Expected 401 or 403 without a token, got $status" >&2; exit 1; }

echo "Checking the radio entity's token can't read the weather..."
token="$(curl -sf -u "f1ae8766-a4d8-4a92-acb6-869e47e9f38e:qEbs2ssy3qoOqSaMYRCEUgvlqUdwOzajEaFScGjg" \
  -d grant_type=client_credentials -d "scope=target-entity:dc99eb28-006c-480e-9854-f2d68cd72dcb:news" \
  http://localhost:9011/oauth2/token | python3 -c 'import json, sys; print(json.load(sys.stdin)["access_token"])')"
status="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $token" http://localhost:3000/api/weather)"
[ "$status" = 403 ] || [ "$status" = 401 ] || { echo "Expected the weather request to be refused, got $status" >&2; exit 1; }

echo "Creating an entity with the SDK script..."
created="$(run_node create-entity "npm run --silent create" 2>&1)"
echo "$created"
if grep -qi "error" <<< "$created"; then
  echo "create-entity reported an error." >&2
  exit 1
fi

echo "All machine-to-machine checks passed."
