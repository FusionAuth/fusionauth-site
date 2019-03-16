---
layout: article
title: Single-page application OAuth login using implicit grant 
subtitle: Using JWTs 
description: An explanation of single-page application login using FusionAuth OAuth interface with the implicit grant and uses JWTs in local storage
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

{% plantuml _diagrams/logins/spa/oauth-implicit-grant-jwts-local-storage.plantuml %}

## Explanation

Coming soon

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)