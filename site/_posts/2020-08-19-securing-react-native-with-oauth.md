---
layout: blog-post
title: Securing React Native with OAuth
description: React Native lets you build mobile applications for iOS and Android using JavaScript. This tutorial will show you how to use OAuth to authenticate users in a React Native application.
author: Krissanawat Kaewsanmuang
image: blogs/bottleneck-pattern/the-auth-bottleneck-pattern.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

In this tutorial, we will set up a React Native application to work with OAuth. We'll use FusionAuth for auth, but the React Native code should work with any OAuth compliant server. 

<!--more-->

First, we'll be installing and configuring FusionAuth. Then we'll set up a React Native project. We'll then perform an Authorization Code grant from within the React Native app. Finally, we'll request information from an OIDC endpoint. With that data, we'll display the user's email in the React Native application. 

This is a lot, but the ride will be fun. Ready to get going?

## Requirements

Here's what you need to get started:

* NodeJS version >= 8.0
* VScode or any other text editor
* `git`
* `npx` 
* Xcode, if building for iOS
* Homebrew (optional)

## What you need to know about OAuth

If you are a web developer, you may be familiar with OAuth. With web development, we have three players:

```
The browser -> The server -> The OAuth server
```

The browser talks to the server, which talks to the OAuth server. The OAuth server generates access tokens which are given to the server. The server stores them securely in the session, and when needed, passes them to other APIs for authorization. This is the architecture we used when [securing a React application with OAuuth](/blog/2020/03/10/securely-implement-oauth-in-react). 

However with a mobile device, things change a bit. A corresponding scenario might be like this:

```
The mobile device -> The server -> The OAuth server
```

However, this architecture can be simplified. The server can be removed; the mobile device can handle the callbacks directly from the OAuth server. In this tutorial, we'll use the Authorization Code grant with the PKCE extension. Below is a suggested [flow from RFC 8252](https://tools.ietf.org/html/rfc8252#page-5), and this is what we'll be implementing.

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/oauth-authorization-code-flow.png" alt="The authorization code flow for native applications." class="img-fluid" figure=false %}

Next up, let's configure the OAuth server and set up our coding environment.

## Setting up FusionAuth as your auth provider

In order to set up FusionAuth, follow the [5-minute setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). It is simple and quick. By default, the OAuth server will run at the address `http://localhost:9011`.

### Configure the FusionAuth application

In this step, we are going to configure a FusionAuth application. This is different from the FusionAuth server instance or the React Native application. In FusionAuth, an application is anything a user might log in to. To configure this, sign into the FusionAuth administrative interface and navigate to "Applications". From there, create a new application.

Once you've done that, navigate to the "OAuth" tab and add in a redirect URI of `fusionauth-demo:/oauthredirect`. We'll use this redirect URL in our React Native application later. 

Also, note the value of "Client Id"; we'll need that later too. Click *Save*. When properly configured, the application details screen should look like this:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard.png" alt="Configuring the FusionAuth application." class="img-fluid" figure=false %}

Make sure to register your user to the new application. Doing so creates a relationship between a user and the newly created application. 

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard-register-user.png" alt="Registering your user to the React Native FusionAuth application." class="img-fluid" figure=false %}

If you want, you can add more users in the "Users" tab, but make sure to register them with your new application. Now, we move on to setting up the React Native project.

## Setting up the React Native development environment

