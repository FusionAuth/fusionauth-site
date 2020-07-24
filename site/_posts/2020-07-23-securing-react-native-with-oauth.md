---
layout: blog-post
title: Securing React Native with OAuth
description: How and why to use a centralized user management system rather than having individual applications use their own auth components.
author: Krissanawat Kaewsanmuang
image: blogs/bottleneck-pattern/the-auth-bottleneck-pattern.png
category: blog
excerpt_separator: "<!--more-->"
---

In this tutorial, we are going to set up FusionAuth in the React Native ecosystem. FusionAuth provides authentication, authorization, and user management for any app: deploy anywhere, integrate with anything, in minutes.

The idea is to set up a FusionAuth app for authorization purposes. We start with setting up of FusionAuth app to integrate it into the React Native project and finally perform authorization from the React Native app. 

<!--more-->

{% include _image.liquid src="/assets/img/blogs/bottleneck-pattern/bottleneck-diagram.png" alt="A common architectural pattern." class="img-fluid" figure=false %}

Let us begin!

## Requirements

Here's what you need to get started.
* NodeJS version >= 8.0
* VScode or other Editor
* GitSCM

## What you need to know

If you have a background of a web developer, you may be familiar with OAuth in Web development. In that case, we have three players:

The browser -> The Server -> The OAuth server

In the case of the mobile device ecosystem, the scenario will be something like this:
The mobile device -> The server -> The OAuth server

However, this scenario can be avoided. The server part can be stripped out and mobile devices cab be opted to handle the callbacks. You can check the following scenario for mobile development:

TBD pic of image of flow

credit : https://tools.ietf.org/html/rfc8252#page-5

In this tutorial, we are going to follow this flow of scenario for a mobile device to interact with the OAuth Server.

Now, it's time to deal with some server configurations and coding implementations.

## Setting up FusionAuth

In order to set up the FusionAuth, you can follow a [5-minute setup](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) guide on FusionAuth’s official documentation. It is very simple and quick.

By default, the OAuth server will run on `http://localhost:9011.

### Setting up the FusionAuth application

In this step, we are going to set up a FusionAuth application. One way to think about it is that an application is anything a user might log in to. For this, we need to go to FusionAuth console and navigate to the Applications menu option. In Applications console, we need to create a new app as shown in the screenshot below:

TBD pic

Next, we need to get the Client ID and also set redirect URI as highlighted in the screenshot below:

TBD pic

Lastly, we need to hit the save button and complete the FusionAuth App configuration.
Now, we move to the React Native project.

## Setting up the React Native project

Since we are going to use React Native CLI for development, we need to ensure that we have the React Native development environment installed. For details, we can follow [the official documentation](https://reactnative.dev/docs/environment-setup).

Here, we are going to use [brew](https://brew.sh/) to install the packages. So, the necessary steps to install the packages using brew will be shown in detail here. We need to make sure that the brew is already installed in our system.

### Setup for iOS

For iOS, we need to install dependencies using the commands given below: 

* `brew install node`
* `brew install watchman`

Lastly, we need to enable Xcode in CLI. For that, we need to open Xcode and navigate to Preference -> Location ->pick Xcode version for command-line tools as shown in the screenshot below:

TBD pic

The setup for iOS is now complete. 

### Setup for Android

For Android, JDK 8 is required and it is strictly suggested to use JDK 8. Using other versions may produce a lot of errors. We can download from Oracle site or using Brew as shown in the snippet below:

`brew cask install adoptopenjdk/openjdk/adoptopenjdk8`

Next, we need to download and install the [Android studio](https://developer.android.com/studio/install).

Then, we need to configure the `ANDROID_HOME` environment variable in our system path.  We can just add the following lines to our `$HOME/.bash_profile` or `$HOME/.bashrc` (if you are using zsh then `~/.zprofile` or `~/.zshrc`) config file:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Hence, our setup for the Android platform is complete as well.

Install react native as well.

For the next step, we are going to create a new React Native Project.

First, we need to create a new react-native project in our desired directory by running the following command in the terminal:

`react-native init RNfusionauth`

Next, we need to open the project folder via VSCode IDE.

## Installing React Native App Auth

One of the key element of the tutorial is the [`react-native-app-auth`](https://github.com/FormidableLabs/react-native-app-auth) package. This package sets up a bridge between [AppAuth-iOS](https://github.com/openid/AppAuth-iOS) and [AppAuth-Android](https://github.com/openid/AppAuth-Android) SDKs for communicating with [OAuth 2.0](https://tools.ietf.org/html/rfc6749) and [OpenID Connect](http://openid.net/specs/openid-connect-core-1_0.html) providers.

This library should support any OAuth provider that implements the [OAuth2 spec](https://tools.ietf.org/html/rfc6749#section-2.2). Hence, we can use it with FusionAuth.

And this package also has support for Authorization Code Flow, which is the recommended choice. It also supports PKCE by default with no additional configuration needed.

Now for installation, we need to run the following code in our React Native project terminal:

`yarn add react-native-app-auth`

### Setup on iOS

For full setup, we can refer to the [package docs](https://github.com/FormidableLabs/react-native-app-auth#setup). Every step is documented in the main repository of this package. Here, only the necessary steps will be provided.

First, we need to install cacao pod by running the command shown below:

* cd ios ; pod install
Then, we need to open the React Native project with Xcode. Then, open `info.plist` and register the redirect URL scheme as shown in the code snippet below:

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

Here, the URL is the same as that we used in the register configuration of the FusionAuth server before.

The last step is to make the following configuration to the AppDelegate.h file:

TBD pic

Now, we can move to the coding implementation.

## The Coding Implementation

First, we need to go to the App.js file of our project and make necessary imports as shown in the code snippet below:

```javascript
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';
```

Then, we need to create a configs object as shown in the code snippet below:

```javascript
const configs = {
 fusionauth: {
   issuer: 'http://localhost:9011/',
   clientId: '253eb7aa-687a-4bf3-b12b-26baa40eecbf',
   redirectUrl: 'fusionauth.demo:/oauthredirect',
   additionalParameters: {},
   scopes: ['offline_access'],
 }
}
```

The properties in the fusionauth object in the config object are explained below:

* The `issuer. is URL for the FusionAuth server.
* `clientId` is the ID that we grab from the FusionAuth server.
* `redirectURL` is the URL that we set up before and a callback path. XXX how do we secure this? pkce is the right thing, correct?
* And additional parameters and scopes that we want to access.

