#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_KEY="90d8fb62-6f13-47d4-8ef6-1c3e687883c6"
BASE_URL="http://localhost:9011"

cleanup() {
  echo "Cleaning up..."
  (cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true)
}
trap cleanup EXIT

echo "Validating docker compose config..."
(cd "$PROJECT_DIR" && docker compose config > /dev/null)

echo "Starting FusionAuth + OpenSearch..."
(cd "$PROJECT_DIR" && docker compose up -d)

echo "Waiting for FusionAuth to be ready..."
timeout 480 bash -c "until curl -sfL $BASE_URL/admin/ 2>/dev/null | grep -q '<title>Login'; do
  echo '  Waiting for FusionAuth...'
  sleep 5
done"
echo "FusionAuth is ready."

echo "Waiting for search indexing to settle..."
sleep 5

echo "Running example-user-search queries against seeded Kickstart users..."

run_search() {
  local file=$1
  local expect=$2
  local result
  result=$(curl -sf -X POST \
    -H "Content-type: application/json" \
    -H "Authorization: $API_KEY" \
    "$BASE_URL/api/user/search" \
    -d @"$file")
  if ! echo "$result" | grep -q "$expect"; then
    echo "FAIL: $file did not return expected user ($expect)"
    echo "$result"
    exit 1
  fi
  echo "  OK: $(basename "$file")"
}

run_search "$PROJECT_DIR/examples/queryString/email-data-request.json" "dinesh@fusionauth.io"
run_search "$PROJECT_DIR/examples/queryString/all-fields-data-request.json" "fusionauth.io"
run_search "$PROJECT_DIR/examples/queryString/email-verified-data-request.json" "fusionauth.io"
run_search "$PROJECT_DIR/examples/ids/ids-request.json" "fusionauth.io"
run_search "$PROJECT_DIR/examples/query/user-data-simple-request.json" "fusionauth.io"
run_search "$PROJECT_DIR/examples/query/user-data-complex-request.json" "fusionauth.io"

echo "All example-user-search queries returned expected results."
