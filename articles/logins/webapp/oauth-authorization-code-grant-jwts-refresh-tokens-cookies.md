---
layout: article
title: OAuth authorization code grant 
subtitle: Using JWTs and refresh tokens 
description: An explanation of webapp login using a native login form that submits to the application backend and uses JWTs and refresh tokens in cookies
image: articles/logins.png
---

{% capture native_intro %}
{% include_relative _oauth-intro.md %}
{% endcapture %}
{{ native_intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml _diagrams/logins/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

Coming soon

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)