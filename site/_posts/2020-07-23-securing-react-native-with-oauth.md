---
layout: blog-post
title: Securing React Native with OAuth
description: How and why to use a centralized user management system rather than having individual applications use their own auth components.
author: Krissanawat Kaewsanmuang
image: blogs/bottleneck-pattern/the-auth-bottleneck-pattern.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

In this tutorial, we are going to set up a React Native application to work with OAuth. We'll set up a FusionAuth app for authorization purposes, but this should work with any OAuth compliant auth service. 

<!--more-->

We start by setting up FusionAuth app, then we set up a React Native project and finally perform the OAuth Authorization Code grant from within the React Native app. 

## Requirements

Here's what you need to get started:

* NodeJS version >= 8.0
* VScode or any other text editor
* `git`
* `npx` 

## What you need to know

If you are a web developer, you may be familiar with OAuth. With web development, we have three players:

```
The browser -> The server -> The OAuth server
```

This architecture was used in this post on [securing a React application with OAuuth](/blog/2020/03/10/securely-implement-oauth-in-react). 

With a mobile device, things change a bit. A corresponding scenario might be something like this:

```
The mobile device -> The server -> The OAuth server
```

However, this can be simplified. The server can be removed and mobile devices can handle the callbacks from the OAuth server. 

Here's a suggested [flow from RFC 8252](https://tools.ietf.org/html/rfc8252#page-5):

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/oauth-authorization-code-flow.png" alt="The authorization code flow for native applications." class="img-fluid" figure=false %}

In this tutorial, we are going to follow this to enable a mobile application to interact with an OAuth server.

Let's configure the server and set up our coding environment.

## Setting up FusionAuth

In order to set up the FusionAuth, you can follow a [5-minute setup](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) guide on FusionAuth’s official documentation. It is very simple and quick.

By default, the OAuth server will run on `http://localhost:9011`.

### Setting up the FusionAuth application

In this step, we are going to configure a FusionAuth application. An application is anything a user might log in to. For this, we need to go to FusionAuth console and navigate to the Applications menu option. In Applications console, we need to create a new app.

Navigate to the *OAuth* tab and add in a redirect URI of `fusionauth-demo:/oauthredirect`. We'll use this redirect in our applications later. 

Also, note the value of the "Client Id"; we'll need that later. Click *Save*. 

When you've properly configured it, the edit screen should look like this:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard.png" alt="Configuring the FusionAuth application." class="img-fluid" figure=false %}

Make sure to register your user to the new application. If you want, you can add more users; register them as well.

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard-register-user.png" alt="Registering your user to the React Native FusionAuth application." class="img-fluid" figure=false %}

Now, we move to the React Native project.

## Setting up the React Native project

