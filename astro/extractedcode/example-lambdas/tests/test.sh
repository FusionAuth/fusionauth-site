#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=6b87a398-39f2-4692-927b-13188a81a9a3-not-for-prod
WORK_DIR="$(mktemp -d)"
COMPOSE=(docker compose -f docker-compose.yml -f "$WORK_DIR/license.yml")

cleanup() {
  status=$?
  if [ -f "$WORK_DIR/license.yml" ]; then
    if [ "${status:-0}" -ne 0 ]; then (cd "$PROJECT_DIR" && "${COMPOSE[@]}" logs --tail 80 2>&1) || true; fi
    (cd "$PROJECT_DIR" && "${COMPOSE[@]}" down -v 2>/dev/null) || true
  fi
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

# wait_for <description> <command...> - poll until the command succeeds or the timeout expires
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

# the group membership is the last thing Kickstart creates
kickstart_done() {
  curl -sf "http://localhost:9011/api/group/member/search?groupId=a7a1a4d9-6f0e-4b8e-9d34-3d9a6f1f2c11" \
    -H "Authorization: $API_KEY" | grep "00000000-0000-0000-0000-000000000002" > /dev/null
}

# mounts astro so harness/release-types.test.js can read the release snapshot and lambdas.json
run_node() {
  docker run --rm --network host -v "$PROJECT_DIR/../..":/astro:ro -w /astro/extractedcode/example-lambdas node:22 "$@"
}

echo "Running the lambda example tests in the harness..."
run_node node --test

# fetch needs a licensed FusionAuth; the kickstart's licenseId is a placeholder
if [ -z "${FUSIONAUTH_LICENSE_KEY:-}" ]; then
  echo "FUSIONAUTH_LICENSE_KEY is not set, so skipping the conformance check against a real FusionAuth."
  exit 0
fi

cd "$PROJECT_DIR"
cp -r kickstart "$WORK_DIR/kickstart"
python3 - "$WORK_DIR/kickstart/kickstart.json" <<'PY'
import json, os, sys
k = json.load(open(sys.argv[1]))
k['licenseId'] = os.environ['FUSIONAUTH_LICENSE_KEY']
json.dump(k, open(sys.argv[1], 'w'), indent=2)
PY
cat > "$WORK_DIR/license.yml" <<YML
services:
  fusionauth:
    volumes:
      - $WORK_DIR/kickstart:/usr/local/fusionauth/kickstart
YML

echo "Starting FusionAuth..."
"${COMPOSE[@]}" pull --quiet
"${COMPOSE[@]}" up -d
wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done

echo "Comparing the harness with FusionAuth..."
run_node node conformance/check.js

echo "All lambda checks passed."
