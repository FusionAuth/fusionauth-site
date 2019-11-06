---
layout: advice
title: Single-page application native login to FusionAuth
subtitle: Using JWTs and refresh tokens
description: An explanation of single-page application login using a native login form that submits directly to FusionAuth and uses JWTs and refresh tokens in cookies
header_dark: true
image: articles/login-types-share-image.jpg
---

{% capture intro %}
{% include_relative _native-fusionauth-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml _diagrams/logins/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-fusionauth-login-api.md %}
{% include_relative _cookie-drop.md %}
{% include_relative _shopping-cart-jwt-load.md %}
{% include_relative _shopping-cart-jwt-expired.md %}
{% include_relative _call-fusionauth-refresh-api.md %}
{% include_relative _cookie-drop.md %}
{% include_relative _shopping-cart-jwt-load.md %}
{% include_relative _shopping-cart-jwt-expired.md %}
{% include_relative _call-fusionauth-refresh-api-invalid.md %}
{% include_relative _relogin.md %}
{% include_relative _forums-initialize-no-sso.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-fusionauth-login-api-overwrite-store-cookie.md %}
{% include_relative _cookie-drop.md %}
{% include_relative _forums-jwt-load.md %}
{% include_relative _stolen-refresh-token-direct-to-fusionauth.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is less secure than other workflows because the JWT is available to JavaScript during the cookie drop process. While this is a small window of time, it is still possible that malicious JavaScript running in the application could gain access to the JWT. If an attacker can inject JavaScript into the page, they can begin stealing user's JWTs. The attacker might introduce JavaScript into an open source project through obfuscated code or through a backend exploit of some kind. Many platforms like Wordpress also allow plugins to add JavaScript includes to websites as well. Therefore, ensuring that your JavaScript is secure can be extremely difficult.

This workflow might still be a good solution for some applications. Developers should just weigh the risks associated with JWTs accessible to JavaScript versus the other workflows we have documented.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)

[_View All Types_](/articles/logins/types-of-logins-authentication-workflows)
