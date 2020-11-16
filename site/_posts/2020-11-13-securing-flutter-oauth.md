---
layout: blog-post
title: Securing a Flutter App with OAuth
description: How can you use Flutter, OAuth and OIDC together?
image: blogs/controlling-hotspot/controlling-a-hotspot-with-fusionauth-authentication.png
author: Krissanawat Kaewsanmuang
category: blog
tags: client-dart 
excerpt_separator: "<!--more-->"
---

Today, Flutter has become one of the most talked-about cross-platform mobile development frameworks. It is giving considerable competition to its rival React Native in terms of GitHub stars. Most developers who have experienced Flutter development do not fail to mention its sublime way to configure and build beautiful UI. There is no doubt that flutter is among the top in the list for the developers to pick the mobile development framework for a new project.

<!--more-->

In this tutorial, we will go through one of the most essential features that is OAuth that every developer must face and implement in their app for authentication purposes. In general most big players providing mobile development frameworks already cover their own OAuth package for their service. But, in the case of Flutter, we are going to use FusionAuth to bootstrap our own Auth server.
So, let's get started!

## Requirements

Some tools and configurations you need to have before starting this tutorial:
* VScode or any other Text Editor
* Git
* Xcode, for iOS
* iPhone simulator or real iOS device
* Android emulator or real Android device

## Setting up FusionAuth as your auth provider

In order to set up FusionAuth, follow the [5 minute setup guide](/docs/v1/tech/5-minute-setup-guide/). It is simple and quick. By default, the OAuth server will run at the address `http://localhost:9011`. Here, we can save our time while walking through some of the steps:

### Configure the FusionAuth application

In this step, we are going to configure a FusionAuth application. This is different from the FusionAuth server instance or the Flutter application. In FusionAuth, an application is anything a user might log in to. To configure this, sign into the FusionAuth administrative interface and navigate to “Applications”. From there, create a new application.

Once we’ve done that, we need to navigate to the “OAuth” tab and add in a redirect URI of `com.fusionauth.flutterdemo://login-callback`. We’ll use this redirect URL in our Flutter application later.

Also, we need to note the value of “Client Id”; we’ll need that later in the configuration process. Then, we need to click on Save. When properly configured, the application details screen should look like this:

pic TBD

We need to make sure that we register our users to the new application. Hence, it will create a relationship between a user and the newly created application as shown in the screenshot below:

pic TBD

If we want, we can add more users to the “Users” tab. But, we need to make sure to register them with our new application. Now, we move on to setting up the Flutter app project.

## Setup Flutter Project

