---
layout: advice
title: "Login with Twitter - Oh, the Humanity!"
description: Twitter doesn't make it easy to build an OAuthv1 login. FusionAuth does.
author: Daniel DeGroff
categories: oauth
header_dark: true
image: articles/login-with-twitter-2.png
related:
- title: "How-To: OAuth Device Authorization"
  url: /learn/expert-advice/oauth/oauth-device-authorization-roku-appletv-xbox
---
When we built out our social login support in FusionAuth we were forced to navigate the harrowing path to signing our OAuth v1 requests to Twitter.

If you've ever done this in Java, you may know there isn't a great option off the shelf to make this easy, or if there is I was unable to find it. Since we had to do some heavy lifting, we decided to share our work with the Java community.

TL;DR See source code on [Gist](https://gist.github.com/robotdan/33f5834399b6b30fea2ae59e87823e1d).

## Sifting through the disaster that is Twitter login

If you have ever built out a Twitter login integration you've likely read through the [Twitter documentation](https://developer.twitter.com/en/docs/twitter-for-websites/log-in-with-twitter/guides/implementing-sign-in-with-twitter.html
).

If you can navigate their documentation, you get a gold star. This task is not for the faint of heart. The most difficult part of making the OAuth v1 requests is building the required signature. The Twitter documentation does little to make this a simpler process.

Here is the summary provided by Twitter on how to build a [signed request](https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature.html).

{:.text}
> These values need to be encoded into a single string which will be used later on. The process to build the string is very specific:
> <br><br>
> 1. Percent encode every key and value that will be signed.
> 2. Sort the list of parameters alphabetically [1] by encoded key [2].
> 3. For each key/value pair:
> 4. Append the encoded key to the output string.
> 5. Append the ‘=’ character to the output string.
> 6. Append the encoded value to the output string.
> 7. If there are more key/value pairs remaining, append a ‘&’ character to the output string.

The first time I read this, I threw up in my mouth. I then went and read the OAuth Core 1.0 specification to ensure I understood the procedure. If you're interested, go read [section 9](https://oauth.net/core/1.0a/#signing_process) of [OAuth Core 1.0 Revision A](https://oauth.net/core/1.0a/)

In summary, it is easy to see why the OAuth v1 specification was deprecated in favor of OAuth 2.0 which relies upon a secure transport (TLS) instead of requiring cumbersome signing strategies.

With that said, to make my life easier, and hopefully some other fellow Java developers, I wrote an OAuth v1 signature builder that I could use to sign my requests to Twitter.

## Gather your Keys

Start by logging into Twitter and navigating the Twitter developer console. Once you're there, navigate to the `Keys and tokens` tab of the application you're integrating. Here you will find a few key pieces of information that you'll need to sign the request.


{% include _image.html src="/assets/img/docs/twitter-keys-tokens.png" alt="Twitter Consumer API Keys" class="img-fluid" figure=false %}

Make note of the two values in the `Consumer API Keys` section, they are suffixed with the labels `API key` and `API secret key`. Once you are in the OAuth v1 world, we'll be using the `API key` value for the consumer key and the `API secret key` value for the consumer secret.


In the above Twitter configuration screenshot we have an `API key` value of `T62nvXkMrZyTeRYK2vBmGiFUq` and an `API secret key` value of `gikDkNsIS7Xpc1eFtgt38lnZFBarywiOtEyyUBGZ3x2fj6d3gz`. We'll use those values in the next section to build an example `Authorization` header.

## Example code

Here is a Java example of building the `Authorization` header value for a `POST` request to the Twitter `request_token` endpoint. This is the first endpoint you will use which is required to obtain a Request Token.

```java
String authorization = new OAuth1AuthorizationHeaderBuilder()
            .withMethod("POST")
            .withURL("https://api.twitter.com/oauth/request_token")
            .withConsumerSecret("gikDkNsIS7Xpc1eFtgt38lnZFBarywiOtEyyUBGZ3x2fj6d3gz")
            .withParameter("oauth_callback", "https://login.piedpiper.com/callback")
            .withParameter("oauth_consumer_key", "T62nvXkMrZyTeRYK2vBmGiFUq")
            .withParameter("oauth_nonce", "tp9pdk9frXwLOwt3")
            .build();
```

Next we'll take the string returned by the builder and build an `Authorization` HTTP header. Line breaks are added for readability.
```
Authorization: OAuth oauth_callback="https%3A%2F%2Flogin.piedpiper.com%2Fcallback",
                     oauth_consumer_key="T62nvXkMrZyTeRYK2vBmGiFUq",
                     oauth_nonce="tp9pdk9frXwLOwt3",
                     oauth_timestamp="1554175774",
                     oauth_signature_method="HMAC-SHA1",
                     oauth_version="1.0",
                     oauth_signature="tYJE4EV0ZoXYX6jsAfQuQvLpjOA%3D"
```

It is as simple as that, now for each request you make to Twitter as part of the OAuth v1 authentication workflow, you simply need to build the `Authorization` header using the `OAuth1AuthorizationHeaderBuilder` class.

To clarify, the easiest way to login with Twitter is to use FusionAuth. However if you find that you need to build your own Twitter login, or need to interact with any other OAuth v1 identity provider we've got you covered.

Now for the source code.

<script src="https://gist.github.com/robotdan/33f5834399b6b30fea2ae59e87823e1d.js"></script>

&nbsp;

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- Technology
- Products
- FusionAuth
-->
