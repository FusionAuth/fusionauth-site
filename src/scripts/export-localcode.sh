#!/usr/bin/env bash

# Publishes localcode directories to their external repositories.
# Loops through every directory in astro/localcode/, strips Bluehawk annotations, and mirrors the content to the remote repository specified in repositoryUrl.txt.
# Directories without a repositoryUrl.txt are skipped silently. If any publish fails, the script continues with the rest and exits non-zero after printing a summary.

# Arguments:
#   $1 — The GitHub access token for pushing to external repositories.
#   $2 — The source commit SHA of the documentation repository to include in the commit message of the localcode repository.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
	echo "Usage: export-localcode.sh <github-token> <commit-sha>" >&2
	exit 1
fi

GITHUB_TOKEN="$1"
DOCUMENTATION_COMMIT_HASH="$2"

successes=()
failures=()

publish_repo() {
	local REPOSITORY_PATH="$1"
	local RELATIVE_PATH="${REPOSITORY_PATH#astro/}"

	local CLEANED_DIR CLONED_DIR
	CLEANED_DIR=$(mktemp -d /tmp/bluehawk-processed.XXXXXX)
	CLONED_DIR=$(mktemp -d /tmp/localcode-repository.XXXXXX)

	local status=0
	(
		set -euo pipefail

		cd "$REPO_ROOT/astro"
		npx bluehawk copy --state published \
			-i "repositoryUrl.txt" \
			-i "tests" \
			-i "node_modules" \
			--output "$CLEANED_DIR" \
			"$RELATIVE_PATH"

		git clone "https://x-access-token:${GITHUB_TOKEN}@${PARTIAL_REMOTE_URL}" "$CLONED_DIR"
		cd "$CLONED_DIR"
		git checkout main
		git config user.email "github-actions[bot]@users.noreply.github.com"
		git config user.name "github-actions[bot]"
		git rm -rf .
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

for LOCAL_REPOSITORY_PATH in astro/localcode/*/; do
	REPOSITORY_NAME=$(basename "$LOCAL_REPOSITORY_PATH")
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
