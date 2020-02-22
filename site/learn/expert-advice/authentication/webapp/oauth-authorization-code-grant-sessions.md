---
layout: advice
title: Webapp OAuth login using authorization code grant
subtitle: Using sessions
description: An explanation of webapp login using FusionAuth OAuth interface with the authorization code grant and uses server-side sessions
header_dark: true
image: advice/types-of-logins-article.png
category: Authentication
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

{% plantuml _diagrams/learn/expert-advice/authentication/webapp/oauth-authorization-code-grant-sessions.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _oauth-login-store.md %}
{% include_relative _create-session.md %}
{% include_relative _shopping-cart-session-redirect.md %}
{% include_relative _shopping-cart-session-load.md %}
{% include_relative _shopping-cart-session-relogin.md %}
{% include_relative _oauth-login-forums.md %}
{% include_relative _create-session.md %}
{% include_relative _forums-session-redirect.md %}
{% include_relative _forums-session-load.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This a safe and feature rich login workflow in FusionAuth. It has the benefit that passwords are only ever provided directly to FusionAuth. It also has the benefit of full SSO capabilities when the user is automatically logged into the forum application by FusionAuth. The downside of this workflow is that the sessions might be shorter lived than refresh tokens, forcing the user to login more regularly. If this is the preferred behavior, than this workflow might be the best fit.  

## APIs used

Here are the FusionAuth APIs used in this example:

* [/oauth2/authorize](/docs/v1/tech/oauth/endpoints#authorize)

[_View All Types_](/learn/expert-advice/authentication/login-authentication-workflows)
