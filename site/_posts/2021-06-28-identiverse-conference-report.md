---
layout: blog-post
title: ! 'Takeaways from Identiverse 2021: Covid thoughts, FIDO and more'
description: Identiverse is an annual identity and IAM conference. FusionAuth showed up and took notes so you don't have to.
author: Dan Moore
image: blogs/disclosure-2020/disclosure-conference-report.png
category: blog
excerpt_separator: "<!--more-->"
---

Identiverse is an annual, vendor agnostic identity and access management (IAM) conference. I attended the 2021 incarnation in person and wanted to share a few takeaways. 

<!--more-->

It was three days long. Here's the [agenda for the 2021 conference](https://identiverse.com/idv2021/). I don't believe the videos are going to be available to the public, but if you attended, you should be able to [view them until the end of July](https://twitter.com/Identiverse/status/1408466566346199046) in the same platform used to view the agenda and contact attendees.

## Covid

I want to address the elephant in the room. This was an in-person conference, the first major technology conference that I've heard of since the pandemic started. I confess I was a bit spooked when I thought about attending. I reviewed their [Covid-19 FAQ page](https://identiverse.com/faq/) carefully and was impressed by what they said they'd do to make sure attendees were safe.

And they did take steps. I saw some things I expect to see at most conferences in the next few years:

* Hand sanitizer everywhere. Thanks Google Cloud for sponsoring those.
* More spacing everywhere, including in sessions. 
* There were few, if any, attendees from outside the USA.
* All sessions with food and drink were outside. 
* There were fewer attendees than in the past. Unsure if that was due to event limits or other factors.
* There were a large number of virtual talks, both "live" and pre-recorded.
* A number of attendees were virtual. I don't know how that experience was.

IMAGE TBD

I'd expect all of these will change the unit economics of event organizing in the future. Anecdotally, I didn't see anybody checking vaccination status (no rapid testing station, for example). I didn't see that many attendees wearing masks, though many of the staff were. I shook hands with a few folks, but there were plenty of hand waves instead. Believe you me, I kept some social distance and avoided large groups.

I also think that the in-person talks were much more fun than the virtual ones. Easier to ask questions, far easier to interact with fellow attendees, and more spontaneous. One speaker even said, "well, since I'm not being recorded..." and proceeded to give us an unvarnished opinion about a dicey matter. This experience reinforced to me that while I don't think virtual events are going away, I think that in-person events will come back strong too, as the experience is simply higher-bandwidth and more fun.

At the end of the conference, I felt like they'd done a great job.

## Content

As at any conference, there was a plethora of great content and I couldn't attend all of it. But from what I saw, there were several themes. 

### Identity Proofing

First, identity proofing is still an unsolved problem, but one that a lot of people are working on. Identity proofing is the process of knowing who someone is before you grant them an account on your system. It can also be used for account recovery. For some applications this is unimportant; an e-commerce site will happily take give me an account (and take my money) without knowing who I actually am. But for many online systems, this is really important. There was one talk about how the New York Air National Guard used identity proofing and digital identity products to allow access to sensitive systems for authorized people. As Covid forced large numbers of employees to remote work, proving folks are who they say they are at scale becomes more important.

The solutions in this space seem to focus on:

* Automatic recognition of paper, government issued documents.
* Facial recognition, including measure to thwart presentation of photos in place of real people.
* Ensuring there is a manual fallback for people when machine learning fails, or when the user has issues.

This was interesting to me because it is a step before the authentication and authorization process which FusionAuth handles well. While you can certainly do identity proofing out of band using one of the many solutions out there, if you'd like tighter integration with FusionAuth, I [filed a tracking issue](https://github.com/FusionAuth/fusionauth-issues/issues/1280) which you can upvote.

### FIDO

There were numerous sessions on [FIDO](https://fidoalliance.org/). In particular, I attended one where folks from Intuit and T-Mobile talked about their rollout. It was a continuation of a discussion panel with the same attendees two years ago. FIDO is an alliance of a number of technology vendors who are working to provide strong passwordless authentication in a way that consumers and application users will use. This includes hardware items such as Yubikeys, biometric solutions such as FaceID, and others. 

In particular, the FIDO non-profit does three things:

- Manages an open technical specification for strong passwordless authentication.
- Runs a certification program to allow companies to certify their solution.
- Runs programs to facilitate adoption of the FIDO standard. This is an increasing portion of their effort now.

FIDO adoption doesn't mean the death of passwords, but during this rollout they found that large numbers of users (>80%) prefer to authenticate with FIDO enabled methods. T-Mobile even uses FIDO to authenticate you before you even call customer service via 611. Intuit has rolled it out across of their major mobile applications.

FIDO also plays into the continuous evaluation of authorization. The T-Mobile representative mentioned that the discussion was evolving from a "what is the best second factor discussion" to a multi-factor world where you are mapping out the right set of authenticators for the action that the user is trying to take. In other words, use strong authentication where the risk suggests it.

### The Kitchen Sink

There was a large amount of other content that didn't fall into one of the two themes above. There was a certification program announced, diversity and inclusion discussions, a talk on mobile application best practices, the multitude of AWS identity solutions, and more. 

One thing that was a bit of a suprise to me was how little code I saw. Even in the talk on mobile application best practices, I didn't see code displayed. Maybe I missed the code-heavy sessions, but this seemed like a conference for IAM admins rather than developers.

However, I talked to several people who were doing interesting things with identity. One had an idea to leverage DNS to help solve the digital identity rollout problem. Another ran identity for over one hundred hospitals and had some unique challenges due to that. We talked a bit about he planned rollouts in the hospital environment, which sounded challenging. 

Someone else I talked to handled a merger of several hospitals by using a vendor's solution which let you create virtual LDAP directories. After a physical merge was required due to EMR compliance concerns, they still use the virtual LDAP directories to control access for SaaS applications.

And the complexity is immense. One person I chatted with at a happy hour commented that they had so many custom applications and identity store that consolidating everything with "unlimited budget" would take 3-5 years. And of course, they didn't have that.

In general, it was a great place to chat with people about their identity challenges and solutions.

