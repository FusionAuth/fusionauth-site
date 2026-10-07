#!/usr/bin/env bash
# Keeps one open issue per failing scheduled workflow, so failures reach the code owners
# instead of only whoever last edited the cron.
#
# Usage: report-scheduled-run.sh <success|failure>
#   failure: open an issue that mentions the CODEOWNERS default owners, or comment on the open one
#   success: close the open issue, if any
#
# Expects the standard GitHub Actions environment plus GH_TOKEN with issues: write.
# WORKFLOW_NAME overrides GITHUB_WORKFLOW; .github/workflows/report-scheduled-run.yml sets it to the caller's name.

set -euo pipefail

result="${1:-}"
if [[ "$result" != success && "$result" != failure ]]; then
  printf 'Usage: report-scheduled-run.sh <success|failure>\n' >&2
  exit 2
fi

label="scheduled-failure"
workflow="${WORKFLOW_NAME:-$GITHUB_WORKFLOW}"
title="Scheduled workflow failing: $workflow"
run_url="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"

issue="$(gh issue list --repo "$GITHUB_REPOSITORY" --label "$label" --state open --json number,title |
  jq -r --arg title "$title" 'map(select(.title == $title))[0].number // empty')"

if [[ "$result" == success ]]; then
  [[ -z "$issue" ]] || gh issue close "$issue" --repo "$GITHUB_REPOSITORY" --comment "Passing again: $run_url"
  exit 0
fi

if [[ -n "$issue" ]]; then
  gh issue comment "$issue" --repo "$GITHUB_REPOSITORY" --body "Failed again: $run_url"
  exit 0
fi

owners="$(awk '$1 == "*" { $1 = ""; print }' "$(dirname "$0")/../../.github/CODEOWNERS" | xargs)"
gh label create "$label" --repo "$GITHUB_REPOSITORY" --force \
  --color B60205 --description "A scheduled workflow is failing"
gh issue create --repo "$GITHUB_REPOSITORY" --label "$label" --title "$title" --body "$owners

\`$workflow\` failed: $run_url

The run summary has the details and how to fix it. Later failures add a comment here, and the next passing run closes this issue."
