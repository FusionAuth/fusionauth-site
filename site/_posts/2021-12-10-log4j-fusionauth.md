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

Beyond not using the log4j framework, recent FusionAuth releases run on Java versions that are not susceptible to this CVE. FusionAuth 1.32 release runs Java 17 and previous releases used Java 14.

In conclusion, FusionAuth is *not affected by the log4j vulnerability*.

To learn more about the CVE, you can:

* visit the [NIST CVE description](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
* a [detailed report about the vulnerability](https://www.lunasec.io/docs/blog/log4j-zero-day/)
* the [HackerNews discussion](https://news.ycombinator.com/item?id=29504755)
* [a message from the logback maintainers about this issue](http://mailman.qos.ch/pipermail/announce/2021/000163.html)

## What about Elasticsearch

ElasticSearch is used by many FusionAuth installations. However, in general the ElasticSearch service is not publicly accessible, if [following the recommended security guidance](/docs/v1/tech/installation-guide/securing/).

{% include _callout-important.liquid content="You should never allow internet connections to ElasticSearch." %}

Per the [ElasticSearch documentation](https://discuss.elastic.co/t/apache-log4j2-remote-code-execution-rce-vulnerability-cve-2021-44228-esa-2021-31/291476):

> Elasticsearch is not susceptible to remote code execution with this vulnerability due to our use of the Java Security Manager. Elasticsearch on JDK8 or below is susceptible to an information leak via DNS which is fixed by a simple JVM property change.

There is no vulnerability if you are running in FusionAuth Cloud. Deployments there do not allow external access to the ElasticSearch servers. FusionAuth versions below 1.16.0 are running Java 8. FusionAuth versions between 1.16 and 1.31 are running Java 14. FusionAuth versions 1.32 or greater are running Java 17. If you need specific version information, please [open a support ticket](https://account.fusionauth.io/account/support/).

If you are self-hosting FusionAuth, please review the ElasticSearch guidance and your ElasticSearch and Java configurations to ensure you aren't vulnerable.

## A bit more about security and FusionAuth

Beyond this specific vulnerability, we want to assure readers that FusionAuth takes security very seriously. 

This commitment includes, but is not limited to:

* a [responsible disclosure program](/security/)
* regular penetration tests
* security disclosures in our extensive [release notes](/docs/v1/tech/release-notes/)


