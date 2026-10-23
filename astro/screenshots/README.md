# Screenshot infrastructure

This directory contains a self-contained Docker Compose setup that runs a local FusionAuth instance seeded with realistic demo data for taking documentation screenshots.

## Quick start

Make sure Docker is running, then from `fusionauth-site/astro/`:

```sh
npm run screenshots
```

This boots FusionAuth, waits for it to be healthy, then captures all screenshots defined in the docs and writes them to `public/img/docs/screenshots/`.

To re-take a single screenshot:

```sh
npx take-screenshots --filter admin-group-add
```

To check whether screenshots have drifted from the committed references (CI use):

```sh
npx check-screenshots
```

## Login credentials

| Email | Password | Role |
|-------|----------|------|
| richard@piedpiper.com | password | FusionAuth admin |

## Demo data

The kickstart file seeds FusionAuth with characters from Silicon Valley.

### Users

| Name | Email | Company |
|------|-------|---------|
| Richard Hendricks | richard@piedpiper.com | Pied Piper (admin) |
| Nelson Bighetti | bighead@piedpiper.com | Pied Piper |
| Erlich Bachman | erlich@bachmanity.com | Bachmanity Capital |
| Dinesh Chugtai | dinesh@piedpiper.com | Pied Piper |
| Bertram Gilfoyle | gilfoyle@piedpiper.com | Pied Piper |
| Monica Hall | monica@raviga.com | Raviga Capital |
| Gavin Belson | gavin@hooli.com | Hooli |
| Jian-Yang | jianyang@octhulu.com | Octhulu |

### Applications

- **Pied Piper** -- roles: `admin`, `user`

### Groups

- **Pied Piper Team** -- Richard, Nelson, Dinesh, Gilfoyle, Jian-Yang
- **Investors** -- Erlich, Monica

## Extending

Add more seed data to `kickstart/kickstart.json` using FusionAuth's kickstart format:
- Users: `POST /api/user/registration` with `user` + `registration` body
- Groups: `POST /api/group/{id}`, then `POST /api/group/member`
- Applications: `POST /api/application/{id}`

To reset the instance and re-apply the kickstart:

```sh
docker compose -f screenshots/docker-compose.yml down -v
npm run screenshots
```

The `-v` flag removes the named volumes so FusionAuth starts fresh and re-runs the kickstart.

## Prerelease images

To document an unreleased version, point the screenshots at a local FusionAuth image without changing the committed pin:

1. Load the image, for example a preview build from engineering:

   ```sh
   docker load -i ~/Downloads/1.70.0-beta.746-feature-cimd.tar
   ```

   The command prints the image name, such as `752443094709.dkr.ecr.us-west-2.amazonaws.com/fusionauth-int:1.70.0-beta.746-feature-cimd`.

1. Create `screenshots/.env` with that name. Docker Compose reads this file automatically, and git ignores it:

   ```sh
   FUSIONAUTH_IMAGE=752443094709.dkr.ecr.us-west-2.amazonaws.com/fusionauth-int:1.70.0-beta.746-feature-cimd
   ```

1. Add a license key to `astro/.env`, which git also ignores, if the screenshots need licensed features such as CIMD or token exchange:

   ```sh
   FUSIONAUTH_LICENSE_KEY=<your license key>
   ```

1. Take only the screenshots you need. Each run starts from a fresh database:

   ```sh
   npm run screenshots -- --filter cimd-domain
   ```

1. Delete `screenshots/.env` when you're done, so later runs use the pinned version again.

To confirm which image Compose will use, run `docker compose -f screenshots/docker-compose.yml config | grep image:`.

Prerelease builds show an "Early Access" badge in the admin header. The screenshot config removes it, so the images match a release. Retake prerelease screenshots with the pinned image after the release ships, because the UI can still change between the preview build and the release.

## Version pinning

`docker-compose.yml` pins `fusionauth/fusionauth-app` to a specific version. This prevents surprise visual changes when Docker pulls a new image. The Update FusionAuth version workflow opens a PR that bumps the pin after each release. Merging it triggers the Update screenshots workflow, which retakes the screenshots and opens its own PR. To bump it by hand, run `bash scripts/update_fusionauth_version.sh` from the repository root and retake all screenshots.
