---
layout: blog-post
title: User Data Security is a Breach
description: Data security includes hardware, software, and human challenges. Use this guide with code examples to secure your system from the beginning.
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
- security
image: blogs/user-data-security-is-a-breach.png
---

If you follow us on Twitter (if you don't, you can [fix that now](http://bit.ly/2WOcw7D)) you’ll see that we post about data security breaches hitting the internet community. We don’t do it to be malicious or gloat about their failures, but to increase awareness beyond the core community of security professionals. We deal with security every day so we know that keeping data secure is a complex challenge. Few people are well-versed in its many facets and subtleties, and it can be difficult to stay informed of the current trends and risks. We hear all the time “See? You can’t stop cyber breaches.” Fortunately, that’s a load of crap.

<!--more-->

[{% include _image.html src="/assets/img/blogs/guide-userdata-inline.png" alt="Guide to User Data Security" class="float-right" figure=false style="width:400px;" %}](/resources/guide-to-user-data-security)

There is a lot you can do to stop cyber breaches and protect your user data. To get you started we’ve put together this [Guide to User Data Security](/resources/guide-to-user-data-security) with a GitHub project that contains a set of scripts you can execute. Should you execute them without knowing exactly what they do? Hell no. Read the guide and understand the points, and then review the scripts. Internet Safety 101 says always check it out for yourself. Read on for an overview of data security, and check out the guide for the deep details, scripts, and strategies to keep you data safe.

## Data Security Is Complex

The reason data security is difficult is threats come from a wide range of sources. Some industry professionals use a metaphor comparing system security to putting a strong lock on the front door of your house. That doesn’t even come close to encompassing the complexity of the situation. If we wanted to make the house metaphor accurate, we’d have to include doors, windows, family, guests, friends of guests, furniture and appliances, contractors and service professionals—basically everything, everyone and anything that gets close to your house. Plus, we’d have to plan against the thousands of people trying to find a way to break in every moment of every day.

**Security professionals need to defend against:**

- Hardware attacks that take advantage of vulnerabilities in routers, processors, equipment and connection pathways
- Firmware attacks that exploit the core functional code of our computers and devices
- Software attacks that invade the sites, tools, and applications that allow us to communicate and interact
- Social engineering attacks that focus on the most easily targeted access point of all: the people using the system

And it gets worse. What if you had to worry about the locks on your neighbor’s doors? With the explosion of cloud-based and multi-tenant services, security teams need to think about how their systems can be compromised by [sharing multi-tenant resources](https://threatpost.com/delta-sears-breaches-blamed-on-malware-attack-against-a-third-party-chat-service/131023/ "Jump to Threatpost site"). (For more information, [read our whitepaper about single and multi-tenant systems.](https://fusionauth.io/blog/2018/12/03/single-tenant-vs-multi-tenant)) This is just the beginning of the challenges security teams face. Hackers are leveraging advances in processing power and computer AI technology to build an ever evolving set of exploits and attacks.

## Data Security Is A Full Time Job

Even if it is your primary job, it’s not easy to stay ahead of the range and scope of possible hacks. At FusionAuth we are constantly refining our codebase to handle increasingly sophisticated challenges, and work with the security-developer community to stay on top of the most recent exploits. We even do our own research. In 2016 we hosted a hack challenge for the community to take their best shot. We were not disappointed. The talented team at [Polynome successfully breached the security](http://polynome.co/infosec/inversoft/elasticsearch/linode/penetration-testing/2016/08/16/hack-that-inversoft.html "Jump to Polynome article") on our testing server, illustrating how creative and detailed an attack can be. Lucky for us we were just doing research.

The point of all this is that system security and data privacy are a full-time job, and [SHOULD be a high-priority](https://www.zdnet.com/article/why-is-it-so-hard-for-us-to-pay-attention-to-cybersecurity/ "Jump to ZDNet article") for every organization. Large companies struggle to defend against cyber threats, and it is even more difficult for startups and small- to medium-sized companies with more restricted time and money. Every company must apply their resources to protect against the most probable threats, and be ready to address any issues that arise. Some companies never have any problems. Others aren't so lucky and have failures at the worst possible time impacting users, punishing the company’s reputation, and costing millions of dollars. ([According to IBM](https://www.wraltechwire.com/2018/04/05/ibm-human-error-is-biggest-reason-for-data-breaches-as-ransomware-attacks-surge/ "Jumpt to Wral Tech Wire"), attacks specifically focused on locking critical data and collecting ransoms cost firms more than $8 billion last year.) Additionally, [the GDPR](/blog/2019/01/29/white-paper-developers-guide-gdpr) introduces substantial risks of legal violations and monetary fines.   

## Make Data Security a Priority

There is no question that data security and privacy will continue to be a prominent issue, and companies need to address it now. Security has moved from a “we’ll get to that eventually” feature to a "we need to do this from the beginning" priority, and must be skillfully factored into designs, projects and timelines. Make sure your team understands [the complexity of security needs](/challenges-of-ciam) and plans to continue revising the system to keep up with evolving exploits. If you decide to leverage third-party providers and partners, ask them how they address security issues and stay current. If their system fails you can lose your business and reputation.

## Where Do We Start?  

A question we hear frequently is “With all the possible issues, where do we start?” The current best answer is to balance your available resources against the most common threats, and get the most secure system you can afford (Did we mention [FusionAuth is free?](/)). Include security considerations into your decision-making process, and evaluate the short- and long-term risks.

For example, a component that is common in almost every application no matter what the purpose is identity and access management. At its most basic, this is the registration and login process. According to security experts, this is one of the most vulnerable points in a system, and hackers often get their first access through a compromised user identity or weak authentication process. From there they are able to access the rest of the system’s data.

Unfortunately, since it is not a “revenue generating” component of the application, registration and authentication is considered not worth the time of the senior application engineers. The development of this highly-targeted access point is often assigned to a junior developer with little to no experience in security. This creates an immediate risk for any business. Inexperienced developers building the part of the system almost guaranteed to be attacked by experienced hackers with their most refined techniques. A clear recipe for disaster.

One (obviously self-serving) solution to this front-line risk is FusionAuth, our flexible and secure customer identity and access management platform. Easy for any developer to install and integrate, FusionAuth allows an application to have a powerful and secure registration, authentication and user management system without investing massive hours of senior developer resources. Our UX and security team have put hundreds of hours into FusionAuth to provide a product that is simple for developers and secure for one to one million users and beyond. Us it to eliminate a severe security risk while saving valuable developer resources.

## Guide to User Data Security  

If you aren't already a security expert, don't worry. The guide below is for the software developer, architect or system administrator who doesn’t want to spend a lifetime wading through cryptographic algorithms and complicated explanations of arcane system administration topics to tackle software security. We have taken everything we have learned through the years about server and application security and distilled it into this simple yet detailed guide. This is not the sum of all things that could be or have been said about software security, but if you implement each of the concepts in this guide the security of your user data is off to a great start.

[Read FusionAuth's Guide to User Data Security](/resources/guide-to-user-data-security){: .btn .btn-primary}

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, passwordless login, social login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn more about FusionAuth](/ "FusionAuth Home"){: .btn .btn-primary}
