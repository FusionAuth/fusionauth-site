---
layout: advice
title: Why outsource your auth system and how to sell the decision to your company
description: Why should you consider outsourcing your authentication, authorization and user management system, and how to get buy-in from your teammates.
author: Joe Stech
image: advice/why-outsource/expert-advice-why-outsource-your-auth-system-and-how-to-sell-the-decision-to-your-company-header-image.png
category: Identity Basics
date: 2021-04-15
dateModified: 2021-04-15
---

You're a software engineering leader, and you're great at your job. You know that the optimal path for software development lies in figuring out which components of your design to implement from scratch and which have already been implemented by specialists and can be reused. 

You also know that these aren't decisions that you can only make once -- you have to keep reevaluating based on environment changes and the needs of new products.

Authentication is one of those components that you deal with all the time. Auth is a necessary part of any software product, but how you implement auth is not necessarily always the same. Careful consideration is needed, because your decision to outsource will not only impact speed of development, but also long-term product maintenance -- you don't want to slow down time to market because you re-implemented an entire auth system unnecessarily, but you also don't want to use an auth system that is going to cause problems down the road. 

## Auth outsourcing considerations

What are the primary considerations when making an outsourcing decision, especially around a component as critical as your identity management system?

### Speed to market

This is the most obvious consideration. Depending on the features you need, it could literally take months to implement auth in-house, whereas it could take less than a day to incorporate an outsourced solution. 

You could say "but what if we only need a bare-bones implementation? Some salted hashes in a database and we're good to go!" That's a totally valid point, and if you don't anticipate needing sophisticated auth features then your best bet might be to do a quick in-house implementation and move on. 

However, time and time again I've seen product developers underestimate the sophistication of features that will be required when their userbases grow. Most of the time development organizations then fall prey to the sunk costs fallacy and double down on augmenting their in-house solution, even when it may be more efficient to abandon the home-grown effort and replace it with an outsourced solution. This will cause huge issues for maintainability, which I'll talk about further below.

### Consequences of an auth breach

Planning for the worst possible case can prevent total financial ruin for your company or division. If a breach of security happens and PII (Personally Identifiable Information) is leaked from your in-house auth system, it can not only cause your company reputational damage but also significant financial penalties (not to mention potential jail time if you try to cover up the breach).

If you outsource your auth system you can limit your liability, and also protect your reputation -- if there is a breach on your auth provider's side, it's likely that the breach will extend beyond your company. A breach in an outsourced auth provider that is used by many different companies will be big news, and customers will be more likely to forgive you for making a mistake in your choice of auth provider than for implementing a poor auth system yourself.

A not-insignificant addendum is that I believe your in-house system is much more likely to suffer a breach than an outsourced provider who is an expert in security. I have no studies to support this claim, but I have never seen a major auth provider compromised, and I've definitely seen companies suffer breaches due to their own in-house auth implementations -- [this article discusses a compilation of 21 million plaintext passwords collected from various breaches](https://arstechnica.com/information-technology/2019/01/hacked-and-dumped-online-773-million-records-with-plaintext-passwords/) wherein passwords were not hashed and salted by auth systems. 

Properly storing passwords is an incredibly low bar, and yet companies that manage their own auth still do it incorrectly all the time.

### Consequences of an auth outage

While less damaging than breaches, outages can still cause reputational damage and liability issues if your SLAs make uptime guarantees. Similarly to breaches, if you outsource your auth system it's likely that any auth outage will extend beyond your company. 

As an example, when Microsoft's Azure Active Directory (AAD) [went down for a good portion of the afternoon late last year](https://www.zdnet.com/article/microsofts-azure-ad-authentication-outage-what-went-wrong/), logins for applications across the internet stopped working. 

When your competitors' authorization systems are down at the same time yours are, nobody blames you for it, but when you're the only company having issues, you suffer reputationally. No matter what your outsourced auth system is (FusionAuth, Cognito, AAD, etc), you can be almost certain that you won't be alone in the event of an outage.

### Maintainability

There are trade-offs here. The benefits to an in-house system include:

* Your engineers can design the exact system to fit your needs, and you'll have unrestricted ability to add very specific features if requirements change over time.
* If the same engineers who built the system are maintaining it, then they'll have the context required to anticipate issues as they add features.

However, the drawbacks can be large:

* Complex new features can take significant time to build. Outsourced auth systems likely have these features already built (things like multi-factor authentication, user management interfaces, analytics and audit logs, and brute force hack detection, among others).
* With an in-house solution, you'll have to budget time to monitor new security threats and patch your system in a rapidly evolving threat landscape.
* You won't get the benefits of a dedicated team that are constantly improving your auth system. This is actually a bigger deal than it seems, because if you outsource auth then other companies will also be filing issue reports and feature requests on your behalf, so you reap the benefits of those extra eyes as well.
* In the case of mergers or acquisitions, an in-house solution is likely to be terrible at combining different databases of users and managing things like duplicates or incomplete data. Such enterprise identity unification efforts can founder on internal auth systems. FusionAuth, on the other hand, supports modeling different user bases with tenants. 

