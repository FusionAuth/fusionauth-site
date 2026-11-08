#!/usr/bin/env bash
set -euo pipefail

EXAMPLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Match the example's Dockerfile rather than the host Python installation.
docker run --rm \
  -e PYTHONDONTWRITEBYTECODE=1 \
  -v "$EXAMPLE_DIR:/example:ro" \
  -w /example \
  python:3.12-slim \
  sh -c 'pip install --disable-pip-version-check --quiet -r unprotected-local-mcp/mcp-server/requirements.txt -r protected-local-mcp/mcp-server/requirements.txt && python tests/test_mcp.py'

# Check all supported Compose configurations without starting FusionAuth.
docker compose -f "$EXAMPLE_DIR/unprotected-local-mcp/docker-compose.yml" config --quiet
docker compose -f "$EXAMPLE_DIR/protected-local-mcp/docker-compose.yml" config --quiet
FUSIONAUTH_URL=http://fusionauth:9011 \
FUSIONAUTH_EXTERNAL_URL=http://localhost:9011 \
MCP_SERVER_URL=http://localhost:8000 \
  docker compose -f "$EXAMPLE_DIR/protected-remote-mcp/docker-compose.yml" config --quiet
