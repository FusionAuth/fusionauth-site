---
layout: blog-post
title: Recon InfoSec switched to FusionAuth from AWS Cognito 
description: Recon InfoSec Lead Architect Whitney Champion discusses how FusionAuth has helped her business provide a seamless experience to their end users.
author: Dan Moore
image: blogs/reconinfosec-story/recon-infosec-switches-to-fusionauth-from-aws-cognito.png
category: blog
tags: topic-community-story topic-upgrade-saas topic-upgrade-cognito
excerpt_separator: "<!--more-->"
---

Whitney Champion is a FusionAuth community member and lead architect at Recon InfoSec, a managed security services provider. She chatted with us over email about how she and her team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer/architect.

**Whitney:** I'm the lead architect at Recon InfoSec. We are a managed security services provider, and we also provide [security training through our Network Defense Range](https://www.reconinfosec.com/training/). Both of these live on pretty sizable security stacks composed of a wide variety of tools that we use--for threat hunting, monitoring, ticketing, forensics, triaging, etc. I'm responsible for architecting/maintaining those stacks and finding the best ways to integrate everything we need in the most secure and efficient ways possible. 

> [FusionAuth] has saved us from having to build our own middleware on top of Cognito, or drop $$$ on something like Auth0 or Okta. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Whitney:** Primarily, we use FusionAuth for user management and OAuth, specifically for our Network Defense Range. Our Network Defense Range provides analysts with a suite of tools, and the authentication mechanisms within those tools vary widely. The nice part about FusionAuth coming into the picture is that it plays nice with all of those mechanisms, and AWS Cognito, so we can integrate all of our platforms, and continue to add them, knowing that FusionAuth will provide a seamless experience for our end users. 

**Dan:** Are there any tools you can name drop?

**Whitney:** Absolutely--we're very open about our toolset :) And we're huge promoters of everything we use. Graylog, Velociraptor, osquery, and Moloch are the threat hunting/DFIR platforms we put in front of participants, as well as TheHive for incident tracking, and RocketChat. 

**Dan:** Curious about the "mechanisms" you mentioned? Do you mean various flavors of OAuth, or are you talking about SAML or OIDC? How do you mean "plays nice"? I'd love to know a bit more about that.

**Whitney:** AWS Cognito is wired up to FusionAuth with OIDC -- works flawlessly, and this sits in front of all our platforms:

* TheHive uses OAuth/OIDC -- this took some finesse as they have been under heavy development getting their latest major release out, and a lot of changes were made to the auth mechanisms, but it's mostly sorted out now
* RocketChat uses OAuth -- works flawlessly
* CTFd uses OAuth -- we've had to make some tweaks on their end to get it to play nice, but this has to do with the way they implemented it
* Moloch uses anonymous logon, and so does Kibana, and the osquery frontend that I built (it could use OIDC also). Graylog has SSO but uses request headers which are set statically on our end. Being able to put FusionAuth in front of all of these as the auth layer is perfect.

We've also had to integrate internal tools with the FusionAuth API and the documentation has been immensely helpful. No major hiccups so far.

> ... we can integrate all of our platforms, and continue to add them, knowing that FusionAuth will provide a seamless experience for our end users. 

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Whitney:** We were previously relying solely on AWS Cognito. And that works fine, for the most part, until you need anything beyond the basic capabilities it provides. Then you start having to develop your own tools, or integrating with others. While we are more than willing to do the former, it's not where we'd prefer to spend our time and resources. Which is where FusionAuth came in. We also needed passwordless login--the magic link feature. Few platforms make it as easy as FusionAuth does.

**Dan:** Could you ballpark how much time using FusionAuth has saved Recon InfoSec? 

**Whitney:** I'm not sure on actual hours (many), but it has saved us from having to build our own middleware on top of Cognito, or drop $$$ on something like Auth0 or Okta. 

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Whitney:** It's currently running as a standalone Tomcat server behind an AWS application load balancer. 

**Dan:** Why did you choose FusionAuth over the competition?

**Whitney:** A big factor was the fact that FusionAuth is extremely supportive of open source. While it's not 100% open source, parts of it are. FusionAuth contributes to the community, employees are active on Slack and GitHub, and you are big on security, etc. It just kind of checked a lot of boxes for us, that we really consider important in our space and to our company. 

We're huge believers in the open source community, and we try to contribute to as many of our tools as we can. Many of the platforms we rely on are open source, so it only made sense to try out FusionAuth when we found it. As it turns out, it checks just as many boxes as the other leading competitors (if not more), some of which are far more expensive in their enterprise offerings. 

We were hesitant to host our own, since it then becomes another platform for us to maintain with everything else, but it has been a breeze so far, which speaks to how rock solid the documentation is--another contributing factor in our decision to use FusionAuth. The fact that it has such a robust API is also huge for us, since we use it heavily as well.

> Working with the FusionAuth team when any issues do come up has been awesome--always responsive, and willing to help get to the root of our issues. 

**Dan:** Can you talk a bit more about how you use the API? Is it for user onboarding (creating users, etc), reporting, auditing, etc? 

**Whitney:** Onboarding, heavily. Yes. Not so much reporting and auditing yet, though I'm sure it'll probably get to that at some point. But onboarding and user management of teams and events has heavily relied on using the API.

**Dan:** Any general feedback/areas to improve?

**Whitney:** We love the platform, and how easy it's been to integrate it into our existing stack with minimal lift or headache. Working with the FusionAuth team when any issues do come up has been awesome--always responsive, and willing to help get to the root of our issues. 

-------

We love sharing community stories. You can check out [Recon InfoSec's website](https://www.reconinfosec.com/) if you'd like to learn more. You can also follow [Whitney on Twitter](https://twitter.com/shortxstack/).
