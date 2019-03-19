---
layout: article
title: Webapp OAuth login using authorization code grant 
subtitle: Using JWTs and refresh tokens 
description: An explanation of webapp login using FusionAuth OAuth interface with the authorization code grant and uses JWTs and refresh tokens in cookies
image: articles/logins.png
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

{% plantuml _diagrams/logins/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _oauth-login-store.md %}
1. The application backend receives the 200 from FusionAuth. It returns a redirect to the browser instructing it to navigate to the user's shopping cart. The JWT and refresh token from FusionAuth are written back to the browser in HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include these cookies so that the backend can use them 
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _oauth-login-forums.md %}
1. The application backend receives the 200 from FusionAuth. It returns a redirect to the browser instructing it to navigate to the user's forum posts. The JWT and refresh token from FusionAuth are written back to the browser in HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include these cookies so that the backend can use them 
{% include_relative _forums-refresh-jwt-load.md %}
{% include_relative _stolen-refresh-token-refresh-jwt.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This is the safest and most feature rich login workflow in FusionAuth. It has the benefit that passwords are only ever provided directly to FusionAuth. It also has the benefit of full SSO capabilities when the user is automatically logged into the forum application by FusionAuth. Finally, the JWT and refresh tokens are HttpOnly cookies that are domain locked to the application backend that needs them.  

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)