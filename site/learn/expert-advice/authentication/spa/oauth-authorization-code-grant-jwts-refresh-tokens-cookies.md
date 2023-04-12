---
layout: advice
title: Single-page application OAuth login using authorization code grant with JWTs and refresh tokens
description: An explanation of single-page application login using FusionAuth OAuth interface with the authorization code grant with JWTs and refresh tokens in cookies
image: advice/header.png
category: Authentication
author: Brian Pontarelli
date: 2019-11-04
dateModified: 2019-11-04
---

{% capture intro %}
{% include_relative _oauth-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml source: _diagrams/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.plantuml, alt: "Single page application OAuth 2 Authorization Code Grant with JWTs and refresh tokens in cookies diagram" %}

## Explanation

{% capture steps %}
{% include_relative _oauth-login-store.md %}
{% include_relative _shopping-cart-refresh-jwt-response-oauth.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _oauth-login-forums.md %}
{% include_relative _forums-refresh-jwt-response-oauth.md %}
{% include_relative _forums-refresh-jwt-load.md %}
{% include_relative _stolen-refresh-token-refresh-jwt.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This is one of the safest and most feature rich login workflow in FusionAuth. It has the benefit that passwords are only provided directly to FusionAuth. It also has the benefit of full SSO capabilities when the user is automatically logged into the forum application by FusionAuth. Finally, the JWT and refresh tokens are HttpOnly cookies that are domain locked to the application backend that needs them.

One downside to this workflow is that it causes the user to leave the single-page application and navigate to the FusionAuth OAuth interface. The effects of this are minimized as long as the browser caches the single-page application.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
