#!/bin/bash

# Define the GitHub organization and the label to search for
ORG="FusionAuth"
LABEL="hacktoberfest"
RESPONDER_USERS=("alex-fusionauth" "mark-robustelli" "synedra") # Replace with specific usernames

# Fetch all issues in the organization with the specified label
issues=$(gh search issues --label "$LABEL" --owner "$ORG" --state open --json number,url,repository)

# Loop through each issue and directly access its details
for issue in $(echo "$issues" | jq -c '.[]'); do
  issue_number=$(echo "$issue" | jq -r '.number')
  issue_url=$(echo "$issue" | jq -r '.url')
  issue_repo=$(echo "$issue" | jq -r '.repository.nameWithOwner')

  echo "Checking issue: $issue_url"

  # Fetch comments for the issue
  comments_json=$(gh issue view "$issue_number" -c -R  "$issue_repo" --json comments)
  comments=$(echo "$comments_json" | jq -c '.comments')

  if [ -z "$comments" ]; then
    echo "No comments found for issue #$issue_number"
    continue
  fi

  # Check if any comments have not been responded to by the specified users
  for comment_author in $(echo "$comments" | jq -r '.[].author.login'); do

    # If a responder has replied, skip to the next comment
    if [[ " ${RESPONDER_USERS[@]} " =~ " $comment_author " ]]; then
      continue
    else
      echo "Unresponded comment found by $comment_author on issue #$issue_number $issue_repo $issue_url"
    fi
  done
done
