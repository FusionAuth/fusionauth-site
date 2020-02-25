---
layout: advice
title: Mobile login to FusionAuth
subtitle: Using JWTs and refresh tokens
description: An explanation of mobile application login using a native login form that submits directly to FusionAuth and uses JWTs and refresh tokens
header_dark: true
image: advice/types-of-logins-article.png
category: Authentication
author: Brian Pontarelli
date: 2019-11-04
dateModified: 2019-11-04
---

{% capture intro %}
{% include_relative _native-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml source: _diagrams/learn/expert-advice/authentication/mobile/native-login-form-to-fusionauth.plantuml, alt: "Mobile application native login form with JWTs and refresh tokens" %}

## Explanation

{% capture steps %}
{% include_relative _open-app.md %}
{% include_relative _call-fusionauth-login-api.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _stolen-refresh-token.md %}
{% include_relative _stolen-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. It uses a JWT and refresh token that are securely store on the mobile device. It has the benefit that passwords are only provided directly to FusionAuth.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
