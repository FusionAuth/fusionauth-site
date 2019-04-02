---
layout: article
title: Mobile login to backend
subtitle: Using JWTs and refresh tokens
description: An explanation of mobile application login using a native login form that submits to the application backend and uses JWTs and refresh tokens
image: articles/login-types-share-image.jpg
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

{% plantuml _diagrams/logins/mobile/native-login-form-to-application-backend.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _open-app.md %}
{% include_relative _call-backend-login-api.md %}
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

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/articles/logins/types-of-logins)
