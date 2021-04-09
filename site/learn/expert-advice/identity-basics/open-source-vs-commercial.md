---
layout: advice
title: Open Source vs Commercial Auth Providers
description: A look at the pros and cons of open-source and commercial authentication providers.
author: Keanan Koppenhaver
image: advice/open-source-vs-commercial/expert-advice-open-source-vs-commercial-auth-providers.png
category: Identity Basics
date: 2021-04-15
dateModified: 2021-04-15
---

When it comes to building any web or mobile application, authentication is one of those areas where you generally don't want to take on the risk yourself. Third-party authentication providers have made this their entire business and dedicate lots of time and money to make sure their solutions are performant, easy to use, and most of all, secure. However, some of these providers make the source code for their solutions available and others keep their source code proprietary.

Choosing one of these types of authentication providers over the other is not always a cut-and-dried decision, as there are benefits to each. Support, release frequency, relicensing capability, maintenance, who is responsible for security, and cost are all factors you should consider when making this decision.

Let's take a more in-depth look at the pros and cons of open-source and commercial authentication providers.

## Open-Source Authentication Providers

Open-source authentication providers are popular because anyone can review much or all of the code that powers them. This availability can be especially helpful in evaluating whether a particular authentication provider will work for your use case. In addition, if you want the source code for any number of reasons (eg, the provider could go out of business or get acquired), open source is basically tailor-made for that. 

But while open-source providers do have some benefits over proprietary authentication providers, there are some downsides as well.

### Support

For solutions that are truly free and open source, often the only support avenue available is submitting a detailed issue via the project's issue tracker and hoping that one of the project maintainers gets back to you. The timeline for this is very undefined, and many open-source maintainers are overwhelmed with the volume of issues that projects get. This can be problematic for something as crucial to an application as an authentication provider, but that's the tradeoff for getting something completely free.

On the plus side, many open-source projects have started introducing paid support tiers, often provided by an affiliated company. If you choose to go with this option, you don't get the product entirely for free, but you usually get an SLA with not only guaranteed support but a guaranteed response time as well. You'll have peace of mind knowing someone knowledgeable about the product is ready and able to answer your questions in a timely manner.

### Release Frequency

How frequently product updates are released really depends on the project, but there are two benefits that open-source providers have over closed-source providers in this case.

First, you can look back at the entire release history and see how frequently releases and updates have happened in the past. Have they shipped one major version a year for the past two or three years? Odds are this will continue. Has the project been dormant for the last couple years? History isn't a perfect predictor, and they _may_ have been working on a huge new release all this time, but that's not a good sign.

And second, open-source projects tend to "work in public," meaning discussions about release frequency, notes from planning meetings, and more may be publicly accessible. Depending on how the project is structured, you may even be able to be part of these meetings. Some projects have this information in their README file or some similar place. You'd rarely get this kind of transparency with a more proprietary provider. 

However, it is worth noting the distinction between open source and open process. A project can be open source but take no feedback from the community; some of Apple's open source projects are like this. On the other hand, commercial software companies can develop “in the open” and even make the source available for inspection using source-available licenses, without allowing for the freedoms that are key to open source licensing. When you evaluate an open-source project, make sure you know what the community feedback process is, if any.

### Relicensing

Most open-source projects of any size have the license for the project publicly available, so you can quickly determine whether those license terms will work for you. It's important to review this carefully, as some projects specify that any project that uses them must _also_ be open source, which might be a deal breaker for you and your team. One common license, the GPL, has this restriction.

Some open-source projects, especially if they are backed by a company, support dual licensing. This means that you can choose one license or another as fits your business model. The first license may be the GPL or a similar restrictive license, while the other may be a commercial license with fewer restrictions that costs money. 

Always review the license for any solution.

### Maintenance Responsibility

In a true open-source solution, the "community" is responsible for submitting fixes they want to see included in the project. Feature requests from the community tend to need to be contributed to by the community itself, meaning you as the customer bear more of the maintenance burden. The amount of testing done for a new release varies based on the effort the community puts forth.

On the flip side, it could mean you have more say in the product roadmap if you're able to contribute fixes in a way that is acceptable to the community. Heck, you could even pay a developer to spend most of their day writing code for this system, which would buy you a lot of influence. Consider how much bandwidth your team has to contribute to this process; it might be a dealbreaker.

You can also, if you need to, make a change in your own version of the project. You can then submit it to the maintainers. If it meets their quality standards and goal for the project, it can be integrated; this is also known as upstreaming. However, if it doesn't get incorporated, you are stuck supporting a critical feature and making sure that future releases don't break it.

### Security Responsibility

