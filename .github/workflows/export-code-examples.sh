#!/usr/bin/env bash

# Publishes code examples from local directories to external repositories.
# Loops through every directory in astro/src/code-example-repositories/, strips Bluehawk annotations, and mirrors the content to the remote repository specified in repositoryUrl.txt.

# Arguments:
#   $1 — The GitHub access token for pushing to external repositories.
#   $2 — The source commit SHA of the documentation repository to include in the commit message of the code example repository.

GITHUB_TOKEN="$1"
DOCUMENTATION_COMMIT_HASH="$2"


for LOCAL_REPOSITORY_PATH in astro/src/code-example-repositories/*/; do
		REPOSITORY_NAME=$(basename "$LOCAL_REPOSITORY_PATH")
		URL_FILE="${LOCAL_REPOSITORY_PATH}repositoryUrl.txt"

		# Skip if the repository does not have a URL file
		if [ ! -f "$URL_FILE" ]; then
			echo "Skipping $REPOSITORY_NAME — no repositoryUrl.txt"
			continue
		fi

		REPOSITORY_URL=$(cat "$URL_FILE" | tr -d '[:space:]')
		REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@${REPOSITORY_URL}"

		echo "Publishing $REPOSITORY_NAME to $REPOSITORY_URL"

		# Process local files with Bluehawk to strip annotations but not generate snippets
		cd astro
		PROCESSED_DIRECTORY=$(mktemp -d /tmp/bluehawk-processed.XXXXXX)
		npx bluehawk copy --state published \
			-i "repositoryUrl.txt" \
			-i "tests" \
			--output "$PROCESSED_DIRECTORY" \
			"$LOCAL_REPOSITORY_PATH"
		cd "$OLDPWD"

		# Clone the remote repository
		CLONE_DIRECTORY=$(mktemp -d /tmp/code-example-repository.XXXXXX)
		git clone "$REMOTE_URL" "$CLONE_DIRECTORY"

		cd "$CLONE_DIRECTORY"

		# Push to every branch that already exists in the remote
		for BRANCH in $(git branch -r | grep -v HEAD | sed 's/  origin\///'); do
			git checkout "$BRANCH"

			# Replace the entire working tree with the processed files to mirror exactly
			git rm -rf .
			git clean -fdxq
			cp -r "$PROCESSED_DIRECTORY/." .

			# Commit if there are changes
			git add -A
			if git diff --cached --quiet; then
				echo "No changes for $BRANCH"
			else
				git commit -m "chore: update from fusionauth-site ${DOCUMENTATION_COMMIT_HASH}"
				git push origin "$BRANCH"
			fi
		done

		# Remove temporary folders
		cd "$OLDPWD"
		rm -rf "$PROCESSED_DIRECTORY" "$CLONE_DIRECTORY"
done
