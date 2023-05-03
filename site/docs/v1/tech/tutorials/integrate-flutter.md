---
layout: doc
title: Integrate Your Flutter Application With FusionAuth
description: Integrate your Flutter application with FusionAuth
navcategory: getting-started
---

{% assign language = "Dart" %}
{% assign technology = "Flutter" %}
{% include docs/v1/tech/tutorials/_integrate-intro.liquid technology=technology %}

## Prerequisites

For this tutorial, you’ll need to have some of these tools installed.

- [Flutter](https://docs.flutter.dev/get-started/install)
- If you want to develop applications for iOS:
    - Xcode
    - iPhone simulator or real iOS device
    - [iPhone development environment](https://docs.flutter.dev/get-started/install/macos#ios-setup)
- If you want to develop applications for Android:
    - Android emulator or real Android device
    - [Android development environment](https://docs.flutter.dev/get-started/install/linux#android-setup)
- Familiarity with ngrok (optional, useful if you want to test on a device)

{% include docs/v1/tech/tutorials/_integrate-prerequisites.liquid %}

To make sure your environment is working correctly, run the following command in your terminal window.

```shell
flutter doctor
```

If everything is configured properly, you will see something like the following result in your terminal window:

```shell
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.7.10)
[✓] Android toolchain - develop for Android devices (Android SDK version 33.0.0)
[✓] Xcode - develop for iOS and macOS (Xcode 14.3)
[✓] Chrome - develop for the web
[✓] Android Studio (version 2022.2)
[✓] IntelliJ IDEA Community Edition (version 2022.2)
[✓] Connected device (2 available)
[✓] HTTP Host Availability

• No issues found!
```

## Download and Install FusionAuth

{% include docs/v1/tech/tutorials/_integrate-install-fusionauth.liquid %}

## Create a User and an API Key

{% include docs/v1/tech/tutorials/_integrate-add-user.liquid language=language %}

## Configure FusionAuth

Next, you need to set up FusionAuth.
This can be done in different ways, but we’re going to use the {{language}} client library.
The below instructions use `npm` from the command line, but you can use the client library with an IDE of your preference as well.

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, copy and paste the following file into `package.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/package.json %}
```

Now you need to install the dependencies in `package.json`.

```shell
npm install
```

Then copy and paste the following file into `setup.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure an Application, CORS and more to allow for easy integration.
```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup.js %}
```
Then, you can run the setup script.
```shell
npm run setup
```
If you want, you can [login to your instance](http://localhost:9011) and examine the new Application the script created for you.

## Create Your Flutter Application

In order to create and set up the new {{technology}} app, run the following command. You'll want to be in a directory where the project should live.

```shell
flutter create fusionauth_demo
```

After the installation process completes, you will see that the `fusionauth_demo` directory contains all the Flutter starter app configuration. Open the project directory with the text editor of your choice.

You can run your new project in the actual device or an emulator to confirm everything is working before you customize any code. Do so by running the following command in the project directory:

```shell
cd fusionauth_demo
flutter run
```

After running this, you will get the list of emulators or devices in which you want to run the project. You can simply choose the one in which you want the code to run. Make sure to remain in this directory for the rest of this tutorial.

However, to run the project on both iOS and Android together, you can use the following command:

```shell
flutter run -d all
```

The build process always takes a while the first time an app is built. After the successful build, you will get the boilerplate Flutter app running in your emulators.

Now that you have a basic working application running, let's jump into the fun stuff: adding auth!

## Integrating AppAuth

[AppAuth](https://appauth.io/) is a popular OAuth package that can be used in both native and cross-platform mobile applications. In this project, you will be storing the access token using the secure storage package. Since such tokens allow your application to access protected resources such as APIs, you need to take care they are stored as securely as possible.

Therefore, you need to install some dependencies to your project. For that, you need to open the `pubspec.yml` file in your project and add these dependencies:

```yaml
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/pubspec.yml %}
```

## Setting up AppAuth

Now that you have installed your libraries, you need to configure and add your previously configured callback URL to native configuration in both the Android and iOS directories.

Let's look at Android first.

### Android setup

In your editor, you need to go to the `android/app/build.gradle` file for your Android app to specify the custom scheme. There should be a section in the file that looks similar to the below code block, but you'll need to add the FusionAuth URL: `com.fusionauth.flutterdemo`.

At the end of your editing, make sure the `appAuthRedirectScheme` section looks similar to the one shown below.

```gradle
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/android/app/build.gradle %}
```

### iOS setup

You need to edit the `ios/Runner/Info.plist` file in the iOS app to specify the custom scheme. There should be a section in it that looks similar to the following, but you'll need to add the FusionAuth URL: `com.fusionauth.flutterdemo://login-callback`.

At the end of your editing, make sure the `CFBundleURLSchemes` section looks similar to this:

```xml
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/ios/Runner/Info.plist %}
```

## Dive into the code

You need to open the `main.dart` file present inside the `lib` directory of your project and paste the contents below.

> Note: putting all your logic in one file makes sense for a tutorial, but for a larger application you'll probably want to split it up.

```dart
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/lib/main.dart %}
```

This code uses the system browser instead of an embedded webview due to security concerns. A webview is totally controlled by the native application displaying it, the [current mobile best practices](https://tools.ietf.org/html/rfc8252) for OAuth require you to use the system browser, which is not under that control. From section 8.12 of that document:

> This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests and allows that authorization endpoints MAY take steps to detect and block authorization requests in embedded user-agents.

Now, start up your emulators or real devices again.

```shell
flutter run -d all
```

After the application is loaded, click the "Login" button. Log in with the user account you created when setting up FusionAuth, and you’ll see the user picture and name next to a logout button.

You should see something similar to this demo:

{% include _youtube-video.liquid youtubeid="EklSdaT0xfw" %}

## Additional resources

Want to dive in further? Here are some additional resources for understanding auth in Flutter and mobile applications.

* [Flutter AppAuth Plugin](https://pub.dev/packages/flutter_appauth)
* [Auth in Flutter](https://medium.com/@greg.perry/auth-in-flutter-97275b29b550)
* [FusionAuth Dart Client Library](https://github.com/FusionAuth/fusionauth-dart-client)
* [Native app OAuth best practices](https://tools.ietf.org/html/rfc8252)
