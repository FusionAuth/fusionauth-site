#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Match current LTS runtimes without calling cloud services or configuring accounts.
for image in node:22 node:24; do
  docker run --rm -v "$PROJECT_DIR:/source:ro" "$image" bash -c '
    set -euo pipefail
    mkdir /work
    cp -R /source/. /work/
    cd /work
    node --version
    npm ci --ignore-scripts --no-audit --no-fund
    node --check RopcProxyFunction/index.js
    node --test tests/function.test.cjs
  '
done
