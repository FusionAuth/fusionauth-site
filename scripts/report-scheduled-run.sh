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
# DETAILS, when set, goes into the issue body and each failure comment.

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
details="${DETAILS:+

$DETAILS}"

# puts the issue link on the run's summary page, so nobody has to open the job log to find it
summarize() {
  printf '%s\n' "$1"
  [[ -z "${GITHUB_STEP_SUMMARY:-}" ]] || printf '### Failure issue\n\n%s\n\n' "$1" >> "$GITHUB_STEP_SUMMARY"
}

issue_url="$(gh issue list --repo "$GITHUB_REPOSITORY" --label "$label" --state open --json title,url |
  jq -r --arg title "$title" 'map(select(.title == $title))[0].url // empty')"

if [[ "$result" == success ]]; then
  if [[ -n "$issue_url" ]]; then
    gh issue close "$issue_url" --repo "$GITHUB_REPOSITORY" --comment "Passing again: $run_url"
    summarize "Closed $issue_url, because this run passed."
  fi
  exit 0
fi

if [[ -n "$issue_url" ]]; then
  gh issue comment "$issue_url" --repo "$GITHUB_REPOSITORY" --body "Failed again: $run_url$details"
  summarize "Added this failure to $issue_url."
  exit 0
fi

owners="$(awk '$1 == "*" { $1 = ""; print }' "$(dirname "$0")/../.github/CODEOWNERS" | xargs)"
gh label create "$label" --repo "$GITHUB_REPOSITORY" --force \
  --color B60205 --description "A scheduled workflow is failing"
issue_url="$(gh issue create --repo "$GITHUB_REPOSITORY" --label "$label" --title "$title" --body "$owners

\`$workflow\` failed: $run_url$details

The job log lists every change the run found and ends with the command that reproduces the run locally; the run summary repeats that command. Later failures add a comment here, and the next passing run closes this issue.")"
summarize "Opened $issue_url for this failure."
