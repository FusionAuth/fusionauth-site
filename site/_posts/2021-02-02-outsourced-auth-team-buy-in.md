---
layout: blog-post
title: "Outsourcing auth: how to get buy-in from your team"
description: Who are the players you'll need to work with to make an outsourced auth implementation successful?
image: blogs/why-outsource-auth/why-outsource-your-auth-system.png
author: Joe Stech
category: blog
excerpt_separator: "<!--more-->"
---

You lead a team of engineers, and your team is responsible for building out a new customer-facing product that could have a huge impact on the trajectory of your company. Lately you've been considering whether or not rolling your own authentication system is a good idea. You've spent a lot of time and effort carefully weighing the pros and cons, and you've come to the conclusion that home grown auth is not in the best interests of your company. 

How do you go about talking to all the relevant stakeholders about this choice?

<!--more-->


Not all orgs are the same, but many companies have similarities. Who to talk to and what to emphasize will be contingent upon the size and structure of your company, so you'll have to adapt this article to your own circumstances. 

However, I'm going to go through the main categories of stakeholders you might have, and suggest ways to talk to them about outsourcing your auth system. Even though you've convinced yourself that you've found the best course of action for your company, everyone else has to believe it too (or at the very least not actively oppose it). 

You'll have to talk to each type of stakeholder on their own terms in order to achieve the best outcome for your company. For each person in each type of role you'll want to emphasize what the benefits are to them and how it's going to help the company as a whole.

Each of the following sections addresses a different stakeholder. If you've been in your current role for any length of time, you'll know which roles exist in your org. If not, your boss can help. For each stakeholder type, I'll make suggestions on how to help them see what you see.

## Your boss 

Unless you're the CEO, you're going to have a boss. Your boss will likely be a software engineering director or VP. They will be responsible for delivering against the product roadmap in the most efficient, maintainable way possible. In many ways your boss should be perfectly aligned with you -- ideally your concerns are a more detailed subset of theirs. 

With that in mind, emphasize a few points:

* **Speed to market:** Depending on the features you need, it could literally take months to implement auth in-house, whereas it could take less than a day to incorporate an outsourced solution.
* **Cost:** There are a few things to consider here, which are covered in the "Cost of in-house vs outsourced auth" section of my post ["Why outsource your auth system?"](/blog/2021/01/20/why-outsource-auth/)
* **Mitigating risk:** Two of the scariest things to an engineering leader are the risk of implementation time ballooning out of control and the risk of serious security breaches. Outsourced auth can help mitigate both of those concerns. Here, talking through the benefits in detail will be very helpful.

## Your developers

If you lead a team of developers, it's crucial that they don't oppose the decision to use third-party auth. **I can't emphasize this enough.** 

If you convince every other stakeholder but fail to convince your devs, many of the benefits of outsourcing auth will be severely reduced. More importantly, if you try and ram through your agenda without adequately conveying your vision, you can lose hard-earned trust. 

This is the 'lead' part of 'leadership' -- in this instance your job is not to dictate, it is to motivate and guide. Your team is smart, and if plugging in an external auth component is the most appropriate way forward for your specific use case you'll likely be able to forge consensus. 

If not, take a long hard look at your situation and ask yourself if you need to reconsider based on new points of view! What have you missed that they have seen? All of your reasoning should be laid before the team, but in particular emphasize:

* **The minimal maintenance required by an outsourced system:** The vendor will be continually improving the system so you don't have to.
* **Support from the vendor:** Documentation, engineering support, and best practices should all easily be obtainable from your vendor of choice, which will greatly speed implementation and mitigate long-term risk.
* **The ability to work on more interesting features:** With the implementation time savings developers will be able to work on more interesting core features, which will also likely give them more visibility and resume-building achievements than re-implementing auth for the Nth time.
* **Stress reduction:** Having a vendor be responsible for some of the high-security aspects of the product will help reduce developer stress.

## Project management

