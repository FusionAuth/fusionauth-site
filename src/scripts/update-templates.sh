#!/usr/bin/env bash

# Refreshes the default email and message templates from the latest FusionAuth release.
#
# The templates ship inside fusionauth-app's jar. This downloads the release zip, pulls the
# .ftl files out of the nested jar, copies them into astro/extractedcode/templates-<kind>,
# checks that every template is still referenced by a docs page, and reports whether anything
# meaningful changed.
#
# It does not commit or open a PR. A non-zero exit means a human needs to look.
#
# Usage:
#   src/scripts/update-templates.sh email
#   src/scripts/update-templates.sh messengers
#   src/scripts/update-templates.sh all
#   src/scripts/update-templates.sh all --dry-run     # leave the repo untouched
#
# Environment:
#   FUSIONAUTH_VERSION    Version to pull. Defaults to the latest from the version API.
#   FUSIONAUTH_APP_ZIP    Path to an already-downloaded release zip, to skip the ~83MB
#                         download while iterating locally.
#   GITHUB_STEP_SUMMARY   When set, a summary is appended to it.
#
# Exit codes:
#   0  templates are current, nothing to do
#   1  something failed (download, extraction, or an undocumented template)
#   2  templates changed meaningfully; commit the result and open a PR

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

DRY_RUN=0
KINDS=()

for arg in "$@"; do
	case "$arg" in
		--dry-run) DRY_RUN=1 ;;
		email) KINDS+=("email") ;;
		messengers) KINDS+=("messengers") ;;
		all) KINDS=("email" "messengers") ;;
		-h|--help)
			sed -n '3,30p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "Unknown argument: $arg" >&2
			echo "Usage: update-templates.sh [email|messengers|all] [--dry-run]" >&2
			exit 1
			;;
	esac
done

if [ "${#KINDS[@]}" -eq 0 ]; then
	echo "Usage: update-templates.sh [email|messengers|all] [--dry-run]" >&2
	exit 1
fi

# kind -> directory inside the jar, destination, and the docs page to add new templates to
jar_dir_for() {
	case "$1" in
		email) echo "emails" ;;
		messengers) echo "messages" ;;
	esac
}
dest_for() {
	case "$1" in
		email) echo "astro/extractedcode/templates-email" ;;
		messengers) echo "astro/extractedcode/templates-messengers" ;;
	esac
}
reference_page_for() {
	case "$1" in
		email) echo "astro/src/content/docs/email/template-reference.mdx" ;;
		messengers) echo "astro/src/content/docs/messengers/template-reference.mdx" ;;
	esac
}

# ── Fetch ─────────────────────────────────────────────────────────────────────

VERSION="${FUSIONAUTH_VERSION:-}"
if [ -z "$VERSION" ]; then
	VERSION=$(curl -f --silent https://account.fusionauth.io/api/version | jq -r '.versions[-1]') || {
		echo "ERROR: could not read the latest version from the version API" >&2
		exit 1
	}
fi
echo "FusionAuth version: $VERSION"

WORK_DIR=$(mktemp -d /tmp/fusionauth-templates.XXXXXX)
trap 'rm -rf "$WORK_DIR"' EXIT

if [ -n "${FUSIONAUTH_APP_ZIP:-}" ]; then
	echo "Using existing zip: $FUSIONAUTH_APP_ZIP"
	ZIP="$FUSIONAUTH_APP_ZIP"
else
	ZIP="$WORK_DIR/fusionauth-app.zip"
	echo "Downloading fusionauth-app-${VERSION}.zip"
	curl -f -L "https://files.fusionauth.io/products/fusionauth/${VERSION}/fusionauth-app-${VERSION}.zip" \
		-o "$ZIP" || { echo "ERROR: download failed" >&2; exit 1; }
fi

# Only the app jar is needed, not the whole distribution.
unzip -q -o "$ZIP" 'fusionauth-app/lib/fusionauth-app*.jar' -d "$WORK_DIR" || {
	echo "ERROR: could not extract the app jar from the zip" >&2
	exit 1
}

EXTRACTED="$WORK_DIR/templates"
mkdir -p "$EXTRACTED"
for kind in "${KINDS[@]}"; do
	jar_dir=$(jar_dir_for "$kind")
	(cd "$EXTRACTED" && unzip -q -o "$WORK_DIR"/fusionauth-app/lib/fusionauth-app*.jar "${jar_dir}/*.ftl") || {
		echo "ERROR: no ${jar_dir}/*.ftl found in the jar" >&2
		exit 1
	}
done

# ── Compare and copy ─────────────────────────────────────────────────────────

status=0
summary=""

