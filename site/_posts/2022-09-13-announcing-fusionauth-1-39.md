---
layout: blog-post
title: Announcing FusionAuth 1.39
description: This release includes better support for JSON patch, SCIM, and locales, as well as bug fixes.
author: Dan Moore
image: blogs/release-1-39/fusionauth-1-39.png
category: blog
tags: topic-webhook
excerpt_separator: "<!--more-->"
---

We're excited to announce the version 1.39.0 release of FusionAuth. It shipped on Sep 12, 2022. This release includes better support for JSON patch, SCIM, and locales.

<!--more-->

There are a number of new features, enhancements, and bug fixes. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-39-0) for a full breakdown of the changes between 1.38 and 1.39, including any schema changes. 

I wanted to call out a few highlights.

## Patch support

With this release, FusionAuth now supports three kinds of `PATCH` operations. `PATCH` is an HTTP verb which updates an object, but unlike the `PUT` verb, doesn't expect the entire object's state to be delivered to it. Instead, only the state that was provided will be changed.

For instance, if you have a user with id `fff92906-68c4-4453-b126-46344bb7f7ca` with a `firstName` field of "Richard", you can change their name to "Rick" using an API call like:

```
API_KEY=...

curl -H 'Authorization: '$API_KEY \
     -X PATCH \
     -H 'Content-Type: application/json' \
     https://local.fusionauth.io/api/user/fff92906-68c4-4453-b126-46344bb7f7ca \
     -d '{"user": {"firstName": "Rick" }}'
```

This works great for primitive values, but for arrays and objects, it's more complicated. Suppose you have a group "Paid employees" with roles of "ceo" and "dev", like displayed below:

{% include _image.liquid src="/assets/img/blogs/release-1-39/paid-employees-group.png" alt="A group of employees that are paid." class="img-fluid" figure=true %}

And here's the JSON for that group:

```json
{
  "group": {
    "data": {},
    "id": "e7f92906-68c4-4453-b126-46344bb7f7ca",
    "insertInstant": 1663011117188,
    "lastUpdateInstant": 1663012776313,
    "name": "Paid employees",
    "roles": {
      "85a03867-dccf-4882-adde-1a79aeec50df": [
        {
          "id": "a9a4e5f8-f834-48e3-aa28-309b0b8e6a0a",
          "insertInstant": 1663010341637,
          "isDefault": false,
          "isSuperRole": false,
          "lastUpdateInstant": 1663010341637,
          "name": "ceo"
        },
        {
          "id": "03b57acd-2aa7-4603-b3b3-3c4f8ddde235",
          "insertInstant": 1663010341637,
          "isDefault": false,
          "isSuperRole": false,
          "lastUpdateInstant": 1663010341637,
          "name": "dev"
        }
      ]
    },
    "tenantId": "30663132-6464-6665-3032-326466613934"
  }
}
```

What would you need to do if the group roles needed to change? Suppose you needed to remove the "dev" role from the "Paid employees" group? Should you send a new array? Send the roles to be deleted? Something else? 

According to the [Group API](/docs/v1/tech/apis/groups#update-a-group), you need to send JSON that looks like this:

```json
{
  "roleIds": [
    "a9a4e5f8-f834-48e3-aa28-309b0b8e6a0a"
  ]
}
```

Prior to this release, there was one recommended option, which was to request the group JSON, remove the role from the `roleIds` array, and use `PUT` to update the entire group. A `PATCH` request would be ignored.

But now there's a few additional choices. The first is to use [RFC 6902 JSON Patch](https://www.rfc-editor.org/rfc/rfc6902). You can use this by setting the `Content-Type` to `application/json-patch+json`. With this functioanlity, you have fine grained control over the JSON object, and can move, replace or add fields.

Here's how you'd update the group to only have the "ceo" role:

```
API_KEY=...
curl -H 'Authorization: '$API_KEY \
     -X PATCH \
     -H 'Content-Type: application/json-patch+json' \
     https://local.fusionauth.io/api/group/e7f92906-68c4-4453-b126-46344bb7f7ca \
     -d '[{ "op": "add", "path": "/roleIds", "value": [ "a9a4e5f8-f834-48e3-aa28-309b0b8e6a0a"] }]'
```

This sets the value of `roleIds` entirely with the array contained in the `value` field. This has the benefit of being precise, but the downside of requiring a new set of operations which are only vaguely related to the structure of the object being changed.

The other option is to use [RFC 7396 JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396). This is a more straightforward way to update complex JSON objects. You can use this by setting the `Content-Type` to `application/merge-patch+json`. With this functioanlity, you can modify JSON fields in a more intuitive manner.

```
API_KEY=...
curl -H 'Authorization: '$API_KEY \
     -X PATCH \
     -H 'Content-Type: application/merge-patch+json' \
     https://local.fusionauth.io/api/group/e7f92906-68c4-4453-b126-46344bb7f7ca \
     -d '{"roleIds": ["a9a4e5f8-f834-48e3-aa28-309b0b8e6a0a"]  }'
```

You can continue to use `PATCH` with a `Content-Type` of `application/json` if you want the previous behavior, which was to append values to objects and arrays. At the time of writing, the client libraries continue to use this previous `PATCH` method.

## SCIM support

While SCIM was released in version 1.36, there were some gaps that prevented interoperability with two of the larger SCIM providers: Azure AD and Okta.

As a reminder, SCIM is a standard which handles a different part of the auth process from OIDC and SAML. The former handles creation, updating and deletion of user accounts, where the latter two handle authentication and authorization. In other words, SCIM creates the user account, and then OIDC lets the user log in to that account.

With this release you can now provision and deprovision users from these identity stores into FusionAuth. There are a number of scenarios where that functionality would be useful.

* When your customers are businesses with a centralized user store. In this situation, your customers may want to control access to their instance of your application by using SCIM to set up accounts. This way, when an employee leaves the customer, their account will be automatically removed from FusionAuth.
* When you need to ensure your employees have access to your custom application. When a new employee is added into your Azure AD directory, SCIM can provision them into the custom application.

With this release, you can use the power of FusionAuth for your CIAM needs, but ensure that FusionAuth is in sync with the Okta and Azure AD directories that you or your customer depend on to manage employees.

## Improved locale support

[FusionAuth supports localization](/docs/v1/tech/core-concepts/localization-and-internationalization), including on the hosted login pages. These pages help take common auth related workflows off your plate, and with localization they can do so in a number of languages ([16 at last count](https://github.com/FusionAuth/fusionauth-localization/)).

This release improves support in a few ways, but the most prominent is that when you request the hosted login pages with locale parameter, FusionAuth now persists that choice so that if a user immediately submits the form and there are errors, the error messages are rendered in the correct language.

## The rest of it

There were 12 issues, enhancements, and bug fixes included in this release. A selection not mentioned above includes:

* Support for the `en_GB` time and date format in the administrative user interface.
* Improved feedback when an API request is made without the correct `Content-Type` header.
* Group application roles are no longer removed during a `PATCH` request to [`/api/group/{groupId}`](/docs/v1/tech/apis/groups#update-a-group)

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-39-0).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-39-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
