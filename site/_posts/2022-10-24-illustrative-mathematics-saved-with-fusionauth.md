---
layout: blog-post
title: Illustrative Mathematics saved 50% by moving to FusionAuth from Auth0
description: Illustrative Mathematics, a non-profit helping educate children about mathm, switched to FusionAuth and saved.
author: Dan Moore
image: blogs/illustrative-mathematics/illustrative-mathematics-fusionauth.png
category: community-story
tags: topic-community-story topic-upgrade-auth0 auth0 upgrade community-story
excerpt_separator: "<!--more-->"
---

Dylan Dechant is a FusionAuth community member and Director of Engineering at Illustrative Mathematics. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about Illustrative Mathematics? What is the company's mission?

**Dylan:** Absolutely. Illustrative Mathematics (IM) is a non-profit whose goal is to create a world where all learners know, use, and enjoy mathematics through curriculum, professional learning, and community.

From my perspective, IM is an edtech company disguised as a math curriculum and content company.

**Dan:** Is there a particular age-group you focus on creating material for? Or is it kindergarten through college? 

**Dylan:** Currently, our curriculum targets K-12.

> Pricing was the main pull [to use FusionAuth], but support has been great too.

**Dan:** Tell me about your work as a Director of Engineering at Illustrative Mathematics.

**Dylan:** I currently manage a team of engineers who work on various applications and products.

At the end of the day, our main focus is empowering our content writers to write the best content through custom software solutions. Our team then takes that content and makes it ready for the masses, whether that's interfacing with a learning management system or creating print-ready PDFs that will become textbooks. That's our focus.

**Dan:** Do you focus primarily on the USA or other countries? Are there any local laws about student data you have to abide by?

**Dylan:** We don't necessarily target the USA but it is the biggest consumer of our curriculum. 

As far as student data, we don't store any of that! 

We've been pretty strategic in what data we store and consume so this isn't really an issue for us with our current model.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Dylan:** We are currently using FusionAuth to secure content that only teachers should see!

> ... the FusionAuth cost is about half of the alternatives.

**Dan:** What problems did we solve for you?

**Dylan:** We potentially have a unique case for our problem.

First, we are non-profit, so we aren’t made of money. 

Second, we pride ourselves in making our materials open to anyone. 

Third, we don’t want students seeing teacher content (aka answers to homework, assessments, etc).

FusionAuth fit the bill when it came to pricing for us and making this possible without spending a percentage of our bottom line.

**Dan:** That's great that you make all your materials free! How were you solving these problems before FusionAuth?

**Dylan:** Auth0 and money.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Dylan:** Pricing was the main pull, but support has been great too.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Dylan:** Based on our fairly straightforward use case of logging users into a website, at the volumes we're seeing the FusionAuth cost is about half of the alternatives.

> FusionAuth really fit the bill when it came to pricing for us...

**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Dylan:** We let FusionAuth take care of that for us. We are on a high availability plan in FusionAuth Cloud.

**Dan:** Any general feedback/areas to improve?

**Dylan:** We are doing a lot of custom integration work and API interfacing, we mainly use ruby.

Improving the [ruby SDK](https://fusionauth.io/docs/v1/tech/client-libraries/ruby) with more examples, especially for using Elasticsearch, would be really helpful.

Also, having a more customizable reporting/admin layer would’ve cut down on our custom integration work, but as engineers, we recognize there isn’t a one size fits all solution!

**Dan:** Can you tell me more about the custom work you are doing? Is it mostly reporting, UX, or something else?

**Dylan:** Both reporting and UX. We pipe registrations into our data warehouse so it's easier for analysts to query. 

We also built a custom UI for admins that allows them to easily query for users and perform administrative tasks on a user like setting a temporary password, locking a user, etc.

**Dan:** Thanks for your feedback!

-------

We love sharing community stories. You can check out [Illustrative Mathematics' website](https://illustrativemathematics.org/) if you'd like to learn more about them. 

