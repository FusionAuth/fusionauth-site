---
layout: article
title: Single-page application native login to FusionAuth 
subtitle: Using JWTs and refresh tokens 
description: An explanation of single-page application login using a native login form that submits directly to FusionAuth and uses JWTs in local storage and refresh tokens in cookies
image: articles/logins.png
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

{% plantuml _diagrams/logins/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies.plantuml %}

## Explanation

Coming soon

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)