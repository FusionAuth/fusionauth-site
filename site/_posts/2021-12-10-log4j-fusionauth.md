---
layout: blog-post
title: "log4j CVE: How it affects FusionAuth (TLDR: It doesn't)"
description: FusionAuth does not use log4j and is not affected by CVE-2021-44228
author: Dan Moore
image: blogs/fusionauth-log4j-cve/log4j-cve-how-it-affects-fusionauth-tldr-it-doesnt-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

The recent announcement of [CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228), which allows for "arbitrary code loaded from LDAP servers when message lookup substitution is enabled" through a vulnerability in log4J has many people double checking the dependencies of their Java applications.

FusionAuth is not affected by this vulnerability in log4j. FusionAuth uses a different logging framework, [logback](http://logback.qos.ch/), so there is no way that any FusionAuth applications could be compromised. 

<!--more-->

{% include _callout-important.liquid content="FusionAuth is not affected by this vulnerability." %}

log4j is a popular logging framework and is used in many Java projects, both open source and commercial. When a CVE like this comes out, it makes sense to check all of your applications for the issue. Security is important to us and we understand why customers and users would reach out about this.

Beyond not using the log4j framework, recent FusionAuth releases run on Java versions that are not susceptible to this. The 1.32 release runs Java 17 and previous releases ran Java 14.

In conclusion, FusionAuth is *not affected by the log4j vulnerability*.

To learn more about the CVE, you can:

* visit the [NIST CVE description](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
* a [detailed report about the vulnerability](https://www.lunasec.io/docs/blog/log4j-zero-day/)
* the [hackernews discussion](https://news.ycombinator.com/item?id=29504755)

## A bit more about security and FusionAuth

Beyond this specific vulnerability, I want to assure readers that FusionAuth takes security very seriously. 

This commitment includes, but is not limited to:

* a [responsible disclosure program](/security/)
* regular penetration tests
* security disclosures in our extensive [release notes](/docs/v1/tech/release-notes/)


