---
layout: blog-post
title: Securing React Native with OAuth
description: React Native lets you build mobile applications for iOS and Android using JavaScript. This tutorial will show you how to use OAuth to authenticate users in a React Native application.
author: Krissanawat Kaewsanmuang
image: blogs/react-native-oauth/securing-react-native-with-oauth.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

In this tutorial, we are going to learn how to secure a Golang program with OAuth by using FusionAuth as an auth provider. Authentication and authorization are essential for any application. 

<!--more-->


We will set up the FusionAuth server. The idea is to construct a URL in order to match with OAuth endpoint. Lastly, we will learn how to make use of access token in order to get user data using OIDC. 

To make the tutorial easy to understand and follow, it would be best to check out the GitHub repo with full coding implementation first.

Now, let’s get started!

## Requirements

The requirements to follow this tutorial are as follows:

* Go SDK
* VScode or any other text editor
* FusionAuth
* git version control
* npx package executer
* Xcode for iOS
* Homebrew (optional)

## Setting up FusionAuth as your auth provider

For an easy and short installation guide, [pick your installation method](/docs/v1/tech/installation-guide/). However, we can also perform some installation steps on macOS using Homebrew. The process is simple and only makes use of a terminal with few commands.

First, we are going to install the tap by running the following command in the terminal:

```shell
brew tap fusionauth/homebrew-fusionauth
```

Note that, this installation step only needs to be done once. Next, we need to install the FusionAuth main services by running the following command:

```shell
brew install fusionauth-app
```

Lastly, we need to start the FusionAuth service by running the following command in the project terminal:

```
brew services start fusionauth-app
```

Now, in order to get started, we need to open our browser and go to `http://localhost:9011`. Then, we need to complete the maintenance mode and the setup wizard.

### Setup FusionAuth with the Installation wizard

Now at `http://localhost:9011`, we will see the Maintenance Mode form that calls for a database credential and new super admin user credential as displayed in the screenshot below:

pic tbd?

We need to fill the setup form as directed above and click on the Submit button. This will cause FusionAuth to exit Maintenace Mode and start itself up. Now, we will see the interstitial page as shown in the screenshot below:

pic tbd?

### Create and configure a new Application

Initially, there will be only one application: FusionAuth. Hence, we need to create a new application by navigating to the "Applications" tab and clicking the green "+" sign. 

Then, we need to configure this application; add the authorized callback of `http://localhost:8080/callback`. Make sure that the Authorization Code checkbox is already checked and enabled.

After a successful setup, we will see the endpoint details as shown in the screenshot below:

pic TBD

Note that we set up this application in the default tenant. FusionAuth supports multi-tenant configurations, but for this post, we'll stick to keeping everything in one tenant, as that keeps it slightly simpler.

Now, our FusionAuth setup is complete. Let's move to the Golang part.

## Setting up the Development Environment for Go

Here, we are going to set up a development environment for the Go ecosystem.
First, we need to download Go from its official website as shown in the screenshot below:

Then, we need to create a new project folder in VScode. Inside the project, we need to create a new file named main.go as directed in the screenshot below:

First, we will try to run the simplest Go project which is not surprisingly the ‘Hello World’ project. The project code snippet is provided in the code snippet below:
package main
import "fmt"
func main() {
     fmt.Println("Hello, Golang")
}
Now in the terminal, run:

```shell
go run main.go
```

We get the following result:

pic tbd

## Initial handlers and OAuth2 config

Now, we are going to set up the handlers and OAuth2 configs. For that, we need to import the necessary components such as OAuth and HTTP packages first as directed in the code snippet below:

```go
package main
import (
  "fmt"
  "io/ioutil"
  "net/http"
  "golang.org/x/oauth2"
  "github.com/thanhpk/randstr"
)
```

Then, we need to define a variable to contain the configurations as shown in the code snippet below:

```go
var (
    FusionAuthConfig *oauth2.Config
    oauthStateString = randstr.Hex(16)
)
```

Next, we need to create a new OAuth instance and assign configuration in the init function that represents the constructor for authorization grant. Here, we only need `ClientID`, which you got from the FusionAuth application configuration screen. We also need to define the OAuth2 endpoints (from the [FusionAuth docs](/docs/v1/tech/oauth/endpoints)) and a callback URL (as entered in the FusionAuth config above):

