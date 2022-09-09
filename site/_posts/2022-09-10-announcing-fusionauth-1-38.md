---
layout: blog-post
title: Announcing FusionAuth 1.38
description: This release includes bug fixes and group membership webhooks
author: Dan Moore
image: blogs/release-1-38/fusionauth-1-38.png
category: blog
tags: topic-webhook
excerpt_separator: "<!--more-->"
---

We're excited to announce the version 1.38 releases of FusionAuth. These shipped in mid-August, 2022. These releases include bug fixes and group webhooks.

<!--more-->

There are a number of new features, enhancements, and bug fixes. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-38-1) for a full breakdown of the changes between 1.37 and 1.38. 

I wanted to highlight the big addition, which was group webhooks.

## Why use webhooks

It's worth stepping back a bit and talking about why webhooks are so important for FusionAuth. The reason is that FusionAuth is always an architectural component that integrates with other parts of your application. We love FusionAuth but you'd never build an entire application without using other frameworks like Spring, Django or Rails.

This means that FusionAuth needs to play nicely with other pieces of software. We do this in a number of different ways, including:

* Implementing well known standards like [SAML](/docs/v1/tech/samlv2/), [OAuth2, and OIDC](/docs/v1/tech/oauth/).
* APIs for all the things. FusionAuth provides a great default login experience for 80% of use cases, but for the other 20%, you can write your own using our APIs. Results: your UX, our backend implementation.
* A deployment model that [works pretty much everywhere](/docs/v1/tech/installation-guide/), including Docker, Windows, Linux and macOS.
* [Client libraries](/docs/v1/tech/client-libraries/) which let you manage and automate FusionAuth configuration tasks.

But one key integration point are [events](/docs/v1/tech/events-webhooks/) that happen inside FusionAuth. These range from the common, [a user logs in](/docs/v1/tech/events-webhooks/events/user-login-success), to the hopefuly less common, [a user's password is determined to have been compromised](/docs/v1/tech/events-webhooks/events/user-password-breach), to the rare and esoteric, a [JWT signing key is updated](/docs/v1/tech/events-webhooks/events/jwt-public-key-update).

Webhooks also can fail actions. Webhooks that can do this are transactional webhooks. When webhooks are configured to be transactional, if a webhook recipient fails, the action will fail, whether a login, a user create or something else. The user won't be able to log in, or the account won't be created.

Webhooks open up the hood, so to speak, and allow you to build software to take action based on what is happening inside FusionAuth in a robust manner. Through the transaction concept mentioned above, they can also prohibit certain actions.

## Group webhooks

Webhook events for groups were [first requested a few years ago](https://github.com/FusionAuth/fusionauth-issues/issues/633) and were implemented in this release.

There are twelve new webhooks:

* Group Create - when a group is created
* Group Create Complete - when a group is created transaction has completed
* Group Delete - when a group is deleted
* Group Delete Complete - when a group delete transaction has completed
* Group Update - when a group is updated
* Group Update Complete - when a group update transaction has completed
* Group Member Add - when a user is added to a group
* Group Member Add Complete - when a user is added to a group and the transaction has completed
* Group Member Remove - when a user is removed from a group
* Group Member Remove Complete - when a user is removed from a group and the transaction has completed
* Group Member Update - when a group membership is updated
* Group Member Update Complete - when a group membership update transaction has completed

You can view more in the [Events and Webhooks](/docs/v1/tech/events-webhooks/events/) documentation.

## How you might use these webhooks

There are a number of possible scenarios where these can be helpful.

If you are managing groups in FusionAuth and another place, you can use these webhooks to help sync up the two systems. When a group is added in FusionAuth, you can create a group in the other system. If you want to sync the other way, from the other system to FusionAuth, use the [Group APIs](/docs/v1/tech/apis/groups) to do so.

You can also audit group membership. There's an [example application](https://github.com/FusionAuth/fusionauth-example-lambda-webhook) to listen for FusionAuth webhooks and store the resulting JSON to Amazon S3. In this scenario, you could capture every time a user is added or removed from a group, the date and time it happened, and IP address or location information related to that change. Since groups are often used to give users permissions (who among us hasn't at one time been a member of the proverbial `admin` group?), tracking such changes can help improve your security awareness.

## The rest of it

There were 7 issues, enhancements, and bug fixes included in this release. A selection of these not mentioned above includes:

* A fix for the `Content-type` header for CSS and JavaScript files hosted by FusionAuth.
* Potential deadlock resolution in the case where a webhook receiver triggers another webhook.
* Some cleanup around the Netty changes in the 1.37 release.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-38-1).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-38-1) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
