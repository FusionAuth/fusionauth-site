# FusionAuth webhook listener examples

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-javascript-webhooks). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


This repository includes JavaScript example webhook listeners.

## Simple

Simple example of a webhook.  Demonstrates where you could tie in your own custom handling.

To run:

```
cd simple/
npm install
npm start
```

## Signature Verification

Demonstrates how to verify signed webhook events (available since 1.48.0).

To run:

```
cd signature-verify/
npm install
npm start
```

## Event Context

Passes context, such as a trace Id, from a FusionAuth API request to the webhook the request triggers. `create-user.js` calls the User API with `eventInfo.data`, and the listener in `app.js` reads the same values from `event.info.data`.

This example needs Docker and Node.js 18 or later. To run:

1. Run `docker compose up -d` from this directory. Kickstart configures FusionAuth with an API key and a webhook that sends `user.create` events to `http://host.docker.internal:3030/webhook`. The webhook sends a shared secret in the `Authorization` header, and the listener rejects any request without that secret. To change the secret, edit `webhookSecret` in `kickstart/kickstart.json` and set the `WEBHOOK_SECRET` environment variable for the listener. The admin user is `admin@example.com` with the password `password`.
1. Start the listener:
   ```
   cd event-context/
   npm install
   npm start
   ```
1. In another terminal, run `npm run create-user` from `event-context/`.

The listener prints the `traceId` that `create-user.js` printed. To stop FusionAuth, run `docker compose down -v`.

To run the automated test, run `bash tests/test.sh`.

Learn more at https://fusionauth.io/docs/events/webhooks
