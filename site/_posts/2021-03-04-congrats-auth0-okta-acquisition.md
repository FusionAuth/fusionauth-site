---
layout: blog-post
title: Congratulations Auth0 on the acquisition by Okta
description: The acquisition of Auth0 by Okta, a leader in the identity and access management (IAM) space, is continued validation of the importance of customer identity and access management (CIAM).
author: Dan Moore
image: blogs/auth0-okta-acquisition/congratulations-auth0-on-the-acquisition-by-okta-header-image.png
category: blog
tags: topic-upgrade-auth0
excerpt_separator: "<!--more-->"
---

Congrats to Auth0, their employees and investors on their acquisition by Okta! This validates that CIAM is a crucial part of any application and that outsourcing it to a provider like Auth0 just plain makes sense. The identity community owes a lot to Auth0, and that includes FusionAuth. 

<!--more-->

We love the way that Auth0 spreads the word about the value of outsourcing your application's auth systems. Today app developers can focus on building their apps. They can offload the effort of implementing and securing identity, authorization and authentication to companies like Auth0 or FusionAuth.

## Auth before Auth0

Before 2013, when Auth0 was founded, authentication was still the wild west. SAML was standardized in 2005, but was tremendously complex and beyond the abilities of the average developer to integrate. Plus, XML!


OAuth1 was a standard, but had some real flaws. Lack of support for native applications, cryptography requirements for clients and long lived access tokens, among other issues, meant that it never saw wide adoption.


OAuth2 was codified in 2012 and was in the process of being implemented by numerous vendors. Social sign on was a big thing, but there was an open question on whether it'd be federated using something like OpenID. This standard had momentum in the late 2000s, but was losing steam around this time. 


The other alternative was having users' online identity locked up in the vaults of Google, Facebook and others. The release of OIDC, the modern authentication framework, while in the works, was still in the future.


## Simple integrations with everything

Auth0 started out by being the easiest way to integrate with your customer's login systems. Their initial website slogan was: “Let your customers' use their existing authentication infrastructure, with a simple, non-invasive JavaScript-based widget that works with most common enterprise authentication protocols.” And they continue to push the envelope on integration, with over 30 SSO integrations available right now.


In addition, their docs and support for open source has been great. Whether it is jwt.io (helping folks understand JSON Web Tokens), hundreds of example applications on GitHub or their excellent Identity Unlocked podcast, they've helped elevate developer's understanding of authentication and authorization. Auth0's documentation, educational content and expertise has helped every developer build more secure systems, and we thank them for that. 


Like Auth0 FusionAuth has focused on a great developer experience, whether that means:

* allowing developers to automate configuration and use our applications in ways we couldn't imagine with our API first approach
* our extensive documentation that customers have said means they never need to talk to us, even when building out complex integrations, or 
* our commitment to open sourcing vast swathes of our software systems, including our client libraries, supporting infrastructure or our documentation

## Solid free tier

With their SaaS model, Auth0 also provided a generous free tier. I've used this myself as a contractor for startups and I can tell you that it was superior to what I would have done if I'd rolled my own system. The free tier lets you offload concerns about authentication and focus on the application you want to build.

At FusionAuth we've always believed that authentication and authorization is necessary but not sufficient for every application. We've also seen way too many broken, insecure, frankly painful homegrown auth systems. Any startup application user that is in Auth0 or FusionAuth is one less user who has to worry about the security of their account. 

In our book anything that lets startups focus on their core business is good for everyone, as it frees up more focus for innovation.

## What does the Okta acquisition mean for the industry?

It's hard to tell; we're in for a few interesting months before the acquisition closes in July. It is unknown if there'll be regulatory challenges. 


But, we know one thing. You don't buy another company to lose money. Okta is making a major commitment to CIAM and feels there's lots of room for revenue growth. The long term strategic goals of Okta in acquiring Auth0, as stated in their investor documentation, are to gain access to a larger market, expand internationally and cross sell between the customer bases.

{% include _image.liquid src="/assets/img/blogs/auth0-okta-acquisition/acquisition-reasons.png" alt="Okta explains to investors why they acquired Auth0." class="img-fluid" figure=false %}

While cross-selling will be great for Okta and primarily IT-centric customers, it may not be great for developers used to Auth0's model. Developers and IT are brothers and sisters-in-arms, they have very different needs when it comes to integrations. 

IT is justifiably conservative in accepting new features and vendors, while developers are focused on features and shipping. With luck, Auth0's developer focus will not be subsumed by the needs of IT admins in the name of cross-selling.

{% include _image.liquid src="/assets/img/blogs/auth0-okta-acquisition/tam-diagram.png" alt="CIAM and IAM markets in the view of Okta." class="img-fluid" figure=false %}

While Okta plans to run Auth0 as an independent unit, integration between two large companies with disparate cultures are not known for going smoothly. We hope that everyone meshes well and the new company runs smoothly, doesn't raise prices, and continues to provide the great support and documentation that Auth0 is known for.

## How does this relate to FusionAuth

We applaud Auth0 on its accomplishments and congratulate Okta on its acquisition. While we admire what's been done and continue to believe that CIAM will be important for applications and companies going forward, our strategy differs in two key areas. 

First, we believe in the freedom to run your auth provider anywhere. Options provide flexibility to meet different application needs. If you want us to run your auth system, we're happy to do so with [FusionAuth Cloud](/pricing/cloud/). If you want to [download FusionAuth and run your auth system](/download/), you can do so, whether in your cloud VPC, your data center, or even on your kiosk. Use our software to secure your user data, wherever you want to keep it.

Second, we believe no one should be priced out of world class authentication. While Auth0 has a solid free tier, as soon as you grow and need more features like SAML integrations, OIDC connections, or custom rules, prices increase, sometimes rapidly. In addition, the cliff in pricing when you reach the end of the free tier can be an unpleasant surprise depending on the number of users you have. 

FusionAuth has [transparent pricing with a calculator](https://account.fusionauth.io/price-calculator) anyone can use to see exactly what their monthly bill will be, as well as plans with unlimited users, SAML and OIDC connections. No need to hop on a sales call, unless you really want to.

We look forward to continuing to provide best in class auth systems for developers with [great documentation](/docs/v1/tech/), [thoughtful APIs](/docs/v1/tech/apis/), [excellent support](/technical-support/) and [quick and easy setup](/docs/v1/tech/5-minute-setup-guide/).
