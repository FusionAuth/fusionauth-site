#!/usr/bin/env bash
# starts claude code in a fresh demo dir with the plugin from this checkout
set -euo pipefail
PLUGIN="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$HOME/fusionauth-demo"
rm -rf "$WORK" && mkdir -p "$WORK" && cd "$WORK"
# drop vars inherited from a parent claude session
for var in $(env | grep -o '^CLAUDE[A-Z_]*' | sort -u); do unset "$var"; done
# claude.ai connectors at the same URL would hide the plugin's MCP server
export ENABLE_CLAUDEAI_MCP_SERVERS=false
P=mcp__plugin_fusionauth_fusionauth-docs
exec claude --plugin-dir "$PLUGIN" \
  --allowedTools "Bash" "Read" "Write" "WebFetch(domain:fusionauth.io)" "Skill" \
  "${P}__ask_fusionauth_question" "${P}__search_fusionauth_sources"
