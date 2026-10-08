# Get started with FusionAuth in 5 minutes or less

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-user-actions-guide). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This project is an example Node.js application that illustrates how to integrate with FusionAuth using the Authorization Code grant and demonstrates how User Actions work by logging the emails and triggered webhooks.

This assumes you already have a running FusionAuth instance, user and application running locally. If you don't, please see the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to do so.

* log into the admin UI of FusionAuth and edit your application. Switch to the OAuth tab and enter the following values.

  - set Authorized redirect URLs `http://localhost:3000/oauth-redirect`
  - set Logout URL `http://localhost:3000/logout`
  - make sure your user has a first name.
  - note your client id and client secret
* copy `.env.sample` to `.env` and update it with your Client Id, Client Secret and FusionAuth instance base URL.
* run `npm install`
* `npm start`

## Testing mail 

Open a new terminal window and run

```
npx maildev -v;
```

Browse to http://localhost:1080/ so that you can see emails arrive as you test Actions.

Log in to FusionAuth and navigate to Tenants. Edit the "Default" tenant. Click on the Email tab and enter the following values:

If FusionAuth is running on Docker.

    Host: host.docker.internal
    Port: 1025


If FusionAuth is running on localhost.

    Host: localhost
    Port: 1025

Click Send test email and an email should arrive in the MailDev web interface


