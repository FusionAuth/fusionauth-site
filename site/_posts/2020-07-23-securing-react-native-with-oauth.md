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

In this tutorial, we are going to set up a React Native application to work with OAuth. We'll set up FusionAuth for authorization purposes, but the React Native code should work with any OAuth compliant server. 

<!--more-->

We start by setting up the FusionAuth app. Then we'll set up a React Native project. We'll then perform an Authorization Code grant from within the React Native app. Finally, we'll request information from an OIDC endpoint to display user data in the application.

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

This is the architecture we used when [securing a React application with OAuuth](/blog/2020/03/10/securely-implement-oauth-in-react). However with a mobile device, things change a bit. A corresponding scenario might be something like this:

```
The mobile device -> The server -> The OAuth server
```

However, this can be simplified. The server can be removed and the mobile device can handle the callbacks directly from the OAuth server. We'll use the Authorization Code grant with the PKCE extension. 

Here's a suggested [flow from RFC 8252](https://tools.ietf.org/html/rfc8252#page-5):

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/oauth-authorization-code-flow.png" alt="The authorization code flow for native applications." class="img-fluid" figure=false %}

In this tutorial, we are going to implement this to enable a mobile application to interact with an OAuth server. First, let's configure that server and set up our coding environment.

## Setting up FusionAuth as your auth provider

In order to set up FusionAuth, follow the [5-minute setup](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) guide. It is very simple and quick. By default, the OAuth server will run on `http://localhost:9011`.

### The application

In this step, we are going to configure a FusionAuth application. An application is anything a user might log in to. To do so, we need to go to FusionAuth console and navigate to *Applications*. There, we need to create a new application.

Once you've done that, navigate to the *OAuth* tab and add in a redirect URI of `fusionauth-demo:/oauthredirect`. We'll use this redirect URL in our React Native application later. 

Also, note the value of "Client Id"; we'll need that later too. Click *Save*. When properly configured, the application details screen should look like this:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard.png" alt="Configuring the FusionAuth application." class="img-fluid" figure=false %}

Make sure to register your user to the new application. If you want, you can add more users; register them as well.

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/fusionauth-dashboard-register-user.png" alt="Registering your user to the React Native FusionAuth application." class="img-fluid" figure=false %}

Now, we move on to the React Native project.

## Setting up the React Native development environment

