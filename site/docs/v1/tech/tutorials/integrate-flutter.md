---
layout: doc
title: Integrate Your Flutter Application With FusionAuth
description: Integrate your Flutter application with FusionAuth
navcategory: getting-started
---

In this tutorial, you are going to learn how to integrate a Flutter application with FusionAuth.

Here's a typical application login flow before integrating FusionAuth into your Flutter application.

{% plantuml source: _diagrams/docs/login-before.plantuml, alt: "Login before FusionAuth." %}

And here's the same application login flow when FusionAuth is introduced.

{% plantuml source: _diagrams/docs/login-after.plantuml, alt: "Login with FusionAuth." %}

## Prerequisites

For this tutorial, you’ll need to have some of these tools installed.

- If you want to develop applications for iOS:
    - Xcode
    - iPhone simulator or real iOS device
    - iPhone development environment
- If you want to develop applications for Android:
    - Android emulator or real Android device
    - Android development environment
- Familiarity with ngrok (optional, useful if you want to test on a device)

You’ll also need Docker, since that is how you’ll install FusionAuth.

The commands below are for macOS, but are limited to `mkdir` and `cd`, which have equivalent in Windows and Linux.

## Setting up FusionAuth as your auth provider

In order to set up FusionAuth, follow the [5 minute setup guide](/docs/v1/tech/5-minute-setup-guide). It is simple and quick. By default, the FusionAuth instance will run at the address `http://localhost:9011`.

Some of the most important setup steps are shown below.

### Configure a FusionAuth application

Configure a FusionAuth application by signing in to the FusionAuth administrative user interface and navigating to **Applications**. From there, create a new application by clicking the green "plus" button.

Then navigate to the **OAuth** tab and fill in the fields like shown below.

| Field                      | Value                                         | Description                                                                                                                                                                  |
|----------------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Name`                     | `My Flutter App`                              | Your application name, for display-only purposes.                                                                                                                            |
| `Client Id`                | `7e3637e8-723a-42d6-9d1d-5cb36128d6f1`        | This is the Id used in every code in this article.                                                                                                                           |
| `Client Authentication`    | `Not required`                                | Since the Flutter application is a native app, it's not considered a "confidential client" and a client secret isn't safe. It could be found by decompiling the application. |
| `PKCE`                     | `Required`                                    | PKCE (often pronounced "pixie") stands for _"Proof of Key Code Exchange"_, which is another method of securing access and is what the Futter library will use.               |
| `Authorized redirect URLs` | `com.fusionauth.flutterdemo://login-callback` | You’ll use this redirect URL in your Flutter application later.                                                                                                              |

Click the blue floppy disk icon to save it. When properly configured, the application details screen should look like this:

{% include _image.liquid src="/assets/img/blogs/securing-flutter-app/application-configuration.png" alt="Configuring the FusionAuth application." class="img-fluid" figure=false %}

Now, register the desired users to the new FusionAuth application. Doing so creates a relationship between a user and the newly created application as shown in the screenshot below:

{% include _image.liquid src="/assets/img/blogs/securing-flutter-app/user-registration.png" alt="Registering the user for the new application." class="img-fluid" figure=false %}

If you want, you can add more users to the "Users" and register them to this application. But you can work through this tutorial with just one registered user.

If you want to test with a real device, you should also set up ngrok to point to the local FusionAuth server, so that devices can access `http://localhost:9011`. While beyond the scope of this tutorial, here's [ngrok documentation](https://ngrok.com/docs#getting-started-expose) on how to do so.

Next, move on to setting up the Flutter app project.

## Setting up the Flutter project

