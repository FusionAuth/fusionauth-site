#!/usr/bin/env bash

# Runs tests for all code example repositories.
# Each repository must have a tests/test.sh file that runs its tests and exits 0 on success.
#
# Usage:
#   bash src/scripts/test-code-examples.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

for LOCAL_REPOSITORY_PATH in astro/src/code-example-repositories/*/; do
  REPOSITORY_NAME=$(basename "$LOCAL_REPOSITORY_PATH")
  TEST_SCRIPT="${LOCAL_REPOSITORY_PATH}tests/test.sh"

  if [ ! -f "$TEST_SCRIPT" ]; then
    echo "Error: $REPOSITORY_NAME has no tests/test.sh" >&2
    exit 1
  fi

  echo "Testing $REPOSITORY_NAME"
  (cd "$LOCAL_REPOSITORY_PATH" && bash tests/test.sh)
done

echo "All code example tests passed"
