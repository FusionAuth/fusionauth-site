---
layout: article
title: Webapp native login to backend 
subtitle: Using JWTs and refresh tokens 
description: An explanation of webapp login using a native login form that submits to the application backend and uses JWTs and refresh tokens in cookies
image: articles/logins.png
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

{% plantuml _diagrams/logins/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _native-login-store.md %}
1. The application backend receives the 200 and returns a redirect to the browser instructing it to navigate to the user's shopping cart. During this step, the JWT and refresh token are written out as HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include the cookies so that the backend can retrieve and use them 
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _native-login-forums.md %}
1. The application backend receives the 200 and returns a redirect to the browser instructing it to navigate to the user's posts in the forum. During this step, the JWT and refresh token are written out as HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include the cookies so that the backend can retrieve and use them 
{% include_relative _forums-refresh-jwt-load.md %}
{% include_relative _stolen-refresh-token-refresh-jwt.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. One downside is that the application backend will be consuming passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)