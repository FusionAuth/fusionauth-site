# :snippet-start: starter-server
import logging

from fastmcp import FastMCP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a basic MCP server without authentication
mcp = FastMCP(
    name="FusionAuth MCP Server",
)


@mcp.tool()
def get_name() -> str:
    """Get a greeting with a name.

    This is a simple tool that returns a hardcoded greeting.
    In the guide, we'll add OAuth authentication so this tool
    returns the authenticated user's name from FusionAuth.
    """
    return "Hello, World!"


if __name__ == "__main__":
    import uvicorn

    mcp_app = mcp.http_app(stateless_http=True)
    uvicorn.run(mcp_app, host="0.0.0.0", port=8000)
# :snippet-end:
