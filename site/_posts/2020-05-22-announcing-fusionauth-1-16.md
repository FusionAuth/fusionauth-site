---
layout: blog-post
title: Announcing FusionAuth 1.16
description: The FusionAuth 1.16 Release allows you search provider flexibility, a smaller Docker image and more.
author: Pete Geoly
image: blogs/news/blog-fusionauth-1-16.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.16. The 1.16.1 release shipped on May 18, 2020. The 1.16.x versions deliver innovations across the FusionAuth platform as well as including fixes that solve several issues for users on version 1.15 and older.

<!--more-->

## Highlights

The big news is you can now run FusionAuth without ElasticSearch. ElasticSearch is still supported and is a great option if you need to support searching hundreds of thousands of users or complex search operations. But if you have fewer users, using the new database search makes deployments, upgrades, and operation of FusionAuth simpler. And if you end up needing the flexibility of ElasticSearch, it’s easy to swap out the FusionAuth search provider. You can switch back and forth easily with not much more than a re-index.
 
If you are using ElasticSearch, we now support ElasticSearch version 7. We continue to support version 6 as well.

You can view the system logs right in the administration user interface. This is useful for troubleshooting.
 
If you are one of our happy Docker users, you may have noticed smaller images. We spent some time tuning our Docker build and decreased our image size by approximately 50% when compared to the latest 1.15.x image.

You can now test your SMTP settings in the "Tenants" / "Email" section of the administration user interface. This allows you to test settings used to send email by sending a message to an email address you specify.

And of course there are over 15 bugs squashed and GitHub issues resolved as well. 

Please see the [release notes](https://fusionauth.io/docs/v1/tech/release-notes) for the full breakdown of the changes between 1.15 and 1.16.

If you'd like to upgrade your version, please see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to check out FusionAuth, [download it today for free](/download).

