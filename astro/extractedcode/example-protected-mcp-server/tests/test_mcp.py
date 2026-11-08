"""Exercise the real MCP HTTP/auth stack with a fake FusionAuth API boundary.

These tests do not replace the licensed FusionAuth OAuth/client walkthrough.
"""

import ast
import importlib.util
import json
from pathlib import Path
import time
import unittest
from unittest.mock import Mock, patch

import httpx


ROOT = Path(__file__).resolve().parents[1]


def load_module(relative_path):
    path = ROOT / relative_path
    spec = importlib.util.spec_from_file_location(relative_path, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def api_response(success=True, payload=None):
    return Mock(
        was_successful=Mock(return_value=success),
        success_response=payload or {},
        error_response={"error": "invalid_token"} if not success else {},
    )


class SourceTests(unittest.TestCase):
    def test_python_and_kickstart_syntax(self):
        for path in ROOT.rglob("*.py"):
            ast.parse(path.read_text(), filename=str(path))
        for path in ROOT.rglob("kickstart.json"):
            config = json.loads(path.read_text())
            self.assertEqual(config["licenseId"], "YOUR_LICENSE_KEY_HERE")

    def test_client_registration_settings(self):
        setup = load_module("protected-local-mcp/setup/setup_clients.py")
        client = Mock()
        client.create_application.return_value = Mock(
            status=200, success_response={"application": {"id": "example-client"}}
        )
        result = setup.create_client_application(client, "Example client", 3335, "http://localhost:8000")
        self.assertEqual(result["client_id"], "example-client")
        config = client.create_application.call_args.args[0]["application"]["oauthConfiguration"]
        self.assertEqual(config["proofKeyForCodeExchangePolicy"], "Required")
        self.assertEqual(config["authorizedURLValidationPolicy"], "ExactMatch")
        self.assertEqual(config["scopeHandlingPolicy"], "Strict")
        self.assertEqual(config["authorizedResourceUris"], ["http://localhost:8000/mcp"])
        self.assertEqual(config["authorizedRedirectURLs"][0], "http://localhost:3335/oauth/callback")


class MCPTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.module = load_module("protected-local-mcp/mcp-server/server.py")
        self.client = Mock()
        self.module.token_verifier.client = self.client

    def valid_token(self, scopes="openid profile get_name"):
        self.client.validate_jwt.return_value = api_response(payload={"jwt": {
            "sub": "example-user", "scope": scopes, "exp": int(time.time()) + 3600,
            "preferred_username": "testuser",
        }})

    async def call_tool(self, module=None, token=None):
        module = module or self.module
        app = module.mcp.http_app(stateless_http=True)
        headers = {"Accept": "application/json, text/event-stream"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://localhost:8000") as client:
                return await client.post("/mcp", headers=headers, json={
                    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
                    "params": {"name": "get_name", "arguments": {}},
                })

    def tool_text(self, response):
        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json() if "application/json" in response.headers.get("content-type", "") else json.loads(
            next(line[6:] for line in response.text.splitlines() if line.startswith("data: "))
        )
        self.assertFalse(payload.get("error"), payload)
        self.assertFalse(payload["result"].get("isError"), payload)
        return payload["result"]["content"][0]["text"]

    async def test_unprotected_tool(self):
        module = load_module("unprotected-local-mcp/mcp-server/server.py")
        self.assertEqual(self.tool_text(await self.call_tool(module=module)), "Hello, World!")

    async def test_protected_tool_requires_token(self):
        response = await self.call_tool()
        self.assertEqual(response.status_code, 401, response.text)
        self.assertIn("WWW-Authenticate", response.headers)

    async def test_invalid_token_is_rejected(self):
        self.client.validate_jwt.return_value = api_response(success=False)
        response = await self.call_tool(token="invalid-example-token")
        self.assertEqual(response.status_code, 401, response.text)

    async def test_missing_scope_is_rejected(self):
        self.valid_token(scopes="openid profile")
        response = await self.call_tool(token="example-token-without-tool-scope")
        self.assertEqual(response.status_code, 403, response.text)

    async def test_authenticated_tool_returns_user_name(self):
        self.valid_token()
        self.client.retrieve_user_info_from_access_token.return_value = api_response(payload={
            "given_name": "Test", "family_name": "User",
        })
        with patch.object(self.module, "FusionAuthClient", return_value=self.client):
            response = await self.call_tool(token="valid-example-token")
        self.assertEqual(self.tool_text(response), "Hello, Test User!")
        self.client.retrieve_user_info_from_access_token.assert_called_once_with("valid-example-token")

    async def test_userinfo_failure_falls_back_to_validated_claim(self):
        self.valid_token()
        self.client.retrieve_user_info_from_access_token.return_value = api_response(success=False)
        with patch.object(self.module, "FusionAuthClient", return_value=self.client):
            response = await self.call_tool(token="valid-example-token")
        self.assertEqual(self.tool_text(response), "Hello, testuser!")

    async def test_validation_failure_does_not_allow_access(self):
        self.client.validate_jwt.side_effect = ConnectionError("FusionAuth unavailable")
        self.assertIsNone(await self.module.token_verifier.verify_token("example-token"))

    async def test_expired_token_is_rejected(self):
        self.client.validate_jwt.return_value = api_response(payload={"jwt": {
            "sub": "example-user", "scope": "get_name", "exp": int(time.time()) - 60,
        }})
        response = await self.call_tool(token="expired-example-token")
        self.assertEqual(response.status_code, 401, response.text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
