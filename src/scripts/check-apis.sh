#!/usr/bin/env bash
# Checks the API docs against the client builder for the latest FusionAuth release.
#
# Usage: bash src/scripts/check-apis.sh [extra check-apis-against-client-json.rb options, e.g. --pr]
#
# Clones fusionauth-client-builder at the branch for the latest release, falling back to the
# minor release's .0 branch when a patch release has no branch of its own.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
builder_url=https://github.com/fusionauth/fusionauth-client-builder
builder_dir="$(mktemp -d)"
trap 'rm -rf "$builder_dir"' EXIT

version="$(curl -f --silent https://account.fusionauth.io/api/version | jq -r 'last(.versions[-1])')"
branch="$version"
if ! git ls-remote --exit-code --heads "$builder_url" "$branch" > /dev/null 2>&1; then
  branch="${version%.*}.0"
fi
printf 'Checking API docs against fusionauth-client-builder %s (release %s)\n' "$branch" "$version"

git clone --quiet --depth 1 --branch "$branch" "$builder_url" "$builder_dir"
"$repo_root/src/check-apis-against-client-json.rb" -f "$repo_root/src/.checkapis.yaml" -c "$builder_dir" -v "$@"