### Cost of in-house vs outsourced auth

When building an in-house auth system your costs are all ostensibly sunk (engineer salaries). However, if building your system in-house delays time to market or prevents creation of other features, the build could cost you a significant amount of real income. There will also be on-going maintenance costs with an in-house solution. 

When making cost calculations, you should compare:

**Revenue lost by slower time-to-market PLUS engineering cost to implement in-house solution PLUS on-going maintenance costs of in-house solution PLUS increased risk of data breach PLUS increased risk of outage PLUS increased risk during a merger or acquisition**

vs 

**The monthly cost incurred by an outsourced provider PLUS the lack of complete control**

When evaluating different auth providers, you'll also want to consider whether an outsourced provider charges on a sliding scale based on number of users or if the cost is fixed. AWS Cognito, for instance, will continue to charge more as your application gains more users. FusionAuth, in contrast, has options that charge a single rate for unlimited users. If your app is small and you don't expect it to grow much, a sliding scale may be better for you. If you don't want a large unexpected bill as you gain more users, a provider that allows for fixed costs may be more appealing.

### Auth may be unrelated to your core competency

As a final consideration, you may want to evaluate if your engineers even have the ability to implement a secure in-house auth system without a significant investment in education. This is something that many leaders dismiss, since they have great faith in the intelligence and skill of their people. 

However, knowledge and intelligence aren't the same, and just because your engineers are capable of becoming auth experts doesn't mean you want them to spend the time to do so. 

As an engineering leader, you have a responsibility to ensure that your engineers are spending their time on efforts that will optimally contribute to the long-term success of your organization. Auth is a necessary component, but is it really a differentiator for your application? 

## Getting buy-in for outsourcing auth

If you've decided that outsourcing your auth system makes sense, how do you go about talking to all the relevant stakeholders about this choice?

Not all orgs are the same, but many companies have similarities. Who to talk to and what to emphasize will be contingent upon the size and structure of your company, so you'll have to adapt this article to your own circumstances. 

However, I'm going to go through the main categories of stakeholders you might have, and suggest ways to talk to them about outsourcing your auth system. Even though you've convinced yourself that you've found the best course of action for your company, everyone else has to believe it too (or at the very least not actively oppose it). 

You'll have to talk to each type of stakeholder on their own terms in order to achieve the best outcome for your company. For each person in each type of role you'll want to emphasize what the benefits are to them and how it's going to help the company as a whole.

Each of the following sections addresses a different stakeholder. If you've been in your current role for any length of time, you'll know which roles exist in your org. If not, your boss can help. For each stakeholder type, I'll make suggestions on how to help them see what you see.

### Your boss 

Unless you're the CEO, you're going to have a boss. Your boss will likely be a software engineering director or VP. They will be responsible for delivering against the product roadmap in the most efficient, maintainable way possible. In many ways your boss should be perfectly aligned with you -- ideally your concerns are a more detailed subset of theirs. 

With that in mind, emphasize a few points:

* **Speed to market:** Depending on the features you need, it could literally take months to implement auth in-house, whereas it could take less than a day to incorporate an outsourced solution.
* **Cost:** There are a few things to consider here, which are covered in the "Cost of in-house vs outsourced auth" section of my post ["Why outsource your auth system?"](/blog/2021/01/20/why-outsource-auth/)
* **Mitigating risk:** Two of the scariest things to an engineering leader are the risk of implementation time ballooning out of control and the risk of serious security breaches. Outsourced auth can help mitigate both of those concerns. Here, talking through the benefits in detail will be very helpful.

### Your developers

If you lead a team of developers, it's crucial that they don't oppose the decision to use third-party auth. **I can't emphasize this enough.** 

If you convince every other stakeholder but fail to convince your devs, many of the benefits of outsourcing auth will be severely reduced. More importantly, if you try and ram through your agenda without adequately conveying your vision, you can lose hard-earned trust. 

This is the 'lead' part of 'leadership' -- in this instance your job is not to dictate, it is to motivate and guide. Your team is smart, and if plugging in an external auth component is the most appropriate way forward for your specific use case you'll likely be able to forge consensus. 

If not, take a long hard look at your situation and ask yourself if you need to reconsider based on new points of view! What have you missed that they have seen? All of your reasoning should be laid before the team, but in particular emphasize:

