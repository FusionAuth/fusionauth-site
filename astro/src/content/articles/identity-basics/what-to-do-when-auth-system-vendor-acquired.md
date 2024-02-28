---
title: What To Do When Your Auth System Vendor Gets Acquired
description: Authentication is an integral part of your application, and as such the acquisition of your auth vendor isn't like other acquisitions.
author: Eze Sunday Eze
icon: /img/icons/auth-system-acquired.svg
darkIcon: /img/icons/auth-system-acquired-dark.svg
section: Identity Basics
date: 2021-06-22
dateModified: 2021-06-22
---

Authentication is an integral part of your application, and as such the acquisition of your auth vendor isn't like other acquisitions. It could mean many things for your business, and you'll have to decide how to respond accordingly.

Will your new provider give you the same support? Pricing? Integration options? All of these might change for better or for worse.

Consider [the acquisition of Auth0 by Okta](/blog/2021/03/04/congrats-auth0-okta-acquisition). Auth0 customers praised them for their top-notch customer support. However, Okta customers have lamented their lackluster customer service [in online forums](https://news.ycombinator.com/item?id=26336270).


> "We moved from Okta a few years ago after we received almost no actual real support for a bunch of issues, even though we were paying a premium cost. 

> "Nobody cares about issues on [Okta's] GitHub... The kicker was when we received a support response as suddenly something was no longer working after an update, we got help in the form of 'We have no plans to address this anytime soon' when asking for an ETA."

> "We ended up switching to Auth0 after we had a few calls with [Okta]. We shaved a decent amount off our costs with Auth0's Enterprise plan, and their webtask based rules worked. While the migration sucked for a bit, in the end, we were much happier."

While clearly an acquisition is cause for concern, it might not be all bad. In this article, we'll discuss red flags to be on the lookout for when your auth vendor is acquired, short-term as well as long-term concerns, and how your engineering team can best handle them.

## Short-term Concerns

During the acquisition and transition process, the attention of both the purchasing company and the company being acquired will be given to internal politics. That means a lot of other things get put on the back burner.

### New Features Are Given Less Attention

Meetings with key decision-makers will focus on enabling a smooth acquisition rather than rolling out new features. As a customer, this will impact your business, as management will probably be a little disorganized for a while.

Imagine that your own customers are waiting on you to deliver a new feature or fix a bug that's solely your auth vendor's place to fix. 

Now what? The new management might not even be interested in rolling out that feature.

### Vendor Employees Experience Uncertainty

The employees of companies on either side of the acquisition may feel uncertain about their employment status. 

Will the new management decide on a total overhaul of existing staff or will they find a place for everyone? Worried employees can understandably have impacted performance.

### Support Deteriorates

All of those reasons--lack of management oversight, shifting plans and roles, delayed rollouts, employee uncertainty--can be felt by your company as less attentive support from your auth vendor during an acquisition. 

## Short-term Benefits

There are also some potential positives in the short-term! For example, sales reps might be distracted, resulting in fewer emails. 

On a more serious note, your auth vendor might offer you incentives, like more free subscriptions, so you'll stick around through the bumpy transition. 

Keep in mind that even though processes might be moving fast during this time, the truth is their business model won't change overnight. The same goes for their pricing. It might eventually fluctuate, but that will most likely happen after everything has settled down.

For most of the transition, your auth vendor will try to make you happy. They know that some of the issues previously mentioned will cause churn and are interested in minimizing that.

## Long-term Concerns

Of course, your concerns aren't magically over after the acquisition completes.

### Some or All of Your Auth System Features Could Be Phased Out

A company I worked for a few years ago had a very robust and all-encompassing [ERM](https://en.wikipedia.org/wiki/Electronic_health_record) that was used by several hospitals across the country. The company was bought by its competitor, and a year after the acquisition, they announced they were going to retire the software and onboard existing customers to a new software package. The company would not be supporting the acquired ERM anymore.

Customers were upset, and some even threatened lawsuits. That didn't do much to change things. The old software package has been phased out after a couple more years and support has ceased. This happened because the acquiring company figured out the software had too many bugs and would be better off if its functionality was added to other in-house products. 

While this was not an auth system, the same logic can be made by an acquirer. A more auth specific example is what happened with Stormpath and Okta in 2017, where customers were given [six months to migrate from the former to the latter](https://techcrunch.com/2017/03/06/okta-stormpath/).

What's the use of an auth system that's not maintained or supported? Maybe you could live with an unmaintained software package if it wasn't under regular threat, but that doesn't describe an auth system. Authentication is critical to your customers' privacy and all application functionality. You don't want a security vulnerability in your auth system to shake customer confidence in your application.

### Product Is Milked and Prices Rise

Your auth vendor's new management might decide to modify pricing and plans. They may move some of the best product features to higher payment plans. One thing is for sure, no one acquires a company looking to lose money on the purchase.

## Long-term Benefits

Some acquisitions happen because your previous auth vendor wasn't making enough money to keep running the business but had a very good product that people loved. In that case, it's possible that new management ends up improving your situation. 

If the new organization is more financially stable, they could make things a lot better for you with more support staff, better management, more developers, better product maintenance, and an improved feature delivery rate. More resources can mean a better product.

## Mitigating Concerns

Once you realize an acquisition is happening, there are some steps you can take to guarantee you'll still be in business after the dust has settled.

### Review Your Contract

Not the most exciting first action, but it's important to know what changes your auth provider can make. Find the contract you signed with your vendor and review it. 

It's also important to think about how this contract might be expected to change. Get clarity and get yourself ready.

### Review Your Usage

Take a close look at how your business solutions integrate with and use your auth vendor's services right now. Figure out the features you use that are absolutely crucial and which of them are proprietary features. 

Are they following [standard auth protocols](/articles/oauth/value-standards-compliant-authentication)? How many of your apps are using this vendor? At a minimum, answering these questions will keep you well informed should you need to migrate to another vendor.

### Talk to Your Account Manager


It's time to talk to your account manager about your business relationship. Give them a call or an email and try to negotiate a long-term contract that will protect your business interests and guarantee a level of stability. The research into the contract you did previously? Now is the time to reference it.

Don't forget to ask about migration timelines while you're at it, so you know how soon you need to be prepared and for what changes.

If you don't have an account manager, send an email to the sales or support team. They may send you elsewhere, but are a good starting point.

### Evaluate What It Would Take to Switch Vendors
 
Budget dev team time to look into other options in case it becomes necessary to move. Discuss the possibility with your partners or stakeholders, touching base with [everyone you discussed the issue with during the initial decision process](/articles/identity-basics/outsource-auth-system-blueprint), so that everyone understands what it would take to make the switch. 

Even if you stick with your vendor through the acquisition, at least now you know more, and you're prepared for whatever comes afterward. 

### Consider Impact to Current or Planned Projects

There's never a perfect time for a huge change to your auth system. What current projects will be impacted, for better or worse? Do you have projects in the planning stage that will have to be reimagined due to new standards or a different set of features? 

It's best to discuss this with your stakeholders, again so that everyone is on the same page and has consensus about priorities.

### Consider Other Options

If the changes are disruptive enough, you may decide you don't want to use third-party solutions anymore. You have a few other options:


* **Use a non SaaS solution:** SaaS solutions are great, but if you use a non-SaaS solution, where you host it yourself, you have far more control over any changes to functionality. You may have to upgrade for security or contractual reasons, but you'll be able to do it on your timeline, not the acquirer's. FusionAuth can be self-hosted and has a community version that is free for unlimited users.
* **An open-source solution:** You'll still have to manage your own source code. You'll just be using a free and community-driven solution like [Gluu](https://gluu.org), [Keycloak](https://www.keycloak.org/index.html), or [OpenIAM](https://www.openiam.com/). Your team will have to [explore these projects](/articles/identity-basics/open-source-vs-commercial) and choose the one that works best for your system.
* **In-house custom build solution:** In some rare cases, none of the available solutions will be a good fit for your organization, and you'll decide to build a custom auth system for your product. This will require more resources to achieve but of course, when completed, you'll have a solution that works best for you. Further, such a choice can be fine-tuned with more features in the future at your will (and expense)--something you won't get anywhere else.

## Conclusion

Your authentication system is one of the most critical pieces in your application, and you have to take it seriously. If your auth vendor gets acquired, understand the implications and discuss them with your team. 

Review the ways you expect to be impacted immediately as well as down the road. Weigh your options as to whether you want to migrate to the new system or find an entirely new solution. 

If you decide to migrate, take some time to consider how you want to approach it—can you afford to take your time to avoid surprises, or do your users need you to move faster?
