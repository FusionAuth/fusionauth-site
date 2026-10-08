# Quickstart: Flutter app with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-flutter-native). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a Flutter app that works with a public accessible FusionAuth instance or a locally running instance of [FusionAuth](https://fusionauth.io/) that has been configured to be accessible via ngrok.

## Setup

### Prerequisites
- [Flutter](https://docs.flutter.dev/get-started/install)
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).
- [Visual Stuido Code](https://code.visualstudio.com/download): The editor for making changes to code.
  - Alternatively, You can user other editors as well.


### FusionAuth Installation via Docker

The root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Set Up A Public URL for FusionAuth

The command below makes use of [ngrok](https://ngrok.com/download). You may need to install the tool if you do not have it available on your machine ( learn more [here](https://fusionauth.io/docs/v1/tech/developer-guide/exposing-instance))

```
ngrok http 9011
```

### Flutter complete-application

The `complete-application` directory contains a minimal Flutter app configured to authenticate with a publicly accessible FusionAuth instance.

To run the application:
* Ensure the FusionAuth server is running as noted above or update the variable `FUSIONAUTH_DOMAIN` in `main.dart` to reflect the FusionAuth server you are using.
* Open iOS simulator or an Android emulator.

```
cd complete-application
flutter pub get
flutter run -d all
```

Upon clicking the login button you will be redirected to your FusionAuth instance's login page.
You can login with a user preconfigured during Kickstart, `richard@example.com` with the password of `password`.

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-flutter-native for a step by step guide on how to build this Flutter app integrated with FusionAuth from scratch.

### Troubleshooting

* I get `Error retrieving discovery document: A server with the specified hostname could not be found` when I click the Login button

Ensure FusionAuth is running on a publicly accessible URL and that the `FUSIONAUTH_DOMAIN` variable in `main.dart` is set to the correct URL of your FusionAuth inastance.


* I get `Resolving dependencies... Because flutterdemo requires SDK version >=3.0.0 <4.0.0, version solving failed.`

Ensure the dart version is greater than 3.0.0 by running 

```
flutter upgrade
```