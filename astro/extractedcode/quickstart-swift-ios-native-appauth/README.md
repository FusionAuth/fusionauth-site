# Quickstart: Swift and SwiftUI for iOS with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-swift-ios-native-appauth). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This project contains an iOS application built with Swift and SwiftUI that works with a locally-running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
You will need the following things properly installed on your computer.

- [Xcode](https://developer.apple.com/xcode/): The official IDE for iOS development. Install it from the Mac App Store.
- Optional: An Apple Developer Account: Necessary for running your app on a device and publishing your app. You can still develop and test the app in a simulator without an account.
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

### Running the iOS App

- Open the `ChangeBank.xcodeproj` file in this project's `complete-application` folder in [Xcode](https://developer.apple.com/xcode/).
- Open the `ChangeBank.plist` file in the `complete-application` folder in a text editor.
  - Change the issuer and clientId values to match that of your FusionAuth instance. If you used the default Docker and Kickstart, you don't need to change anything.

- [Build and run the app](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/) following XCode guidelines. The app will open in the iOS simulator, or your connected iOS device. You can usually press the "play" button in the top left of XCode or press `command-r` to build and run the app with the default settings. 

### Further Information

Visit [https://fusionauth.io/docs/quickstarts/quickstart-swift-ios-native](https://fusionauth.io/docs/quickstarts/quickstart-swift-ios-native) for a step-by-step guide on how to build this iOS app from scratch, including more details about the tenant and application settings.
