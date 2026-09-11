#!/usr/bin/env bash

# Runs tests for all extractedcode test suites in parallel.
# Each directory in astro/extractedcode/ must have a tests/test.sh.
#
# Usage:
#   npm run test-extractedcode  (from astro/)
#   bash src/scripts/test-extractedcode.sh  (from repo root)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# Validate upfront — every extractedcode directory must have tests/test.sh
for dir in astro/extractedcode/*/; do
  name=$(basename "$dir")
  if [ ! -f "${dir}tests/test.sh" ]; then
    echo "Error: $name is missing tests/test.sh" >&2
    exit 1
  fi
done

# Launch all suites in parallel, capturing each suite's output
names=()
pids=()
logs=()

for dir in astro/extractedcode/*/; do
  name=$(basename "$dir")
  log=$(mktemp)
  (cd "$dir" && bash tests/test.sh) >"$log" 2>&1 &
  names+=("$name")
  pids+=("$!")
  logs+=("$log")
  echo "Started: $name"
done

echo ""
echo "Waiting for all suites to complete..."

passed=()
failed=()
failed_logs=()

for i in "${!names[@]}"; do
  name="${names[$i]}"
  pid="${pids[$i]}"
  log="${logs[$i]}"

  if wait "$pid"; then
    passed+=("$name")
    rm -f "$log"
  else
    failed+=("$name")
    failed_logs+=("$log")
  fi
done

echo ""
echo "=== Results ==="
for name in "${passed[@]+"${passed[@]}"}"; do
  echo "  ✓ $name"
done
for name in "${failed[@]+"${failed[@]}"}"; do
  echo "  ✗ $name"
done

if [ "${#failed[@]}" -gt 0 ]; then
  for i in "${!failed[@]}"; do
    echo ""
    echo "=== Failed output: ${failed[$i]} ==="
    cat "${failed_logs[$i]}"
    rm -f "${failed_logs[$i]}"
  done
  echo ""
  echo "${#failed[@]} extractedcode test suite(s) failed"
  exit 1
fi

echo ""
echo "All extractedcode tests passed!"