Since we are going to use React Native CLI for development, ensure that we have the React Native development environment installed. For installation instructions, follow [the official documentation](https://reactnative.dev/docs/environment-setup).

We are going to use [brew](https://brew.sh/) to install the packages. Make sure that brew is already installed in your system, or install the packages in a different way.

We also need to install development environments for iOS, Android, or both.

### iOS environment

Make sure you have Xcode installed. Then, we need to install dependencies using the commands given below: 

* `brew install node`
* `brew install watchman`

Lastly, we need to install the Xcode CLI tools, which are not normally installed. For that, open Xcode and navigate to Preferences -> Locations. Then pick the Xcode version for command-line tools as shown in the screenshot below:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/activate-xcode.png" alt="Activating Xcode." class="img-fluid" figure=false %}

The setup for iOS is now complete. 

### Android environment

For Android, JDK 8 is required. Using other versions may result in errors. We can download this JDK from the Oracle website or using brew as shown in the snippet below:

```shell
brew cask install adoptopenjdk/openjdk/adoptopenjdk8
```

Next, we need to download and install the [Android studio](https://developer.android.com/studio/install).

Then, we need to configure the `ANDROID_HOME` environment variable in our system path.  We can just add the following lines to our `$HOME/.bash_profile` or `$HOME/.bashrc` (if you are using zsh then `~/.zprofile` or `~/.zshrc`) config file:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Now our setup for the Android platform is complete.

## React native project setup

We are now going to create a new React Native Project.

First, create a new react-native project in our desired directory by running the following command in the terminal:

```shell
react-native init RNfusionauth
```

Open the project folder in your text editor (VSCode or whatever you use).

### Installing react native app auth

One of the key components of our application is the [`react-native-app-auth`](https://github.com/FormidableLabs/react-native-app-auth) package. This package sets up a bridge between [AppAuth-iOS](https://github.com/openid/AppAuth-iOS) and [AppAuth-Android](https://github.com/openid/AppAuth-Android) SDKs for communicating with [OAuth 2.0](https://tools.ietf.org/html/rfc6749) and [OpenID Connect](http://openid.net/specs/openid-connect-core-1_0.html) providers.

This library should support any server that implements the [OAuth2 spec](https://tools.ietf.org/html/rfc6749#section-2.2), which FusionAuth does.

This package also has support for Authorization Code grant. It also supports PKCE by default with no additional configuration needed.

To install this, we need to run the following code in our React Native project directory, in the terminal:

```shell
yarn add react-native-app-auth
```

This will add the library.

### Setting up react native app auth for iOS

To set up the auth for an iOS app, we need to take the following steps. For all the options, check out the [package docs](https://github.com/FormidableLabs/react-native-app-auth#setup). Here, only necessary steps will be outlined.

First, we need to install cacao pod by running the command shown below:

```shell
cd ios ; pod install
```

Then, we need to open the React Native project with Xcode. Open the `info.plist` file and register the redirect URL scheme as shown in the code snippet below:

```xml
<key>CFBundleURLTypes</key>
 <array>
   <dict>
     <key>CFBundleURLName</key>
     <string>com.your.app.identifier</string>
     <key>CFBundleURLSchemes</key>
     <array>
       <string>fusionauth.demo</string>
     </array>
   </dict>
 </array>
```

Here, the URL, `fusionauth.demo`, is the same as the prefix for the OAuth redirect we configured in the FusionAuth dashboard before.

The last step is to change the `AppDelegate.h` file to include the needed imports and properties:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/appdelegate-change.png" alt="Modifying the appdelegate class." class="img-fluid" figure=false %}

### Setting up react native app auth for Android

For Android, we need additional configuration to capture the [authorization redirect](https://github.com/openid/AppAuth-android#capturing-the-authorization-redirect). Add the following property to the `defaultConfig` in `android/app/build.gradle`:

```android
android {
 defaultConfig {
   manifestPlaceholders = [
     appAuthRedirectScheme: 'fusionauth.demo'
   ]
 }
}
```

However, a new issue pops up when we start working on Android. Developing and debugging an Android app on a Mac is difficult as the emulator is not fully supported. The emulator runs pretty slow compared to the iOS emulator. 

A better solution is to use an actual Android mobile device. When you are doing so, how can you connect the FusionAuth server, running on localhost, to the device, which is on a wifi or cell network? The solution is to use a local tunnel service. There are several out there; we'll use ngrok.

#### Start using HTTPS on Local 

We have a local tunnel service like ngrok that enables us to connect localhost to internet connectivity. 

In order to configure and set up ngrok, we need to follow the following instructions:

First, unzip to install and install it.

Then connect your account. Running the following command will add our auth token to the default `ngrok.yml` configuration file. This will grant us access to more features and longer session times. 

Running tunnels will be listed on the [status page](https://dashboard.ngrok.com/status/tunnels) of the dashboard.

```shell
./ngrok authtoken Your key
```

Launch ngrok. For full details, go through [the documentation](https://ngrok.com/docs). We can use it for our purposes by running it from the command line. For the help message:

```shell
./ngrok help
```

In order to start an HTTP tunnel forwarding to `localhost` and port `9011`, where FusionAuth is listening, we need to run the following command:

```shell
./ngrok http 9011
```

We get random address which forwards to our FusionAuth instance. It'll be something like `https://ce2f267ff5a5.ngrok.io`. We can reference this value from our Android device and any traffic sent will be forwarded to FusionAuth. We will also use this for our iOS devices for consistency.

Now, we can move to the coding.

## The implementation

If you want to skip ahead, just grab the code from the [GitHub repository](https://github.com/fusionauth/fusionauth-example-react-native).

First, we need to go to the `App.js` file of our project. Add necessary imports as shown in the code snippet below:

```javascript
//...
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';
//...
```

Then, we need to create a `configs` object as shown in the code snippet below:

```javascript
//...
const configs = {
  fusionauth: {
    issuer: 'https://ce25267ff5a5.ngrok.io', // or whatever your ngrok address is
    clientId: '253eb7aa-687a-4bf3-b12b-26baa40eecbf',
    redirectUrl: 'fusionauth.demo:/oauthredirect',
    additionalParameters: {},
    scopes: ['offline_access'],
  }
}
//...
```

Here's more about the properties of the `fusionauth` object in the `configs` object:

* `issuer` is the URL for the FusionAuth server.
* `clientId` is the ID that we grabbed from the FusionAuth dashboard.
* `redirectURL` is the URL that we set up before, with a callback path defined by the react native app auth library.

We also add any additional parameters we need to pass (none, in this case), as well as scopes to request. In this case, we're requesting `offline_access` as that will return a `refresh_token`, which can be used to request additional access tokens.

Next, create a default auth state in order to handle the response from server, as shown in the code snippet below:

```javascript
//...
const defaultAuthState = {
  hasLoggedInOnce: false,
  provider: '',
  accessToken: '',
  accessTokenExpirationDate: '',
  refreshToken: ''
};

const [authState, setAuthState] = useState(defaultAuthState);
//...
```

Now, we are ready to configure authorization.

## Configuring Authorization

We need to create a function to perform authorization. The main authorization function requires the `configs` object that we previously created. The implementation of the function is below:

```javascript
const handleAuthorize = useCallback(
  async provider => {
    try {
      const newAuthState = await authorize(configs.fusionauth);

      setAuthState({
        hasLoggedInOnce: true,
        ...newAuthState
      });
    } catch (error) {
      Alert.alert('Failed to log in', error.message);
    }
  },
  [authState]
);
```

## Building the user interface

Next, we need to create a user interface for all the components. We'll create a simple UI to display the access token and other server response data. The access token is what FusionAuth provides once a user has signed in. The code for UI implementation looks like this:

```react
//...
return (
  <View style={styles.container}>
    <Image
      source={require('./fusionauth.png')}
    />
    {authState.accessToken ? (
      <View style={styles.userInfo}>
        <View>
          <Text style={styles.userInfoText}>
            accessToken
          </Text>
          <Text style={styles.userInfoText}>
            {authState.accessToken}
          </Text>
          <Text style={styles.userInfoText}>
            accessTokenExpirationDate
          </Text>
          <Text style={styles.userInfoText}>
            {authState.accessTokenExpirationDate}
          </Text>
        </View>
      </View>
    ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleAuthorize()}
        >
          <Text style={styles.buttonText}>
            Login with FusionAuth</Text>
          </TouchableOpacity>
      )}
  </View>
);
```

We'll show one of two states, depending on if we have an `accessToken`. We can run the app in the simulator:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rmrqXT30X38" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>


## Securely storing the token

Once the user has successfully authenticated, we will have a JWT and possibly a refresh token that should be stored securely. Storing sensitive data like an access token in `Asyncstorage` is bad practice. We can use another third-party package to easily access the iOS Keychain and Android secure storage. 

There are many packages that help us interact with keychain and secure shared preferences.

The Formidable team, the creators of the `react-native-app-auth` package we are using, recommend [`react-native-keychain`](https://github.com/oblador/react-native-keychain). We install it by running the following command:

```shell
yarn add react-native-keychain
```

We need to store the access token after authentication success. We can do so by using this code:

```javascript
//...
try {
  const newAuthState = await authorize(configs.fusionauth);
  console.log(newAuthState)
  setAuthState({
    hasLoggedInOnce: true,
    ...newAuthState
  });
  await Keychain.setGenericPassword('accessToken', newAuthState.accessToken);
} catch (error) {
  Alert.alert('Failed to log in', error.message);
}
//...
```

Also, we must create a function to check for credentials before returning the key. If it's not there, we'll return an error:

```javascript
//...
const getAccesstoken = async () => {
  try {
    // Retrieve the credentials
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password
    } else {
      console.log('No credentials stored');
    }
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
  }
}
//...
```

## Retrieving more information about the authenticated user

Since we have the access token, and have stored it securely, the last thing we need to do is to use the token to get user data from FusionAuth.

Create a new function named `getUser`. In it, we'll construct the URL and retrieve the access token, then we'll make a call to the standard `/oauth2/userinfo` endpoint. The code stores the response data as shown in the code snippet below:

```javascript
//...
const getUser = async () => {
  try {
    const access_token = await getAccesstoken();
    if (access_token !== null) {
      fetch(configs.fusionauth.issuer+"/oauth2/userinfo", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          setuserinfo(json);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  } catch (e) {
    console.log(e);
  }
};
//...
```

Next, we need to update the user interface code to display the data:

```react
//...
return (
  <View style={styles.container}>
    <Image
      source={require('./fusionauth.png')}
    />
    {authState.accessToken ? (
      <TouchableOpacity
        style={styles.button}
        onPress={() => getUser()}
      >
        <Text style={styles.buttonText}>Get User</Text>
      </TouchableOpacity>
    ) : (<TouchableOpacity
      style={styles.button}
      onPress={() => handleAuthorize()}
    >
      <Text style={styles.buttonText}>Login with FusionAuth</Text>
    </TouchableOpacity>)}
    {userinfo ? (
      <View style={styles.userInfo}>
        <View>
          <Text style={styles.userInfoText}>
            Username:{userinfo.given_name}
          </Text>
          <Text style={styles.userInfoText}></Text>
          <Text style={styles.userInfoText}>Email:{userinfo.email}</Text>
          <Text style={styles.userInfoText}></Text>

        </View>
      </View>
    ) : (
        <View></View>
    )}
  </View>
);
```

We're checking if we have `userinfo` is defined. If so, we'll display the user's given name and email address, pulled from FusionAuth.

Here's a video showing the resulting interaction:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/M1GQiLn6ZEA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

There you have it. You have successfully configured FusionAuth with a React Native project. We have used FusionAuth to authenticate a user and displayed information from that user in the project.

## Conclusion

This tutorial has been a rollercoaster of information about web and mobile authentication flow. We were able to perform authorization and get user data from the auth server by implementing the native app workflow. 

As a reminder, the [code for this React Native project](https://github.com/fusionauth/fusionauth-example-react-native) is available on Github.

I hope you enjoyed this tutorial. See you next time!

