---
layout: blog-post
title: Building a CLI app with the device grant and golang
description: Building an authenticated CLI app using FusionAuth and the FusionAuth golang client library
author: Matt Gowie
image: blogs/java-client-example/tutorial-using-java-to-manage-fusionauth.png
category: blog
tags: client-golang
excerpt_separator: "<!--more-->"
---

Ever need to authenticate a user from a device that doesn't provide a great interface for logging in? Maybe your device is a smart TV, a Raspberry Pi, or perhaps a CLI app? Oh and you're a fan of Golang? Well, then this is the post for you!

<!--more-->
In this post, we'll walkthrough an example of how to use [FusionAuth](https://fusionauth.io) and their [Golang Client](https://github.com/FusionAuth/go-client) to authenticate a small Golang CLI app using the [OAuth2 Device Code Grant type flow](https://www.oauth.com/oauth2-servers/device-flow/user-flow/) ("Device Flow").

If you're a bit hazy on the Device Flow, then here is a quick refresher from the [grant's RFC (#8628)](https://tools.ietf.org/html/rfc8628):

> The OAuth 2.0 device authorization grant is designed for Internet-
   connected devices that either lack a browser to perform a user-agent-
   based authorization or are input constrained to the extent that
   requiring the user to input text in order to authenticate during the
   authorization flow is impractical.  It enables OAuth clients on such
   devices (like smart TVs, media consoles, digital picture frames, and
   printers) to obtain user authorization to access protected resources
   by using a user agent on a separate device.

![Device Code Grant Diagram](https://is.docs.wso2.com/en/5.11.0/assets/img/using-wso2-identity-server/deviceflow.png)

## Setup Instructions

First things first, to follow along you'll need golang obviously. If you don't already have go on your local machine, *go* ahead and [install it over here](https://golang.org/doc/install).

Next, we need to setup FusionAuth (FA) on our local machines to properly be able to test our CLI app. If you haven't already played around with FA then I suggest checking out their [5 minute setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) and stopping after you've completed step #3. That should get you setup with a running FA server which our CLI app can authenticate with.

Once you've got FA running, we'll need to setup our CLI app's FA Application. Follow these steps to do so:

1. Head over to [FA's Applications UI](http://localhost:9011/admin/application/)
1. Click the green "➕" button to add a new Application.
1. Give your Application a good name so you remember what it is. "Device Code Grant Example" isn't a bad choice.
1. Click on the OAuth tab and under "Enabled grants", check off "Device". This will enable support for the Device Code Grant type on our newly created Application.
1. Since it is required, be sure to fill in the "Device verification URL" field. You can just put "http://example.com/device" if you'd like since we don't need this for our particular application.
   1. Since our CLI app is actually running from a device with a browser, we don't need to provide a friendly URL to the user as we can open FA's `/oauth2/device` URL directly. Neat!
1. Your application form should look something like the below, and if so then you're doing great! Click the save button in the top right.
{% include _image.liquid src="/assets/img/blogs/golang-cli-device-grant/fa-create-application-example.png" alt="FA Create Application Example." class="img-fluid" figure=false %}
1. Now, view your newly created application by clicking the green "🔍" and copy the Client ID as we'll need that later.

Great -- your FA Application is setup, so now we just need two more things from the FA UI before moving forward:

1. Your **Tenant ID** -- You can find find this easily by clicking the "Tenants" tab on the left sidebar and then copying the "Id" value for the "Default" tenant.
1. A new **API Key** -- This one requires a couple more clicks:
   1. Click "Settings > API Keys" on the left sidebar.
   1. Next click our friendly green "➕" button to add a new API Key.
   1. Give your new key a name (again, you can't go wrong with "Device Code Grant Example") and leave everything else the same. Hit save.
   1. Finally, copy the "Id" value for your new key from the table.

Sweet, our FA administrivia is out of the way now that we have our Client ID, Tenant ID, and API Key! Hurrah!

Last setup item: Let's get our CLI app ([getgif](https://github.com/FusionAuth/fusionauth-example-go-device-code-grant)) cloned and setup so you can follow along:

1. Open up your favorite terminal and clone our project: `git clone https://github.com/FusionAuth/fusionauth-example-go-device-code-grant`
1. Change directories into this new project and crack open the `.env` file with your favorite text editor. Here you'll see 3 variables that should look familar! Fill in those variables with your Client ID, Tenant ID, and API Key and then save and exit that file.
1. Lastly, let's build our CLI app via `go build .`, which should create a `getgif` binary in the root of the project.


## Golang CLI App Intro

I bet you're asking yourself: "So what is this `getgif` project that I just built?". Well, I'll tell you, but first let's have the `help` command do some of that work for me:

{% include _image.liquid src="/assets/img/blogs/golang-cli-device-grant/fa-getgif-help.png" alt="The `getgif` help screen." class="img-fluid" figure=false %}

Now you're probably saying to yourself "Oooh I get it now...", but let me break it down just in case:

1. We've got our CLI example app: `getgif`. It has 3 primary commands: `login`, `fetch`, and `logout`
1. The `login` command is responsible for authenticating our user using the FA go client library. We'll dive deep into this command shortly, so keep reading.
1. The `fetch` command is responsible for fetching cool gifs from giphy, but only if the user is authenticated. The message is clear: authenticate and be rewarded with gifs. 😎
1. The `logout` command is responsible for logging our user out. Simple enough!

Awesome -- next up let's talk about our `login` command as that is going to cover the most important part of our example application: Authentication using the Device Flow.


## Golang `login` Walkthrough

First, let's talk about the steps we need to accomplish for our Device Flow authentication:

1. We need to reach out to the FA server to start the Device Code Flow and fetch a User Code for our user to input.
1. We need to display our user's User Code, open the browser for them to FA's 'Device code login' page, and then start polling the FA server for when the user has completed the login flow.
1. Once the user has completed the login flow, our polling of the FA server should respond back with a JWT Access Token. We can then trade that Access Token with the FA server to get information about our user and save that to disk as successful validation that our user is logged in.

Sounds great - let's dive into each of those steps!

### Starting the Device Code Flow

To start the Device Flow off, we need to send the ["Device Authorization Request"](https://tools.ietf.org/html/rfc8628#section-3.1). To show how we'll do that, let's start off with some abridged code and then break it down:

```go
// ...

// LoginCmd provides the command for logging into the FA server using the Device Flow.
var LoginCmd = &cobra.Command{
   Use:   "login",
   Short: "Authenticate to the FA server using the OAuth Device Flow.",
   Run: func(cmd *cobra.Command, args []string) {
      faClient = fusionauth.NewClient(httpClient, baseURL, apiKey)
      openIDConfig, err := faClient.RetrieveOpenIdConfiguration()
      if err != nil {
         log.Fatal(err)
      }

      deviceResp, err := startDeviceGrantFlow(openIDConfig.DeviceAuthorizationEndpoint)
      if err != nil {
         log.Fatal(err)
      }

      // To be continued...
   },
}

func startDeviceGrantFlow(deviceAuthEndpoint string) (*fusionauth.DeviceResponse, error) {
   var result *fusionauth.DeviceResponse = &fusionauth.DeviceResponse{}

   resp, err := http.PostForm(deviceAuthEndpoint, url.Values{
      "client_id":            {ClientID},
      "scope":                {"offline_access"},
      "metaData.device.name": {"Golang CLI App"},
      "metaData.device.type": {string(fusionauth.DeviceType_OTHER)},
   })

   if err != nil {
      return result, err
   }

   defer resp.Body.Close()
   json.NewDecoder(resp.Body).Decode(result)

   return result, nil
}

// ...
```

Here you can see the following:

1. We have our login command, where our main logic is in our `Run` function.
1. Our `Run` func starts off by creating a `FusionAuthClient` and assigning it to `faClient`. This is using FA's [go-client](github.com/FusionAuth/go-client/pkg/fusionauth) library, which **will be our primary interface to our FA server going forward** and is going to come in handy throughout our Device Flow.
1. Next, we call `faClient.RetrieveOpenIdConfiguration` which returns to us an `openIDConfig` object of type [OpenIdConfiguration](https://pkg.go.dev/github.com/FusionAuth/go-client/pkg/fusionauth?tab=doc#OpenIdConfiguration). This will be handy as we'll be able to get some important OAuth endpoints from that configuration.
1. Lastly, we call `startDeviceGrantFlow` with `openIDConfig.DeviceAuthorizationEndpoint`. This function sends the "Device Authorization Request" we mentioned earlier and populates the response into the `result` object which is of type [`fusionauth.DeviceResponse`](https://pkg.go.dev/github.com/FusionAuth/go-client/pkg/fusionauth?tab=doc#DeviceResponse).

Now that we've sent our Device Auth request and we've got back a successful response, we've properly kicked off our FA server to accept a Device Login and have received our User and Device Codes locally to our CLI App. Let's do something with those shall we?

### Display the User Code, Open the Device Login page, and Poll the FA server for completion

Alright, now that we've got a User Code we need to show that code to the user so they can complete the "Device login", we need to open the "Device login" page so the user doesn't need to enter the URL themselves, and we need to start polling the FA server with our Device Code so we're informed when the user completes their login.

Again, let's look at some code and then work our way through it:

```go
// LoginCmd provides the command for logging into the FA server using the Device Flow.
var LoginCmd = &cobra.Command{
    Use:   "login",
    Short: "Authenticate to the FA server using the OAuth Device Flow.",
	Run: func(cmd *cobra.Command, args []string) {
		faClient = fusionauth.NewClient(httpClient, baseURL, apiKey)
		openIDConfig, err := faClient.RetrieveOpenIdConfiguration()
		if err != nil {
			log.Fatal(err)
		}

		deviceResp, err := startDeviceGrantFlow(openIDConfig.DeviceAuthorizationEndpoint)
		if err != nil {
			log.Fatal(err)
		}

		informUserAndOpenBrowser(deviceResp.UserCode)

		accessToken, err := startPolling(openIDConfig.TokenEndpoint, deviceResp.DeviceCode, deviceResp.Interval)
		if err != nil {
			log.Fatal(err)
		}

      // To be continued...
   },
}

// ...

func informUserAndOpenBrowser(userCode string) {
	cyan := color.New(color.FgCyan)
	cyan.Printf("Your User Code is: ")

	yellow := color.New(color.FgYellow, color.Bold)
	yellow.Printf("%s\n", userCode)

	cyan.Printf("Opening browser for code entry...\n")

	// Wait a few seconds to give user a chance to check out the printed user code.
	time.Sleep(3 * time.Second)

	url := fmt.Sprintf("%s/oauth2/device?client_id=%s&tenantId=%s", host, ClientID, TenantID)
	open.Run(url)
}

func startPolling(tokenEndpoint string, deviceCode string, retryInterval int) (*fusionauth.AccessToken, error) {
	var result *fusionauth.AccessToken = &fusionauth.AccessToken{}
	yellow := color.New(color.FgYellow, color.Bold)
	blue := color.New(color.FgBlue, color.Bold)

	for {
		resp, err := http.PostForm(tokenEndpoint, url.Values{
			"device_code": {deviceCode},
			"grant_type":  {"urn:ietf:params:oauth:grant-type:device_code"},
			"client_id":   {ClientID},
		})

		if err != nil {
			return result, err
		}

		// 400 status code (StatusBadRequest) is our sign that the user
		// hasn't completed their device login yet, sleep and then continue.
		if resp.StatusCode == http.StatusBadRequest {

			// Sleep for the retry interval and print a dot for each second.
			for i := 0; i < retryInterval; i++ {
				if i == 0 {
					blue.Printf(".")
				} else {
					yellow.Printf(".")
				}
				time.Sleep(time.Second)
			}

			continue
		}

		fmt.Printf("\n")
		defer resp.Body.Close()
		json.NewDecoder(resp.Body).Decode(result)

		return result, nil
	}
}

// ...
```

This should look familiar! We start with our LoginCmd's `Run` function again, but we continue that function a bit more to do the following:

1. We call `informUserAndOpenBrowser` with our `deviceResp.UserCode` that we got from the FA server. This prints to the user's CLI the given `userCode` and open's up FA's `/oauth2/device` endpoint for our Application and Tenant.
1. Next, we call `startPolling` which continually polls the given `openIDConfig.TokenEndpoint` every `retryInterval` seconds (5 seconds is RFC8628's / FA's default) to see if the user has completed the Device login (tied to the given `deviceCode`). Once the user has completed their login, the FA server responds with a proper `200` response including a JWT Access Token which is then populated into our `result` object and returned.

Now we're getting somewhere! The only thing left to do is trade our Access Token for the actual user record and save it to disk. Let's do it!

### Trade our Access Token for info on our User and write it to disk

Our last task is simple: We have a JWT Access Token and our handy `FusionAuthClient` has a method [`RetrieveUserUsingJWT`](https://pkg.go.dev/github.com/FusionAuth/go-client/pkg/fusionauth?tab=doc#FusionAuthClient.RetrieveUserUsingJWT), so we just need to combine the two and save the result. Let's see it in action:

```go
// LoginCmd provides the subcommand for logging into the FA server using the Device Flow.
var LoginCmd = &cobra.Command{
	Use:   "login [no options!]",
	Short: "Login to the FA server using the OAuth Device Flow.",
	Run: func(cmd *cobra.Command, args []string) {
      // ...

		accessToken, err := startPolling(openIDConfig.TokenEndpoint, deviceResp.DeviceCode, deviceResp.Interval)
		if err != nil {
			log.Fatal(err)
		}

		fetchAndSaveUser(accessToken)
	},
}

func fetchAndSaveUser(token *fusionauth.AccessToken) {
	resp, _, err := faClient.RetrieveUserUsingJWT(token.AccessToken)
	if err != nil {
		log.Fatal(err)
	}

	// Save our User object for later usage in fetch
	Save("/tmp/getgif.json", resp.User)

	cyan := color.New(color.FgCyan)
	cyan.Printf("You successfully authenticated! You can now use `getgif fetch`!\n")
}
```

Great stuff, we send off our JWT to FA, FA's go-client intelligently responds with a [`UserResponse`](https://pkg.go.dev/github.com/FusionAuth/go-client/pkg/fusionauth?tab=doc#UserResponse) object, we save that response's User field (`resp.User`) to `/tmp/getgif.json`, and then we print a success message. Simple, easy, and effective!

## Working!

Now, since this is a post about using using FusionAuth and not about the Giphy API, I won't dig into the `fetch` command too much and I'll leave that to you but suffice to say it's pretty simple. Here is the whole flow in action:

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe width="560" height="315" src="https://www.youtube.com/embed/EKO3THhEkx8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Final Words

In this post, we went through how we could easily accomplish authenticating a CLI application using the Device Code grant, FusionAuth, and the FusionAuth golang client library. We got into all the gritty details in `login.go` so you as the reader can walk away and implement this flow in your own FusionAuth backed, golang application. And finally, we saw it all working with a sweet gopher gif at the end!

Now this post just shows off one grant type that FusionAuth supports, so if you're interested in others then I suggest checking out [the FusionAuth documentation](https://fusionauth.io/docs/) as there is a lot more that is possible! And if you're interested in learning more about the Golang client library then be sure to [check out the code](https://github.com/FusionAuth/go-client) and [the corresponding godoc](https://pkg.go.dev/github.com/FusionAuth/go-client/pkg/fusionauth?tab=doc) as both are easy to read and understand!
