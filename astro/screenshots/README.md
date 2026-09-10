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

## Version pinning

`docker-compose.yml` pins `fusionauth/fusionauth-app` to a specific version. When upgrading FusionAuth, update the pin there and re-test all screenshots. This prevents surprise visual changes when Docker pulls a new image.
