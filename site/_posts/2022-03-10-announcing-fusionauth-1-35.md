---
layout: blog-post
title: Announcing FusionAuth 1.35
description: This release includes bug fixes, internal updates, and support for HTTP requests in FusionAuth lambdas.
author: Dan Moore
image: blogs/release-1-35/product-update-fusionauth-1-35.png
category: blog
tags: topic-troubleshooting feature-advanced-threat-detection topic-lambda
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.35 of FusionAuth. This version shipped Mar 9, 2022. 1.35 includes bug fixes, internal updates, and support for HTTP requests in FusionAuth lambdas.

<!--more-->

This release contained features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-35-0) for a full breakdown of the changes between 1.34 and 1.35. 

There are a few improvements that I wanted to call out specifically.

## HTTP requests in lambdas

This is an [oft-requested feature](https://github.com/FusionAuth/fusionauth-issues/issues/267) which allows for complex integrations by allowing a lambda to retrieve data from external URLs.

As a reminder, FusionAuth lambdas are snippets of JavaScript executed at various points in the auth lifecycle, including:

* Before a JWT is generated when a user has logged in.
* After a response is received from an Identity Provider such as Google or a SAML IdP.
* Before a JWT is issued in a Client Credentials grant.
* After user data has been retrieved from an LDAP server using a Connector.

In all of these scenarios, integration with additional data sources or logic may be required or useful. This includes:

* Adding custom claims based on business logic specific to the user and application, encapsulated by an API.
* Calling IdP endpoints to retrieve additional data, such as the Microsoft Graph API endpoints.
* Calling a FusionAuth API. One example would be retrieving group names and adding them to a token.

This is all possible with this release, because you can now make arbitrary HTTP requests within your lambda. This allows you to integrate any API or enterprise systems into various login flows.

Here's example code, which retrieves a random Marvel movie quote from an unauthenticated API:

```javascript
var response = fetch("https://randommarvelquoteapi.herokuapp.com/", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
});
```

The request includes headers, so you may access any private APIs that are secured by an API key. You can make multiple requests to the same or different servers from within one lambda. You can also use other HTTP methods such as `POST`, allowing you to modify external databases during a lambda execution.

The `response` object includes the body, status and headers. You can check to see if the API call succeeded and perform logic based on the response status. 

Below we add the retrieved quote to the JWT claims, because who doesn't love a good movie quote?

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

However, you must use the new GraalJS execution engine for this functionality.

This feature is available for users on Essentials or Enterprise edition. Learn more about these editions by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## Internal upgrades

1.35 and future versions of FusionAuth will ship with the GraalJS JavaScript execution engine. The sole JavaScript execution engine for previous versions was Nashorn, which has been [heading toward deprecation and removal from the JDK for a while](https://openjdk.java.net/jeps/335).

GraalJS is a FusionAuth [tech preview feature](/docs/v1/tech/core-concepts/roadmap#tech-preview-features) at the moment. This means that, while the FusionAuth team will always strive for backward compatibility, there may be some changes required as we receive feedback from users and customers. In addition, GraalJS doesn't currently have the [performance optimizations of Nashorn](https://github.com/FusionAuth/fusionauth-issues/issues/571#issuecomment-1061614065), so when using it, benchmark your system to ensure it meets your needs.

The benefits of GraalJS include the ability to make HTTP requests as mentioned above and long-term support for a more modern version of JavaScript. While there is no internal timeline to remove Nashorn, it is recommended that you migrate your lambdas to GraalJS once it is out of tech preview.

You can choose which engine to use on a per lambda basis, via the administrative user interface as below, or via the API:

{% include _image.liquid src="/assets/img/blogs/release-1-35/lambda-engine-choice.png" alt="Choosing an engine type for your lambda." class="img-fluid" figure=true %}

You can also switch between the two engines if needed. However, functionality such as HTTP requests will be limited to code running under GraalJS.

## The rest of it

There were 6 issues, enhancements and bug fixes included in this release. A selection of these include:

* A fix for the `startup.bat` Windows startup script
* A bugfix for the passwordless flow to make it more robust when expected parameters are missing

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-35-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