Setting up the Flutter project is simple and easy for every OS: just follow the instructions in the [Flutter documentation](https://flutter.dev/docs/get-started/install). But to make things easier, a quick outline of the setup steps is provided below.

First, clone the Flutter SDK from GitHub by running the following command in your device terminal:

```shell
cd $HOME/dev
git clone https://github.com/flutter/flutter.git
```

> Note that you need to choose an appropriate directory in which to clone the SDK. The example above will use `~/dev`.

Next, add the `flutter` tool to your path by running the following command in the terminal (and if you are doing this more than once, perhaps to your `.bashrc` or `.zshrc`):

```shell
export PATH="$PATH:$HOME/dev/flutter/bin"
```

You can check if everything is configured properly by running the following command in your terminal window:

```shell
flutter doctor
```

If everything is configured properly, you will see the following result in your terminal window:

{% include _image.liquid src="/assets/img/blogs/securing-flutter-app/flutter-doctor-output.png" alt="Output of the flutter doctor command." class="img-fluid" figure=false %}

> If you didn't see the above messages, please review the [more detailed installation instructions](https://flutter.dev/docs/get-started/install) on the Flutter site.

Note that Flutter depends on iOS and/or Android development environments being installed. Doing so is beyond the scope of this tutorial, however. If you need to do that, please consult the platform installation instructions for Android or iOS as appropriate.

## Creating a new Flutter app

In order to create and set up the new Flutter app, run the following command. You'll want to be in a directory where the project should live.

```shell
cd $HOME/dev
flutter create fusionauth_demo
```

After the installation process completes, you will see that the `fusionauth_demo` directory contains all the Flutter starter app configuration. Open the project directory with the text editor of your choice.

You can run your new project in the actual device or an emulator to confirm everything is working before you customize any code. Do so by running the following command in the project directory:

```shell
cd $HOME/dev/fusionauth_demo
flutter run
```

After running this, you will get the list of emulators or devices in which you want to run the project. You can simply choose the one in which you want the code to run. Make sure to remain in this directory for the rest of this tutorial.

{% include _image.liquid src="/assets/img/blogs/securing-flutter-app/flutter-choose-device.png" alt="Output of the flutter run command." class="img-fluid" figure=false %}

However, to run the project on both iOS and Android together, you can use the following command:

```shell
flutter run -d all
```

The build process always takes a while the first time an app is built. After the successful build, you will get the boilerplate Flutter app in your emulators as displayed in the emulator screenshots below:

{% include _image.liquid src="/assets/img/blogs/securing-flutter-app/flutter-demo-home-page.png" alt="The default Flutter app in the emulator." class="img-fluid" figure=false %}

Now that you have a basic working application running, let's jump into the fun stuff: adding auth!

## Integrating AppAuth

[AppAuth](https://appauth.io/) is a popular OAuth package that can be used in both native and cross-platform mobile applications. In this project, you will be storing the access token using the secure storage package. Since such tokens allow your application to access protected resources such as APIs, you need to take care they are stored as securely as possible.

Therefore, you need to install some dependencies to your project. For that, you need to open the `pubspec.yml` file in your project and add these dependencies:

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

## Setting up AppAuth

Now that you have installed your libraries, you need to configure and add your previously configured callback URL to native configuration in both the Android and iOS directories.

Let's look at Android first.

### Android setup

In your editor, you need to go to the `android/app/build.gradle` file for your Android app to specify the custom scheme. There should be a section in the file that looks similar to the below code block, but you'll need to add the FusionAuth URL: `com.fusionauth.flutterdemo`.

At the end of your editing, make sure the `appAuthRedirectScheme` section looks similar to this:

```gradle
// ...
android {
  //...
  defaultConfig {
    // ...
    manifestPlaceholders += [
      'appAuthRedirectScheme': 'com.fusionauth.flutterdemo'
    ]
  }
}
```

### iOS setup

You need to edit the `Info.plist` file in the iOS app to specify the custom scheme. There should be a section in it that looks similar to the following, but you'll need to add the FusionAuth URL: `com.fusionauth.flutterdemo://login-callback`.

At the end of your editing, make sure the `CFBundleURLSchemes` section looks similar to this:

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

> @TODO check if we really need ://login-callback here

## Dive into the code

You need to open the `main.dart` file present inside the `./lib` directory of your project. Below is the entirety of the `main.dart` file, as it should be when fully finished. This tutorial will cover each section individually soon.

> Note: putting all your logic in one file makes sense for a tutorial, but for a larger application you'll probably want to split it up.

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
          issuer: 'https://$FUSION_AUTH_DOMAIN',
          scopes: <String>['offline_access'],
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
        ElevatedButton(
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
        ElevatedButton(
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

That's a lot. Let's break it down section by section. First, inside the `main.dart` file, you need to import all necessary packages:

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

Then, you can initialize both `FlutterAppAuth` and `FlutterSecureStorage` instances by using this code:

```dart
// ...
final FlutterAppAuth appAuth = FlutterAppAuth();
const FlutterSecureStorage secureStorage = FlutterSecureStorage();
// ...
```

Next, you need to define some constants. If you plan to run your application on a real device right now, you can use [ngrok.io](https://ngrok.io) to publish your local FusionAuth instance to an Internet endpoint. If you are only using a simulator, you can set `FUSIONAUTH_AUTH_DOMAIN` to `localhost:9011`.

```dart
//...
const String FUSION_AUTH_DOMAIN = 'b47a7e1e6e7d.ngrok.io';
const String FUSION_AUTH_CLIENT_ID = '7e3637e8-723a-42d6-9d1d-5cb36128d6f1';
const String FUSION_AUTH_REDIRECT_URI =
    'com.fusionauth.flutterdemo://login-callback';
const String FUSION_AUTH_ISSUER = 'https://$FUSION_AUTH_DOMAIN';
// ...
```

Now you are going to create the following classes:

* `Profile`
* `Login`
* `MyApp`

The `Profile` class extends the `StatelessWidget` class. It holds what is shown after the successful login. The user interface is simple: some user information and a logout button.

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
        ElevatedButton(
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

The `Login` class also extends `StatelessWidget`. It displays a simple Login button. When pressed, that will start the `loginAction`, which you'll build out below.

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
        ElevatedButton(
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

`MyApp` is the main class and extends `StatefulWidget`. The `MyApp` object is the main class that runs your app. The whole application is started by the `main` function which calls the `runApp` function which starts up the `MyApp` object.

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

However, most of the action takes place in the `_MyAppState` object. In terms of user interface, this object renders the `Profile` or `Login` interfaces based on whether the user is authenticated or not.

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

This class houses the implementation of four main functions which set up the user interface and interact with the external OIDC server:

* `initAction`
* `loginAction`
* `getUserDetails`
* `logoutAction`

`initAction` is called inside the `initState` function of the `MyApp` class. This function is executed when the `MyApp` object is initialized. It checks the authentication token and if it is present, retrieves user details and sets the state with those details.

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

The `loginAction` is triggered when you press the login button of the `Login` class. This function retrieves the Authorization Token Response using the `AuthorizationTokenResponse` method returned by the `appAuth.authorizeAndExchangeCode` call. The request needs the Client Id, Redirect URL, Issuer, and required scopes to provide the access token. It also uses the aforementioned PKCE process by default, preventing insecure access. The `AppAuth` library takes care of all of these details.

After successfully getting the access token, the `getUserDetails` function is called to get user information and set the required state variables, which changes the UI rendered.

This code uses the system browser instead of an embedded webview due to security concerns. A webview is totally controlled by the native application displaying it, the [current mobile best practices](https://tools.ietf.org/html/rfc8252) for OAuth require you to use the system browser, which is not under that control. From section 8.12 of that document:

> This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests and allows that authorization endpoints MAY take steps to detect and block authorization requests in embedded user-agents.

Moving forward, here's `loginAction`:

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

This calls `getUserDetails`, which takes the access token as a parameter and makes the HTTP GET request to the auth server. If successful, it will receive the user details in response. This is a standard OIDC call. This function is called inside the `initAction` function as well.

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

To handle logging the user out, the `logoutAction` will be responsible for two things:

* Remove the access token from secure storage
* Set the state back to initial values

These are all shown in the code snippet below:

```dart
Future<void> logoutAction() async {
  await secureStorage.delete(key: 'refresh_token');
  setState(() {
    isLoggedIn = false;
    isBusy = false;
  });
}
```

After editing `main.dart`, start up your emulators or real devices again.

```shell
flutter run -d all
```

You should see something similar to this demo:

{% include _youtube-video.liquid youtubeid="EklSdaT0xfw" %}

## Additional resources

Want to dive in further? Here are some additional resources for understanding auth in Flutter and mobile applications.

* [Flutter AppAuth Plugin](https://pub.dev/packages/flutter_appauth)
* [Auth in Flutter](https://medium.com/@greg.perry/auth-in-flutter-97275b29b550)
* [FusionAuth Dart Client Library](https://github.com/FusionAuth/fusionauth-dart-client)
* [Native app OAuth best practices](https://tools.ietf.org/html/rfc8252)
