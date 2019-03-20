---
layout: article
title: Webapp OAuth login using authorization code grant 
subtitle: Using sessions and refresh tokens 
description: An explanation of webapp login using FusionAuth OAuth interface with the authorization code grant and uses server-side sessions plus refresh tokens in cookies
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

{% plantuml _diagrams/logins/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _oauth-login-store.md %}
{% include_relative _create-session.md %}
{% include_relative _shopping-cart-session-refresh-redirect.md %}
{% include_relative _shopping-cart-session-refresh-load.md %}
{% include_relative _shopping-cart-session-refresh-refresh.md %}
{% include_relative _shopping-cart-session-refresh-relogin.md %}
{% include_relative _oauth-login-forums.md %}
{% include_relative _create-session.md %}
{% include_relative _forums-session-refresh-redirect.md %}
{% include_relative _forums-session-refresh-load.md %}
{% include_relative _stolen-session-refresh-token.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This the safest and most feature rich login workflow in FusionAuth. It has the benefit that passwords are only ever provided directly to FusionAuth. It also has the benefit of full SSO capabilities when the user is automatically logged into the forum application by FusionAuth. Also, the session and refresh tokens are HttpOnly cookies that are domain locked to the application backend that needs them. Plus, the User object (or JWT) is secured on the server inside a server-side session.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)