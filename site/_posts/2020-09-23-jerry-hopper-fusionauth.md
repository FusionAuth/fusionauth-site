---
layout: blog-post
title: Jerry loved FusionAuth so much he built an ARM image for it
description: Community member Jerry Hopper discusses how and why he sold FusionAuth to his colleagues.
author: Dan Moore
image: blogs/contaim-customer-story/contaim-adopts-fusionauth-to-manage-their-auth-lifecycle.png

category: blog
tags: topic-customer-story
excerpt_separator: "<!--more-->"
---

Jerry Hopper is a FusionAuth user and community member. He also maintains the ARM/ARM64 FusionAuth docker repo. He chatted with us over email about how he is using FusionAuth to meet his auth needs. 

<!--more-->

*This interview has been edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer.

**Jerry:** Well, no school-educated nerd here.  I'm a self-made developer. When I was at school, there was no 'computer oriented' education. My first computer was a Commodore 64, 24 years ago. With no programming skills at all I started playing around with PHP. Not the best choice as a starting point but since then I have taught myself several languages through online courses. I eventually got a job as a programmer. Nowadays I'm a freelance application developer/system engineer, and I focus on backend APIs. 

I'm still a fan of PHP but other than that I have mastered other languages like python, perl, node, and CFML. In my spare time I am also a developer. I'm that kind of guy that has a complete in-house cabinet with several servers and an impressive electricity bill. I read manuals instead of the newspaper. 

> ... the main problem that FusionAuth solves is development time and authentication headaches.  

**Dan:** What's your favorite manual that you have read recently?

**Jerry:** Currently, I'm into the [PHP Swoole docs](https://www.swoole.co.uk/). But if you are referring to my favorite paper manuals, the most recent would be "Scouting for Boys: A handbook for instruction in good citizenship" (the Dutch edition from 1961). A manual from my youth, which I tend to read every 10 years or so. It reads like an adventure. I can recommend that manual to all young people! 

Seriously though, the last technical paper book I read was "Exchange 5.5" from O'Reilly, and that's not even a manual!

**Dan:** How do you use FusionAuth? Is it for OAuth? User management? Social sign-on? Something else?

**Jerry:** I'm using FusionAuth in several ways. Mostly in my work projects the choice IdP is already decided. If not, I recommend FusionAuth! In my personal projects I use FusionAuth as a centralized IdP server for applications like gitlab, blogs, wikis and machine to machine authentication via APIs. 

With the 'rise of ARM devices', thanks to the Raspberry Pi, I discovered that FusionAuth was able to run on ARM/ARM64. I'm maintaining the [FusionAuth docker repo for it](https://github.com/jerryhopper/fusionauth-app-multiarch). Since that time, a 1GB SBC powers my `oauth2_proxy`.

**Dan:** What problems did FusionAuth solve for you? And how were you solving them before FusionAuth?

**Jerry:** The best thing about Fusionauth is that I never have any headaches about authentication mechanisms. In my pre-FusionAuth era, I was more or less dependent on services like 'Login with Google/Facebook'. This doesn't work well when you are developing in places where there is no network.

Another nice aspect is that FusionAuth is API driven, and has very complete logging, which makes it a breeze to make your applications GDPR compliant.  

The fact that fusionauth supports multiple tenants on one instance, helps when developing several different projects. 

However, the main problem that FusionAuth solves is development time and authentication headaches.  

> ... I somehow stumbled on Fusionauth. When I saw this 'out-of-the-box' signup, login and administration screens, I never went back! 

**Dan:** Why did you choose FusionAuth over the competition?

**Jerry:** Well, I initially tried some [OpenSource CAS software](https://github.com/apereo/cas), which was way over complicated to setup and maintain. After that I used Bshaffer's [OAuth2 server](https://bshaffer.github.io/oauth2-server-php-docs/) - a PHP implementation which requires a lot of custom coding. Although I learned a lot about OAuth2, JWT, and OpenID Connect, I somehow stumbled on FusionAuth. When I saw 'out-of-the-box' signup, login and administration screens, I never went back! 
 
**Dan:** Is there a work project that you can talk a bit more about using FusionAuth with? 
 
**Jerry:** Well, BLS-ICT needed a CAS service for a job/recruitment site (HRMatches). The client wishes were only 'GDPR compliance' and that the data should be within the EU. So the dev team was asked to do some research on possible solutions. The dev team's requirement was that we wanted a standards compliant SSO solution. So we compiled a list of GDPR guidelines that apply to authentication. Then we compared possible paid/open source solutions with this list to see what solution would suffice.

It didn't take long to realize there is no 'out of the box' solution which was decently priced. So we looked at open source solutions.  Apereo/CAS was the solution that my boss was aiming for because it was very versatile and written in Java. In my spare time I checked out Apereo/CAS. I thought it was over complicated for our use. The setup, and understanding it, was IMHO a time-consuming job and there would be a need for a lot of custom coding. 

So I looked further, initially focusing on Bshaffer's PHP OauthServer.  While I was prototyping what we'd need to do, and how much coding that would take, I somehow stumbled upon FusionAuth, which cut the custom coding to a minimum. I was instantly in love :).

