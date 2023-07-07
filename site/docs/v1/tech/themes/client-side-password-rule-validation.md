---
layout: doc
title: Client Side Password Rule Validation
description: Configuring FusionAuth to check passwords client side
navcategory: customization
---

FusionAuth checks all password rules in serverside validation, but you can also check them client side.

{% comment %}
This page is pulled from a GH subdirectory, ensuring that the code can be ran and updated easily.
{% endcomment %}

{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-scripts/master/client-side-password-rules/README.md %}

## JavaScript code

Here's the example code.

```
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-scripts/master/client-side-password-rules/FusionAuthPasswordChecker.js %}
```
