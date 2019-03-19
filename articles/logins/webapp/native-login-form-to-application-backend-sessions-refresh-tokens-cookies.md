---
layout: article
title: Webapp native login to backend 
subtitle: Using sessions and refresh tokens 
description: An explanation of webapp login using a native login form that submits to the application backend and uses server-side sessions plus refresh tokens in cookies
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

{% plantuml _diagrams/logins/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _native-login-store.md %}
{% include_relative _create-session.md %}
1. The application backend returns a redirect to the browser instructing it to navigate to the user's shopping cart. The id for the server-side session is written back to the browser in an HTTP cookie. The refresh token from FusionAuth is also written back to the browser in an HTTP cookie. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include these cookies so that the backend can retrieve the User object from the server-side session and refresh their session if it expires 
{% include_relative _shopping-cart-session-refresh-load.md %}
{% include_relative _shopping-cart-session-refresh-refresh.md %}
{% include_relative _shopping-cart-session-refresh-relogin.md %}
{% include_relative _native-login-forums.md %}
{% include_relative _create-session.md %}
1. The application backend returns a redirect to the browser instructing it to navigate to the user's forum posts. The id for the server-side session is written back to the browser in an HTTP cookie. The refresh token from FusionAuth is also written back to the browser in an HTTP cookie. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include these cookies so that the backend can retrieve the User object from the server-side session and refresh their session if it expires
{% include_relative _forums-session-refresh-load.md %}
{% include_relative _stolen-session-refresh-token.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)