```go
//...
func init() {
  FusionAuthConfig = &oauth2.Config{
    RedirectURL: "http://localhost:8080/callback",
    ClientID:    "7d2b4cb4-ccd5-42ac-8469-f802393c8f98",
    Scopes:      []string{"openid"},
    Endpoint: oauth2.Endpoint{
       AuthURL:  "http://localhost:9011/oauth2/authorize",
       TokenURL: "http://localhost:9011/oauth2/token",
    },
 }
}
//...
```

Here, we have defined the OAuth instance inside the init function which is called and run every time the application is run.


## Adding our display

Now, we need to add an `index.html` file. For the index function, we are going to use hardcoded HTML as shown below, but for a larger application you might want to look at a templating language: 

```go
//...
func handleMain(w http.ResponseWriter, r *http.Request) {
  var htmlIndex = `<html>
    <body>
       <a href="/login">FusionAuth Log In</a>
    </body>
    </html>`
   fmt.Fprintf(w, htmlIndex)
}
//...
```

Then, we need to call the `handleMain` function inside the main function and start listening to port 8080 using the code from the following code snippet:

```
//...
func main() {
  http.HandleFunc("/", handleMain)
  fmt.Println(http.ListenAndServe(":8080", nil))
}
//...
```

Now, we need to re-run the server again by stopping the existing server and restarting it:

```shell
go run main.go
```

Navigate to `http://localhost:8080/`. As a result, we will get the following screen in the web browser:

pic TBD

Great, but how do we login? Glad you asked.

## Login function

For the login function, we need to create a new function called `handleFusionAuthLogin`. Then, we make use of the OAuth instance created URL and use the HTTP package to redirect to FusionAuth. Because we are using a properly configured OAuth library, the URL is generated for us. 

```go
//...
func handleFusionAuthLogin(w http.ResponseWriter, r *http.Request) {
  url := FusionAuthConfig.AuthCodeURL(oauthStateString)
  http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}
//...
```

## Handling the callback

In order to handle the callback, which contains the `code` parameter and is crucial to the Authorization Code grant, we pass the temporary `code` and `state` to a `getUserInfo` function. We'll see the contents of that function below. It is going to get user data back from FusionAuth. The code to handle the callback is provided in the code snippet below:

```go
//...
func handleFusionAuthCallback(w http.ResponseWriter, r *http.Request) {
  content, err := getUserInfo(r.FormValue("state"), r.FormValue("code"))
  if err != nil {
    fmt.Println(err.Error())
    http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
    return
  }
  fmt.Fprintf(w, "Content: %s\n", content)
}
//...
```

## Display User Info

Now, in order to fetch and display user info, we need to create `getUserInfo`, as mentioned above.

```go
//...
func getUserInfo(state string, code string) ([]byte, error) {
  if state != oauthStateString {
    return nil, fmt.Errorf("invalid oauth state")
  }
  token, err := FusionAuthConfig.Exchange(oauth2.NoContext, code)
  if err != nil {
    return nil, fmt.Errorf("code exchange failed: %s", err.Error())
  }
  url := "http://localhost:9011/oauth2/userinfo"
  var bearer = "Bearer " + token.AccessToken
  req, err := http.NewRequest("GET", url, nil)
  req.Header.Add("Authorization", bearer)
  client := &http.Client{}
  response, err := client.Do(req)
  if err != nil {
    return nil, fmt.Errorf("failed getting user info: %s", err.Error())
  }
  defer response.Body.Close()
  contents, err := ioutil.ReadAll(response.Body)
  if err != nil {
   return nil, fmt.Errorf("failed reading response body: %s", err.Error())
  }
  return contents, nil
}
//...
```

That's a fair bit of code, let's break it down:

* First, we check the `state` received from the server matches before sending it to the server. This is to prevent CSRF attack.
* Then, we use a temporary code exchange in order to retrieve an access token.
* Next, we construct a request with an `Authorization` header, using the access token as a bearer token.
* Last, we print the response from the server.

Hence, we will get the result as displayed in the demo below:

https://www.youtube.com/watch?v=uqlD5vopAr8

Obviously you'd want to do more than just print out a JSON data structure in a real application. You'd probably want to show the user's data, welcome them, and show or hide functionality based on who they were. 

## Conclusion

Using the Authorization Code grant in GoLang lets you use any OAuth compatible identity provider to seure your application.This is just a demonstration of what can be done with golang and FusionAuth. 

You can review and fork the application on [GitHub](TBD).

Happy coding!

