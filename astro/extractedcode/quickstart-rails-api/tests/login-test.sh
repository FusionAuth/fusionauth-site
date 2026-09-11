#!/usr/bin/env bash
set -euo pipefail

FA_URL="http://localhost:9011"
APP_URL="http://localhost:4001"
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
APPLICATION_ID="e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"

FAIL=0

login() {
  local login_id="$1"
  local password="$2"
  curl -s "$FA_URL/api/login" \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"loginId\":\"$login_id\",\"password\":\"$password\",\"applicationId\":\"$APPLICATION_ID\"}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])"
}

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  local body_file="${4:-}"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $description (expected $expected, got $actual)"
  else
    echo "  FAIL: $description (expected $expected, got $actual)"
    if [ -n "$body_file" ] && [ -f "$body_file" ]; then
      echo "  --- Response body ---"
      cat "$body_file"
      echo ""
      echo "  --- End response body ---"
    fi
    FAIL=1
  fi
}

echo "Logging in as teller@example.com..."
TELLER_TOKEN=$(login "teller@example.com" "password")

echo "Logging in as customer@example.com..."
CUSTOMER_TOKEN=$(login "customer@example.com" "password")

echo "Testing /make-change..."
CODE=$(curl -s -o /tmp/rails-mc-teller.json -w "%{http_code}" "$APP_URL/make-change?total=1.02" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /make-change" 200 "$CODE" /tmp/rails-mc-teller.json
grep -q "4 quarters" /tmp/rails-mc-teller.json && echo "  PASS: correct change breakdown for \$1.02" || { echo "  FAIL: unexpected change breakdown"; cat /tmp/rails-mc-teller.json; FAIL=1; }

CODE=$(curl -s -o /tmp/rails-mc-customer.json -w "%{http_code}" "$APP_URL/make-change?total=1.02" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer can call /make-change" 200 "$CODE" /tmp/rails-mc-customer.json

CODE=$(curl -s -o /tmp/rails-mc-notoken.json -w "%{http_code}" "$APP_URL/make-change?total=1.02")
assert_status "no token on /make-change is rejected" 401 "$CODE" /tmp/rails-mc-notoken.json

# String#to_f returns 0.0 rather than raising, so without an explicit check
# these requests are answered as successful requests for zero change.
CODE=$(curl -s -o /tmp/rails-mc-nonsense.json -w "%{http_code}" "$APP_URL/make-change?total=nonsense" --cookie "app.at=$TELLER_TOKEN")
assert_status "non-numeric total is rejected" 400 "$CODE" /tmp/rails-mc-nonsense.json

CODE=$(curl -s -o /tmp/rails-mc-missing.json -w "%{http_code}" "$APP_URL/make-change" --cookie "app.at=$TELLER_TOKEN")
assert_status "missing total is rejected" 400 "$CODE" /tmp/rails-mc-missing.json

CODE=$(curl -s -o /tmp/rails-mc-negative.json -w "%{http_code}" "$APP_URL/make-change?total=-1.00" --cookie "app.at=$TELLER_TOKEN")
assert_status "negative total is rejected" 400 "$CODE" /tmp/rails-mc-negative.json

CODE=$(curl -s -o /tmp/rails-mc-029.json -w "%{http_code}" "$APP_URL/make-change?total=0.29" --cookie "app.at=$TELLER_TOKEN")
assert_status "0.29 is accepted" 200 "$CODE" /tmp/rails-mc-029.json
grep -q "1 quarters 0 dimes 0 nickels 4 pennies" /tmp/rails-mc-029.json && echo "  PASS: correct change breakdown for \$0.29" || { echo "  FAIL: unexpected breakdown for \$0.29"; cat /tmp/rails-mc-029.json; FAIL=1; }

echo "Testing /panic..."
CODE=$(curl -s -o /tmp/rails-panic-teller.json -w "%{http_code}" -X POST "$APP_URL/panic" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /panic" 200 "$CODE" /tmp/rails-panic-teller.json

CODE=$(curl -s -o /tmp/rails-panic-customer.json -w "%{http_code}" -X POST "$APP_URL/panic" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer is denied /panic" 401 "$CODE" /tmp/rails-panic-customer.json

CODE=$(curl -s -o /tmp/rails-panic-notoken.json -w "%{http_code}" -X POST "$APP_URL/panic")
assert_status "no token on /panic is rejected" 401 "$CODE" /tmp/rails-panic-notoken.json

if [ "$FAIL" -eq 0 ]; then
  echo "All login/authorization checks passed."
  exit 0
else
  echo "Some login/authorization checks failed."
  exit 1
fi
