---
layout: advice
title: Single-page application native login to FusionAuth (same domain) with JWTs and refresh tokens
description: An explanation of single-page application login using a native login form that submits directly to FusionAuth on the same domain with server-side sessions with refresh tokens in cookies
image: advice/header.png
category: Authentication
author: Brian Pontarelli
date: 2019-11-04
dateModified: 2019-11-04
---

{% capture intro %}
{% include_relative _native-fusionauth-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml source: _diagrams/learn/expert-advice/authentication/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.plantuml, alt: "Single page application native login with JWTs and refresh tokens in same domain cookies diagram" %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-fusionauth-login-api-cookies.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-jwt-expired.md %}
{% include_relative _call-fusionauth-refresh-api.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-jwt-expired.md %}
{% include_relative _call-fusionauth-refresh-api-invalid.md %}
{% include_relative _relogin.md %}
{% include_relative _forums-initialize-no-sso.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-fusionauth-login-api-cookies-overwrite-store-cookie.md %}
{% include_relative _forums-refresh-jwt-load.md %}
{% include_relative _stolen-refresh-token-direct-to-fusionauth.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is more secure than the other workflows that call FusionAuth directly because the JWT and refresh token are both stored in HttpOnly cookies. The downside of this workflow is that there are no built in SSO capabilities provided by FusionAuth. It forces the developer to build out an SSO solution themselves.

Additionally, this workflow requires that FusionAuth be deployed at the top-level domain for the entire organization or that a proxy be used to rewrite the cookies that FusionAuth sends back as part of the Login API so that they are in the correct domain.  

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
