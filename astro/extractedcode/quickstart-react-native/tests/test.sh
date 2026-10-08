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

# the application is one of the last things Kickstart creates
kickstart_done() {
  python3 - "$PROJECT_DIR/kickstart/kickstart.json" <<'PY'
import json, sys, urllib.request
k = json.load(open(sys.argv[1]))
v = k['variables']
key = k['apiKeys'][0]['key'].replace('#{apiKey}', v.get('apiKey', ''))
req = urllib.request.Request(f"http://localhost:9011/api/application/{v['applicationId']}", headers={'Authorization': key})
urllib.request.urlopen(req, timeout=10)
PY
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done

echo "Checking FusionAuth against the kickstart..."
python3 "$SCRIPT_DIR/check-kickstart.py"

# Building the app is as far as CI can go: logging in needs an emulator and a public URL for FusionAuth.
# This is a managed Expo app with no native projects, so the build is Expo bundling the app's
# JavaScript for each platform, which fails on syntax, import and dependency errors.
echo "Bundling the Expo app for Android and iOS..."
docker run --rm -v "$PROJECT_DIR/complete-application":/app -w /app node:18 bash -c \
  "npm ci && npx expo export --platform android --output-dir /tmp/expo-android && npx expo export --platform ios --output-dir /tmp/expo-ios"
