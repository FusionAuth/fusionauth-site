---
layout: blog-post
title: ! 'Takeaways from Identiverse 2021: Covid thoughts, FIDO and more'
description: Identiverse is an annual identity and IAM conference. FusionAuth showed up and took notes so you don't have to.
author: Dan Moore
image: blogs/takeaways-identiverse-2021/takeaways-from-identiverse-2021-covid-thoughts-fido-and-more-header-image.png
category: blog
tags: conference-report
excerpt_separator: "<!--more-->"
---

Identiverse is an annual, vendor agnostic identity and access management (IAM) conference. I attended the 2021 incarnation in person last week and wanted to share a few takeaways. 

<!--more-->

It was three days long; here's [the agenda](https://identiverse.com/idv2021/). I don't believe videos are available to the public, but if you attended, you can [view them until the end of July](https://twitter.com/Identiverse/status/1408466566346199046) using the same Identiverse application you may have used to view the agenda during the event or to ask questions of speakers.

## Covid concerns

First, I want to address the elephant in the room. Identiverse was an in-person conference, the first major technology conference that I've heard of since the pandemic started. I was a bit spooked when I thought about attending. I reviewed their [Covid-19 FAQ page](https://identiverse.com/faq/) carefully and was impressed by how they were planning to make sure attendees were safe.

During the conference, I saw some things I expect to see at most conferences in the next few years:

* Hand sanitizer everywhere. Thank you Google Cloud for sponsoring those.
* Seats were spaced out for all sessions.
* There were few, if any, attendees from outside the USA. I believe that was because of covid travel restrictions.
* Meals and happy hours were outside. 
* There were fewer attendees than in the past, according to other conference goers who had been to previous Identiverses.
* There were a large number of virtual talks, both live and pre-recorded.
* A number of attendees were virtual. (I don't know how that experience was.)

I'd expect these changes to affect the unit economics of event organizing. Anecdotally, I didn't see anybody checking vaccination status; there was no rapid testing station, for example. I also didn't see many attendees wearing masks, though many of the staff were. I shook hands with a few folks, but there were plenty of hand waves instead. Believe you me, I typically kept social distance and avoided large groups.

The in-person talks were much more fun than the virtual ones. It was easier to ask questions, to interact with fellow attendees, and in general felt more spontaneous. One speaker said, "well, since I'm not being recorded..." and proceeded to give an unvarnished opinion about a dicey matter. While I don't think virtual events are going away, in-person events will come back strong, as the experience is simply higher-bandwidth and more fun.

At the end of the conference, I felt like they'd done a great job handling my covid concerns.

## What about the actual conference, Dan?

As at any conference, there was a plethora of great content and I couldn't attend all the talks. But from what I saw, there were several themes. 

### Identity proofing

First, affordable identity proofing at scale is still an unsolved problem; one that a lot of people are working on. Identity proofing is the process of knowing who someone is before you grant them a user account. It can also be used for account recovery. 

For some applications identity proofing is unimportant; a typical ecommerce site will happily provide an account and take my money without knowing who I actually am. But for many online systems, such as unemployment insurance or business accounts, tying the user to a real identity is really important. There was a talk about how the New York Air National Guard used identity proofing and digital identity products to allow access to sensitive systems for a set of authorized people. As covid forced large numbers of employees toward remote work, knowing folks are who they say they are at scale becomes more critical.

The solutions in this space seem to focus on:

* Automatic recognition of government issued paper documents.
* Facial recognition, including fraud detection. Photos of someone shouldn't be accepted when the person needs to be present.
* Ensuring there are manual fallbacks when machine learning fails, or when the user can't present all the required documentation.

This is a step before the authentication and authorization process (the focus of FusionAuth). While you can identity proof out of band using one of the many solutions out there, if you'd like tighter integration with FusionAuth, I [filed a tracking issue](https://github.com/FusionAuth/fusionauth-issues/issues/1280) which you can upvote.

### FIDO

There were numerous sessions on [FIDO](https://fidoalliance.org/). FIDO is an alliance of technology vendors working to provide strong passwordless authentication in a way that consumers and application users can easily use. This includes hardware items such as Yubikeys, biometric solutions such as FaceID, and others. In particular, the FIDO non-profit organization does three things:

- Manages an open technical specification for strong passwordless authentication.
- Runs a certification program allowing companies to certify their solution.
- Runs programs to facilitate adoption of the standard. According to their executive director and CMO, this is an increasing portion of their effort now.

I attended one session where presenters from Intuit and T-Mobile talked about rollouts of FIDO enabled applications. This panel was a continuation of a discussion with the same attendees two years ago, which is an interesting way to close the loop at a conference.

FIDO adoption doesn't necessarily mean the death of passwords. But during this rollout they found large numbers of users (>80%) preferred to authenticate with FIDO enabled methods. T-Mobile uses FIDO to authenticate a customer service caller. Intuit has rolled it out across their major mobile applications.

FIDO also plays in continuous evaluation of authorization. The T-Mobile representative stated the discussion was evolving from a "what is the best second factor discussion," which was common a few years ago, to a multi-factor world where you are mapping the right set of authenticators for the current user action. Some situations call for strong recent authentication, such as changing payment information, while others, like checking the minutes, require less assurances.

### The rest of it

There was a lot of other content which didn't fall into one of the two common themes above:

* An [IAM certification program](https://idpro.org/cidpro/) was announced.
* There was more than one diversity and inclusion discussion.
* An interesting talk on OAuth and secure mobile applications
* An overview of all the ways you can authenticate with AWS
* And more.

One surprise to me was how little code I saw. Even in the mobile application security session, I didn't see much code displayed. Maybe I simply missed the code-heavy sessions, but this seemed like a conference for IAM admins rather than devs.

However, it was fantastic for learning more about the wide world of IAM. I talked to many people who were doing interesting things with identity. One wanted to leverage DNS to enable a rollout of digital identity. I got a chance to chat in person with a couple of the IAM personalities that are "big names" in the space.

I also sat next to a person at breakfast who ran identity for over one hundred hospitals and had some unique challenges. We talked a bit about how he planned rollouts in the hospital environment; these are sensitive environments in so many respects.

Another attendee I chatted with handled an enterprise identity integration project. This project was driven by a merger of several hospitals, and their conflicting identity stores were "merged" using virtual LDAP directories. Even after merging the stores into one LDAP directory, which was required for EMR compliance concerns, this company still uses the virtual LDAP solution to manage SaaS application access.

The complexity of IAM is immense. One person I chatted with at a happy hour commented that they had so many custom applications and identity stores that consolidating everything, even with an unlimited budget, would take 3-5 years. And of course, they didn't have that budget.

All in all, Identiverse was a great place to chat with people about their identity challenges and solutions.
