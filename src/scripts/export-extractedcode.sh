#!/usr/bin/env bash

# Publishes extractedcode directories to their external repositories.
# Loops through every directory in astro/extractedcode/, strips Bluehawk annotations, and mirrors the content to the remote repository specified in repositoryUrl.txt.
# Directories without a repositoryUrl.txt are skipped silently. If any publish fails, the script continues with the rest and exits non-zero after printing a summary.

# Environment:
#   PUBLISH_TOKEN: GitHub token with write access to the external repositories.
# Arguments:
#   $1: The source commit SHA of the documentation repository to include in the commit message of the extractedcode repository.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

if [ -z "${PUBLISH_TOKEN:-}" ] || [ -z "${1:-}" ]; then
	echo "Usage: PUBLISH_TOKEN=<github-token> export-extractedcode.sh <commit-sha>" >&2
	exit 1
fi

DOCUMENTATION_COMMIT_HASH="$1"

successes=()
failures=()

publish_repo() {
	local REPOSITORY_PATH="$1"
	local RELATIVE_PATH="${REPOSITORY_PATH#astro/}"

	local CLEANED_DIR CLONED_DIR
	CLEANED_DIR=$(mktemp -d /tmp/bluehawk-processed.XXXXXX)
	CLONED_DIR=$(mktemp -d /tmp/extractedcode-repository.XXXXXX)

	local status=0
	(
		set -euo pipefail

		cd "$REPO_ROOT/astro"
		# The Start Here app's Playwright spec is part of the documented example;
		# only its docs-only test runner should be excluded from export.
		local test_ignore="tests"
		if [ "$(basename "$REPOSITORY_PATH")" = "example-get-started" ]; then
			test_ignore="tests/test.sh"
		fi
		npx bluehawk copy --plugin bluehawk-languages.js --state published \
			-i "repositoryUrl.txt" \
			-i "$test_ignore" \
			-i ".github" \
			-i "node_modules" \
			--output "$CLEANED_DIR" \
			"$RELATIVE_PATH"

		git clone "https://x-access-token:${PUBLISH_TOKEN}@${PARTIAL_REMOTE_URL}" "$CLONED_DIR"
		cd "$CLONED_DIR"
		git checkout main
		git config user.email "github-actions[bot]@users.noreply.github.com"
		git config user.name "github-actions[bot]"
		# Keep repository-owned workflows, CODEOWNERS, and other GitHub configuration.
		git rm -rf -- . ':(exclude).github' ':(exclude).github/**'
		git clean -fdxq
		cp -r "$CLEANED_DIR/." .
		git add -A
		if ! git diff --cached --quiet; then
			git commit -m "chore: update from fusionauth-site ${DOCUMENTATION_COMMIT_HASH}"
			git push origin main
		fi
	) || status=$?

	rm -rf "$CLEANED_DIR" "$CLONED_DIR"
	return $status
}

# EXTRACTEDCODE_FILTER: space-separated list of directory names to publish.
# When empty or unset, all directories are published.
EXTRACTEDCODE_FILTER="${EXTRACTEDCODE_FILTER:-}"

for LOCAL_REPOSITORY_PATH in astro/extractedcode/*/; do
	REPOSITORY_NAME=$(basename "$LOCAL_REPOSITORY_PATH")

	if [ -n "$EXTRACTEDCODE_FILTER" ]; then
		match=0
		for filter_name in $EXTRACTEDCODE_FILTER; do
			[ "$REPOSITORY_NAME" = "$filter_name" ] && match=1 && break
		done
		if [ "$match" -eq 0 ]; then
			echo "Skipping $REPOSITORY_NAME (not in filter)"
			continue
		fi
	fi

	URL_FILE="${LOCAL_REPOSITORY_PATH}repositoryUrl.txt"

	if [ ! -f "$URL_FILE" ]; then
		echo "Skipping $REPOSITORY_NAME (no repositoryUrl.txt)"
		continue
	fi

	PARTIAL_REMOTE_URL=$(tr -d '[:space:]' < "$URL_FILE")

	if publish_repo "$LOCAL_REPOSITORY_PATH"; then
		successes+=("$REPOSITORY_NAME")
	else
		echo "ERROR: Failed to publish $REPOSITORY_NAME" >&2
		failures+=("$REPOSITORY_NAME")
	fi
done

echo ""
echo "=== Publish summary ==="
if [ ${#successes[@]} -gt 0 ]; then
	printf "  Published: %s\n" "${successes[@]}"
fi
if [ ${#failures[@]} -gt 0 ]; then
	printf "  Failed:    %s\n" "${failures[@]}" >&2
	exit 1
fi
echo "All repositories published successfully."
