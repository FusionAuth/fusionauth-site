# Example Fine-Grained Authorization Example

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-fine-grained-authorization). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Express.js application that uses FusionAuth as the identity provider. 
This application will use an OAuth Authorization Code grant to log a user in and 
get them access and refresh tokens.

This application uses the integrated Permify fine-grained authorization server to determine 
if certain actions are allowed. If an action is not allowed, the user is redirected to an error page.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure local FusionAuth and Permify servers.

The `/app` directory the fully working version of the application.

## Project Dependencies
* Docker or a Docker compatible system, for running FusionAuth and Permify
* Node 22 or later, for running the Changebank Express.js application

## Installation via Docker

In the root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker or a compatible system installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your teller username is `teller@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

## Setting Up Permissions

These permissions are checked for every request and defined in `permify-setup/authmodel.txt`.

* The account page can be displayed to anyone who is a teller, vp or member.
* The makechange page can be displayed to anyone who is a teller while the bank is open (by default between 7am and 5pm local time).
* The admin page is available to anyone who is a teller or vp.


```shell
cd permify-setup
```

Install dependencies

```shell
npm install
```

Configure the local permify server

```shell
npm run schema && npm run loaddata
```


## Running the Example App
To run the application, first go into the project directory

```shell
cd app
```

Install dependencies

```shell
npm install
```

Start the application

```shell
npm run dev
```

## Check Access

Visit http://localhost:8080/ and log in with one of the users above.

Pages to check:

- http://localhost:8080/admin as an admin user and a normal user
- http://localhost:8080/account as any logged in user
- http://localhost:8080/make-change as a teller . Change `hour` to be `2` in app/src/index.ts in the `validateUser` function to test the ABAC permission check.
