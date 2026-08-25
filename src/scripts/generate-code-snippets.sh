#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASTRO_DIR="$(cd "$SCRIPT_DIR/../../astro" && pwd)"
cd "$ASTRO_DIR"

mkdir -p src/generated-code-snippets

# Compute a hash of all localcode file contents to detect changes
compute_hash() {
  find localcode -type f | sort | xargs sha256sum 2>/dev/null \
    || find localcode -type f | sort | xargs shasum -a 256 2>/dev/null
}
HASH_FILE="src/generated-code-snippets/.localcode-hash"
current_hash=$(compute_hash | sha256sum 2>/dev/null | cut -d' ' -f1 \
  || compute_hash | shasum -a 256 | cut -d' ' -f1)
snippet_count=$(find src/generated-code-snippets -type f -not -name '.localcode-hash' 2>/dev/null | wc -l)

if [ -f "$HASH_FILE" ] && [ "$(cat "$HASH_FILE")" = "$current_hash" ] && [ "$snippet_count" -gt 0 ]; then
  echo "Code snippets: up to date ($((snippet_count + 0)) files)"
  exit 0
fi

total_written=0

for repo in localcode/*/; do
	output_dir="src/generated-code-snippets/$(basename "$repo")"
	mkdir -p "$output_dir"
	status=0
	out=$(npx --yes bluehawk snip "$repo" \
		--output "$output_dir" \
		--plugin bluehawk-languages.js \
		--ignore 'node_modules' \
		--ignore 'vendor' \
		--ignore '.gitignore' \
		--ignore '.DS_Store' \
		--ignore 'package*.json' \
		--ignore '*.lock' \
		--ignore 'repositoryUrl.txt' \
		--ignore 'tests' \
		--ignore 'LICENSE' \
		--ignore 'SECURITY.md' \
		2>&1) || status=$?
	if [ $status -ne 0 ] || printf '%s\n' "$out" | grep -q 'bluehawk errors'; then
		echo "Error: bluehawk snip failed for $repo" >&2
		printf '%s\n' "$out" | grep -v 'parsed file' | grep -v 'found binary file' >&2 || true
		exit 1
	fi
	written=$(printf '%s\n' "$out" | grep -c 'wrote text file') || true
	total_written=$((total_written + written))
done

find src/generated-code-snippets -mindepth 1 -type d -empty -delete
echo "$current_hash" > "$HASH_FILE"
echo "Code snippets: $total_written written"
