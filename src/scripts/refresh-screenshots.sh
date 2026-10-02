#!/usr/bin/env bash

# Regenerates every screenshot and reports whether any of them meaningfully changed.
#
# The old weekly job decided with `git diff`, a byte comparison, so PNG encoding noise or a
# single antialiased pixel looked the same as a redesigned page. This keeps the previous
# images as a baseline, regenerates, then compares pixels with a tolerance. Anything within
# tolerance is reverted to the committed version so it does not churn the repo.
#
# Usage:
#   src/scripts/refresh-screenshots.sh                      # regenerate and compare
#   src/scripts/refresh-screenshots.sh --threshold 0.005    # looser tolerance
#   src/scripts/refresh-screenshots.sh --compare-only       # skip capture, compare what is there
#
# Requires Docker and the screenshot CLI (npm ci in astro/screenshots, plus
# `npx playwright install webkit`).
#
# Exit codes:
#   0  no meaningful change; the working tree is left clean
#   1  something failed
#   2  at least one screenshot changed beyond the tolerance; review and commit

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SHOTS_DIR="$REPO_ROOT/astro/public/img/docs/screenshots"
DIFF_DIR="$REPO_ROOT/astro/.screenshot-diffs"

THRESHOLD=0.002
COMPARE_ONLY=0
while [ $# -gt 0 ]; do
	case "$1" in
		--threshold) THRESHOLD="$2"; shift 2 ;;
		--compare-only) COMPARE_ONLY=1; shift ;;
		-h|--help) sed -n '3,22p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
		*) echo "Unknown argument: $1" >&2; exit 1 ;;
	esac
done

if [ ! -d "$SHOTS_DIR" ]; then
	echo "ERROR: $SHOTS_DIR does not exist" >&2
	exit 1
fi

BASELINE=$(mktemp -d /tmp/screenshots-baseline.XXXXXX)
trap 'rm -rf "$BASELINE"' EXIT
cp "$SHOTS_DIR"/*.png "$BASELINE"/ 2>/dev/null
echo "Baseline: $(ls -1 "$BASELINE" | wc -l | tr -d ' ') committed screenshot(s)"

if [ "$COMPARE_ONLY" -eq 0 ]; then
	echo "Regenerating (this starts Docker and drives a browser, so it takes a while)"
	# Removing first means a screenshot whose declaration is gone does not linger,
	# and the comparison reports it as removed.
	rm -f "$SHOTS_DIR"/*.png
	( cd "$REPO_ROOT/astro" && npm run screenshots ) || {
		echo "ERROR: capture failed; restoring the committed screenshots" >&2
		cp "$BASELINE"/*.png "$SHOTS_DIR"/ 2>/dev/null
		exit 1
	}
fi

echo ""
rm -rf "$DIFF_DIR"
node "$REPO_ROOT/src/scripts/compare-screenshots.mjs" \
	--baseline "$BASELINE" \
	--candidate "$SHOTS_DIR" \
	--threshold "$THRESHOLD" \
	--revert-within-tolerance \
	--out "$DIFF_DIR"
compare_status=$?

echo ""
case "$compare_status" in
	0)
		echo "No meaningful changes. Working tree left as committed."
		exit 0
		;;
	1)
		echo "Screenshots changed. Review $DIFF_DIR, then commit the updated PNGs."
		exit 2
		;;
	*)
		echo "ERROR: comparison failed" >&2
		exit 1
		;;
esac
