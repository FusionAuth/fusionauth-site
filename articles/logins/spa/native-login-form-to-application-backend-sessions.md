---
layout: article
title: Single-page application native login to backend 
subtitle: Using sessions
description: An explanation of single-page application login using a native login form that submits to the application backend and uses server-side sessions
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

{% plantuml _diagrams/logins/spa/native-login-form-to-application-backend-sessions.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _shopping-cart-initialize.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api.md %}
{% include_relative _create-session.md %}
{% include_relative _shopping-cart-session-response.md %}
{% include_relative _shopping-cart-session-load.md %}
{% include_relative _shopping-cart-session-relogin.md %}
{% include_relative _forums-initialize-no-sso.md %}
{% include_relative _check-user.md %}
{% include_relative _render-login-form.md %}
{% include_relative _call-backend-login-api.md %}
{% include_relative _create-session.md %}
{% include_relative _forums-session-response.md %}
{% include_relative _forums-session-load.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. One downside is that the application backend receives passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

Additionally, this workflow requires that the user login each time their session expires. If this is the preferred behavior, than this workflow might be a good fit. 

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)