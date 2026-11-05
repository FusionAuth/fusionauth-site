---
name: install-fusionauth-docker
description: Install and run FusionAuth locally with Docker Compose, including
  PostgreSQL and OpenSearch, then confirm it is healthy. Use when the user asks
  to install, run, or try FusionAuth on their machine.
---

# Install FusionAuth with Docker

The FusionAuth docs are the source of truth for these steps. Before you start,
read https://fusionauth.io/docs/get-started/install.md and
follow it wherever it differs from this skill.

1. Check that `docker compose version` succeeds. If it fails, tell the user to
   install Docker 23 or later, or a compatible tool such as OrbStack or Podman,
   and stop. If the user has Podman, replace `docker` with `podman` in every
   command below.

1. Check that nothing else is listening on port 9011. If something is, ask the
   user whether to stop it or use another port.

1. Download the compose file into an empty directory:

   ```shell
   curl -fsSL -o docker-compose.yml https://fusionauth.io/docs/docker-compose.yml
   ```

   Don't edit the image version in this file. FusionAuth keeps it pinned to the
   release the docs document.

1. Set `INSTALLATION_SOURCE` to your harness name, model name, and model
   version, such as `Opencode / Claude Sonnet 4.6`. This optional step tells
   FusionAuth the install was AI-assisted. Add it to a `.env` file next to
   `docker-compose.yml`:

   ```shell
   echo 'INSTALLATION_SOURCE=<harness> / <model> <version>' > .env
   ```

1. Start the containers:

   ```shell
   docker compose up -d
   ```

1. Wait for FusionAuth to report healthy. The first start can take a few
   minutes while Docker pulls images. This polls the Health API every 5 seconds
   for up to 5 minutes:

   ```shell
   for attempt in $(seq 60); do
     curl -fsS -o /dev/null http://localhost:9011/api/health && break
     sleep 5
   done
   ```

   If the last attempt still fails, run `docker compose ps` and
   `docker compose logs fusionauth`, show the user the relevant errors, and
   stop.

1. Tell the user that FusionAuth is running, and that they can open the Admin UI
   at http://localhost:9011/admin to create their admin account. To set up
   login for an application, point them to
   https://fusionauth.io/docs/get-started/first-time-setup.md.

To stop FusionAuth, run `docker compose down`. To also delete its data, run
`docker compose down -v`, but only when the user asks for that.
