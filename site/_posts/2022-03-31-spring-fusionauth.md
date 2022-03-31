---
layout: blog-post
title: "Spring Framework CVE: How it affects FusionAuth (TLDR: It doesn't)"
description: FusionAuth does not use Spring and is not affected by CVE-2022-22965
author: Dan Moore
image: blogs/fusionauth-log4j-cve/log4j-cve-how-it-affects-fusionauth-tldr-it-doesnt-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

The recent announcement of [CVE-2022-22965](https://tanzu.vmware.com/security/cve-2022-22965), which means "a Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution (RCE) via data binding," has some folks asking if FusionAuth is affected. This CVE is also known as the "Spring4Shell" vulnerability.

FusionAuth is not affected by this vulnerability in Spring. FusionAuth uses a different MVC framework, [Prime](https://github.com/prime-framework/prime-mvc), so there is no way that any FusionAuth applications could be compromised. 

<!--more-->

{% include _callout-important.liquid content="FusionAuth is not affected by this vulnerability." %}

Spring is a popular application framework and is used in many Java projects, both open source and commercial. When a CVE like this comes out, it makes sense to check all of your applications for the issue. Security is important to us and we understand why customers and users would reach out about this.

In conclusion, FusionAuth is *not affected by the Spring vulnerability*.

To learn more about the CVE, you can:

* visit the [CVE description](https://tanzu.vmware.com/security/cve-2022-22965)
* review a [detailed report about the vulnerability](https://spring.io/blog/2022/03/31/spring-framework-rce-early-announcement)
* participate in the [HackerNews discussion](https://news.ycombinator.com/item?id=30871128)

## A bit more about security and FusionAuth

Beyond this specific vulnerability, we want to assure readers that FusionAuth takes security very seriously. 

This commitment includes, but is not limited to:

* a [responsible disclosure program](/security)
* regular penetration tests
* security disclosures in our extensive [release notes](/docs/v1/tech/release-notes)


