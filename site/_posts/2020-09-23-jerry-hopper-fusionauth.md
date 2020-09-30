---
layout: blog-post
title: Contaim adopts FusionAuth to manage their auth lifecycle
description: Contaim CEO Jerry Plunkett discusses how FusionAuth has helped his business.
author: Dan Moore
image: blogs/contaim-customer-story/contaim-adopts-fusionauth-to-manage-their-auth-lifecycle.png

category: blog
tags: topic-customer-story
excerpt_separator: "<!--more-->"
---

Jerry Hopper is a FusionAuth user and community member. He chatted with us over email about how he is using FusionAuth to meet his auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer.

**Jerry:** Well, no school-educated nerd here.  I'm a self-made developer. When I was at school, there was no 'computer oriented' education. My first computer was a c64 and 24 years ago. With no programming skills at all I started playing around with PHP. Not the best choice as starting point but since then I taught myself several languages through online courses. I eventually got a job as programmer.  Nowadays I'm a freelance application developer/system engineer, and i focus on backend-api's. I'm still a fan of PHP but other than that I have mastered other languages like python, perl, node, and CFML. In my spare time I am also a developer. I'm that kind of guy that has a complete in-house cabinet with several servers and an impressive electricity bill. I read manuals instead of the newspaper. 

**Dan:** What's your favorite manual that you have read recently?

**Jerry:** Currently, I'm into the [PHP Swoole docs](https://www.swoole.co.uk/). But if you are referring to my favorite paper manuals, the most recent would be "Scouting for Boys: A handbook for instruction in good citizenship" (the dutch edition from 1961). A manual from my youth, which I tend to read every 10 years or so. It reads like an adventure. I can recommend that manual to all young people! Seriously though, the last technical paper book I read was "Exchange 5.5" from O'Reilly, and that's not even a manual!

**Dan:** How do you use FusionAuth? Is it for OAuth? User management? Social sign-on? Something else?

**Jerry:** I'm using fusionauth in several ways. Mostly in my work-projects the choice of which IDP to use is already decided. If not, I recommend FusionAuth! In my personal projects I use FusionAuth as a centralized IdP server for applications like gitlab, blogs, wiki's and machine to machine authentication via APIs. 

With the 'rise of ARM devices' thanks to the Raspberry Pi, I discovered that FusionAuth was able to run on Arm/Arm64. I'm maintaining the [FusionAuth docker repo for it](https://github.com/jerryhopper/fusionauth_app_arm64). Since then a 1gb SBC powers my `oauth2_proxy`.

**Dan:** What problems did FusionAuth solve for you? And how were you solving them before FusionAuth?

**Jerry:** The best thing about Fusionauth is that I never have any headaches about authentication mechanisms. In my pre-FusionAuth era, I was more or less dependent on services like 'login with google/facebook'. This doesn't work well when you are developing on places where there is no network.

Another nice aspect is that FusionAuth is api-driven, and has very complete logging, which makes it a breeze to make your applications GPDR compliant.  

The fact that fusionauth supports multiple tenants on one instance, helps when developing several different projects. 

However, the main problem that FA solves, is development time and authentication headaches.  

**Dan:** Can you talk a bit more about how you use FusionAuth to make your projects GDPR compliant?

**Jerry:** We compiled a list with minimal needs for the auth service that at least 'show your intentions to follow GDPR'. (Yes, intentions were very much a thing when GDPR was introduced and still is. Proof of good intentions can save you money when GDPR violations are judged or fined):

Our gdpr checklist for an auth service:

1. Hosted in EU
1. Account export 'self service'
1. Account removal 'self service'
1. Password strength / 2fa 
1. Auditing/logging
1. Data encryption options
1. Anonymization

So, essentially we looked for the best product that could meet these needs. For FusionAuth, the checklist looked like:

Point 1: hosted in EU - check!

Points 2 and 3: self-service - check! (thanks to the API)

Point 4: password strength/2fa - check

Point 5: logging/audit - check

Point 6: encryption - database encryption is not required or nessecary, but it is possible with postgreSQL. One drawback is that elastic doesn't support table level encryption. However, all passwords are stored securely in the database.

Point 7: Anonymization - check, FA JWT claims can be modified when issued [to remove user data].

When looking at the pure backend of the authentication service - FusionAuth has all GDPR headaches covered. Obviously a lot of GDPR compliance needs to come from the custom code in the application we build, but FusionAuth's API allowed us to do this with ease. Having the authentication separate from the main application gives the flexibility to adapt.

**Dan:** Why did you choose FusionAuth over the competition?

**Jerry:** Well, I initally tried some OpenSource CAS software, which was way overcomplicated to setup and maintain. After that i used Bshaffer's [OAuth2 server](https://bshaffer.github.io/oauth2-server-php-docs/) - a php implementation which requires a lot of custom coding. Although I learned a lot about Oauth2, JWT, and openID, I somehow stumbled on Fusionauth. When i saw this 'out-of-the-box' signup, login and administration screens, I never went back! 
 
**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Jerry:** All my FusionAuth instances run on docker, obviously behind an (nginx) proxy. 

