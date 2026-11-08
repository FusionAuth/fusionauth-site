# Get started with FusionAuth in 5 minutes or less

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-5-minute-guide). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


This project is an example Node.js application that illustrates how to integrate with FusionAuth using the Authorization Code grant.

This assumes you already have a running FusionAuth instance, user and application running locally. If you don't, please see the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to do so.

* log into the admin UI of FusionAuth
** update your FusionAuth application to allow a redirect of `http://localhost:3000/oauth-redirect`
** add a logout url of `http://localhost:3000/logout`
** make sure your user has a first name.
** note your client id and client secret
* copy `.env.sample` to `.env` and update it with your Client Id, Client Secret and FusionAuth instance base URL.
* run `npm install`
* `npm start`

Go to http://localhost:3000/ and login with the previously created user.

You should see 'Hello <name>'

You should be able to logout as well.

## Last updated

Aug 2024