Setting up the Flutter project is simple and easy for every OS platform. We can simply follow the instruction on the [Flutter documentation](https://flutter.dev/docs/get-started/install) page. But in order to save our time, a quick demonstration of setup steps are provided below:

First, we need to clone the Flutter SDK from GitHub by running the following command in our device terminal:

```shell
git clone https://github.com/flutter/flutter.git
```

Note that, we need to choose an appropriate directory to clone the SDK.

Next, we need to add the flutter tool to our path by running the following command in the terminal:

```shell
export PATH="$PATH:`pwd`/flutter/bin"
```

Hence, we can now check if everything is configured properly or not by running the following command in our terminal window:

```shell
flutter doctor
```

If everything is configured properly, we will see the following result in our terminal window:

pic TBD from him

Note that Flutter depends on iOS and/or Android development environments being installed. Doing so is beyond the scope of this tutorial, so please consult the linked documentation above.

## Creating a new Flutter app

In order to create and set up the new flutter boilerplate app, we need to run the following command by opening the terminal window in the specific directory that we want our project to be created:


```shell
flutter create fusionauth_demo
```

After the installation process completes successfully, we will get the `fusionauth_demo` directory that contains all the flutter starter app configurations. Now, we can open the project directory with VScode by running the following command:

```shell
code fusionauth_demo
```

Now, we can run our new project in the actual device or a emulator. We can do so by running the following command in the project directory:


```shell
flutter run
```

After running the command, we will get the list of emulators or devices in which we want to run the project. We can simply choose the one in which we want to run.

pic TBD from kriss

However, in order to run the project on both iOS and Android together, we can run the following command:

```shell
flutter run -d all
```

The built process always takes time in its first built. And, after the successful build. we will get the boilerplate flutter app in our emulators as displayed in the emulator screenshots below:

pic TBD from kriss

## Integrating AppAuth

[AppAuth](https://appauth.io/) is a popular OAuth package that can be used in both native and cross-platform. In this project, we will be storing the access token as well using the secure storage package. Hence, we need to install some dependencies to our project first. For that, we need to open the `pubspec.yml` file in our project and add the dependencies and save it as directed in the code snippet below:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^0.12.1
  flutter_appauth: ^0.9.1
  flutter_secure_storage: ^3.3.3
  simple_gravatar: ^1.0.5
  cupertino_icons: ^1.0.0
```

## Setup AppAuth

Here, we need to add callback URL to native configuration in both Android and iOS.

### Android setup

We need to go to the android/app/build.gradle file for our Android app to specify the custom scheme so that there should be a section in it that looks similar to the following but replace <your_custom_scheme> with the desired value:

```
// ...
android {
  //...
  defaultConfig {
    // ...
    manifestPlaceholders = [
      'appAuthRedirectScheme': 'com.fusionauth.flutterdemo://login-callback'
    ]
  }
}
```

### iOS setup

We need to go to the `Info.plist` in our iOS app to specify the custom scheme so that there should be a section in it that looks similar to the following but replace <your_custom_scheme> with the desired value:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.fusionauth.flutterdemo://login-callback</string>
        </array>
    </dict>
</array>
```
## Dive to Code

Next, we need to open the `main.dart` file present inside the `./lib` directory of our project. Below is the entireity of `main.dart`. Putting all your logic in one file makes sense for a tutorial, but for a real application you'll want to split it up.

```dart
import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:simple_gravatar/simple_gravatar.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final FlutterAppAuth appAuth = FlutterAppAuth();
const FlutterSecureStorage secureStorage = FlutterSecureStorage();

const String FUSION_AUTH_DOMAIN = '1a5321098cb0.ngrok.io';
const String FUSION_AUTH_CLIENT_ID = '7e3637e8-723a-42d6-9d1d-5cb36128d6f1';
const String FUSION_AUTH_CLIENT_SECRET =
    'hQ7s4MJIHIyk7iqbZ0082Q020RT9EZYtfBrah1v3a4A';
const String FUSION_AUTH_REDIRECT_URI =
    'com.fusionauth.flutterdemo://login-callback';
const String FUSION_AUTH_ISSUER = 'https://$FUSION_AUTH_DOMAIN';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key key}) : super(key: key);

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool isBusy = false;
  bool isLoggedIn = false;
  String errorMessage;
  String name;
  String picture;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FusionAuth on Flutter ',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('FusionAuth on Flutter Demo'),
        ),
        body: Center(
          child: isBusy
              ? const CircularProgressIndicator()
              : isLoggedIn
                  ? Profile(logoutAction, name, picture)
                  : Login(loginAction, errorMessage),
        ),
      ),
    );
  }

  Future<Map<String, Object>> getUserDetails(String accessToken) async {
    const String url = 'https://$FUSION_AUTH_DOMAIN/oauth2/userinfo';
    final http.Response response = await http.get(
      url,
      headers: <String, String>{'Authorization': 'Bearer $accessToken'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user details');
    }
  }

  Future<void> loginAction() async {
    setState(() {
      isBusy = true;
      errorMessage = '';
    });

    try {
      final AuthorizationTokenResponse result =
          await appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          FUSION_AUTH_CLIENT_ID,
          FUSION_AUTH_REDIRECT_URI,
          clientSecret: FUSION_AUTH_CLIENT_SECRET,
          issuer: 'https://$FUSION_AUTH_DOMAIN',
          scopes: <String>['offline_access'],
          // promptValues: ['login']
        ),
      );
      log('data: $result');
      // final Map<String, Object> idToken = parseIdToken(result.idToken);
      final Map<String, Object> profile =
          await getUserDetails(result.accessToken);

      debugPrint('response: $profile');
      await secureStorage.write(
          key: 'refresh_token', value: result.refreshToken);
      var gravatar = Gravatar(profile['email']);
      var url = gravatar.imageUrl(
        size: 100,
        defaultImage: GravatarImage.retro,
        rating: GravatarRating.pg,
        fileExtension: true,
      );
      setState(() {
        isBusy = false;
        isLoggedIn = true;
        name = profile['given_name'];
        picture = url;
      });
    } on Exception catch (e, s) {
      debugPrint('login error: $e - stack: $s');

      setState(() {
        isBusy = false;
        isLoggedIn = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> initAction() async {
    final String storedRefreshToken =
        await secureStorage.read(key: 'refresh_token');
    if (storedRefreshToken == null) return;

    setState(() {
      isBusy = true;
    });

    try {
      final TokenResponse response = await appAuth.token(TokenRequest(
        FUSION_AUTH_CLIENT_ID,
        FUSION_AUTH_REDIRECT_URI,
        issuer: FUSION_AUTH_ISSUER,
        refreshToken: storedRefreshToken,
      ));

      // final Map<String, Object> idToken = parseIdToken(response.idToken);
      final Map<String, Object> profile =
          await getUserDetails(response.accessToken);

      await secureStorage.write(
          key: 'refresh_token', value: response.refreshToken);
      var gravatar = Gravatar(profile['email']);
      var url = gravatar.imageUrl(
        size: 100,
        defaultImage: GravatarImage.retro,
        rating: GravatarRating.pg,
        fileExtension: true,
      );
      setState(() {
        isBusy = false;
        isLoggedIn = true;
        name = profile['given_name'];
        picture = url;
      });
    } on Exception catch (e, s) {
      debugPrint('error on refresh token: $e - stack: $s');
      await logoutAction();
    }
  }

  Future<void> logoutAction() async {
    await secureStorage.delete(key: 'refresh_token');
    setState(() {
      isLoggedIn = false;
      isBusy = false;
    });
  }
}

class Login extends StatelessWidget {
  final Future<void> Function() loginAction;
  final String loginError;

  const Login(this.loginAction, this.loginError, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        RaisedButton(
          onPressed: () async {
            await loginAction();
          },
          child: const Text('Login'),
        ),
        Text(loginError ?? ''),
      ],
    );
  }
}

class Profile extends StatelessWidget {
  final Future<void> Function() logoutAction;
  final String name;
  final String picture;

  const Profile(this.logoutAction, this.name, this.picture, {Key key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.orange, width: 4),
            shape: BoxShape.circle,
            image: DecorationImage(
              fit: BoxFit.fill,
              image: NetworkImage(picture ?? ''),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text('Name: $name'),
        const SizedBox(height: 48),
        RaisedButton(
          onPressed: () async {
            await logoutAction();
          },
          child: const Text('Logout'),
        ),
      ],
    );
  }
}

```

That's a lot. Let's break it down section by section. First, inside the `main.dart` file, we need to make the imports of all the necessary packages as shown in the code snippet below:

```dart
import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:simple_gravatar/simple_gravatar.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
//...
```

Then, we can initialize the `FlutterAppAuth` instance and `FlutterSecureStorage` instance by using the code from the following code snippet:

```dart
// ...
final FlutterAppAuth appAuth = FlutterAppAuth();
const FlutterSecureStorage secureStorage = FlutterSecureStorage();
```

Next, we need to define some constants for the Auth Ids and URLs as directed in the code snippet below:

```dart
//...
const String FUSION_AUTH_DOMAIN = 'b47a7e1e6e7d.ngrok.io';
const String FUSION_AUTH_CLIENT_ID = 'c93fe25d-7c79-470f-8014-89e3a5768230';
const String FUSION_AUTH_CLIENT_SECRET =
    'hQ7s4MJIHIyk7iqbZ0082Q020RT9EZYtfBrah1v3a4A';
const String FUSION_AUTH_REDIRECT_URI =
    'com.fusionauth.flutterdemo://login-callback';
const String FUSION_AUTH_ISSUER = 'https://$FUSION_AUTH_DOMAIN';
```

TODO you'll need to update these

Now, in the `main.dart` file, we are going to create class objects:

* Profile
* Login
* MyApp

Let's look at each of these in turn.

The `Profile` class extends to a Stateless widget that houses the widgets and UI implementations which is to be shown after the successful Auth login. The UI is simple with a logout button to logout from the authenticated state.

```dart
// ...
class Profile extends StatelessWidget {
  final Future<void> Function() logoutAction;
  final String name;
  final String picture;

  const Profile(this.logoutAction, this.name, this.picture, {Key key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.orange, width: 4),
            shape: BoxShape.circle,
            image: DecorationImage(
              fit: BoxFit.fill,
              image: NetworkImage(picture ?? ''),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text('Name: $name'),
        const SizedBox(height: 48),
        RaisedButton(
          onPressed: () async {
            await logoutAction();
          },
          child: const Text('Logout'),
        ),
      ],
    );
  }
}
//...
```

The `Login` class also extends to a Stateless Widgets that provides the interface form for login activity. It delivers a Login button as a UI to execute the loginAction function.

```dart
//...
class Login extends StatelessWidget {
  final Future<void> Function() loginAction;
  final String loginError;

  const Login(this.loginAction, this.loginError, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        RaisedButton(
          onPressed: () async {
            await loginAction();
          },
          child: const Text('Login'),
        ),
        Text(loginError ?? ''),
      ],
    );
  }
}
//...
```

The `MyApp` class is the main class that extends to the StateFul widget. MyAppclass object is the main class that runs on our app which is called side the runApp method inside the main() function.

```dart
//...
void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({Key key}) : super(key: key);

  @override
  _MyAppState createState() => _MyAppState();
}
//...
```

In terms of UI, this class renders out the `Profile` or `Login` interfaces based on the authenticated state. The `Profile` or `Login` classes are conditionally rendered by passing the respective `loginAction` and `logoutAction` functions along with other required parameters.

```dart
//...
class _MyAppState extends State<MyApp> {
  bool isBusy = false;
  bool isLoggedIn = false;
  String errorMessage;
  String name;
  String picture;
//...
```

This class object houses the implementation of four main functions:

* `getUserDetails`
* `loginAction`
* `LogoutAction`
* `initAction`

`getUserDetails` takes the access token as a parameter and makes the HTTP GET request to the Auth server by passing the access token. If successful, it will receive the user details in response. This is a standard OIDC call. This function is called inside the `initAction` and `loginAction` functions.

```dart
// ...
Future<Map<String, Object>> getUserDetails(String accessToken) async {
  const String url = 'https://$FUSION_AUTH_DOMAIN/oauth2/userinfo';
  final http.Response response = await http.get(
    url,
    headers: <String, String>{'Authorization': 'Bearer $accessToken'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get user details');
  }
}
// ...
```

`loginAction` is triggered when we press the login button of the `Login` class. This function makes the Authorization Token Response using the `AuthorizationTokenResponse` method inside the `appAuth.authorizeAndExchangeCode` instance. The request takes in the client id, redirect URL, issuer, and required scopes to provide the access token in the end. After successfully getting the access token, the `getUserDetails` function is called to get the user info and set the required state variables to change the UI rendered in the app interface.

```dart
Future<void> loginAction() async {
  setState(() {
    isBusy = true;
    errorMessage = '';
  });

  try {
    final AuthorizationTokenResponse result =
        await appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        FUSION_AUTH_CLIENT_ID,
        FUSION_AUTH_REDIRECT_URI,
        issuer: 'https://$FUSION_AUTH_DOMAIN',
        scopes: <String>['openid'],
      ),
    );
    log('data: $result');
    final Map<String, Object> profile =
        await getUserDetails(result.accessToken);

    debugPrint('response: $profile');
    await secureStorage.write(
          key: 'refresh_token', value: result.refreshToken);
    var gravatar = Gravatar(profile['email']);
    var url = gravatar.imageUrl(
      size: 100,
      defaultImage: GravatarImage.retro,
      rating: GravatarRating.pg,
      fileExtension: true,
    );
    setState(() {
      isBusy = false;
      isLoggedIn = true;
      name = profile['given_name'];
      picture = url;
    });
  } on Exception catch (e, s) {
    debugPrint('login error: $e - stack: $s');

    setState(() {
      isBusy = false;
      isLoggedIn = false;
      errorMessage = e.toString();
    });
  }
}
// ...
```

`initAction` is called inside the `initState` function of the `MyApp` class. This function is executed at the initialization of `MyApp` class and houses function to check the authentication token and get the user details similar to the `loginAction` function.

```dart
//...
Future<void> initAction() async {
  final String storedRefreshToken =
      await secureStorage.read(key: 'refresh_token');
  if (storedRefreshToken == null) return;

  setState(() {
    isBusy = true;
  });

  try {
    final TokenResponse response = await appAuth.token(TokenRequest(
      FUSION_AUTH_CLIENT_ID,
      FUSION_AUTH_REDIRECT_URI,
      issuer: FUSION_AUTH_ISSUER,
      refreshToken: storedRefreshToken,
    ));

    // final Map<String, Object> idToken = parseIdToken(response.idToken);
    final Map<String, Object> profile =
        await getUserDetails(response.accessToken);

    await secureStorage.write(
        key: 'refresh_token', value: response.refreshToken);
    var gravatar = Gravatar(profile['email']);
    var url = gravatar.imageUrl(
      size: 100,
      defaultImage: GravatarImage.retro,
      rating: GravatarRating.pg,
      fileExtension: true,
    );
    setState(() {
      isBusy = false;
      isLoggedIn = true;
      name = profile['given_name'];
      picture = url;
    });
  } on Exception catch (e, s) {
    debugPrint('error on refresh token: $e - stack: $s');
    await logoutAction();
  }
}
//...
```

In `logoutAction` we remove the access token from the secure storage and set state back to initial states as shown in the code snippet below:

```dart
Future<void> logoutAction() async {
  await secureStorage.delete(key: 'refresh_token');
  setState(() {
    isLoggedIn = false;
    isBusy = false;
  });
}
```

The final result for both Android and iOS is demonstrated in the demo video below:
https://drive.google.com/file/d/1ssYwiooqoJfoyoD1uO0WkJo-hSM9jzzT/view?usp=sharing

## Additional resources

Want to dive in further? Here are some additional resources for understanding auth in Flutter and mobile applications.

* [Flutter AppAuth Plugin](https://pub.dev/packages/flutter_appauth)
* [Auth in Flutter](https://medium.com/@greg.perry/auth-in-flutter-97275b29b550)
* [FusionAuth Dart Client Library](https://github.com/FusionAuth/fusionauth-dart-client)
* [Native app OAuth best practices](https://tools.ietf.org/html/rfc8252)

## Conclusion

With the growing popularity of the Flutter mobile app development framework, it is essential to know about different feature implementations in Flutter as well. Here, we talked about Flutter and OAuth implementations using FusionAuth technology. First, we got brief stepwise guidance on how to set up our first Flutter project and run it in the respective emulators or devices. 

Then, we went into the detailed guidance of how to implement the authentication feature in Flutter using FusionAuth.

If you need to extend this application to access the FusionAuth API, check out the Dart FusionAuth client library. For example, you could add the last login date as a custom data field.

Also overall coding implementation done in this tutorial is available on GitHub.
Until then, keep coding folks!



TODO:
submit PR for this repo
https://pub.dev/packages/flutter_appauth

https://github.com/MaikuB/flutter_appauth

Pull over images and load up youtube

Add note about why we turn off 'require authentication' (maybe to react native post too?) in the application configuration. Note PKCE

Note the github repo in the beginning

add it to example apps

appAuth.authorizeAndExchangeCode is convenience method

pkce is built in

read aloud