Open-source projects [may be more secure, especially over time](https://www.infoworld.com/article/2985242/why-is-open-source-software-more-secure.html), because more eyes have inspected the code to find security vulnerabilities. Some projects even undergo specific security audits to ensure their responsibility. 

However, there are also [instances of vulnerabilities remaining open for months](https://github.com/keycloak/keycloak/pull/7612). But if the bug is severe and an open-source project is well supported or popular, the timeline may shrink to days or weeks.

In the end, you (and the maintainers) are ultimately responsible for the security of the software. Just like with maintenance responsibility, if you don't have time for your team to frequently review the security issues as they're reported and fixed and then upgrade your system, this may mean that open source isn't the best option for you.

### Cost

This is where many open-source solutions really shine. If you're running an open-source authentication provider, the cost for the provider itself in many cases is nothing. Zip. Nada. Who doesn't like free?

The caveat to that price tag is that you generally also have to run this software on your own infrastructure, so there's an implicit cost there. However, if you're already running your own infrastructure, then in many cases, an open-source authentication provider can be added at no direct monetary cost to you.

While this price tag is attractive, it's important not to forget that open-source providers come with added maintenance and security responsibility when compared to proprietary solutions, as we've already discussed.

## Commercial Authentication Providers

An alternative to open-source, commercial authentication providers (such as [FusionAuth](https://fusionauth.io/), [Okta](https://www.okta.com/), and [Auth0](https://auth0.com/)) are popular because they take care of all the ambiguity and self-reliance that come with open source.

But just because commercial providers handle many of open source's problems doesn't mean there aren't tradeoffs that need to be considered with them as well.

### Support

Because you're paying for a commercial authentication provider, some level of support is included in your contract. This can be provided either over email, phone, live chat, or some combination of all of those. Generally when you sign up with one of these providers, some sort of SLA will be provided with a contractually guaranteed response timeframe.

The peace of mind from having dedicated support can be one of the most important reasons to choose a commercial authentication provider over open source. At the end of the day, the buck stops with them. As noted above, you can often pay a company to support an open-source option, too.

### Release Frequency

Unlike with open-source providers, it may be difficult to know how often updates for commercial providers are released, especially if all of the provider's infrastructure lives in the cloud and updates don't require any action from the customer. They may release their software multiple times per day, or it may be months between public releases.

This is one of the questions you can ask the sales team when evaluating different providers, but commercial providers don't always have the transparency associated with open-source providers. You can't always just go and look up previous release dates and research update progress yourself. However, some providers, such as FusionAuth, do offer [comprehensive release notes](https://fusionauth.io/docs/v1/tech/release-notes/) to aid you in your evaluation.

### Relicensing

Commercial providers tend to have either more obscure or more restrictive licenses. You won't be able to take the code and do anything you want with it. If you are building a typical web application, this shouldn't be an issue, but if you are embedding or redistributing your code with the auth system, that may violate the license. Ask your vendor. 

Many of the issues of relicensing that come with open-source technologies don't apply to commercial authentication providers, because they usually provide a single license that goes with their product. They handle the licensing of any component parts in-house and usually have legal teams or at the very least an attorney that's reviewing all of the different aspects of software licensing.

This is another thing you don't have to worry about with a commercial provider, rather than being responsible for reviewing all these licenses if you went with an open-source solution.

### Maintenance Responsibility

This is one of the main benefits of a commercial provider. They are responsible for all the maintenance of their product. Because you're paying for the product directly, this is one area you no longer have to worry about. You are trading money for time.

However, unlike with open source, you have less freedom to make fixes yourself. So if you have a feature or a fix that you believe should be in the product, the most you can do is try to convince someone at the vendor to get that prioritized. With an open-source solution, you could fix it yourself, if you are willing to accept the maintenance burden.

If you are worried about access to the source code if the commercial vendor goes out of business, ask about a source code escrow. Some providers are willing to add a provision to their contract with you.

### Security Responsibility

As with maintenance responsibility, the responsibility for the security of a commercial product is on the vendor. They will be the ones applying patches and (hopefully) doing frequent security audits to ensure their product is secure. These could include running internal security reviews, a bug bounty program, or hiring a pentesting firm to test the product's security.

It may take longer to find bugs than it would with an open-source product where more people from all sorts of different backgrounds are invested in the security of the product and review it frequently. While the security responsibility may not be on you as a customer, you _do_ have the responsibility to [perform due diligence on any potential vendor](/learn/expert-advice/identity-basics/due-diligence-authentication-vendors/) and ensure that they take the security of their product seriously. One way to do that is to examine the vendor's public security policy. Another is to look at the [CVE database](https://cve.mitre.org/) and see how vulnerabilities are handled.

### Cost

One of the more notable differences between open source and commercial solutions is cost. Because of the benefits detailed above, there is usually a cost to a commercial solution, whereas many open-source solutions are provided free of charge and maintained by the community. 

However, some commercial software offers free tiers with limited support. For example, Auth0 allows you a certain number of users for free. FusionAuth has a community edition allowing you an unlimited number of users if you self-host.

Depending on what stage your company is in, this cost can either be something you can absorb or a dealbreaker.

## The Final Showdown

Using third-party authentication can be a great choice for your application, allowing you to focus on the business logic where your application provides value, but there is more than one type of provider. So in the battle of open source versus commercial authentication, which is the better choice? As with most real-world decisions, the answer is "that depends."

Open-source authentication providers can be a great choice if you have more time than money. They are usually more cost-effective, too, but they do require maintenance and upkeep internally.

If you don't have the staff or the time to maintain an open-source solution, or if you do but don't want to make that investment, providers like [FusionAuth](https://fusionauth.io/) can be a great asset to your company, bringing a high-quality authentication solution to your business and taking care of all the maintenance and security concerns that go with it, so you can focus on writing the code that matters.

