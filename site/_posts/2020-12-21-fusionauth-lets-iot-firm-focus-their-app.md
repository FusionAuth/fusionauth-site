---
layout: blog-post
title: IoT company picks FusionAuth to avoid getting distracted by auth
description: FusionAuth allows an IoT company to ignore auth and focus on building their applications.
author: Dan Moore
image: blogs/ampio-customer-story/iot-company-picks-fusionauth-to-avoid-getting-distracted-by-auth-header-image.png
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

Michał Getka is a FusionAuth community member and software engineer at Ampio Smart Home. He's working on the company's cloud offering, which meets the needs of their modern IoT platform. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer.

**Michał:** I'm working as a software engineer at Ampio Smart Home, a company providing complete highly customized smart home solutions. We provide components adding smart aspects into customers' lights, blinds, heating, air conditioning and more. Our system can also be integrated with IoT devices from other manufacturers. We are responsible for most aspects of our product's design - from electronics, hardware design and manufacturing, embedded software development to providing a cloud platform allowing customers to remotely access their installations.

Our system stands out because of its distributed architecture. There is no single point of failure - there is no central component whose failure will prevent you from turning on the lights in your bedroom. Another prominent aspect is the fact that the installation is not tightly bound with our cloud. Customers with limited internet connectivity or who just don't want to utilize our cloud can still benefit from all our features on the LAN network, including the smart phone app. More computer literate customers can ensure themselves remote access without our cloud.

> Primarily, we wanted to find a production ready identity management solution with OAuth capabilities, to focus our development efforts on our system domain components.

**Dan:** What is the main use case for having a smart home solution? Is it comfort? Energy efficiency? Something else? Why would someone buy your solution? (It certainly sounds awesome to me.)

**Michał:** Speaking as a developer to another developer, I would say that smart home installation can be imagined as a framework in which each of home appliances stand as an independent service which provides its designated functionality and can trigger actions on another device. These appliances are things like wall switches, light points, home audio systems, actuated blinds or driveway gateways. It's up to you what you will use it for. 

In our business model the devices are installed in clients' properties by trained contractors who support the clients in deciding which automation will be most beneficial. So, going back to the primary question, such an installation can be used to increase a resident's comfort, the installation's energy efficiency, security etc. All installation properties are governed by its configuration. 

And the configuration can be changed - if you want this wall switch next to your living room door to turn on funky, colorful LED lights instead of the main chandelier, as it was before, all that needs to be done is to reprogram the installation. There is no need to change the wiring in the wall. And besides all this, it's just cool - for me, a technology enthusiast, it's very appealing to control each of the appliances in my home with my smartphone.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Michał:** Actually, all the above. We are utilizing OAuth for social sign-on, as well as an authentication and authorization protocol for our internal and external services. Groups allow us to differentiate end-users and contractors who are granted access to additional resources. We were also happy to see that FusionAuth can take care of [user consents](/docs/v1/tech/apis/consent/) and localization settings management.

**Dan:** How are you using the consent model, or is that part of a future feature you're planning?

**Michał:** We are using FusionAuth's consents functionality to manage user consents on things like newsletters and terms of service. On top of that, we introduce a notion of required consents. Those will be for items like terms of service and privacy policies. On each successful login attempt, our services check whether the user has agreed to the required consents, and if not, he or she is redirected to our custom consent collection view. 

With this, we are covering two scenarios. One of them is the change of the consent's content - for example if we change something in the terms of service, we will define new consent like `terms_of_service_v2` and mark it as required instead of the previous one. Then, each user will be asked to familiarize themselves with the new consent content and make his or her decision. 

The second scenario is social sign-on. If the user creates an account directly, we will show them checkboxes in the registration form. But if he or she creates an account via social sign-on there is no place to put checkboxes, so he or she will be asked to consider the required consents after the first successful authentication.

**Dan:** How much time and money would you say using FusionAuth has saved you?

**Michał:** Such estimates are always hard for me, so I would rather not answer with numbers out of thin air.

> FusionAuth is a product where each of our requirements is either fulfilled out of the box, or it could be easily developed based on the API, webhooks or other workarounds.
 
**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Michał:** Primarily, we wanted to find a production ready identity management solution with OAuth capabilities, to focus our development efforts on our system domain components. So, we did what you are suggesting on the FusionAuth homepage - we took FusionAuth, and have gone on to build something awesome.

