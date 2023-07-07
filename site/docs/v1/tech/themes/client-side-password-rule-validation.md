---
layout: doc
title: Client Side Password Rule Validation
description: Configuring FusionAuth to check passwords client side
navcategory: customization
---

FusionAuth checks all password rules in serverside validation, but you can also check them client side.

{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-scripts/master/client-side-password-rules/README.md %}

## JavaScript code

Here's the example code.

```
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-scripts/master/client-side-password-rules/FusionAuthPasswordChecker.js %}
```
