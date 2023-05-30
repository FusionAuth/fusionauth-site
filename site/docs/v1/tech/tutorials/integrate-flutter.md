---
layout: doc
title: Integrate Your Flutter Application With FusionAuth
description: Integrate your Flutter application with FusionAuth
navcategory: getting-started
language: JavaScript
technology: Flutter
---

{% include docs/integration/_intro.md %}

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
- Familiarity with [ngrok](https://ngrok.com) (optional, useful if you want to test on a device)

{% include docs/integration/_prerequisites.md %}

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

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

## Set up a Public URL for Fusionauth

Your FusionAuth instance is now running on a different machine (your computer) than the mobile app will run (either a real device or an emulator), which means that it won't be able to access `localhost`.

If the device (either real or emulator) and your computer are connected to the same network, you can use the local IP Address for your machine (e.g. `192.168.15.2`). Here are a few articles to help your find your IP Address depending on the Operational System you are running: 

- [Linux](https://linuxize.com/post/how-to-find-ip-address-linux/#find-your-public-ip-address)
- [Mac](https://support.apple.com/guide/mac-help/find-your-computers-name-and-network-address-mchlp1177/mac)
- [Windows](https://support.microsoft.com/en-us/windows/find-your-ip-address-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9)

If they are not connected to the same network or if you have something that blocks connections (like a Firewall), you can use [ngrok](https://ngrok.com/docs/getting-started/) to expose your local FusionAuth instance running at port `9011` to the Internet.

In either case, you'll have to use that address when configuring your instance and developing the app.

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the {{page.language}} client library. The below instructions use `npm` on the command line, but you can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, copy and paste the following file into `package.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/package.json %}
```

Install the dependencies.

```shell
npm install
```

Then copy and paste the following file into `setup.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure your FusionAuth instance to allow for easy integration.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup-flutter.js %}
```

Then, you can run the setup script, replacing `YOUR_API_KEY_FROM_ABOVE` with the API Key you generated earlier and `YOUR_PUBLIC_URL` with the public address for your instance (either `http://your-ip-address:9011` or the URL ngrok provided you).

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE fusionauth_domain=YOUR_PUBLIC_URL npm run setup-flutter
```

If you are using PowerShell, you will need to set the environment variables in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
$env:fusionauth_domain='YOUR_PUBLIC_URL'
npm run setup-flutter
```

If you want, you can [log into your instance](http://localhost:9011){:target="_blank"} and examine the new Application the script created for you.

## Create Your {{page.technology}} Application

In order to create and set up the new {{page.technology}} app, run the following command. You'll want to be in a directory where the project should live.

```shell
mkdir ../flutter-app && cd ../flutter-app
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

[AppAuth](https://appauth.io/){:target="_blank"} is a popular OAuth package that can be used in both native and cross-platform mobile applications. In this project, you will be storing the access token using the secure storage package. Since such tokens allow your application to access protected resources such as APIs, you need to take care they are stored as securely as possible.

Therefore, you need to install some dependencies to your project. For that, you need to replace the `pubspec.yaml` file in your project with the one below.

```yaml
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/pubspec.yaml %}
```

## Setting Up AppAuth

Now that you have installed your libraries, you need to configure and add your previously configured callback URL to native configuration in both the Android and iOS directories.

Let's look at Android first.

### Android Setup

In your editor, you need to go to the `android/app/build.gradle` file for your Android app to specify the custom scheme. There should be a part of the file that looks similar to the code block below, but you'll need to add the FusionAuth URL `com.fusionauth.flutterdemo` to the `appAuthRedirectScheme` section.

```gradle
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/android/app/build.gradle %}
```

### iOS Setup

You need to edit the `ios/Runner/Info.plist` file in the iOS app to specify the custom scheme. There should be a section in it that looks similar to the following, but you'll need to add the FusionAuth URL: `com.fusionauth.flutterdemo://login-callback`.

At the end of your editing, make sure the `CFBundleURLSchemes` section looks similar to this:

```xml
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/ios/Runner/Info.plist %}
```

## Dive into the code

You need to open the `main.dart` file present inside the `lib` directory of your project and paste the contents below.

{% include _callout-tip.liquid content="Putting all your logic in one file makes sense for a tutorial, but for a larger application you'll probably want to split it up." %}

```dart
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-flutter-dart/main/lib/main.dart %}
```

In the beginning of the file, change the `FUSIONAUTH_DOMAIN` constant to the public address for your instance (the same one you used when configuring it). If it is not running on HTTPS, you should also change `FUSIONAUTH_SCHEME` to `http`. 

This code uses the system browser instead of an embedded webview due to security concerns. A webview is totally controlled by the native application displaying it, the [current mobile best practices](https://tools.ietf.org/html/rfc8252) for OAuth require you to use the system browser, which is not under that control. From section 8.12 of that document:

{% include _callout-note.liquid content="This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests and allows that authorization endpoints MAY take steps to detect and block authorization requests in embedded user-agents." %}

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
