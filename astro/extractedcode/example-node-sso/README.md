# FusionAuth Node.js SSO example

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-node-sso). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

Two Node.js applications, Pied Piper and Hooli, that share a FusionAuth SSO session. Each application keeps its own session, and FusionAuth front-channel logout ends both. For how the pieces fit together, see [Enable SSO](https://fusionauth.io/docs/authentication/sessions/enable-sso) and [Log Users Out](https://fusionauth.io/docs/authentication/sessions/log-users-out).

## Prerequisites

* Docker.
* Node.js.
* Two host names that resolve to `127.0.0.1`: `piedpiper.local` and `hooli.local`. Add them to your hosts file. Applications on the same host share cookies across ports, so SSO needs a separate host name for each application.

## Why the Example Needs TLS

FusionAuth logs the user out of the other application by loading that application's `/endsession` route in a hidden iframe. The iframe is cross-site, so the browser sends the application's session cookie only when the cookie is `SameSite=None`, and `SameSite=None` requires the `Secure` attribute. Browsers send `Secure` cookies only over HTTPS. The session cookie in `app.js` therefore uses `SameSite=None; Secure`, and the applications must run behind TLS.

Over plain HTTP, the session cookie never gets set, and login loops back to FusionAuth. To try the example without TLS, see [Run Without TLS](#run-without-tls).

## Start FusionAuth

```shell
docker compose up -d
```

Kickstart creates two users with the password `password`:

* `admin@example.com` can log in to the Admin UI at `http://localhost:9011/admin`.
* `richard@example.com` can log in to both applications.

To stop FusionAuth, run `docker compose down`.

## Run With TLS

1. Before you start FusionAuth for the first time, change the URLs in `kickstart/kickstart.json` from `http://piedpiper.local:3000` and `http://hooli.local:3001` to `https://piedpiper.local` and `https://hooli.local`. If FusionAuth already ran, edit **Authorized redirect URLs** and **Logout URL** on each Application in the Admin UI instead.
1. In each application's `.env`, set `appURL` to the HTTPS URL, such as `appURL="https://piedpiper.local"`.
1. In each application's `views/layout.pug`, change the link to the other application to its HTTPS URL.
1. Start an HTTPS proxy in front of each application. For example, [Caddy](https://caddyserver.com) issues local certificates for `.local` host names:

   ```shell
   caddy reverse-proxy --from piedpiper.local --to localhost:3000
   caddy reverse-proxy --from hooli.local --to localhost:3001
   ```

1. Start each application:

   ```shell
   cd pied-piper && npm install && PORT=3000 npm start
   cd hooli && npm install && PORT=3001 npm start
   ```

## Run Without TLS

Add the following line to the `.env` file in both `pied-piper` and `hooli`:

```properties
INSECURE_COOKIES=true
```

The session cookie then uses `SameSite=Lax` without `Secure`. Login and SSO work over HTTP, but logout from one application doesn't end the other application's session.

Start each application:

```shell
cd pied-piper && npm install && PORT=3000 npm start
cd hooli && npm install && PORT=3001 npm start
```

## Try It

1. Open Hooli in a private browser window and log in as `richard@example.com`. Check **Keep me signed in**, so FusionAuth creates the SSO session.
1. Click the Pied Piper link in the header. Pied Piper logs you in without a login form.
1. Click **Log out**. With TLS, you're logged out of both applications.

Browsers that block third-party cookies can still drop the session cookie in the logout iframe. In that case, logout from one application leaves the other logged in.
