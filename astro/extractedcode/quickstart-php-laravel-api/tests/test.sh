#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_PID=""
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop laravel 2>/dev/null || true
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

# FusionAuth answers on its root URL before Kickstart has finished creating the
# application, so both conditions have to be waited on separately.
fusionauth_ready() {
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep "<title>Login" > /dev/null
}

kickstart_done() {
  curl -sf http://localhost:9011/api/application/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
    -H "Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
}

# Tokens minted right after Kickstart can still carry the default issuer, which the API rejects,
# so wait until a fresh token has the issuer the kickstart configures.
issuer_ready() {
  curl -s http://localhost:9011/api/login \
    -H "Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works" \
    -H "Content-Type: application/json" \
    -d '{"loginId":"teller@example.com","password":"password","applicationId":"e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"}' \
    | python3 -c "import base64, json, sys; p = json.load(sys.stdin)['token'].split('.')[1]; sys.exit(json.loads(base64.urlsafe_b64decode(p + '=' * (-len(p) % 4)))['iss'] != 'http://localhost:9011')"
}

# The API is protected, so an unauthenticated request returning 401 is what
# tells us it is up and enforcing authentication.
laravel_ready() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' -H 'Accept: application/json' http://localhost:8000/api/make-change 2>/dev/null)" = "401" ]
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

# The quickstart runs on Sail with MariaDB. SQLite keeps the test to one app container while still
# running the migrations, and the JWKS URL points at local FusionAuth instead of the ngrok tunnel
# readers set up. Real environment variables take precedence over the .env file.
# The lockfile pins packages that need PHP 8.2, so this uses the image Laravel's docs use for Sail.
# php -S with Laravel's router instead of artisan serve, which drops most environment variables.
# The array cache keeps a JWKS fetched before Kickstart creates the signing key from sticking around.
echo "Starting Laravel API..."
docker run --network host --name laravel --rm -v "$PROJECT_DIR/complete-application":/app -w /app \
  -e DB_CONNECTION=sqlite -e DB_DATABASE=/tmp/quickstart.sqlite \
  -e JWT_JWKS_URL=http://localhost:9011/.well-known/jwks.json \
  -e CACHE_DRIVER=array \
  laravelsail/php82-composer:latest sh -c \
  "composer install --no-interaction --quiet && touch /tmp/quickstart.sqlite && php artisan migrate --force && cd public && php -S 0.0.0.0:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php" &
until docker inspect laravel > /dev/null 2>&1; do
  sleep 1
done
docker logs -f laravel &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done
wait_for "Token issuer" issuer_ready

echo "Waiting for Laravel API to be ready..."
wait_for "Laravel API" laravel_ready

echo "Running API tests..."
bash "$SCRIPT_DIR/login-test.sh"
