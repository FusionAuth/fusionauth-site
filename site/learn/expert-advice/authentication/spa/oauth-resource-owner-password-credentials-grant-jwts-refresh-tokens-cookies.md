---
layout: advice
title: Single-page application OAuth login using resource owner password credentials grant
subtitle: Using JWTs and refresh tokens
description: An explanation of single-page application login using a native login form that submits to the application backend and uses JWTs and refresh tokens in cookies
header_dark: true
image: advice/types-of-logins-article.png
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

{% plantuml _diagrams/learn/expert-advice/authentication/spa/oauth-resource-owners-grant-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api-oauth.md %}
{% include_relative _shopping-cart-refresh-jwt-response.md %}
{% include_relative _shopping-cart-refresh-jwt-load.md %}
{% include_relative _shopping-cart-refresh-jwt-refresh.md %}
{% include_relative _shopping-cart-refresh-jwt-relogin.md %}
{% include_relative _forums-initialize-sso.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api-oauth.md %}
{% include_relative _forums-refresh-jwt-response.md %}
{% include_relative _forums-refresh-jwt-load.md %}
{% include_relative _stolen-refresh-token-refresh-jwt.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. One downside is that the application backend receives passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/token (grant)](/docs/v1/tech/oauth/endpoints#resource-owner-credentials-grant-request)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token (refresh)](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/articles/logins/types-of-logins-authentication-workflows)
