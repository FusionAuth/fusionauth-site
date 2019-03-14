---
layout: article
title: OAuth authorization code grant 
subtitle: Using sessions 
description: An explanation of webapp login using a native login form that submits to the application backend and uses server-side sessions
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

{% plantuml _diagrams/logins/webapp/oauth-authorization-code-grant-sessions.plantuml %}

## Explanation

Coming soon

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)