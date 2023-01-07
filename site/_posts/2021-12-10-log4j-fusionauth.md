---
layout: blog-post
title: "Log4j CVE: How it affects FusionAuth (TLDR: It doesn't)"
description: FusionAuth does not use Log4j and is not affected by CVE-2021-44228
author: Dan Moore
image: blogs/fusionauth-log4j-cve/log4j-cve-how-it-affects-fusionauth-tldr-it-doesnt-header-image.png
category: announcement
tags: log4shell java cve
excerpt_separator: "<!--more-->"
---

The recent announcement of [CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228), which allows for "arbitrary code loaded from LDAP servers when message lookup substitution is enabled" through a vulnerability in log4J has many people double checking the dependencies of their Java applications. This CVE is also known as the "Log4Shell" vulnerability.

FusionAuth is not affected by this vulnerability in Log4j. FusionAuth uses a different logging framework, [Logback](http://logback.qos.ch/), so there is no way that any FusionAuth applications could be compromised. 

<!--more-->

{% include _callout-important.liquid content="FusionAuth is not affected by this vulnerability." %}

Log4j is a popular logging framework and is used in many Java projects, both open source and commercial. When a CVE like this comes out, it makes sense to check all of your applications for the issue. Security is important to us and we understand why customers and users would reach out about this.

In conclusion, FusionAuth is *not affected by the Log4j vulnerability*.

To learn more about the CVE, you can:

* visit the [NIST CVE description](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
* review a [detailed report about the vulnerability](https://www.lunasec.io/docs/blog/log4j-zero-day/)
* participate in the [HackerNews discussion](https://news.ycombinator.com/item?id=29504755)
* read [a message from the Logback maintainers about this issue](http://mailman.qos.ch/pipermail/announce/2021/000163.html)

**Update December 15:** There is an additional related CVE: [CVE-2021-45046](https://nvd.nist.gov/vuln/detail/CVE-2021-45046). This also does not affect FusionAuth because FusionAuth does not use log4j.

## What about Elasticsearch

Elasticsearch is used by many FusionAuth installations. However, in general the Elasticsearch service is not publicly accessible, if [following the recommended security guidance](/docs/v1/tech/admin-guide/securing).

{% include _callout-important.liquid content="You should never allow internet connections to Elasticsearch." %}

Per the [Elasticsearch announcement](https://discuss.elastic.co/t/apache-log4j2-remote-code-execution-rce-vulnerability-cve-2021-44228-esa-2021-31/291476):

> Elasticsearch is not susceptible to remote code execution with this vulnerability due to our use of the Java Security Manager. Elasticsearch on JDK8 or below is susceptible to an information leak via DNS which is fixed by a simple JVM property change.

There is no vulnerability if you are running in FusionAuth Cloud. Deployments there do not allow external access to the Elasticsearch servers. FusionAuth versions between 1.16 and 1.31 are running Java 14. FusionAuth versions 1.32 or greater are running Java 17. If you need specific version information, please [open a support ticket](https://account.fusionauth.io/account/support/).

If you are self-hosting FusionAuth, please review the Elasticsearch guidance and your Elasticsearch and Java configurations to ensure you aren't vulnerable.

**Update December 15:** There is an additional related CVE: [CVE-2021-45046](https://nvd.nist.gov/vuln/detail/CVE-2021-45046). Per the [Elasticsearch announcement](https://discuss.elastic.co/t/apache-log4j2-remote-code-execution-rce-vulnerability-cve-2021-44228-esa-2021-31/291476):

> A further vulnerability (CVE-2021-45046) was disclosed on December 14th after it was found that the fix to address CVE-2021-44228 in Apache Log4j 2.15.0 was incomplete in certain non-default configurations. Our guidance for Elasticsearch and Logstash are unchanged by this new vulnerability and we are currently working to assess other products in order to provide a clear statement.

## A bit more about security and FusionAuth

Beyond this specific vulnerability, we want to assure readers that FusionAuth takes security very seriously. 

This commitment includes, but is not limited to:

* a [responsible disclosure program](/security)
* regular penetration tests
* security disclosures in our extensive [release notes](/docs/v1/tech/release-notes)