At the moment, our system which incorporates FusionAuth is still in development. Our current system is a monolith including a custom identity management solution that doesn't facilitate OAuth functionality. Our current efforts are aiming to redesign the whole thing using a microservices approach. OAuth allows us to perform user authentication and authorization utilizing standard libraries. It is also crucial for authorization of external services like Google Assistant or Amazon Alexa for voice assistant integrations.

In order not to get distracted while building something awesome, we didn't want to implement front-end aspects of the authorization flow, which can be pretty complex taking different authentication flows into account. FusionAuth's theming system gave us enough flexibility to tailor the provided authorization flows to our needs.

Another aspect worth mentioning is user migration. Our current system incorporates a custom password hashing scheme. By making use of the [password hashing plugin development tutorial](/docs/v1/tech/plugins/password-encryptors/), it was not an issue to implement our custom scheme, even for a developer with no experience in Java. To eventually get rid of the custom scheme we are enabling password rehashing on the login event.

> FusionAuth saved us a lot of time in preparing identity management and user authorization. We value its developer friendliness and interface clarity.

**Dan:** Can you talk a bit more about the Google Assistant/Alexa integrations? Have those been built out, or are they on the roadmap? If the former, any interesting challenges encountered?

**Michał:** Those integrations are on our roadmap. In general, it involves implementation of an API that maps our model of smart home installation onto a model that is understood by Google's or Amazon's integration services. The aspect where FusionAuth kicks in is the access authorization. OAuth2 is utilized to allow the user to grant Google or Amazon access to his or her installation via our API.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Michał:** We are deploying FusionAuth as a custom docker container. Our image is based on a generic FusionAuth image but adds some utilities that we have found useful. For example, FusionAuth provides tools for easy localization of authentication views, but there are no such tools for email message localization. So we have built such utilities in conjunction with [Kickstart](/docs/v1/tech/installation-guide/kickstart) and the API. This is one of examples where some functionality may be missing, or may be not so fun to use, but can easily be extended with low development effort.

On a network level, FusionAuth stands behind a reverse-proxy server. Publicly we are exposing only authentication related endpoints so FusionAuth can be mounted on the same domain as our primary application. The admin panel as well as API endpoints are accessible only in the internal network.

**Dan:** Would you be interested in open sourcing the tooling around email messages localization :) ? That sounds pretty great.

**Michał:** I'm not entirely sure whether those few lines in python are worth publishing, but I can share what they are about. The idea is to create jinja2 templates for each email. The templates are localized with the use of GNU gettext. Based on the jinja2 templates, localized FreeMarker templates are rendered. So, yeah - templates for templates ;) 

Rendered templates and stylesheets are then passed through the premailer tool to increase visual consistency across email clients and pushed into FusionAuth either via Kickstart or the API. If you would be interested in building such functionality I believe it should be done in a similar way that themes are localized. That is, each message has an HTML and Text template and messages file for each locale. Our current solution is just a workaround of the current limitation and as such is not particularly elegant.

> In order not to get distracted while building something awesome, we didn't want to implement front-end aspects of the authorization flow, which can be pretty complex taking different authentication flows into account. 

**Dan:** Which reverse proxy did you use?

**Michał:** HAProxy as an edge proxy with TLS offloading, and a bunch of nginx instances for static content, WSGI applications and the FusionAuth instance itself. HAProxy also has some neat features in the terms of upstream service health checking. 

The results of those checks are easily exposed in prometheus format. Since FusionAuth doesn't expose such metrics itself, we rely on the data provided by HAproxy. Anyway, a prometheus interface for FusionAuth would be lovely! [ed note: follow along on this issue for [prometheus support](https://github.com/FusionAuth/fusionauth-issues/issues/362).]

**Dan:** Why did you choose FusionAuth over the competition?

**Michał:** We didn't want to go with a SaaS option, so we were looking for a self-hosted solution. We defined a set of requirements including ease of user migration, MFA options, and so on. The features we needed were, in general, present in the solutions available on the market, but rarely all at once. FusionAuth is a product where each of our requirements is either fulfilled out of the box, or it could be easily developed based on the API, webhooks or other workarounds.

Most of the concerns about FusionAuth stemmed from the closed source model, particularly around responsiveness to bugs and business model risk. After some time as a member of the FusionAuth community I've seen that the dev team is pretty responsive to users' feedback, so it calmed me enough to be confident in choosing FusionAuth as a central identity management service for our product.

**Dan:** Any general feedback/areas to improve?

**Michał:** FusionAuth saved us a lot of time in preparing identity management and user authorization. We value its developer friendliness and interface clarity. 

-------

We love sharing community stories. You can check out [Ampio Smart Home's website](https://ampio.pl) if you'd like to learn more. 
