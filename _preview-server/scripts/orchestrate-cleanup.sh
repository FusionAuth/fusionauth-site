#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

install -m600 /dev/null /tmp/pk
printf '%s\n' "$SSH_KEY" > /tmp/pk

ssh -o StrictHostKeyChecking=no -i /tmp/pk preview@"$PREVIEW_HOST" \
  "/opt/preview/scripts/release-slot.sh '$PR'" || true
  
rm -f /tmp/pk

"$DIR/comment.sh" closed