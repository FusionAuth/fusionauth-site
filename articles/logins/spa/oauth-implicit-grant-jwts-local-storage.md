---
layout: article
title: Single-page application OAuth login using implicit grant
subtitle: Using JWTs in local storage
description: An explanation of single-page application login using FusionAuth OAuth interface with the implicit grant and uses JWTs in local storage
image: articles/login-types-share-image.jpg
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

{% plantuml _diagrams/logins/spa/oauth-implicit-grant-jwts-local-storage.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-local-storage.md %}
{% include_relative _oauth-implicit-login-store.md %}
{% include_relative _move-jwt-from-uri-to-local-storage.md %}
{% include_relative _shopping-cart-jwt-local-storage-load.md %}
{% include_relative _oauth-implicit-relogin.md prefix="A while later, the user's JWT expires and the application realizes it is expired. " %}
{% include_relative _move-jwt-from-uri-to-local-storage.md %}
{% include_relative _shopping-cart-jwt-local-storage-load.md %}
{% include_relative _forums-initialize-sso.md %}
{% include_relative _check-local-storage.md %}
{% include_relative _oauth-implicit-relogin.md %}
{% include_relative _move-jwt-from-uri-to-local-storage.md %}
{% include_relative _forums-jwt-load.md %}
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is less secure than other workflows because it is storing the user's JWT in local storage. While local storage provides convenient storage for single-page applications, any JavaScript running on the page has access to it. If an attacker can inject JavaScript into the page, they can begin stealing user's JWTs. The attacker might introduce JavaScript into an open source project through obfuscated code or through a backend exploit of some kind. Many platforms like Wordpress also allow plugins to add JavaScript includes to websites as well. Therefore, ensuring that your JavaScript is secure can be extremely difficult.

This workflow might still be a good solution for some applications. Developers should just weigh the risks associated with JWTs accessible to JavaScript versus the other workflows we have documented.

Additionally, since this workflow does not use refresh tokens (and cannot use refresh tokens according to the specification). Therefore, when the user's session expires, they will need to log into the application again. This could be an automatic login, but it still requires the browser to take the user to the FusionAuth OAuth interface.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)

[_View All Types_](/articles/logins/types-of-logins)
