# Sourced by the scripts that scheduled workflows run.
# run_locally prints the exact command that reproduces the current run, to the log and the step summary.
# Usage: run_locally 'FUSIONAUTH_VERSION=1.69.4 bash scripts/example.sh --check'

run_locally() {
  printf '\nTo reproduce this run locally, run this from the repo root:\n\n  %s\n' "$1"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '### Reproduce locally\n\nRun this from the repo root:\n\n```bash\n%s\n```\n\n' "$1" >> "$GITHUB_STEP_SUMMARY"
  fi
}
