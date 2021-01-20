---
layout: blog-post
title: Why outsource your auth system?
description: What are the primary considerations when making your decision about whether to outsource your user management, authorization, and authentication system?
image: blogs/why-outsource-auth/why-outsource-your-auth-system.png
author: Joe Stech
category: blog
excerpt_separator: "<!--more-->"
---

You're a software engineering leader, and you're great at your job. You know that the optimal path for software development lies in figuring out which components of your design to implement from scratch and which have already been implemented by specialists and can be reused. 

<!--more-->

You also know that these aren't decisions that you can only make once -- you have to keep reevaluating based on environment changes and the needs of new products.

Authentication is one of those components that you deal with all the time. Auth is a necessary part of any software product, but how you implement auth is not necessarily always the same. Careful consideration is needed, because your decision to outsource will not only impact speed of development, but also long-term product maintenance -- you don't want to slow down time to market because you re-implemented an entire auth system unnecessarily, but you also don't want to use an auth system that is going to cause problems down the road. 

So what are the primary considerations when making your decision?

## Speed to market

This is the most obvious consideration. Depending on the features you need, it could literally take months to implement auth in-house, whereas it could take less than a day to incorporate an outsourced solution. 

You could say "but what if we only need a bare-bones implementation? Some salted hashes in a database and we're good to go!" That's a totally valid point, and if you don't anticipate needing sophisticated auth features then your best bet might be to do a quick in-house implementation and move on. 

However, time and time again I've seen product developers underestimate the sophistication of features that will be required when their userbases grow. Most of the time development organizations then fall prey to the sunk costs fallacy and double down on augmenting their in-house solution, even when it may be more efficient to abandon the home-grown effort and replace it with an outsourced solution. This will cause huge issues for maintainability, which I'll talk about further below.

## Consequences of an auth breach

Planning for the worst possible case can prevent total financial ruin for your company or division. If a breach of security happens and PII (Personally Identifiable Information) is leaked from your in-house auth system, it can not only cause your company reputational damage but also significant financial penalties (not to mention potential jail time if you try to cover up the breach).

If you outsource your auth system you can limit your liability, and also protect your reputation -- if there is a breach on your auth provider's side, it's likely that the breach will extend beyond your company. A breach in an outsourced auth provider that is used by many different companies will be big news, and customers will be more likely to forgive you for making a mistake in your choice of auth provider than for implementing a poor auth system yourself.

A not-insignificant addendum is that I believe your in-house system is much more likely to suffer a breach than an outsourced provider who is an expert in security. I have no studies to support this claim, but I have never seen a major auth provider compromised, and I've definitely seen companies suffer breaches due to their own in-house auth implementations -- [this article discusses a compilation of 21 million plaintext passwords collected from various breaches](https://arstechnica.com/information-technology/2019/01/hacked-and-dumped-online-773-million-records-with-plaintext-passwords/) wherein passwords were not hashed and salted by auth systems. 

Properly storing passwords is an incredibly low bar, and yet companies that manage their own auth still do it incorrectly all the time.

## Consequences of an auth outage

While less damaging than breaches, outages can still cause reputational damage and liability issues if your SLAs make uptime guarantees. Similarly to breaches, if you outsource your auth system it's likely that any auth outage will extend beyond your company. 

As an example, when Microsoft's Azure Active Directory (AAD) [went down for a good portion of the afternoon late last year](https://www.zdnet.com/article/microsofts-azure-ad-authentication-outage-what-went-wrong/), logins for applications across the internet stopped working. 

When your competitors' authorization systems are down at the same time yours are, nobody blames you for it, but when you're the only company having issues, you suffer reputationally. No matter what your outsourced auth system is (FusionAuth, Cognito, AAD, etc), you can be almost certain that you won't be alone in the event of an outage.

## Maintainability

There are trade-offs here. The benefits to an in-house system include:

* Your engineers can design the exact system to fit your needs, and you'll have unrestricted ability to add very specific features if requirements change over time.
* If the same engineers who built the system are maintaining it, then they'll have the context required to anticipate issues as they add features.

However, the drawbacks can be large:

* Complex new features can take significant time to build. Outsourced auth systems likely have these features already built (things like multi-factor authentication, user management interfaces, analytics and audit logs, and brute force hack detection, among others).
* With an in-house solution, you'll have to budget time to monitor new security threats and patch your system in a rapidly evolving threat landscape.
* You won't get the benefits of a dedicated team that are constantly improving your auth system. This is actually a bigger deal than it seems, because if you outsource auth then other companies will also be filing issue reports and feature requests on your behalf, so you reap the benefits of those extra eyes as well.
* In the case of mergers or acquisitions, an in-house solution is likely to be terrible at combining different databases of users and managing things like duplicates or incomplete data. Such enterprise identity unification efforts can founder on internal auth systems. FusionAuth, on the other hand, supports modeling different user bases with tenants. 

## Cost of In-House vs Outsourced Auth

When building an in-house auth system your costs are all ostensibly sunk (engineer salaries). However, if building your system in-house delays time to market or prevents creation of other features, the build could cost you a significant amount of real income. There will also be on-going maintenance costs with an in-house solution. 

When making cost calculations, you should compare:

**Revenue lost by slower time-to-market PLUS engineering cost to implement in-house solution PLUS on-going maintenance costs of in-house solution PLUS increased risk of data breach PLUS increased risk of outage PLUS increased risk during a merger or acquisition**

vs 

**The monthly cost incurred by an outsourced provider PLUS the lack of complete control**

When evaluating different auth providers, you'll also want to consider whether an outsourced provider charges on a sliding scale based on number of users or if the cost is fixed. AWS Cognito, for instance, will continue to charge more as your application gains more users. FusionAuth, in contrast, has options that charge a single rate for unlimited users. If your app is small and you don't expect it to grow much, a sliding scale may be better for you. If you don't want a large unexpected bill as you gain more users, a provider that allows for fixed costs may be more appealing.

## Auth may be unrelated to your core competency

As a final consideration, you may want to evaluate if your engineers even have the ability to implement a secure in-house auth system without a significant investment in education. This is something that many leaders dismiss, since they have great faith in the intelligence and skill of their people. 

However, knowledge and intelligence aren't the same, and just because your engineers are capable of becoming auth experts doesn't mean you want them to spend the time to do so. 

As an engineering leader, you have a responsibility to ensure that your engineers are spending their time on efforts that will optimally contribute to the long-term success of your organization. Auth is a necessary component, but is it really a differentiator for your application?

Only you have the context to make the best decisions for your company, but I hope this article has helped you think through some of the considerations involved in outsourcing your auth.