Since we are going to use the React Native command line interface tool (CLI) for development, we must have the React Native development environment installed. For installation instructions, please follow [the official documentation](https://reactnative.dev/docs/environment-setup).

We also need to install development environments for iOS, Android, or both. We are going to use [brew](https://brew.sh/) to install additional packages. Make sure that brew is already installed, or install the packages in a different way. 

### iOS environment

Install needed a needed iOS dependency using this command:

```shell
brew install watchman
```

We need to install the Xcode CLI tools, which are not normally present. To do so, open Xcode and navigate to "Preferences" and then "Locations". Then pick the Xcode version for command-line tools as shown in the screenshot below:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/activate-xcode.png" alt="Activating Xcode." class="img-fluid" figure=false %}

The setup for iOS is now complete. 

### Android environment

For Android, JDK 8 is required. Using other versions may result in errors. We can download this JDK from the Oracle website or using brew as shown in the snippet below:

```shell
brew cask install adoptopenjdk/openjdk/adoptopenjdk8
```

Next, we need to download and install the [Android studio](https://developer.android.com/studio/install).

Then, we need to configure the `ANDROID_HOME` environment variable in our system path.  We can add the following lines to our `$HOME/.bash_profile` or `$HOME/.bashrc`. If you are using zsh then the files are `~/.zprofile` or `~/.zshrc`.

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Now our setup for the Android platform is complete.

## React native project setup

We are now going to create a new React Native project. First, create a new project in our desired directory by running the following command in the terminal:

```shell
react-native init RNfusionauth
```

Open the project folder in your text editor, as we'll be making additional changes to these files.

### Installing `react-native-app-auth` to communicate with the OAuth 2.0 and OpenId Connect server

A key dependency of our application is the [`react-native-app-auth`](https://github.com/FormidableLabs/react-native-app-auth) package. This sets up a bridge between the [AppAuth-iOS](https://github.com/openid/AppAuth-iOS) and [AppAuth-Android](https://github.com/openid/AppAuth-Android) SDKs for communicating with [OAuth 2.0](https://tools.ietf.org/html/rfc6749) and [OpenID Connect](http://openid.net/specs/openid-connect-core-1_0.html) providers.

This library should support any server that implements the [OAuth2 spec](https://tools.ietf.org/html/rfc6749#section-2.2). FusionAuth does, so we should be good.

This package also has support for the Authorization Code grant. It enables PKCE by default. This is important because a mobile device is not a ["confidential client"](https://tools.ietf.org/html/rfc6749#section-2.1) and we want to make sure any malicious actors can't intercept our authorization code.

To install `react-native-app-auth`, run the following in our React Native project directory:

```shell
yarn add react-native-app-auth
```

Using this library will help us out immensely. It takes care of most of the steps specified by RFC 8252; we just have to make sure to kick off the process (step 1) and then receive and store the access token (step 6). As a reminder, here's the diagram:

{% include _image.liquid src="/assets/img/blogs/react-native-oauth/oauth-authorization-code-flow.png" alt="The authorization code flow for native applications." class="img-fluid" figure=false %}

### Setting up iOS auth 

To set up the auth for an iOS app, take the following steps. If you want to learn more about other options, check out the [package docs](https://github.com/FormidableLabs/react-native-app-auth#setup). Here, only the necessary steps will be covered.

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

Here, the URL, `fusionauth.demo`, is the same as the prefix for the OAuth redirect we configured in the FusionAuth administrative user interface above. 

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

However, a new issue pops up when we start working on the Android version. Developing and debugging an Android app on a Mac is difficult as the emulator is not fully supported. Among other issues, the emulator is slow compared to the iOS emulator. 

A better solution is to use an actual Android mobile device. When you are doing so, how can you connect the FusionAuth server, running on localhost, to the device, which is on a wifi or cell network? The solution is to use a local tunnel service. There are several out there; we'll use ngrok.

#### Setting up ngrok

A local tunnel service like ngrok enables us to proxy between localhost and internet connections. In order to configure ngrok, follow these instructions:

First, unzip and install it. Then connect your account. Running the following command will add our auth token to the default `ngrok.yml` file. This will grant us access to more features and longer session times. 

Running tunnels will be listed on the [status page](https://dashboard.ngrok.com/status/tunnels) of the dashboard.

```shell
./ngrok authtoken Your key
```

We want to start HTTP tunnel forwarding to `localhost` and port `9011`, where FusionAuth is listening. For more options and details, consult [the documentation](https://ngrok.com/docs). Run the following command to launch the ngrok proxy:

```shell
./ngrok http 9011
```

We'll get a random URL which forwards traffic to our FusionAuth instance. It'll be something like `https://ce2f267ff5a5.ngrok.io`. We can reference this value from our Android device and traffic will be forwarded. We will also use this for our iOS app for consistency, even though the iOS emulator can connect to localhost.

Now, we can move on to coding.

## Coding a React Native application to use OAuth and FusionAuth

Finally, the code! As always, if you want to skip ahead, grab the code from the [GitHub repository](https://github.com/fusionauth/fusionauth-example-react-native).

Big picture, we're going to be building out our logic and views in the `App.js` file. For a bigger project, you'd split this code up into components. We'll use libraries to manage authorization and secure storage of our data, however.

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

First, we need to add necessary imports as shown in the code snippet below:

```javascript
//...
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';
//...
```

Next, we need to create a `configs` object. This will contain details such as your application's client id:

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

The `issuer` is the URL for the FusionAuth server. The `clientId` is the ID that we grabbed from the FusionAuth administrative user interface. The `redirectUrl` is the URL that we set up on the application. The value `oauthredirect` is a callback path defined by the react native app auth library. Make sure you update the `issuer` and `clientId` keys in this object with your configuration values.

We can also add any additional parameters we need to pass (none, in this case). If you need custom scopes, you can add them too. We're requesting the `offline_access` scope so that the OAuth server will return a `refresh_token`. Such a token can be used to request additional access tokens should our current one expire.

Then, create a default auth state object. This will be used and updated as our user first views the app, then authenticates. This object will be mutated based on the response from the server.

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

Now, we are ready to configure the code which will actually receive the token. 

## Configuring React Native OAuth authorization

Now we need to create the callback function mentioned in the project setup section. We'll use the the `configs` object. It will also use the `authorize` method from the `react-native-app-auth`. That method will do all the heavy lifting and actually connect with the OAuth server. The implementation of the function is below:

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

Now we have the code to interface with FusionAuth. We want to give the user some way to invoke the code.

## Building the user interface

Next, we need to create a user interface (UI). We'll create a simple UI to begin authentication. After the user has logged in, we'll display the access token. The access token is what FusionAuth provides once a user has successfully signed in. 

Of course, you typically don't want to simply display or store the access token. You want it because it allows your application to make other API calls, often to gather more information to display to the user. Later in this tutorial we'll use an access token to retrieve user information from a standard OpenID Connect endpoint, and display that in our application.

You can also provide the token to APIs that let you take actions, like recording a todo or placing an order. We won't build those integrations today.

Add the initial code for the UI to `App.js`:

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

We'll show one of two states, depending on whether we have an `accessToken`. At this point, we can run the app in the simulator:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rmrqXT30X38" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

You can further style the application by modifying the `styles` object, but we'll leave that as an exercise for the reader. 

Following best practices, the mobile application opens up a system browser for user authentication, rather than a webview or embedded user-agent.

## Securely storing the JWT access token

Once the user has successfully authenticated, we will have an access token, and possibly a refresh token, which should be stored securely. The access token is a JSON Web Token, also known as a JWT. Storing sensitive data like an access token in `Asyncstorage` is bad practice. We can use another third-party package to access the iOS Keychain and Android secure storage, which are better choices.

There are many options, but the Formidable team, the creators of the `react-native-app-auth` package we are using, recommend [`react-native-keychain`](https://github.com/oblador/react-native-keychain). Install it by running the following command:

```shell
yarn add react-native-keychain
```

We need to store the access token after successful authentication. We can do so by using this code, again, adding it to the `App.js` file:

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

Before, we were setting the `authState` in memory, but now we're storing it in secure storage. This is the line we added:

```javascript
//...
await Keychain.setGenericPassword('accessToken', newAuthState.accessToken);
//...
```

Also, we must create a function to check for credentials before returning the key. If it's not there, we'll return `null`:

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

Since we have the access token, and have stored it securely, we can now get user data from FusionAuth. Of course, you could also use the access token to call other services or APIs.

To retrieve user information, create a new function called `getUser` in the `App.js` file. In it, we'll construct a URL and retrieve the access token from our storage, then we'll make a call to a standard endpoint to get user information. The code then stores the response data. 

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

Next, we need to update the user interface to display the user data:

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

In this UI, we're checking if we have `userinfo`. If so, we'll display the user's given name and email address; this is the data retrieved from FusionAuth. 

Here's a video showing the emulators executing the code after these changes:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/M1GQiLn6ZEA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

There you have it. You have successfully configured a React Native application to interact with FusionAuth. We have authenticated a user, stored their access token securely, and displayed information from that user.

## Conclusion

This tutorial has been a rollercoaster of information about web and mobile authentication flows. We were able to perform authorization and get user data from an OAuth server. As a reminder, the [code for this React Native project](https://github.com/fusionauth/fusionauth-example-react-native) is available on Github.

I hope you enjoyed this tutorial. Do you have any comments or questions?

Please post them below.

Happy coding!

