---
layout: blog-post
title: FusionAuth Expands Support for Authentication Workflows Spanning Multiple Systems
description: Lambda HTTP Connect enables software developers to build complex authentication workflows spanning multiple systems and cloud services.
author: David Polstra
image: blogs/http-lambda-connect-press-release/http-lambda-connect.png
category: announcement
tags: topic-press-release lambda press-release
excerpt_separator: "<!--more-->"
---

FusionAuth, the authentication and authorization platform built for developers, today announced a new capability enabling software developers to build complex authentication workflows spanning multiple systems and cloud services. The feature, called “Lambda HTTP Connect” allows customers to exchange data with other systems during authentication processes. A frequently requested feature, it is important for any software applications needing data from separate directories or microservices to properly authenticate and authorize end users.  

<!--more-->

During the login process, FusionAuth provides data to executable blocks of JavaScript code called Lambdas. These execute at certain points in the login process. Allowing HTTP requests  from Lambdas allows applications to address use cases such as: 

* A fintech company could combine account information and credit status from separate systems into the login information, enabling specific features for a given  user. 

* An application based on Microsoft Azure could query Azure Active Directory to retrieve additional user data beyond what is included in a standard OIDC authentication flow. 

* A SaaS application could pull user status level information from a customer database at the time of login, instantly enabling specific privileges for the end user. 

"Developers value the ability to create customized login workflows in a microservice or other complex environments," said Daniel DeGroff, co-CTO at FusionAuth. "Authentication today goes far beyond simple username and password. We empower the developer to build a fully data-enabled user experience both with our APIs and now our Lambda HTTP Connect  functionality."

Lambda HTTP Connect is currently available for FusionAuth Essentials and FusionAuth Enterprise customers. Learn more in [the FusionAuth documentation](/docs/v1/tech/lambdas/#using-lambda-http-connect).

### About FusionAuth

FusionAuth is the authentication and authorization platform built for developers, by developers. It solves the problem of building essential user security without adding risk or distracting from the primary application. For developers and technical leaders creating products for external users, FusionAuth puts them in the driver’s seat, with control, flexibility and developer ergonomics. FusionAuth tames the risk and complexity that comes with typical identity systems. With self-hosted or cloud software, extensive documentation, free options, fast deployment and a no-hassle process, it eliminates the business hurdles that make it hard for developers to meet their authentication and authorization requirements. Learn more at [fusionauth.io](/). 

### Media Contact

Sarah Hawley  
Mockingbird Communications  
P: +1 480 292 4640  
E: sarah@mockingbirdcomms.com


