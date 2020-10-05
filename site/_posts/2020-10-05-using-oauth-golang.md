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

In this tutorial, we are going to learn how to secure a Golang program with OAuth by using FusionAuth mechanism as a custom OAuth provider. Authentication is an essential mechanism to apply in any technology nowadays. FusionAuth mechanism is very useful in the sense that it helps us set up a custom OAuth. 

<!--more-->


First, we will learn what OAuth is. Then, we will go on to set up the FusionAuth server. The idea is to construct a URL in order to match with OAuth endpoint. Lastly, we will learn how to make use of access token in order to get user info from OIDC. 
To make the tutorial easy to understand and follow, it would be best to check out the GitHub repo with full coding implementation first.
Now, let’s get started!
Requirements
The requirements to follow this tutorial are as follows:
Go SDK.
VScode or any other text editor.
FusionAuth for OAuth provider.
git version control.
npx package executer.
Xcode for iOS.
Homebrew (optional).
Setting up FusionAuth as your Auth provider
For an easy and short installation guide, you can follow the installation guide at FusionAuth documentation. However, we can also perform some installation steps on macOS using Homebrew. The process is simple and only makes use of a terminal with few commands.
First, we are going to install tap by running the following command in the terminal:
brew tap fusionauth/homebrew-fusionauth
Note that, this installation step is to be performed only once.
Next, we need to install the FusionAuth main services by running the following command:
brew install fusionauth-app
Lastly, we need to start the FusionAuth services by running the following command in the project terminal:
brew services start fusionauth-app
Now, in order to get started, we need to open our browser and goto http://localhost:9011 . Then, we need to complete the maintenance mode and the setup wizard.
Setup FusionAuth with the Installation wizard
Now in the http://localhost:9011 , we will see the Maintenance Mode form that calls for a database credential and new super admin user credential as displayed in the screenshot below:

We need to fill the setup form as directed above and click on the Submit button. This will cause FusionAuth to exit Maintenace Mode and start itself up. Now, we will see the interstitial page as shown in the screenshot below:

Create and configure a new Application
Initially, FusionAuth will have accessed with a default account which we can update. Hence, we need to create a new account as directed in the code snippet below:

Then, we need to configure the authorized callback URL as directed in the code snippet below:

Lastly, we need to make sure that the Authorization Code checkbox is already checked and enabled as directed in the screenshot below:

After a successful setup, we will see the endpoint details as shown in the screenshot below:

Now, our FusionAuth setup is complete. Hence, we can move to the Golang part.
Setting up the Development Environment for Go
Here, we are going to set up a development environment for the Go ecosystem.
First, we need to download Go from its official website as shown in the screenshot below:

Then, we need to create a new project folder in VScode. Inside the project, we need to create a new file named main.go as directed in the screenshot below:

First, we will try to run the simplest Go project which is not surprisingly the ‘Hello World’ project. The project code snippet is provided in the code snippet below:
package main
import "fmt"
func main() {
     fmt.Println("Hello, Golang")
}
Now in the terminal, if we run go run main.go command, we will get the following result:

We can notice the ‘Hello, Golang’ text printed in the terminal.
Initial handlers and OAuth2 config
Now, we are going to set up the handlers and OAuth2 configs. For that, we need to import the necessary components such as OAuth and HTTP packages first as directed in the code snippet below:
package main
import (
  "fmt"
  "io/ioutil"
  "net/http"
  "golang.org/x/oauth2"
   "github.com/thanhpk/randstr"
)
Then, we need to define a variable to contain the configurations as shown in the code snippet below:
var (
    FusionAuthConfig *oauth2.Config
    oauthStateString = randstr.Hex(16)
)
Next, we need to create a new OAuth instance and assign configuration in the init function that represents the constructor for authorization grant. Here, we only need ClientID . We also need to define the OAuth2 endpoints and a callback URL as directed in the code snippet below:
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



Here, we have defined the OAuth instance inside the init function which is called and run every time the application is run.
Adding index.html
Now, we need to add an index.html file. For the index function, we are going to integrate simple HTML as displayed in the code snippet below: 
func handleMain(w http.ResponseWriter, r *http.Request) {
  var htmlIndex = `<html>
    <body>
       <a href="/login">FusionAuth Log In</a>
    </body>
    </html>`
   fmt.Fprintf(w, htmlIndex)
}
Then, we need to call the handleMain function inside the main function and start listening to port 8080 using the code from the following code snippet:
func main() {
   http.HandleFunc("/", handleMain)
  fmt.Println(http.ListenAndServe(":8080", nil))
}
Now, we need to re-run the server again by pressing the following buttons based on the platform being used:
macOS: ⌘+c
Windows: Ctrl+c
and run go run main.go again. Then, navigate to http://localhost:8080/. As a result, we will get the following screen in the web browser:

Login function
For the login function, we need to create a new function called handleFusionAuthLogin. Then, we make use of the OAuth instance created URL and use the HTTP package to redirect to FusionAuth. The code for this is provided in the code snippet below:
func handleFusionAuthLogin(w http.ResponseWriter, r *http.Request) {
  url := FusionAuthConfig.AuthCodeURL(oauthStateString)
  http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}
Handling Callback
In order to handle the callback, we pass the temporary code and state to getUserInfo function that we are going to use for getting test data from the server. The code to handle the callback is provided in the code snippet below:
func handleFusionAuthCallback(w http.ResponseWriter, r *http.Request) {
  content, err := getUserInfo(r.FormValue("state"), r.FormValue("code"))
  if err != nil {
    fmt.Println(err.Error())
    http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
    return
  }
  fmt.Fprintf(w, "Content: %s\n", content)
}
Display User Info
Now, in order to fetch and display user info, we need to create a new function called getUserInfo as mentioned above and receive code and state from the FunstionAuth server as shown in the code snippet below:
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
The coding implementations in the above code snippet is explained below:
First, we check the state received from the server matches before sending it to the server. This is to prevent XSRF attack.
Then, we use a temporary code exchange in order to an access token.
Next, we construct a request with an Authorization header.
Lastly, we print the response from the server.
Hence, we will get the result as displayed in the demo below:
https://www.youtube.com/watch?v=uqlD5vopAr8
Finally, we have successfully completed the configuration to make GoLang secure with FusionAuth, a custom OAuth provider.
conclusion
This tutorial will definitely grab the interest of Go developers. Security and authentication are important aspects of any website nowadays. Making a website secure using FusionAuth is a new thing that we learned in this tutorial. Most importantly, we got detailed guidance on how Oauth works and how to set up an OAuth server with FusionAuth. Using OAuth code flow in GoLang to make it secure was the lesson of this tutorial. This is just a demonstration of what can be done with GoLang and FusionAuth. There are many other things to explore. We will come up with more interesting and exemplary articles on this topic.
Here all code in this tutorial is available on Github
Until then, stay tuned! Peace out folks!