Next, we need to create a default auth state in order to handle the response from server as shown in the code snippet below:

```javascript
const defaultAuthState = {
 hasLoggedInOnce: false,
 provider: '',
 accessToken: '',
 accessTokenExpirationDate: '',
 refreshToken: ''
};

const [authState, setAuthState] = useState(defaultAuthState);
```

Now, we are ready to configure authorization.

## Configuring Authorization

Here, we need to create a function for performing authorization. In this process, the main function authorization requires configs object that we created before. The overall implementation of the function is provided in the code snippet below:

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

## UI part

Next, we need to create UI for all the components that we prepared before. Here, we need to create a simple UI in order to show access token and other response data from the server. The code for UI implementation is provided in the code snippet below:

```javascript
// ...
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

Since we have a UI, now we can try and run the app as shown in the simulation below:

https://youtu.be/AsYpA-Wn52Y 

## Store token

Once the user has successfully authenticated, we will have a JWT and possibly a refresh token that should be stored securely. Storing sensitive data like access token in Asyncstorage is a bad practice. But, we can use another third-party package that makes the access to iOS Keychain and Android secure more.secured. So, using the third-party package might be the best practice.
There are many packages that help us interact with keychain and secure shared preferences.
Formidable team, the creators of `react-native-app-auth` package recommend [`react-native-keychain`](https://github.com/oblador/react-native-keychain) package. Hence, we are going to use the package and install it as shown by running the following command:

`yarn add react-native-keychain`

Then, we need to store access token after authentication success as shown in the code snippet below:

```javascript
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
```

Also, we need to create a function that checks for credentials before returning the key else return an error or empty logs as shown in the code snippet below:

```javascript
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
```

## Getting Auth user

Since we can get the access token which grants authorization and store it in a secure place, the last thing we need to do is to use the token to get the user data from the auth server.
Here, we need to create a new function named `getUser` and construct URL and access token then store response data in the state as shown in the code snippet below:

```javascript
const getUser = async () => {
   try {
     const access_token = await getAccesstoken();
     if (access_token !== null) {
       fetch("http://localhost:9011/oauth2/userinfo", {
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
```

Next, we need to update the UI code in order to display the data as shown in the code snippet below:

```javascript
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

Hence, we will get the result as shown in the simulation below:
https://youtu.be/CyzycLTjXrU

Finally, we have successfully configured FusionAuth with the React Native project.

## Conclusion

This tutorial has been the rollercoaster of information about web and mobile authentication flow at the beginning. The brief information about the FusionAuth and it’s use cases has been a plus point. We were able to perform authorization and get user data from the auth server implementing the workflow from the diagram provided above in the tutorial. The stepwise implementation will definitely make it easier for you to configure FusionAuth and integrate it into other React Native projects. 

The entire code for this project is available on Github. 

I hope you enjoyed this tutorial. See you next time with more cool implementations.