Since we are going to use the React Native command line interface (CLI) for development, we must have the React Native development environment installed. For installation instructions, please follow [the official documentation](https://reactnative.dev/docs/environment-setup). You'll also want to make sure you select `react-native-cli` rather than `expo`. These instructions also walk you through starting your application, so if you are new to React Native, make sure you give them a read.

We also need to install development environments for iOS, Android, or both. We are going to use [brew](https://brew.sh/) to install needed packages as well. If you are following along, make sure that `brew` is installed, or install the packages in a different way. 

### iOS environment

First, we'll install watchman, which is used to automatically rebuild files when they change:

```shell
brew install watchman
```

Then we need to install the Xcode CLI tools, which are not normally present and can't be done with `brew`. To install, open Xcode and navigate to "Preferences" and then "Locations". Pick the Xcode version for command-line tools as shown in the screenshot below:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/activate-xcode.png" alt="Activating Xcode." class="img-fluid" figure=false %}

iOS is ready to go.

### Android environment

For Android, JDK 8 is required, as other versions may result in errors. We can download this version from the Oracle website or using `brew` as shown in the snippet below:

```shell
brew cask install adoptopenjdk/openjdk/adoptopenjdk8
```

Next, we need to download and install the [Android studio](https://developer.android.com/studio/install).

Then, we need to configure the `ANDROID_HOME` environment variable in our system path.  We can add the following lines to our `$HOME/.bash_profile` or `$HOME/.bashrc`. If you are using zsh, the files are `~/.zprofile` or `~/.zshrc`.

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Now the setup for the Android platform is done.

## React native project setup

We are now going to create a new React Native project. First, create a directory to contain all of our code, then `cd` to that directory. Pick an application name; we chose `RNfusionauth` and will use that name throughout the tutorial.

Run this command to create the basic project files and configuration:

```shell
react-native init RNfusionauth
```

We'll be making additional changes to these files as we build out the application.

### Installing `react-native-app-auth` to communicate with the OAuth 2.0 and OpenId Connect server

A key dependency of our application is the [`react-native-app-auth`](https://github.com/FormidableLabs/react-native-app-auth) package. This sets up a bridge between the [AppAuth-iOS](https://github.com/openid/AppAuth-iOS) and [AppAuth-Android](https://github.com/openid/AppAuth-Android) SDKs for communicating with [OAuth 2.0](https://tools.ietf.org/html/rfc6749) and [OpenID Connect](http://openid.net/specs/openid-connect-core-1_0.html) providers.

This library should support any server that implements the [OAuth2 spec](https://tools.ietf.org/html/rfc6749#section-2.2), as FusionAuth does.

This package supports the Authorization Code grant and enables the PKCE extension by default. This is important because a mobile device is not a ["confidential client"](https://tools.ietf.org/html/rfc6749#section-2.1) and we want to ensure malicious actors can't intercept our authorization code.

To install `react-native-app-auth`, run the following in the project directory:

```shell
yarn add react-native-app-auth
```

Using this library will help us build the OAuth integration quickly and securely. It takes care of many of the steps specified by RFC 8252; we just have to make sure to kick off the process (step 1) and receive and store the access token (step 6). As a reminder, here's the diagram from the RFC:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/oauth-authorization-code-flow.png" alt="The authorization code flow for native applications." class="img-fluid" figure=false %}

### Setting up iOS auth 

Now, we'll configure auth for an iOS build of the React Native app. The basics will be covered below, but if you want to learn more about other options, check out the [docs](https://github.com/FormidableLabs/react-native-app-auth#setup). 

First, we need to install the cacao pod by running the command shown below:

```shell
cd ios ; pod install
```

Then, we need to open the React Native project with Xcode. Edit the `info.plist` file and register the redirect URL scheme as shown in the code snippet below:

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

Here, the `CFBundleURLSchemes` defines the URL schemes handled by this application. The scheme we are registering, `fusionauth.demo`, should look familiar, as we configured FusionAuth to redirect to a URL with that scheme in it. If you modify it here, you should modify it there as well.

The last step is to change the `AppDelegate.h` file to include needed imports and properties:

```objective_c
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import "RNAppAuthAuthorizationFlowManager.h"
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, RNAppAuthAuthorizationFlowManager>

@property (nonatomic, strong) UIWindow *window;
@property(nonatomic, weak)id<RNAppAuthAuthorizationFlowManagerDelegate>authorizationFlowManagerDelegate;
@end
```

### Setting up auth for Android

For Android, we need additional configuration to capture the [authorization redirect](https://github.com/openid/AppAuth-android#capturing-the-authorization-redirect). Add the following property to the `defaultConfig` object in the `android/app/build.gradle` file:

```gradle
android {
 defaultConfig {
   manifestPlaceholders = [
     appAuthRedirectScheme: 'fusionauth.demo'
   ]
 }
}
```

Here, the `appAuthRedirectScheme`, `fusionauth.demo`, is another scheme definition, the same as with iOS. If you modify it here, you should modify it in the FusionAuth administrative interface and in the iOS configuration as well.

However, a new issue pops up when we start working on the Android application. Developing and debugging an Android app on a Mac is difficult as the emulator is not fully supported. Among other issues, the emulator is slow when compared to the iOS emulator. 

A better solution is to use an actual Android mobile device. When you are doing so, how can you connect the FusionAuth server, running on localhost, to the device, which is on a wifi or cell network? The solution is to use a local tunnel service such as ngrok.

#### Setting up ngrok

ngrok enables us to proxy between local services and the internet. You'll want to [download](https://ngrok.com/download) it, then install it.  Connect your account, by running the following command. It will add our auth token to the default `ngrok.yml` file, which will grant us access to more features and longer session times. 


```shell
./ngrok authtoken Your key
```

Running tunnels will be listed on the [status page](https://dashboard.ngrok.com/status/tunnels) of the ngrok dashboard. 

Now we want to start HTTP tunnel forwarding to `localhost` and port `9011`, where FusionAuth is listening. Run the following command to launch the ngrok proxy:

```shell
./ngrok http 9011
```

We'll get a random URL which forwards traffic to our FusionAuth instance. It'll be something like `https://ce2f267ff5a5.ngrok.io`. Using this, we can configure our Android device to communicate with the local instance of FusionAuth. We will also use this URL for our iOS app for consistency's sake, even though the iOS emulator can connect to localhost without a tunnel.

Now, we can move on to coding.

## Coding a React Native application to use OAuth and FusionAuth

Finally, the code! If you want to skip ahead, grab the Apache2 licensed code from the [GitHub repository](https://github.com/fusionauth/fusionauth-example-react-native).

Big picture, we're going to be building out our logic and views in the `App.js` file. For a bigger project, you'd split this code up into components, but for our tutorial having one file will make things easier. We'll use libraries to manage authorization and secure storage of our data, however. 

Here's what `App.js` will look like when we are done (don't worry, it looks like a lot, but we'll explain most of it):

```react
import React, { useState, useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { authorize, prefetchConfiguration } from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
const defaultAuthState = {
  hasLoggedInOnce: false,
  provider: '',
  accessToken: '',
  accessTokenExpirationDate: '',
  refreshToken: ''
};
export default () => {
  const [authState, setAuthState] = useState(defaultAuthState);
  const [userinfo, setuserinfo] = useState(null)
  React.useEffect(() => {
    prefetchConfiguration({
      warmAndPrefetchChrome: true,
      ...configs.fusionauth
    });
  }, []);
  const configs = {
    fusionauth: {
      issuer: 'https://ce25267ff5a5.ngrok.io',
      clientId: '253eb7aa-687a-4bf3-b12b-26baa40eecbf',
      redirectUrl: 'fusionauth.demo:/oauthredirect',
      additionalParameters: {},
      scopes: ['offline_access'],
    }
  }

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
  const getUser = async () => {
    try {
      const access_token = await getAccesstoken();
      if (access_token !== null) {
        fetch(configs.fusionauth.issuer + "/oauth2/userinfo", {
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
  const handleAuthorize = useCallback(
    async () => {
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
    },
    [authState]
  );


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

}


const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "grey",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  button: {
    backgroundColor: "#f58321",
    padding: 20
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
  },
  userInfo: {
    height: 300,
    width: 300,
    alignItems: "center",
  },
  userInfoText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
  },
  profileImage: {
    height: 64,
    width: 64,
    marginBottom: 32,
  },
});

```

First, we need to add necessary imports to `App.js`:

```javascript
//...
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';
//...
```

Next, we need to create a `configs` object. This will contain details such as the application's client id:

```javascript
//...
const configs = {
  fusionauth: {
    issuer: 'https://ce25267ff5a5.ngrok.io', 
    clientId: '253eb7aa-687a-4bf3-b12b-26baa40eecbf',
    redirectUrl: 'fusionauth.demo:/oauthredirect',
    additionalParameters: {},
    scopes: ['offline_access'],
  }
}
//...
```

More on the configuration parameters, as this is something you'll need to change in your code. The `issuer` is the URL for the FusionAuth server; you can see that we've set it to our ngrok URL. The `clientId` is the ID that we grabbed from the FusionAuth administrative user interface. 

The `redirectUrl` is the URL that we set up in the FusionAuth application, with the scheme we used in configuring iOS and Android. The value `oauthredirect` is a callback path defined by the react native app auth library. Make sure you update the `issuer` and `clientId` keys in this object with your configuration values.

We can also add any additional parameters (none, in this case). If you need custom scopes, this is the place to add them as well. We're requesting the `offline_access` scope so that the OAuth server will return a `refresh_token`. Such a token can be used to request additional access tokens should our current one expire.

Next, create a default auth state object in the file. This will be modified as our user first views the React Native app, then authenticates. This contains information like the token values and expiration dates.

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

Now, we are ready to configure the code which receives the token. 

## Configuring React Native OAuth authorization

Let's create the function to get the token; this will use the previously created `configs` object. It will also use the `authorize` function from the `react-native-app-auth` package. It will do all the heavy lifting and connect with the OAuth server. The implementation of the function is below:

```javascript
//...
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
//...
```

`newAuthState` is returned from the `authorize` function, as we can set our auth state to that returned value. Now we have the code to interface with FusionAuth, so we'll want to give the user a way to invoke the code.

## Building the user interface

So, we need to create a user interface (UI). We'll create a simple UI to begin authentication. After the user has logged in, we'll display the access token. The access token is what FusionAuth provides once a user has successfully signed in. 

Of course, you typically don't want to simply display or store the access token. You want it because it allows your application to make other API calls, often to gather more information to display to the user. Later in this tutorial we'll use an access token to retrieve user information from an OpenID Connect endpoint, and display that in our application.

You can also provide the token to APIs that let the application send an email, record a todo or place an order. We won't build those integrations today, however.

To set up the UI, add this to `App.js`:

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

The app will display one of two states, depending on whether we have an `accessToken`. Now, you we can run the app in the iOS simulator by typing `npx react-native run-ios` in your terminal:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rmrqXT30X38" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

You can improve the look and feel of the application modifying the `styles` object and adding more CSS, but we'll leave that as an exercise for the reader. Following best practices, notice that the mobile application opens up a system browser for user authentication, rather than a webview or embedded user-agent.

## Securely storing the JWT 

Once the user has successfully authenticated, we will have an access token, and possibly a refresh token, which should be stored securely. The access token is a JSON Web Token, also known as a JWT. Storing sensitive data like this JWT in `Asyncstorage`, the typical React Native client storage option, is bad practice. We can use a third-party package to access the iOS Keychain and Android secure storage, a better choice.

There are many options, but the Formidable team, the creators of the `react-native-app-auth` package we are using, recommend [`react-native-keychain`](https://github.com/oblador/react-native-keychain). Install it by running the following command:

```shell
yarn add react-native-keychain
```

To store the access token after successful authentication, add this to the `App.js` file:

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

Before, we were calling `setAuthState` to store the JWT in memory, but now we're storing it securely for future invocations. This is the line we added to do so:

```javascript
//...
await Keychain.setGenericPassword('accessToken', newAuthState.accessToken);
//...
```

The flip side of storing the token in this manner is that we must create a function to check for credentials before returning the key. If it's not there, we'll return `null`:

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

Now we can, when handed an access token, securely store and retrieve the JWT. Next, let's look at what we can do with the token.

## Retrieving more information about the authenticated user

Since we have the access token, we can now retrieve user data from FusionAuth. Of course, you could also use the access token to call other services or APIs, but that's beyond the scope of this tutorial.

To retrieve user information, create a new function called `getUser` in the `App.js` file. In it, we'll construct a URL and retrieve the access token from storage, then we'll make a call to an endpoint for user information.

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

Of course, it's not much fun to get the data, without displaying it. Let's update the UI to show what we've learned about our user:

```react
//...
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
//...
```

In this UI snippet, we're checking if we have `userinfo`. If so, we'll display the user's given name and email address; this data is retrieved from FusionAuth. Here's a video showing the emulators executing the code after these changes:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/M1GQiLn6ZEA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

There you have it. You have successfully configured a React Native application to interact with FusionAuth. We have authenticated a user, stored their access token securely, and displayed information from that user.

## Conclusion

This tutorial has been a rollercoaster of information about mobile authentication. We were able to perform authorization and get user data from an OAuth server. As a reminder, the [code for the React Native project](https://github.com/fusionauth/fusionauth-example-react-native) is available on Github.

I hope you enjoyed this tutorial. Do you have any comments or questions? Please post them below.

Happy coding!
