# Quickstart: Java for Android with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-java-android-native). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This project contains an Android application that works with a locally-running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
You will need the following things properly installed on your computer.

- [Android Studio](https://developer.android.com/studio): The official IDE for Android will help you develop and install necessary tools to set it up.
  - At least Java 17 (which you can install via Android Studio)
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth. Ensure you also have [docker compose](https://docs.docker.com/compose/) installed.
- (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

### FusionAuth Installation via Docker

The root of this project directory _(next to this README)_ are two files: [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```bash
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by Docker Compose by executing `docker compose down -v`.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is `http://localhost:9011/`

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Running the Android App

- Open this project's `complete-application` folder in [Android Studio](https://developer.android.com/studio).
- Expose FusionAuth to the internet, via a tool like ngrok.
- Update the tenant `Issuer` value to be the public FusionAuth URL.
- Create new JWT signing keys.
- Update the `discovery_uri` field in `complete-application/app/res/raw/auth_config.json` with the value of the public FusionAuth hostname.
- Either [connect a hardware device](https://developer.android.com/studio/run/device) or create an Android Virtual Device to run the [Android Emulator](https://developer.android.com/studio/run/emulator).
- [Build and run the app](https://developer.android.com/studio/run/) following Android Studio guidelines.

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-android-java-native for a step-by-step guide on how to build this Android app from scratch, including more details about the tenant and application settings.