for kind in "${KINDS[@]}"; do
	jar_dir=$(jar_dir_for "$kind")
	dest=$(dest_for "$kind")
	page=$(reference_page_for "$kind")
	src="$EXTRACTED/$jar_dir"

	echo ""
	echo "=== $kind ==="

	# The jar nests some templates (emails/internal); only the top level is documented.
	count=$(find "$src" -maxdepth 1 -name '*.ftl' | wc -l | tr -d ' ')
	echo "$count template(s) in the release"

	added=()   # in the release, not in the repo
	removed=() # in the repo, no longer in the release
	while IFS= read -r f; do
		[ -f "$dest/$(basename "$f")" ] || added+=("$(basename "$f")")
	done < <(find "$src" -maxdepth 1 -name '*.ftl')
	while IFS= read -r f; do
		[ -f "$src/$(basename "$f")" ] || removed+=("$(basename "$f")")
	done < <(find "$dest" -maxdepth 1 -name '*.ftl')

	[ "${#added[@]}" -ne 0 ] && printf '  new in release: %s\n' "${added[@]}"
	[ "${#removed[@]}" -ne 0 ] && printf '  no longer in release: %s\n' "${removed[@]}"

	# Compare the release against the repo before copying anything. Detection is done
	# on the files rather than with `git diff`, which reports nothing for an untracked
	# file -- and a template that is new in a release is exactly that in a fresh
	# checkout, so a git-based check would stay silent on the case this job exists for.
	# Only the top level is considered; the jar nests emails/internal, which is not
	# documented and not copied.
	changed=0
	whitespace_only=1
	[ "${#added[@]}" -ne 0 ] && changed=1 && whitespace_only=0
	[ "${#removed[@]}" -ne 0 ] && changed=1 && whitespace_only=0
	while IFS= read -r f; do
		filename=$(basename "$f")
		[ -f "$dest/$filename" ] || continue
		if ! diff -q "$dest/$filename" "$f" > /dev/null 2>&1; then
			changed=1
			echo "  content differs: $filename"
			if ! diff -qw "$dest/$filename" "$f" > /dev/null 2>&1; then
				whitespace_only=0
			fi
		fi
	done < <(find "$src" -maxdepth 1 -name '*.ftl')

	if [ "$changed" -eq 0 ]; then
		echo "  no changes"
		continue
	fi

	if [ "$whitespace_only" -eq 1 ]; then
		echo "  whitespace-only changes, skipping"
		continue
	fi

	if [ "$DRY_RUN" -eq 1 ]; then
		status=2
		continue
	fi

	find "$src" -maxdepth 1 -name '*.ftl' -exec cp {} "$dest/" \;

	# Every template must be rendered by an <ExtractedCode> somewhere in the docs, so a
	# template added upstream cannot land undocumented.
	missing=()
	for f in "$dest"/*.ftl; do
		filename=$(basename "$f")
		if ! grep -rqF "$(basename "$dest")/$filename" astro/src/content/docs; then
			missing+=("$filename")
		fi
	done
	if [ "${#missing[@]}" -ne 0 ]; then
		echo "ERROR: these $kind templates are not referenced by any docs page:" >&2
		printf '  %s\n' "${missing[@]}" >&2
		echo "" >&2
		echo "Add <ExtractedCode src=\"$(basename "$dest")/<file>\" lang=\"ftl\" /> for each, in" >&2
		echo "$page" >&2
		status=1
		summary+="## $kind templates are undocumented"$'\n\n'
		summary+="These templates ship with FusionAuth but no docs page renders them:"$'\n\n'
		for m in "${missing[@]}"; do summary+="- \`$m\`"$'\n'; done
		summary+=$'\n'"Add an \`<ExtractedCode>\` for each in \`$page\`."$'\n\n'
		continue
	fi

	echo "  meaningful changes detected"
	git --no-pager diff --stat -- "$dest/" 2>/dev/null || true
	status=2
	summary+="## $kind templates have new content"$'\n\n'
	summary+="Regenerate with:"$'\n\n'
	summary+='```bash'$'\n'"src/scripts/update-templates.sh $kind"$'\n''```'$'\n\n'
	summary+="<details><summary>Diff</summary>"$'\n\n'
	summary+='```diff'$'\n'"$(git --no-pager diff -- "$dest/")"$'\n''```'$'\n'
	summary+="</details>"$'\n\n'
done

if [ -n "$summary" ] && [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
	printf '%s' "$summary" >> "$GITHUB_STEP_SUMMARY"
fi

echo ""
case "$status" in
	0) echo "Templates are current." ;;
	2) echo "Templates changed. Commit the result and open a PR." ;;
	*) echo "Failed. See the errors above." >&2 ;;
esac
exit "$status"
