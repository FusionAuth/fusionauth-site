---
layout: advice
title: Single-page application OAuth login using authorization code grant with sessions
description: An explanation of single-page application login using FusionAuth OAuth interface with the authorization code grant with server-side sessions
image: advice/header.png
category: Authentication
author: Brian Pontarelli
date: 2019-11-04
dateModified: 2019-11-04
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

{% plantuml source: _diagrams/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-sessions.plantuml, alt: "Single page application OAuth 2 Authorization Code Grant with server-side sessions diagram" %}

## Explanation

{% capture steps %}
{% include_relative _oauth-login-store.md %}
{% include_relative _create-session.md %}
{% include_relative _shopping-cart-session-response-oauth.md %}
{% include_relative _shopping-cart-session-load.md %}
{% include_relative _shopping-cart-session-relogin.md %}
{% include_relative _oauth-login-forums.md %}
{% include_relative _create-session.md %}
{% include_relative _forums-session-response-oauth.md %}
{% include_relative _forums-session-load.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This a safe and feature rich login workflow in FusionAuth. It has the benefit that passwords are only provided directly to FusionAuth. It also has the benefit of full SSO capabilities when the user is automatically logged into the forum application by FusionAuth. The downside of this workflow is that the sessions might be shorter lived than refresh tokens, forcing the user to login more regularly. If this is the preferred behavior, than this workflow might be the best fit.  

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
