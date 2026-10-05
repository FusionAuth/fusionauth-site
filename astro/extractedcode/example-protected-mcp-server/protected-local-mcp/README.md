# Protected Local MCP Server

Completed code for the FusionAuth tutorial: [Protecting MCP Servers With FusionAuth OAuth](https://fusionauth.io/docs/extend/examples/protecting-mcp-servers).

This is a fully working MCP server with FusionAuth OAuth protection. The `get_name` tool requires a valid access token with the `get_name` scope and returns the authenticated user's name.

## Prerequisites

- Docker Desktop
- Node.js >= 20.18.1
- Python 3.12+
- FusionAuth Essentials license (required for custom OAuth scopes)

## Quick Start

### 1. Configure your license

Open `kickstart/kickstart.json` and replace `YOUR_LICENSE_KEY_HERE` with your FusionAuth Essentials license key.

### 2. Start the stack

```bash
docker compose up -d
```

Wait about 30 seconds for all services to start.

### 3. Register an MCP client

```bash
cd setup
pip install -r requirements.txt
python setup_clients.py
```

Enter a name for your client (e.g. `Claude Desktop`) when prompted. Copy the configuration block that is printed.

### 4. Configure your MCP client

Add the configuration output from step 3 to your MCP client config file. For Claude Desktop, open Settings > Developer > Edit Config.

### 5. Connect and authenticate

Restart your MCP client. Your browser will open to FusionAuth's login page. Use the test credentials:

- Email: `test@example.com`
- Password: `password`

After logging in, ask your client: "What's my name?"
