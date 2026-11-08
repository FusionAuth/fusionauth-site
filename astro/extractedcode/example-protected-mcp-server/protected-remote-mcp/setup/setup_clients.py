#!/usr/bin/env python3
"""
MCP Client Setup Script

Registers an MCP client as an OAuth application in FusionAuth so it can
authenticate against the MCP server. Run this script once for each MCP
client you want to register.

Usage:
    python setup_clients.py [--fusionauth-url URL] [--api-key KEY] [--port PORT]
"""

import argparse
import json
import sys
import uuid

from fusionauth.fusionauth_client import FusionAuthClient

FUSIONAUTH_URL = "http://localhost:9011"
API_KEY = None
DEFAULT_PORT = 3334
TEST_USER_ID = "00000000-0000-0000-0000-000000000001"

CONNECTOR_UI_REDIRECT_URL = "https://claude.ai/api/mcp/auth_callback"


def check_fusionauth(client: FusionAuthClient) -> bool:
    """Check if FusionAuth is running and the API key is valid."""
    try:
        response = client.retrieve_system_status()
        return response.status == 200
    except Exception:
        return False


def create_scope(client: FusionAuthClient, app_id: str) -> None:
    """Try to create the get_name custom scope on the client application."""
    response = client.create_o_auth_scope(app_id, {
        "scope": {
            "name": "get_name",
            "description": "Access the get_name tool to retrieve the authenticated user's name",
            "defaultConsentMessage": "Allow this application to read your name",
            "defaultConsentDetail": "This will share your display name with the requesting application.",
            "required": True,
        }
    })

    if response.status in (200, 201):
        return
    elif response.status == 400:
        error_data = response.error_response or {}
        field_errors = error_data.get("fieldErrors", {})
        general_errors = error_data.get("generalErrors", [])
        if "scope.name" in field_errors:
            # Scope already exists, treat as success
            return
        for err in general_errors:
            if "license" in err.get("message", "").lower():
                print("  Note: Custom scopes require a FusionAuth Essentials license.")
                print("  The MCP server will still work, but without the custom 'get_name' scope.")
                return
        print(f"  Failed to create scope: {response.status}")
    else:
        print(f"  Failed to create scope: {response.status}")


def create_client_application(
    client: FusionAuthClient, client_name: str, port: int, mcp_server_url: str
) -> "dict | None":
    """Create an OAuth application in FusionAuth for an MCP client."""
    app_id = str(uuid.uuid4())

    relationship = "ThirdParty"

    redirect_urls = [
        f"http://localhost:{port}/oauth/callback",
        f"http://127.0.0.1:{port}/oauth/callback",
        f"http://localhost:{port}/callback",
        f"http://127.0.0.1:{port}/callback",
    ]
    pkce_policy = "Required"
    client_auth_policy = "NotRequiredWhenUsingPKCE"
    require_client_auth = False

    response = client.create_application({
        "application": {
            "name": client_name,
            "oauthConfiguration": {
                "authorizedRedirectURLs": redirect_urls,
                "authorizedResourceUris": [mcp_server_url+"/mcp"],
                "authorizedURLValidationPolicy": "ExactMatch",
                "clientAuthenticationPolicy": client_auth_policy,
                "enabledGrants": ["authorization_code", "refresh_token"],
                "generateRefreshTokens": True,
                "proofKeyForCodeExchangePolicy": pkce_policy,
                "requireClientAuthentication": require_client_auth,
                "relationship": relationship,
                "scopeHandlingPolicy": "Strict",
            },
        }
    }, app_id)

    if response.status in (200, 201):
        app_data = response.success_response["application"]
        result = {
            "name": client_name,
            "client_id": app_data["id"],
        }
        return result
    else:
        print(f"  Failed to create {client_name}: {response.status}")
        return None


def print_mcp_config(client_name: str, client_id: str, mcp_server_url: str, port: int, client_secret: str = None):
    """Print the MCP client configuration for the user to add."""
    if client_secret:
        print(f"\n  Connector UI configuration for {client_name}:")
        print(f"  URL:           {mcp_server_url}/mcp")
        print(f"  Client Id:     {client_id}")
        print(f"  Client Secret: {client_secret}")
        print(f"\n  Enter these values in Settings -> Connectors in Claude Desktop or claude.ai.")
        return

    args = ["mcp-remote@0.1.37", f"{mcp_server_url}/mcp", str(port)]
    if mcp_server_url.startswith("http://"):
        args.append("--allow-http")

    scope_str = "openid profile get_name"
    args += ["--static-oauth-client-info", f'{{"client_id":"{client_id}","scope":"{scope_str}"}}']

    config = {
        "mcpServers": {
            "name-server": {
                "command": "npx",
                "args": args,
            }
        }
    }

    print(f"\n  MCP configuration for {client_name}:")
    print(f"  Client Id: {client_id}")
    print(f"\n  Add this to your MCP client config:")
    print(f"  {json.dumps(config, indent=2)}")


def main():
    parser = argparse.ArgumentParser(description="Set up an MCP client in FusionAuth")
    parser.add_argument(
        "--fusionauth-url",
        default=FUSIONAUTH_URL,
        help=f"FusionAuth URL (default: {FUSIONAUTH_URL})",
    )
    parser.add_argument(
        "--api-key",
        default=API_KEY,
        help="FusionAuth API key",
    )
    parser.add_argument(
        "--mcp-server-url",
        default="http://localhost:8000",
        help="MCP server URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"OAuth callback port for mcp-remote (default: {DEFAULT_PORT}). Change this if port {DEFAULT_PORT} is already in use on your machine.",
    )
    parser.add_argument(
        "--tenant-id",
        default=None,
        help="FusionAuth tenant Id (required for multi-tenant instances)",
    )
    args = parser.parse_args()

    client = FusionAuthClient(args.api_key, args.fusionauth_url)
    if args.tenant_id:
        client.tenant_id = args.tenant_id

    print("FusionAuth MCP Client Setup")
    print("=" * 40)

    print(f"\nChecking FusionAuth at {args.fusionauth_url}...")
    if not check_fusionauth(client):
        print("Error: Cannot connect to FusionAuth. Is it running?")
        print(f"  URL: {args.fusionauth_url}")
        print("  Run 'docker compose up -d' first.")
        sys.exit(1)
    print("FusionAuth is running.")

    client_name = input("\nEnter a name for this MCP client (e.g. Claude Desktop): ").strip()
    if not client_name:
        print("No name provided. Exiting.")
        sys.exit(0)

    print(f"\n  Creating {client_name}...")
    result = create_client_application(client, client_name, args.port, args.mcp_server_url)

    if result:
        print(f"  Created {result['name']} (Client Id: {result['client_id']})")
        print("\n  Configuring scope...")
        create_scope(client, result["client_id"])
        try:
            client.register(
                {"registration": {"applicationId": result["client_id"]}},
                TEST_USER_ID,
            )
        except Exception:
            pass
        print("\n" + "=" * 40)
        print("Setup complete!")
        print("=" * 40)
        print_mcp_config(result["name"], result["client_id"], args.mcp_server_url, args.port, result.get("client_secret"))

        print("\n\nTest user credentials:")
        print("  Email: test@example.com")
        print("  Password: password")
    else:
        print("\nClient was not created.")


if __name__ == "__main__":
    main()
