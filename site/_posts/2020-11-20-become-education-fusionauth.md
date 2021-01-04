---
layout: blog-post
title: Become Education chose FusionAuth and built features rather than user management
description: Career Education as a Service startup Become Education evaluated IDaaS services and chose FusionAuth because FusionAuth understood them.
author: Dan Moore
image: blogs/...
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

David Wilson is a FusionAuth community member and co-founder and CTO at Become Education, a "careers education as a service" company. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer and CTO.

**David:** I'm the technical cofounder at Become Education, based in Sydney. We provide Careers Education as a service to schools teaching grades 5 through 10. We provide curriculum and teacher professional development in conjunction with student and teacher facing SaaS applications to support that activity. I'm responsible for the apps as well as internal systems.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**David:** We use FusionAuth for OAuth and use the provided login UI to support SSO and passwordless access for our users. Accounts are first established in our system and we use the FusionAuth API to create logins and keep things synced up.

> Free tiers for developers [for other IDaaS services] are common but requirements like custom domains or control of data residency can trigger enterprise pricing.

**Dan:** Interesting. So FusionAuth is not the system of record, your system is. Why didn't you build SSO and OAuth directly into your system? Have there been any hiccups in syncing the data from your system to FusionAuth? 

**David:** FusionAuth definitely helped speed up the product release by letting us focus on building features rather than user management. For start-up products FusionAuth is very helpful and easy to roll out since it supports almost all popular identity protocols and frameworks.

We anticipated that we couldn't accurately scope what functionality would become critical for us after gaining experience with early deployments. Passwordless, for example, was not on my radar. But having it available provided an unexpected solution for certain schools.

We drive account creation from our admin app and the API's first step is to create or lookup an account on FusionAuth and return the `user.id`. The FusionAuth `user.id` becomes the id for our user system, creating a link that will survive changes to the email address. We never drive account updates from the FusionAuth UI and always push from our system so this simplifies the syncing. But our user APIs are more complex than they would otherwise be and bugs do happen.

> The decision [to use FusionAuth] was then easy. Ignore the big names and go with the team that understands startups and can scale with them.

**Dan:** Do schools have auth systems you need to integrate with?

**David:** So far we’ve only need to support school OpenID Identity Providers.

**Dan:** What resources are protected by OAuth (APIs or something else)?

**David:** Everything interesting is behind our APIs so that's what we protect. 

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**David:** Our initial release of the student application didn't support user accounts - each class had an access key. FusionAuth allowed us to move beyond that by solving the authentication/authorization challenge.

> For start-up products FusionAuth is very helpful and easy to roll out since it supports almost all popular identity protocols and frameworks.

**Dan:** Why did you choose FusionAuth over the competition?

**David:** It is hard to overstate how expensive IDaaS services can be. The cost/feature ramp might work for some startups but can hurt product design and implementation at others.

Free tiers for developers are common but requirements like custom domains or control of data residency can trigger enterprise pricing.

Pre-sales support can burn a couple of weeks to return a canned reply.
 
I discovered FusionAuth in the midst of that frustration. We connected with a human on the first try and he happened to be the lead developer. The decision was then easy. Ignore the big names and go with the team that understands startups and can scale with them.

**Dan:** That's awesome! We love to hear that we've helped. To put some numbers on it, how much time and money would you say choosing FusionAuth saved you?

**David:** I don’t know how to do that with any accuracy. FusionAuth and competitor products have evolved. Our list of unknown unknowns is larger with the other guys, but our requirements will shift to deal with the environment, limitations, and compromises created by any decision.

> It is hard to overstate how expensive IDaaS services can be.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**David:** Running on a three node cluster in Azure Kubernetes Service.

**Dan:** Any general feedback/areas to improve?

**David:** Our applications are 'serverless' and we are on consumption based billing resulting in easy scaling. This is important since classroom activity is bursty and there are long periods with zero activity. 

We host FusionAuth on Azure. We've redeployed four times looking for the right price/performance balance. We can deploy FusionAuth as needed to meet data residency requirements but this requires three VMs per region. 

Utopia would be serverless deployment of FusionAuth. For example, versions for major cloud providers like Azure and AWS that would support consumption based plans. This would solve hosting cost and scalability challenges. 

But since I've got VMs running 24/7 to handle CIAM, I see potential for more app access control in FusionAuth.

FusionAuth is maintaining state while servicing apps that don't. I expect that a teacher will occasionally tell 3 or 30 kids to share the same account for the hour. A feature that limits creation of concurrent sessions could limit account abuse and protect user data from session overwrites.

**Dan:** So a serverless version of FusionAuth would be awesome, eh? Are you thinking of something like Aurora Serverless or Cognito? Are there examples of other auth systems running out there that make you say: "I wish FusionAuth had that deployment model!"?

**David:** Cognito has improved in the last couple years and yeah that deployment model is of great interest.

> FusionAuth definitely helped speed up the product release by letting us focus on building features rather than user management. 

**Dan**: Other than the cost concerns (as mentioned above), were there any wrinkles or troubleshooting you had to do to run FusionAuth in AKS?

**David:** Currently the AKS nodes are restarting at least daily and we don’t understand this yet. It would be useful if the system logs appeared in the UI rather in docker environment.

-------

We love sharing community stories. You can check out [Become Education's website](https://www.become.education/) if you'd like to learn more. 
