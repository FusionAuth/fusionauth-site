#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# b2c and graph need a real azure tenant, so the function runs with both mocked (from a copy, to keep node_modules out of the repo)
echo "Testing the ROPC proxy function..."
docker run --rm -v "$PROJECT_DIR":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && for f in RopcProxyFunction/*.js; do node --check \$f; done && node --test tests/"
