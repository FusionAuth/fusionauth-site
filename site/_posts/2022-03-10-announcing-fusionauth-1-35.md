---
layout: blog-post
title: Announcing FusionAuth 1.35
description: This release includes bug fixes, internal updates, and support for API calls in FusionAuth lambdas.
author: Dan Moore
image: blogs/release-1-35/product-update-fusionauth-1-35.png
category: blog
tags: tbd topic-troubleshooting feature-advanced-threat-detection
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.35 of FusionAuth. This version shipped Mar 9, 2022. 1.35 includes bug fixes, internal updates, and support for API calls in FusionAuth lambdas.

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-35-0) for a full breakdown of the changes between 1.34 and 1.35. 

There are a few improvements that I wanted to call out specifically.

## API calls within lambdas

This is an [oft-requested feature](https://github.com/FusionAuth/fusionauth-issues/issues/267) which allows for complex integrations by allowing a lambda to retrieve data from external URLs.

As a reminder, FusionAuth lambdas are snippets of JavaScript which are executed at various points in the authentication lifecycle. Such points include:

* Before a JWT is generated when a user has logged in.
* After a response is received from an Identity Provider such as Google or a SAML IdP. This is termed a "reconciliation" of the data between the external IdP and FusionAuth.
* Before a JWT is issued for the Client Credentials grant.
* After user data has been retrieved from an LDAP server when using a Connector.

In all of these scenarios, integration with additional data sources may be required. This includes:

* Adding custom claims based on business logic specific to the user and application, encapsulated by an API.
* Calling addition IdP endpoints to retrieve additional data during a user reconcile, such as Microsoft graph endpoints.
* Augmenting token data with information from FusionAuth, such as the name of any groups of which a user is a member.

This is all possible now, because you can make arbitrary API calls from within your lambda. This allows you to integrate any API or enterprise systems into the various login flows.

Here's example code, which fetches a random Marvel movie quote from an unauthenticated API:

```javascript
var response = fetch("https://randommarvelquoteapi.herokuapp.com/", {
                                  method: "GET",
                                  headers: {
                                    "Content-Type": "application/json"
                                  }
                                });
```

The request can include headers, so you can access any private APIs secured by an API key. You can make multiple requests to the same or different servers. You can also use other HTTP methods such as `POST`, allowing you to modify external systems within a lambda.

The `response` object includes the body, status and headers. You can check to see if the API call succeeded and perform logic based on teh response status. Below we add the quote to the JWT claims, because who doesn't love a good movie quote?

```javascript
if (response.status === 200) {
  var quoteBody = JSON.parse(response.body);
  jwt.quote = quoteBody.quote;
} else {
  jwt.quote = "n/a";
}
```

You can manage these lambdas via the administrative user interface, as below, or [the Lambda API](/docs/v1/tech/apis/lambdas).

{% include _image.liquid src="/assets/img/blogs/release-1-35/api-requests-lambda.png" alt="Lambda which makes API requests." class="img-fluid" figure=true %}

You must use the GraalJS execution engine (see below for more details) for this functionality.

This feature is available for users on the Essentials or Enterprise editions. You can learn more about these editions by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## Internal upgrades

For a number of reasons, this and future versions of FusionAuth will ship with the GraalJS JavaScript execution engine. The previous execution engine was Nashorn, which has been [heading toward deprecation and removal for a while](https://openjdk.java.net/jeps/335).

GraalJS is a [tech preview feature](/docs/v1/tech/core-concepts/roadmap#tech-preview-features) at the moment. This means that, while the FusionAuth team will strive for backward compatibility, there may be some changes required. In addition, GraalJS doesn't have the [performance optimizations currently available for Nashorn](https://github.com/FusionAuth/fusionauth-issues/issues/571#issuecomment-1061614065), so make sure to benchmark your system to ensure it meets your needs.

The benefits of GraalJS include the ability to use `fetch` as mentioned above and long-term support for a more modern version of JavaScript. While there is no internal timeline to remove Nashorn support, it is recommended that you migrated GraalJS once it is out of tech preview.

You can choose which engine to use on a per lambda basis:

{% include _image.liquid src="/assets/img/blogs/release-1-35/lambda-engine-choice.png" alt="Choosing an engine type for your lambda." class="img-fluid" figure=true %}

## The rest of it

There were 6 issues, enhancements and bug fixes included in this release. A selection of these include:

* A fix for the `startup.bat` Windows startup script
* A fix for the passwordless flow to make it more robust when expected parameters are missing

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-35-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
