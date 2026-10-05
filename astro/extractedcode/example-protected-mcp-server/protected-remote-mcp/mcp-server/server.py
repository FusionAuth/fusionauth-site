import os
import logging

from fusionauth.fusionauth_client import FusionAuthClient
from fastmcp import FastMCP
from fastmcp.server.auth import RemoteAuthProvider, AccessToken, TokenVerifier
from fastmcp.server.dependencies import get_access_token
from pydantic import AnyHttpUrl

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FUSIONAUTH_URL = os.environ.get("FUSIONAUTH_URL", "http://fusionauth:9011")
FUSIONAUTH_EXTERNAL_URL = os.environ.get("FUSIONAUTH_EXTERNAL_URL", "http://localhost:9011")
MCP_SERVER_URL = os.environ.get("MCP_SERVER_URL", "http://localhost:8000")


class FusionAuthTokenVerifier(TokenVerifier):
    """Verifies tokens using the FusionAuth JWT validation endpoint."""

    def __init__(
        self,
        fusionauth_url: str,
        required_scopes: list[str] | None = None,
    ):
        super().__init__(required_scopes=required_scopes)
        self.client = FusionAuthClient(None, fusionauth_url)

    async def verify_token(self, token: str) -> AccessToken | None:
        try:
            response = self.client.validate_jwt(token)

            if not response.was_successful():
                logger.warning("Token validation failed: %s", response.error_response)
                return None

            claims = response.success_response.get("jwt", {})
            scopes = claims.get("scope", "").split() if claims.get("scope") else []

            return AccessToken(
                token=token,
                client_id=claims.get("sub", ""),
                scopes=scopes,
                expires_at=claims.get("exp"),
                claims=claims,
            )
        except Exception as e:
            logger.error("Failed to validate token: %s", e)
            return None


token_verifier = FusionAuthTokenVerifier(
    fusionauth_url=FUSIONAUTH_URL,
    required_scopes=["get_name"],
)

auth = RemoteAuthProvider(
    token_verifier=token_verifier,
    authorization_servers=[AnyHttpUrl(FUSIONAUTH_EXTERNAL_URL)],
    base_url=MCP_SERVER_URL,
    scopes_supported=["openid", "profile", "get_name"],
)

mcp = FastMCP(
    name="FusionAuth MCP Server",
    auth=auth,
)


@mcp.tool()
def get_name() -> str:
    """Get the authenticated user's name from FusionAuth.

    Returns the name of the currently authenticated user. Requires a valid
    FusionAuth access token with the 'get_name' scope.
    """
    access_token = get_access_token()
    if access_token is None:
        return "Error: No access token found. Please authenticate first."

    client = FusionAuthClient(None, FUSIONAUTH_URL)
    response = client.retrieve_user_info_from_access_token(access_token.token)

    if not response.was_successful():
        logger.warning("UserInfo request failed: %s", response.error_response)
        claims = access_token.claims
        return f"Hello, {claims.get('preferred_username') or claims.get('email') or access_token.client_id}!"

    userinfo = response.success_response
    given = userinfo.get("given_name", "")
    family = userinfo.get("family_name", "")
    name = f"{given} {family}".strip() or userinfo.get("preferred_username") or userinfo.get("email") or access_token.client_id

    return f"Hello, {name}!"


if __name__ == "__main__":
    import uvicorn

    mcp_app = mcp.http_app(stateless_http=True)
    uvicorn.run(mcp_app, host="0.0.0.0", port=8000)
