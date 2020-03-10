---
layout: advice
title: Single-page application native login to backend with sessions and refresh tokens
description: An explanation of single-page application login using a native login form that submits to the application backend with server-side sessions plus refresh tokens in cookies
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

{% plantuml source: _diagrams/learn/expert-advice/authentication/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.plantuml, alt: "Single page application native login with server-side sessions and refresh tokens diagram" %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api.md %}
{% include_relative _create-session.md %}
{% include_relative _shopping-cart-session-refresh-response.md %}
{% include_relative _shopping-cart-session-refresh-load.md %}
{% include_relative _shopping-cart-session-refresh-refresh.md %}
{% include_relative _shopping-cart-session-refresh-relogin.md %}
{% include_relative _forums-initialize-no-sso.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api.md %}
{% include_relative _create-session.md %}
{% include_relative _forums-session-refresh-response.md %}
{% include_relative _forums-session-refresh-load.md %}
{% include_relative _stolen-session-refresh-token.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. One downside is that the application backend receives passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
