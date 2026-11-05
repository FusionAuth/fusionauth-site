# Screenshot infrastructure

This directory contains a self-contained Docker Compose setup that runs a local FusionAuth instance seeded with realistic demo data for taking documentation screenshots.

## Setup

Install the screenshot dependencies once. They're separate from the main `astro/` dependencies:

```sh
cd astro/screenshots
npm install
```

The passkey screenshots need a FusionAuth license. Add your key to `astro/.env`, which git ignores:

```sh
FUSIONAUTH_LICENSE_KEY=<your license key>
```

Without a license, the passkey screenshots fail or lose their licensed settings, so don't commit them.

## Quick start

Make sure Docker is running, then from `fusionauth-site/astro/`:

```sh
npm run screenshots
```

This boots FusionAuth, waits for it to be healthy, then captures all screenshots defined in the docs and writes them to `public/img/docs/screenshots/`.

To re-take a single screenshot:

```sh
npm run screenshots -- --filter admin-group-add
```

To check whether screenshots have drifted from the committed references (CI use):

```sh
npm run check-screenshots
```

## Add a screenshot to a page

Place the `Screenshot` component where the image belongs. The `url` is a path on the local instance at `http://localhost:9011`. The filename comes from the URL and any highlights, and `id` overrides it:

```jsx
<Screenshot url="/admin/group/" alt="The FusionAuth groups list." />
```

To outline an element, nest a `Highlight` with a CSS `selector`. The optional `label` adds a badge above the outline. The default color is `#f60`. Override `color` only when the default doesn't work:

```jsx
<Screenshot url="/admin/user/manage/00000000-0000-0000-0000-100000000003" alt="The user registration form." fullPage={true}>
  <Highlight selector="[name*='preferredLanguages']" label="Languages" />
</Screenshot>
```

| Prop | Default | Description |
|---|---|---|
| `url` | required | Path on the FusionAuth instance, or a full URL for a [fresh-instance screenshot](#fresh-instance-screenshots) |
| `id` | derived | Output filename, without `.png` |
| `alt` | filename | Alt text for the image |
| `width` | `1100` | Viewport width in px |
| `height` | `800` | Viewport height in px |
| `fullPage` | `false` | Capture the full scrollable height. Write `fullPage={true}`, because the capture tool ignores a bare `fullPage` |
| `crop` | none | CSS selector for the part of the page to keep, such as `main header:has(h1), #tenant_name`. Covers every match and any highlights |
| `cropPadding` | `16` | Space in px kept around the cropped area |

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

## Fresh-instance screenshots

A few screenshots show what a new FusionAuth installation looks like before any setup, such as the Setup Wizard in [First Time Setup](../src/content/docs/get-started/first-time-setup.mdx). The kickstarted instance can't show these pages, so the Docker Compose file also runs `fusionauth-fresh`: a second instance with no Kickstart file, at `http://127.0.0.1:9012`. Its database lives in memory, so every run starts at the Setup Wizard.

These screenshots are part of the normal suite. `npm run screenshots` and `npm run check-screenshots` start both instances and capture both sets. To retake only the fresh-instance screenshots, filter on the port in their URLs:

```sh
npm run screenshots -- --filter 9012
```

To add a fresh-instance screenshot:

1. Point the `Screenshot` component's `url` at `http://127.0.0.1:9012`. The `127.0.0.1` host keeps the fresh instance's cookies apart from the kickstarted instance at `localhost`.
1. Give the shot `fresh: true` in its setup module, with a `prepare` function that gets the page into the right state. The usual normalization for the kickstarted instance doesn't run for fresh shots. See `setup/get-started/first-time-setup.mjs` for an example that completes the Setup Wizard and logs in.

If a run stops partway, the fresh instance can be left past the Setup Wizard. Remove it before you retry:

```sh
docker compose -f screenshots/docker-compose.yml rm -sf fusionauth-fresh db-fresh
```

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

`docker-compose.yml` pins `fusionauth/fusionauth-app` to the release in the repository's `fusionauth-version` file. This prevents surprise visual changes when Docker pulls a new image. The Update FusionAuth version workflow opens a PR that bumps the pin after each release. Once it merges, the weekly Update screenshots workflow retakes the screenshots against the new release and opens its own PR, or you can start that workflow by hand. See "Update the docs for a new FusionAuth release" in the [repository README](../../README.md).