For offline/external development I run a FusionAuth server on a NanoPi Neo2 SBC which I carry with me wherever my laptop goes. 


> aaa
 
**Dan:** Any general feedback/areas to improve?

**Jerry:** Im not sure - although I think for completeness sake the 'Client-Credentials' grant should be implemented.  

Oh, and would love to see official multi-arch docker builds  ;). 

-------

We love sharing community stories. You can check out [Contaim's website](https://contaim.io/) if you'd like to learn more about his company.

    Jerry hopper, community maintainer Arm/Arm64 FA  repository  ( https://hub.docker.com/repository/docker/jerryhopper/fusionauth-app )


    What link would you like me to use when I introduce you (Jerry, from <company X>, or something different)

    Jerry hopper, community maintainer Arm/Arm64 FA  repository  ( https://hub.docker.com/repository/docker/jerryhopper/fusionauth-app )


     




No problem, but i must say that i use fusionauth purely personal. I did try to introduce FA for a certain work project- but sadly the client of that project (hrmatches) went bankrupt.
But the story behind it is quite interesting, as it describes the  'discovery of auth' for a team of developers who's goal is simplicity and gdpr compliance.

cheers!

On Mon, Sep 21, 2020 at 10:45 PM Dan Moore <dan@fusionauth.io> wrote:
Awesome, thanks for this!

A few follow on questions:

* what does CAS stand for? I'm not familiar with that.
CAS is short for Central Authentication service.  I did checked my past conversations and the cas application we intended to use at bls-ict was https://github.com/apereo/cas: 
My boss introduced the term 'CAS' to me ( He was a fan of Apereo/Cas solution )

* what's your favorite manual you read recently?

Currently, im into php-Swoole docs. but if you are referring to my favorite paper manuals - most recent would be "Scouting for Boys: A handbook for instruction in good citizenship" (the dutch edition (1961))  A manual from my youth, which i tend to read every 10 years or so. it reads like an adventure.  i can recommend that manual to all young people!    Seriously though - the last technical paper manual i read was exchange 5.5 from oreilly -  and thats not even a manual!

* is there a work project that you can talk a bit more about using FusionAuth with? Business domain, stack, functionality? (If not, totally understand, just thought I'd ask.)
 
 Well, BLS-ICT needed a CAS service for a job/recruitment site (hrmatches.com) . The client wishes were only  'gdpr compliancy' and the data should be within EU - so the dev-team was asked to do some research on possible solutions. The dev-team's requirement was that we wanted a standards compliant SSO.   So we compiled a list of GDPR guidelines that apply on authentication. Then we compared possible paid/opensource solutions with this list - and see what solution would suffice.
 It didnt take long to realize there is no 'out of the box' solution, which was decently priced. So - we looked at opensource solutions.  Apereo/cas was the solution that my boss was aiming for because it was very versatile, and java.  In my sparetime i checked out this Apereo/Cas - and i though it was overcomplicated for our use. The setup - and understanding it - was imho a time-consuming job and  there would be a need for a lot of custom coding. So i looked further,  - initially focussing on Bshaffer's php OauthServer.  While i was prototyping what would be needed, and how much coding-resources that would take, i somehow stumbled upon fusionauth, which cut down the custom coding to a minimum. i was instantly in love :)

 It didnt take very long before my developer-collegues saw the potential of fusionauth. Especially the administration API was the favorite part for them.  As the HRMatches application was CFML (coldfusion) - it was clear that implementing fusionauth in the current codebase wasnt very difficult.  Meanwhile - the HRMatches application-development was on 'hold' - as the client wasnt paying its bills. After 3 months - the HRMatches project was come to a halt - as the client went bankrupt. Sad detail : just a few months before bankrupty - we convinced the boss to ditch apereo/cas for fusionauth - but because of the bankrupty we never had the chance to implement it.

  
  * can you talk a bit more about how you use FusionAuth to make your projects GDPR compliant?
   * why don't you use fusionauth on your laptop instead of carrying around the nanopi neo2? Just because deploying FusionAuth to the nanopi is more fun :) ?
    
    When i worked at BLS-ICT, there was a need for a CAS server. The boss decided more or less he wanted Apereo/Cas implementation. i wasnt convinced. so after some research i introduced FA to my collegues while the choice was already set for Apereo/Cas. Initially i introduced FusionAuth to my collegues on a vm on my machine.   So - in their 'spare' time, they would be playing around with FA.  But i was both developer as well as technical support for some clients, for who i needed to use vpn, And when i was on the VPN - my collegues couldnt reach my virtual fusionauth instance.  My boss wouldnt allow me to run a FA on the dev-servers, so i just plugged a nanopi in the network so my collegues could play with it, even when i wasnt there.  It was my way of trying to convince my collegues - and giving the application maximum exposure.  i think after 1-2 months - i decided  to deploy a Arm64 device with fusionAuth in the office - as i wasnt allowed to run a dedicated one on development servers. i do think that the web-interface and 'local availability' of the fusionauth instance was the key to get to convince my collegues that FA was very suitable to us.
