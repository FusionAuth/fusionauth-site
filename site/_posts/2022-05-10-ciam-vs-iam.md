---
layout: blog-post
title: Customer Identity and Access Management (CIAM) vs Identity and Access Management (IAM)
description: What are the main differences between CIAM and IAM?
author: Dan Moore
image: blogs/ciam-vs-iam/ciam-vs-iam.png
category: article
tags: features-ciam ciam iam explainer
excerpt_separator: "<!--more-->"
---

Both Customer Identity and Access Management (CIAM) and IAM (Identity and Access Management) are about people who are users of your system: who can access what, how do they prove who they are, and how you manage access over time. Though there are similarities between CIAM and IAM, at their heart they serve different needs. 

Let's take a look at these two identity management archetypes and see how they differ.

<!--more-->


## IAM

While IAM stands for Identity and Access Management, it is actually missing a letter. It really should be termed EIAM, for Employee Identity and Access Management. It's also commonly called "workforce", probably because that sounds better than EIAM (how do you even pronounce EIAM?).

IAM is primarily for managing employee identities. There are a number of vendors who help companies manage this problem. 

The employee lifecycle is well understood:

* people are on-boarded when they are hired
* employees have a certain set of privileges needed to do their jobs
* workers may shift roles in a controlled fashion (also known as a 'promotion' or 'transfer')
* users can be forced to conform to password policies and other security requirements (what are they going to do, quit?)
* eventually people leave and will then be offboarded

IAM solutions are deployed in a heterogeneous environment. Multiple silos of user data are normal, as well as different protocols for identity data. For example, LDAP is still alive and well in many companies. I talked to a company who had rolled up a bunch of hospitals and maintained multiple different employee directories for years. There also may be complicated federation between the user data silos.

There are other entities which may need their identity managed by an IAM solution, such as contractors or partners. 

The common attributes of IAM users are:

* they are known and verified, typically through legal paperwork such as an offer letter and employment contract
* they proceed through a set of defined processes to get their credentials
* there's a durable business relationship, often involving money

Customers, however, are different.

## CIAM

Customer Identity and Access Management handles human beings and their privileges and access, but there are a number of differences from IAM.

First, customers are, well, customers.

They are buying a good or service from you, and paying you for it. They typically have other choices of businesses with which to transact. 

They may also be potential customers, evaluating your solution. Compare that with IAM; you aren't going to give a potential employee access to your systems, but a potential customer may have limited access.

With customers your primary motivation is to delight them.

### Expectations

Because of the alternatives they have, customers have a different set of expectations. Customers won't have the same commitment to a company or organization that employees or partners will. You need to meet customer's expectations with any system or product they interact with, including how they log in and access systems via CIAM.

Some ways to exceed customer expectations include:

* localization in their language
* consumer grade user experience
* speed similar to Google search
* communication methods they prefer like SMS or email
* social identity federation with Facebook or Google (the best social provider depends on geography and user persona)

It's not only users that have expectations of a CIAM system. Marketing and sales departments, among others, will want access to the data your CIAM system holds. It must have the ability to push the appropriate user data into other applications, preferably in real time. This data can then be used to improve the customer experience as well as to achieve company goals such as increased sales.

### More users, less interaction

Another difference between CIAM and IAM is that there will be more users in a CIAM system.

Companies can have thousands of employees, but a customer population many times larger. Google had 135,000 employees in 2021, but [billions of users](https://www.semrush.com/blog/google-search-statistics/). Basecamp had fewer than 100 employees, but had [millions of users](https://expandedramblings.com/index.php/basecamp-statistics-and-facts/).

Many IAM solutions charge dollars/user/month. For CIAM, you'll want to pay orders of magnitudes less per user.

Additionally, customers will not necessarily interact with your organization or application every day, whereas employees will, at least on their non-vacation days. But, due to marketing campaigns, seasonal trends or even the day of the month, there may be spikes in usage that you'll want to prepare for.

The increased number of users and irregular visitation frequency means:

* You will need to plan for scale and higher per-user efficiency.
* On the other hand, plan for some users, possibly a majority of them, to be inactive in any given month.
* Ensure self-service is available for common account actions, such as registration, enabling security measures and password resets. Otherwise your customer service load will explode.

### Permission complexity

Thankfully, the complexity of permissions tends to be lower with CIAM solutions.

While there may still be multiple types of users with permissions within your application or applications, what you won't have is complex cross cutting permission hierarchies like IAM users will.

For workforce solutions, other entities matter, like the team, the department, the organization, and the division. These all play a role in determining access to resources within the company. This is, of course, on top of the attributes of the user.

With CIAM, you won't have this hierarchical thicket of permissions. You also won't typically have a large number of different applications to which you must control access.

In short, with CIAM you can handle more users but the access control will be simpler to model and understand. Customers won't put up with user interfaces, security requirements or system performance that organizations can inflict on employees or partners.

### What about a CRM?

CIAM differs from a Customer Relationship Management (CRM) tool such as Salesforce or Hubspot. The purpose of CRM is to record the interactions with a customer and the audience is internal. The purpose of CIAM is to allow the user to manage their identity as well as to control access to different applications.

## Conclusion

CIAM and IAM solutions share some common attributes. They both help you control people's access to your system. But there are significant differences as well.

IAM solutions are great at supporting and enabling a company's workforce to access applications they need to do their job in a secure manner.

CIAM solutions, on the other hand, are simpler and built for scale and customer experience.
