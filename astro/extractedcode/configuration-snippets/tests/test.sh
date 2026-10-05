#!/usr/bin/env bash
# The extractedcode runner requires this entry point; refresh logic lives in src/scripts.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
python3 "$repo_root/src/scripts/tests/test_fetch_external_content.py"