* **The minimal maintenance required by an outsourced system:** The vendor will be continually improving the system so you don't have to.
* **Support from the vendor:** Documentation, engineering support, and best practices should all easily be obtainable from your vendor of choice, which will greatly speed implementation and mitigate long-term risk.
* **The ability to work on more interesting features:** With the implementation time savings developers will be able to work on more interesting core features, which will also likely give them more visibility and resume-building achievements than re-implementing auth for the Nth time.
* **Stress reduction:** Having a vendor be responsible for some of the high-security aspects of the product will help reduce developer stress.

### Project management

I don't want to over-simplify the role of project management, but in general they're going to care the most about a stable, well-thought-out implementation schedule that can be acted on in a consistent, predictable manner. Does that sound like most software development projects in your organization or that you've seen in your career? Maybe not! All the more reason to make choices that help your team get a little closer to that ideal. 

Thus, when talking to project management about outsourcing your auth system it's important to emphasize the benefits of **speed of implementation** and **reduction of scheduling risk**. With pre-built components and vendor support it's unlikely that you'll be blowing up your schedule with this choice.

### Product management

They probably don't care about implementation details of your auth system, frankly. However, it can be helpful to convey your reasoning to them. Emphasize to them that outsourcing auth will allow the team to **work on new features more quickly**. This can help you even if product doesn't have a direct say in implementation decisions, since by addressing their main concerns, they'll likely be your ally in discussions with other decision makers.

Product management will probably also appreciate the fact that outsourced auth has a large feature set out of the box -- you can point out all the functionality that your proposed auth system already has for which they won't need to draft requirements. This conversation might even remind product management of things they need to ensure have been specified in the main product, like internationalization and localization.

### Legal 

I feel like this one is pretty clear: **emphasize risk mitigation**. Both outages and auth breaches can come with significant legal ramifications, especially if you have stringent SLAs in place for your product.

Legal will likely appreciate the fact that you want to use a tried and tested solution rather than building something brand new. Legal will also appreciate that your proposed auth solution will help you comply with data protection laws like the GDPR, COPPA and the CCPA, as opposed to your team debating adding such support in a last minute sprint.

### Quality Assurance

QA would love to live in a world where they could set up a bunch of regression tests on a system built out of stable third-party components and then move on to the next thing. They don't want to have to come back to dev with a huge list of issues they found in your home-grown auth system and then iterate with you on it over and over until all the kinks are worked out. 

They *especially* don't want to miss a crucial test and then have stakeholders across a panicked company asking them why a production auth system wasn't tested thoroughly enough.

Talk to them about how your proposed auth solution has been pre-tested and battle-hardened (if it has been). Talk to them about the large community using the components and how the vendor responds to bugs; do they release a fix quickly or does the bug linger? Talk to them about how they can treat it like any other third-party component, which will let them focus on other concerns, like testing the features customers pay you for!

### UX and Design

Good designers want to spend their time designing new exciting aesthetics and workflows, not auth flows that have been done a million times. 

Talk to them about how they don't have to reinvent the authentication flows, they just have to tweak them. Have them review vendor documentation about how to customize existing auth flows and screens. That will also inform you on the flexibility you have (or don't) when doing such customization.

### Security

If your org is big enough that security needs to sign off on new externally facing architecture decisions, it's likely they'll already be on board with using a pre-existing auth solution. 

In talking to people in this area, it still doesn't hurt to emphasize:

* The monitoring benefits provided by a dedicated auth system.
* Standards certifications that your proposed auth system complies with (ISO 27001, SOC2, HIPAA BAAs, etc). 
* **Actual laws** that your proposed auth system can help you comply with, as mentioned in the legal section above (GDPR/CCPA are big ones!).

### Infrastructure

If your organization is large enough for a dedicated infrastructure team it's likely that you already have a robust auth solution, but there are cases where you have several internal apps with different auth systems and you want to standardize on a new outsourced auth system. 

It might also be that your infrastructure team is young and they're just considering a company-wide auth solution. They might appreciate you doing the legwork here. The infrastructure team might even be where you work! 

Talking points of concern to this role mainly focus on **the benefits of single sign-on**. The benefits are numerous, but some of the big ones are reducing help desk tickets, increasing productivity and security (fewer password post-its floating around), and just generally making life better.

### Above all else, emphasize spending time doing new things

Now that we've discussed the majority of potential stakeholders, it should be clear that there's an overarching message to disseminate: **build new things!**

Don't spend your time reimplementing boilerplate functionality that already has robust solutions. Auth is like a datastore; yes, you could build your own, but that'll only make sense in specific circumstances.

Get your team excited about pushing your product forward with new features that will solve problems for your customers. Outsource what already has tried-and-true implementations.

