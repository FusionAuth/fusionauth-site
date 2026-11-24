# FusionAuth

Install [FusionAuth](https://fusionauth.io) on your machine and get answers about FusionAuth from the official docs.

The plugin contains the following components:

* The `install-fusionauth-docker` skill installs FusionAuth with Docker Compose, including PostgreSQL and OpenSearch, and confirms that FusionAuth is healthy.
* The FusionAuth Docs MCP server answers questions about FusionAuth from the FusionAuth docs, GitHub issues, and YouTube videos.

## Use the Plugin

To install FusionAuth, ask your agent to install or run FusionAuth on your machine. The skill needs a local shell and Docker 23 or later, so the skill works in Claude Code, Codex, and other harnesses that run commands on your machine. After the install, open the Admin UI at http://localhost:9011/admin to create your admin account.

To learn about FusionAuth, ask a question such as "How do I add Login with Google to a FusionAuth application?" The agent queries the FusionAuth Docs MCP server and answers with links to the docs.

## Data

The install skill downloads the Docker Compose file from `fusionauth.io` and pulls the FusionAuth, PostgreSQL, and OpenSearch images from Docker Hub. FusionAuth then runs on your machine and stores data in Docker volumes. The skill sets the optional `INSTALLATION_SOURCE` environment variable to your harness and model name, which tells FusionAuth that the install was AI-assisted.

The MCP server sends your questions to `https://ai.fusionauth.io/mcp/docs`. The MCP server needs no account or sign-in.

## Source

FusionAuth maintains this plugin in the [FusionAuth docs repository](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/fusionauth-skills). Changes to this repository come from that folder, so open issues and pull requests there.
