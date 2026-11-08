#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for app in pied-piper hooli; do
  (cd "$app" && npm ci --no-audit --no-fund)
done
node tests/smoke.cjs
node tests/callback.cjs
