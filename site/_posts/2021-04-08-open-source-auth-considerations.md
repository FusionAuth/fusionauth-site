---
layout: blog-post
title: Open source auth provider considerations
description: Some of the pros and cons of open-source auth providers.
author: Keanan Koppenhaver
image: blogs/try-before-you-buy/how-to-get-the-most-out-of-a-free-auth-provider-trial-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

Open-source authentication providers are popular because anyone can review much or all of the code that powers them. This availability can be especially helpful in evaluating whether a particular authentication provider will work for your use case. In addition, if you want the source code for any number of reasons (e.g., the provider could go out of business or get acquired), open source is basically tailor-made for that. 

<!--more-->

But while open-source providers do have some benefits over proprietary authentication providers, there are some downsides as well.

_This blog post is an excerpt from [Open Source vs Commercial Auth Providers](/learn/expert-advice/identity-basics/open-source-vs-commercial/)._

### Support

For solutions that are truly free and open source, often the only support avenue available is submitting a detailed issue via the project's issue tracker and hoping one of the project maintainers gets back to you. The timeline for this is very undefined, and many open-source maintainers are overwhelmed with the volume of issues that projects get. This can be problematic for something as crucial to an application as an authentication provider, but that's the tradeoff for getting something completely free.

On the plus side, many open-source projects have started introducing paid support tiers, often provided by an affiliated company. If you choose to go with this option, you don't get the product entirely for free, but you usually get an SLA with not only guaranteed support but a guaranteed response time as well. You'll have peace of mind knowing someone knowledgeable about the product is ready and able to answer your questions in a timely manner.

### Release Frequency

How frequently product updates are released really depends on the project, but there are two benefits that open-source providers have over closed-source providers in this case.

First, you can look back at the entire release history and see how frequently releases and updates have happened in the past. Have they shipped one major version a year for the past two or three years? Odds are this will continue. Has the project been dormant for the last couple years? History isn't a perfect predictor, and they _may_ have been working on a huge new release all this time, but that's not a good sign.

And second, open-source projects tend to "work in public," meaning discussions about release frequency, notes from planning meetings, and more may be publicly accessible. Depending on how the project is structured, you may even be able to be part of these meetings. Some projects have this information in their README file or some similar place. You'd rarely get this kind of transparency with a more proprietary provider. 

However, it is worth noting the distinction between open source and open process. A project can be open source but take no feedback from the community; some of Apple's open source projects are like this. On the other hand, commercial software companies can develop “in the open” and even make the source available for inspection using source-available licenses, without allowing for the freedoms that are key to open source licensing. When you evaluate an open-source project, make sure you know what the community feedback process is, if any.

### Relicensing

Most open-source projects of any size have the license for the project publicly available, so you can quickly determine whether those license terms will work for you. It's important to review this carefully, as some projects specify that any project that uses them must _also_ be open source, which might be a deal breaker for you and your team. One common license, the GPL, has this restriction.

Some open-source projects, especially if they are backed by a company, support dual licensing. This means that you can choose one license or another as fits your business model. The first license may be the GPL or a similar restrictive license, while the other may be a commercial license with fewer restrictions that costs money. 

Always review the license for any auth system you are considering before moving forward.

### Maintenance Responsibility

In a true open-source solution, the "community" is responsible for submitting fixes they want to see included in the project. Feature requests from the community tend to need to be contributed to by the community itself, meaning you as the customer bear more of the maintenance burden. The amount of testing done for a new release varies based on the effort the community puts forth.

On the flip side, it could mean you have more say in the product roadmap if you're able to contribute fixes in a way that is acceptable to the community. Heck, you could even pay a developer to spend most of their day writing code for this system, which would buy you a lot of influence. Consider how much bandwidth your team has to contribute to this process; it might be a dealbreaker.

You can also, if you need to, make a change in your own version of the project. You can then submit it to the maintainers. If it meets their quality standards and goal for the project, it can be integrated; this is also known as upstreaming. However, if it doesn't get incorporated, you are stuck supporting a critical feature and making sure that future releases don't break it.

### Security Responsibility

Open-source projects [may be more secure, especially over time](https://www.infoworld.com/article/2985242/why-is-open-source-software-more-secure.html), because more eyes have inspected the code to find security vulnerabilities. Some projects even undergo specific security audits to ensure their responsibility. 

However, there are also [instances of vulnerabilities remaining open for months](https://github.com/keycloak/keycloak/pull/7612). But if the bug is severe and an open-source project is well supported or popular, the timeline may shrink to days or weeks.

In the end, you (and the maintainers) are ultimately responsible for the security of the software. If you don't have time for your team to frequently review the security issues as they're reported and fixed and then upgrade your system, this may mean that open source isn't the best option.

### Cost

This is where many open-source solutions really shine. If you're running an open-source authentication provider, the cost for the provider itself in many cases is nothing. Zip. Nada. Who doesn't like free?

The caveat to that price tag is that you generally also have to run this software on your own infrastructure, so there's an implicit cost there. However, if you're already running your own infrastructure, then in many cases, an open-source authentication provider can be added at no direct monetary cost to you.

While this price tag is attractive, it's important not to forget that open-source providers come with added maintenance and security responsibility when compared to proprietary solutions, as we've already discussed.

To learn about pros and cons of open-source and commercial auth providers, read [Open Source vs Commercial Auth Providers](/learn/expert-advice/identity-basics/open-source-vs-commercial/).
