# Quickstart: Android App with FusionAuth Android SDK

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-kotlin-android-native). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains an Android app extracted from the FusionAuth Android SDK that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

This example uses the FusionAuth Android SDK 0.2.0 release.

## Setup

### Prerequisites

You will need the following things properly installed on your computer.

- [Android Studio](https://developer.android.com/studio): The official IDE for Android helps you develop and install the necessary tools to set it up.
  - At least Java 17 (which you can install via Android Studio)
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth. Ensure you also have [docker compose](https://docs.docker.com/compose/) installed.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

### FusionAuth Installation via Docker

The root of this project directory _(next to this README)_ are two files: [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```bash
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by Docker Compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:
* Your client Id is: `21e13847-4f30-4477-a2d9-33c3a80bd15a`
* Your `Example Android App` test user `richard@example.com` and your password is `password`.
* Your FusionAuth admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl to access FusionAuth is `http://localhost:9011/`

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Running the Android App

This Android Quickstart is fully functional and can be used without any modifications:

- Open this project's `complete-application` folder in [Android Studio](https://developer.android.com/studio).
- Either [connect a hardware device](https://developer.android.com/studio/run/device) or create an Android Virtual Device to run the [Android Emulator](https://developer.android.com/studio/run/emulator).
- [Build and run the app](https://developer.android.com/studio/run/) following Android Studio guidelines.

And there are additional [testing instructions](TESTING.md) available for different scenarios.

## Further Information

Please follow the following sections for further information about the Quickstart and FusionAuth Android SDK.

### Quickstart

See the [FusionAuth Android Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-android-java-native-fusionauth-sdk/) for a full tutorial on using FusionAuth and Android.

### Documentation FusionAuth Android SDK

See the [FusionAuth Android SDK Documentation](https://fusionauth.io/docs/sdks/android-sdk) for an overview to the SDK. Or see the latest [Full library documentation](https://github.com/FusionAuth/fusionauth-android-sdk/blob/main/library/docs/index.md) for the complete documentation of the SDK.

### Automated End 2 End Testing

While developing the Android SDK we made use of Automated End 2 End Testing within the [Android Emulator](https://developer.android.com/studio/run/emulator). This is something useful during App development and we moved the test as well into the quickstart and further documented our testing implementation [here](TESTING.md).

<!--
Maintainer info on how to create the example App manually:

The example App is a copy from https://github.com/FusionAuth/fusionauth-android-sdk/tree/main/app by:

1. Create a new Android project with Kotlin and Gradle
2. copy the app/src folder from the sdk in to the app/ folder
3. copy the app/build.gradle.kts from the sdk in to the app/ folder
4. remove lint configuration for sarifReport from it
5. replace implementation(project(":library")) with implementation("io.fusionauth:fusionauth-android-sdk:0.1.1") and use accordingly the latest release version
6. copy the fusionauth/<latest version>/ from the sdk to fusionauth/
7. make sure gradlew is on the same version as the sdk by running e.g. ./gradlew wrapper --gradle-version 8.6
8. test the app by first starting fusionauth and then run the app.
9. once successful manually tested do a full End 2 End test by running ./gradlew clean connectedAndroidTest
10. once successful commit your changes
11. create a new tag according to the tag of the io.fusionauth:fusionauth-android-sdk e.g. 0.1.1
-->
