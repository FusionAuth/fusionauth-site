# Quickstart: iOS App with FusionAuth Swift SDK

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-swift-ios-native). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains an iOS app extracted from the FusionAuth iOS SDK that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites

You will need the following things properly installed on your computer.

- [Xcode](https://developer.apple.com/xcode/): The official IDE for iOS helps you develop and install the necessary tools to set it up.
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
* Your `Example iOS Quickstart` test user `richard@example.com` and your password is `password`.
* Your FusionAuth admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl to access FusionAuth is `http://localhost:9011/`

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Running the iOS App

This iOS Quickstart is fully functional and can be used without any modifications:

- Open this project's `complete-application` folder in [Xcode](https://developer.apple.com/xcode/).
- Either connect an iPhone or create an iPhone Simulator to run the app.

And there are additional [testing instructions](TESTING.md) available for different scenarios.

## Further Information

Please follow the following sections for further information about the Quickstart and FusionAuth Swift SDK.

### Quickstart

See the [FusionAuth Swift iOS Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-swift-ios-native/) for a full tutorial on using FusionAuth and iOS.

### Documentation FusionAuth Android SDK

See the [FusionAuth Swift SDK Documentation](https://fusionauth.io/docs/sdks/swift-sdk) for an overview to the SDK. Or see the latest [Full library documentation](https://github.com/FusionAuth/fusionauth-swift-sdk/tree/main/Documentation/Reference) for the complete documentation of the SDK.

### Automated End 2 End Testing

While developing the iOS SDK we made use of Automated End 2 End Testing within the SwiftTests. This is something useful during App development and we moved the test as well into the quickstart and further documented our testing implementation [here](TESTING.md).

<!--
Maintainer info on how to create the example App manually:

The example App is a copy from https://github.com/FusionAuth/fusionauth-swift-sdk/tree/main/Samples/Quickstart by:

1. Copy the Samples/Quickstart folder in to the complete-application folder
2. edit the complete-application/fusionauth-quickstart-swift-ios-native.xcodeproj/project.pbxproj file, removing the Packages and sdk references. 
3. open the project and add the sdk dependency by adding the latest release from https://github.com/FusionAuth/fusionauth-swift-sdk/
5. update the docker-compose.yml file to use the latest version used by the sdk
-->
