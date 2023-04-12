---
layout: advice
title: Mobile OAuth login using resource owner password credentials grant with JWTs and refresh tokens
description: An explanation of mobile application login using a native login form that submits to the application backend ( with JWTs and refresh tokens) which calls FusionAuth's OAuth Resource Owner's Password Grant
image: advice/header.png
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

{% plantuml source: _diagrams/learn/expert-advice/authentication/mobile/oauth-resource-owners-grant.plantuml, alt: "Mobile application OAuth 2 Resource Owners Grant diagram" %}

## Explanation

{% capture steps %}
{% include_relative _open-app.md %}
{% include_relative _call-backend-login-api-oauth.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _stolen-refresh-token.md %}
{% include_relative _stolen-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is a secure methods of authenticating users. It uses a JWT and refresh token that are securely store on the mobile device. One downside is that the application backend receives passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/token (grant)](/docs/v1/tech/oauth/endpoints#resource-owner-password-credentials-grant-request)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token (refresh)](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