It didn't take very long before my developer colleagues saw the potential of FusionAuth. Especially the administration API; it was their favorite part. As the HRMatches application was CFML (Coldfusion), it was clear that implementing FusionAuth in the current codebase wasn't very difficult.  

Meanwhile the HRMatches application development was on hold, as the client wasn't paying its bills. After three months the HRMatches project came to a halt as the client went bankrupt. Sad detail: just a few months before bankruptcy we convinced the boss to ditch Apereo/CAS for FusionAuth. But because of the bankruptcy we never had the chance to implement it for HRMatches.

**Dan:** Can you talk a bit more about how you use FusionAuth to make your projects GDPR compliant?

**Jerry:** We compiled a list with minimal needs for the auth service that at least 'show your intentions to follow GDPR'. (Yes, intentions were very much a thing when GDPR was introduced and still are. Proof of good intentions can save you money when GDPR violations are judged or fined.)

> Obviously a lot of GDPR compliance needs to come from the custom code in the application we build, but FusionAuth's API allowed us to do this with ease. Having the authentication separate from the main application gives us the flexibility to adapt.

Our GDPR checklist for an auth service:

1. Hosted in the EU
1. Account export 'self service'
1. Account removal 'self service'
1. Password strength/2fa 
1. Auditing/logging
1. Data encryption options
1. Anonymization

So, essentially we looked for the best product that could meet these needs. For FusionAuth, the checklist looked like:

* Hosted in the EU - check!
* Self-service - check! (Thanks to the API)
* Password strength/2fa - check
* Auditing/logging - check
* Encryption - database encryption is not required or necessary, but it is possible with PostgreSQL. One drawback is that Elasticsearch doesn't support table level encryption. However, all passwords are stored securely in the database.
* Anonymization - check, FusionAuth JWT claims can be modified when issued [to remove user data].

When looking at the pure backend of the authentication service, FusionAuth has all the GDPR headaches covered. Obviously a lot of GDPR compliance needs to come from the custom code in the application built, but FusionAuth's API allowed us to do this with ease. Having the authentication separate from the main application gives us the flexibility to adapt.

**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Jerry:** All my FusionAuth instances run on docker, obviously behind an (nginx) proxy. 

For offline/external development I run a FusionAuth server on a NanoPi Neo2 SBC which I carry with me wherever my laptop goes. 

**Dan:** Why don't you use FusionAuth on your laptop instead of carrying around the NanoPi Neo2? Just because deploying FusionAuth to the NanoPi is more fun :)?
    
**Jerry:** When I worked at BLS-ICT, there was a need for an auth server as mentioned above. The boss decided more or less he wanted the Apereo/CAS implementation. I wasn't convinced. So after some research I introduced FusionAuth to my colleagues while the choice was already set for Apereo/CAS. Initially I introduced FusionAuth to my colleagues on a VM on my machine. So in their 'spare' time, they would be playing around with FusionAuth.  
> I do think that the web-interface and 'local availability' of the FusionAuth instance was the key to convincing my colleagues that FusionAuth was very suitable for us.
 
But I was both a developer as well as technical support for some clients, for whom I needed to use a VPN. And when I was on the VPN my colleagues couldn't reach my virtual FusionAuth instance. My boss wouldn't allow me to run FusionAuth on the dev servers, so I just plugged a NanoPi in the network so my colleagues could play with it, even when I wasn't there.  It was my way of trying to convince my colleagues and giving the application maximum exposure. I think it was after one to two months I decided to deploy a ARM64 device with FusionAuth in the office as I wasn't allowed to run a dedicated one on development servers. I do think that the web-interface and 'local availability' of the FusionAuth instance was the key to convincing my colleagues that FusionAuth was very suitable for us.

**Dan:** Any general feedback/areas to improve?

**Jerry:** I think for completeness sake the 'Client Credentials' grant should be implemented. [ed note: see [this issue](https://github.com/FusionAuth/fusionauth-issues/issues/155) for more on that]

Oh, and would love to see official multi-arch docker builds ;). 

-------

We love sharing community stories. You can check out [the FusionAuth ARM/ARM64 repository](https://github.com/jerryhopper/fusionauth-app-multiarch) if you'd like to learn more

