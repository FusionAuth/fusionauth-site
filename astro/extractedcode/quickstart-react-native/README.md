# Quickstart: React Native app with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-react-native). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a React Native app that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites

- [Node](https://nodejs.org): This will be used to set up your project.
- To test on Android devices, you can either connect a physical device or [Android Studio](https://developer.android.com/studio) to set up an emulator.
- To test on iOS devices, you'll need a Mac and install [Xcode](https://developer.apple.com/xcode/) to set up an emulator.
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

This app has been tested with React Native 0.72.4 and Node 20.

### FusionAuth Installation via Docker

The root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by Docker Compose by executing `docker compose down -v`.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your FusionAuth instance URL is: `http://localhost:9011/`

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### React Native application

The `complete-application` directory contains a minimal React Native app configured to authenticate with locally running FusionAuth.

Install dependencies and run the [Expo](https://expo.dev/) server with:

```shell
cd complete-application
npm install
npx expo start
```

After waiting a few moments, you should see a QR Code and a menu with some actions. Right below the QR Code, you'll see a message like this one _(the real address may vary)_.

```
› Metro waiting on exp://192.168.1.2:8081
```

To use [Expo Go](https://docs.expo.dev/get-started/expo-go/), a client for testing your apps on Android and iOS devices without building anything locally, you need to:

* Copy that listening address (`exp://192.168.1.2:8081`).
* Navigate to your FusionAuth instance on [localhost:9011](http://localhost:9011).
* Browse to **Applications**.
* Click on <IconButton icon="edit" color="blue" /> in your `ExampleReactNativeApp` to edit it.
* Go to the **OAuth** tab.
* Add that address to **Authorized redirect URLs**.
* Click on <IconButton icon="save" color="blue" /> to save your changes.

Go back to the terminal with the Expo menu.

* If you want to test on an Android device:
  * Connect a physical device via USB or install [Android Studio](https://developer.android.com/studio) to set up an emulator.
  * Press `a` in the Expo menu.
* If you want to test on an iOS device and are running a Mac:
  * Install [Xcode](https://developer.apple.com/xcode/) to set up an emulator.
  * Press `i` to run on the emulated iOS device.

When the application starts in your physical or emulated device, click `Log in` and fill in the credentials for a user preconfigured during Kickstart, `richard@example.com` with the password of `password`.

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-react-native for a step by step guide on how to build this React Native app integrated with FusionAuth by scratch.

### Troubleshooting

* I keep receiving an `invalid_redirect_uri` when running the app with Expo Go

Make sure you have updated the **Authorized redirect URLs** in your [FusionAuth instance](http://localhost:9011) like shown on the [React Native application](#React-Native-application) step.