I don't want to over-simplify the role of project management, but in general they're going to care the most about a stable, well-thought-out implementation schedule that can be acted on in a consistent, predictable manner. Does that sound like most software development projects in your organization or that you've seen in your career? Maybe not! All the more reason to make choices that help your team get a little closer to that ideal. 

Thus, when talking to project management about outsourcing your auth system it's important to emphasize the benefits of **speed of implementation** and **reduction of scheduling risk**. With pre-built components and vendor support it's unlikely that you'll be blowing up your schedule with this choice.

## Product management

They probably don't care about implementation details of your auth system, frankly. However, it can be helpful to convey your reasoning to them. Emphasize to them that outsourcing auth will allow the team to **work on new features more quickly**. This can help you even if product doesn't have a direct say in implementation decisions, since by addressing their main concerns, they'll likely be your ally in discussions with other decision makers.

Product management will probably also appreciate the fact that outsourced auth has a large feature set out of the box -- you can point out all the functionality that your proposed auth system already has for which they won't need to draft requirements. This conversation might even remind product management of things they need to ensure have been specified in the main product, like internationalization and localization.

## Legal 

I feel like this one is pretty clear: **emphasize risk mitigation**. Both outages and auth breaches can come with significant legal ramifications, especially if you have stringent SLAs in place for your product.

Legal will likely appreciate the fact that you want to use a tried and tested solution rather than building something brand new. Legal will also appreciate that your proposed auth solution will help you comply with data protection laws like the GDPR, COPPA and the CCPA, as opposed to your team debating adding such support in a last minute sprint.

## Quality Assurance

QA would love to live in a world where they could set up a bunch of regression tests on a system built out of stable third-party components and then move on to the next thing. They don't want to have to come back to dev with a huge list of issues they found in your home-grown auth system and then iterate with you on it over and over until all the kinks are worked out. 

They **especially** don't want to miss a crucial test and then have stakeholders across a panicked company asking them why a production auth system wasn't tested thoroughly enough.

Talk to them about how your proposed auth solution has been pre-tested and battle-hardened (if it has been). Talk to them about the large community using the components and how the vendor responds to bugs; do they release a fix quickly or does the bug linger? Talk to them about how they can treat it like any other third-party component, which will let them focus on other concerns, like testing the features customers pay you for!

## UX and Design

Good designers want to spend their time designing new exciting aesthetics and workflows, not auth flows that have been done a million times. 

Talk to them about how they don't have to reinvent the authentication flows, they just have to tweak them. Have them review vendor documentation about how to customize existing auth flows and screens. That will also inform you on the flexibility you have (or don't) when doing such customization.

## Security

If your org is big enough that security needs to sign off on new externally facing architecture decisions, it's likely they'll already be on board with using a pre-existing auth solution. 

In talking to people in this area, it still doesn't hurt to emphasize:

* The monitoring benefits provided by a dedicated auth system.
* Standards certifications that your proposed auth system complies with (ISO 27001, SOC2, HIPAA BAAs, etc). 
* **Actual laws** that your proposed auth system can help you comply with, as mentioned in the legal section above (GDPR/CCPA are big ones!).

## Infrastructure

If your organization is large enough for a dedicated infrastructure team it's likely that you already have a robust auth solution, but there are cases where you have several internal apps with different auth systems and you want to standardize on a new outsourced auth system. 

It might also be that your infrastructure team is young and they're just considering a company-wide auth solution. They might appreciate you doing the legwork here. The infrastructure team might even be where you work! 

Talking points of concern to this role mainly focus on **the benefits of single sign-on**. The benefits are numerous, but some of the big ones are reducing help desk tickets, increasing productivity and security (fewer password post-its floating around), and just generally making life better.

## Above all else, emphasize spending time doing new things

Now that we've discussed the majority of potential stakeholders, it should be clear that there's an overarching message to disseminate: **build new things!**

Don't spend your time reimplementing boilerplate functionality that should already have robust solutions. 

Get your team excited about pushing your product forward with new features that will solve problems for your customers. Outsource what already has tried-and-true implementations.

