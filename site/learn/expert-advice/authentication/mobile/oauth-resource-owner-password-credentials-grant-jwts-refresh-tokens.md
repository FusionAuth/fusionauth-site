---
layout: advice
title: Mobile OAuth login using resource owner password credentials grant
subtitle: Using JWTs and refresh tokens
description: An explanation of mobile application login using a native login form that submits to the application backend and uses JWTs and refresh tokens
header_dark: true
image: articles/login-types-share-image.jpg
category: Authentication
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

{% plantuml _diagrams/logins/mobile/oauth-resource-owners-grant.plantuml %}

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

* [/oauth2/token (grant)](/docs/v1/tech/oauth/endpoints#resource-owner-credentials-grant-request)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token (refresh)](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/articles/logins/types-of-logins-authentication-workflows)
