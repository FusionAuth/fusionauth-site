# Protected Remote MCP Server

Remote deployment variant for the FusionAuth tutorial: [Protecting MCP Servers With FusionAuth OAuth](https://fusionauth.io/docs/extend/examples/protecting-mcp-servers).

This folder contains only the MCP server. It is intended for use with an existing FusionAuth instance. The setup script includes `--fusionauth-url`, `--api-key`, `--tenant-id`, and `--connector-ui` flags for remote deployments.

## Prerequisites

- A publicly accessible URL for the MCP server (e.g. via Fly.io or ngrok)
- A publicly accessible FusionAuth instance (version 1.63.0 or later)
- Node.js >= 20.18.1
- Python 3.12+
- FusionAuth Essentials license (required for custom OAuth scopes)

## Quick Start

### 1. Start the MCP server

Set the required environment variables and start the server:

```bash
MCP_SERVER_URL=https://mcp.example.com \
FUSIONAUTH_URL=https://auth.example.com \
FUSIONAUTH_EXTERNAL_URL=https://auth.example.com \
docker compose up -d
```

- `MCP_SERVER_URL`: the public HTTPS URL of the MCP server.
- `FUSIONAUTH_URL`: the URL the MCP server uses internally to reach FusionAuth for token validation.
- `FUSIONAUTH_EXTERNAL_URL`: the URL MCP clients use in their browser to complete the OAuth flow. In most deployments this is the same as `FUSIONAUTH_URL`.

### 2. Register an MCP client

```bash
cd setup
pip install -r requirements.txt
python setup_clients.py \
  --fusionauth-url https://auth.example.com \
  --api-key YOUR_API_KEY \
  --mcp-server-url https://mcp.example.com
```

If your FusionAuth instance has multiple tenants, add `--tenant-id YOUR_TENANT_ID`.

For the Claude Desktop or claude.ai connector UI, add `--connector-ui`:

```bash
python setup_clients.py \
  --fusionauth-url https://auth.example.com \
  --api-key YOUR_API_KEY \
  --mcp-server-url https://mcp.example.com \
  --connector-ui
```

### 3. Connect your MCP client

Use the configuration output from step 2. See the full tutorial for client-specific instructions.
