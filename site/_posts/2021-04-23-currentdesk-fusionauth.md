---
layout: blog-post
title: CurrentDesk saved thousands of dollars by choosing FusionAuth
description: CurrentDesk, a financial technology provider, choose FusionAuth for affordability, flexibility and developer friendliness.
author: Dan Moore
image: blogs/seegno-fusionauth/seegno-manages-thousands-of-tenants-with-fusionauth-and-kubernetes-header-image.png
category: blog
tags: topic-community-story 
excerpt_separator: "<!--more-->"
---

Brittany Roddy is a FusionAuth community member and lead software engineer and architect at CurrentDesk. She chatted with us over email about how she and her team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about CurrentDesk? What is the company's mission?

**Brittany:** Since our founding in 2012, CurrentDesk has provided web-based technology solutions to financial brokerages and their partners worldwide. Our mission is to create the industry-leading brokerage management platform across all major trading platforms and financial markets so that our customers can manage their entire client and partner operations from one place.

> When we performed a cost estimate of our previous provider, our annual bill was expected to increase by tens of thousands of dollars once we reached anticipated production load [when compared with FusionAuth]

**Dan:** Tell me about your work as a lead developer and architect at CurrentDesk. 

**Brittany:** I am involved in translating the business requirements into digestible and well-organized work for the team, then supporting the team as they build out and deliver the features. Being a relatively small team, I have a foot in almost every facet of the development process from requirements to release and I personally love that! 

As an architect, I get to explore the best technology and creative approaches to solve our business and team needs. As a lead, I get to assist our developers as they are in the trenches of implementation, and as a developer and ops engineer, I get hands on experience developing and deploying the product and tech stack we've built.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?
        
**Brittany:** We use FusionAuth primarily for OAuth.

> When FusionAuth says it's built for devs, they mean it! 

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Brittany:** FusionAuth has been essential in providing a unified approach to restricting our frontend, service layer, and data access layer. By attaching customized data to our tokens via FusionAuth's lambda feature, we are able to lock down front-end navigation and content, scope data at the service layer, and restrict queries and mutations at the data access layer. 

This helps us achieve a straightforward and resilient approach to multi-tenancy. We have also been able to leverage FusionAuth to generate login activity logs, send customized forgot password emails, and kick off additional on-boarding processes asynchronously in response to changes made on the FusionAuth server.

**Dan:** What's an example of an additional on-boarding process?

**Brittany:** After granting a user access to the system, we send a welcome email with content customized to the organization (tenant). This email provides a link that allows the user to complete the registration process by setting up a new password within our web application. 

Some organizations may additionally want to require two-factor login set-up; FusionAuth allows us the flexibility to configure the on-boarding experience so that each organization is able to set its own rules for their users.

> The API is easy to use and well-maintained, and the support team is quick to assist when we encounter an issue (which is rare!).

**Dan:** How were you solving these problems before FusionAuth?

**Brittany:** We have used other authentication providers and even built some in-house solutions for other products before deciding on FusionAuth for our next-generation platform.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Brittany:** As we started to evaluate what launching with other providers would look like, it became very clear that the pricing model for many popular providers did not scale well, especially considering the flexibility needed to satisfy our requirements. It simply was not feasible for authentication to account for such a large portion of our budget. When we came back to the drawing board and found FusionAuth, we were very impressed how affordable it was considering the functionality offered. 

Overall, a rich feature set complemented by strong flexibility and developer control means we are able to leverage core authentication capabilities while also having the freedom to develop creative solutions to fit our unique use cases. When FusionAuth says it's built for devs, they mean it! The API is easy to use and well-maintained, and the support team is quick to assist when we encounter an issue (which is rare!). This is perfect for a relatively small team building enterprise software. 

> Being able to host FusionAuth in our own environment means we have complete control over the infrastructure cost and maintenance.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Brittany:** Quite a bit! When we performed a cost estimate of our previous provider, our annual bill was expected to increase by tens of thousands of dollars once we reached anticipated production load and we were going to need to jump through some hoops in order to satisfy our requirements. 

Being able to host FusionAuth in our own environment means we have complete control over the infrastructure cost and maintenance. We can scale out our infrastructure to increase availability and performance as our system grows compared to a linear cost growth per individual user. 

Additionally, FusionAuth offers enough flexibility out of the box that our development team does not need to architect workarounds to meet our needs; the relationship is much more symbiotic and less friction inherently means less time and money developing a solution. 

**Dan:** How do you run FusionAuth (Kubernetes, standalone tomcat server, behind a proxy, etc)?
        
**Brittany:** We host FusionAuth in EC2 using Docker with an RDS database. It's accessed via an application load balancer.

> FusionAuth has been essential in providing a unified approach to restricting our frontend, service layer, and data access layer.

**Dan:** Any general feedback/areas to improve?

**Brittany:** We have genuinely enjoyed working with the technology and FusionAuth team! Thank you so much for providing this solution for us. 

-------

We love sharing community stories. You can check out [CurrentDesk's website](https://currentdesk.com/) if you'd like to learn more about them.
