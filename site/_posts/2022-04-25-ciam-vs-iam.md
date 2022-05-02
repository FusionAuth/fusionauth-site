---
layout: blog-post
title: Customer Identity and Access Management (CIAM) vs Identity and Access Management (IAM)
description: What are the main differences between CIAM and IAM?
author: Dan Moore
image: blogs/single-sign-on-discord/using-single-sign-on-with-discord-and-fusionauth.png
category: blog
tags: features-ciam
excerpt_separator: "<!--more-->"
---

Though there are similarities between Customer Identity and Access Management (CIAM) and IAM (Identity and Access Management), at their heart they are serving different needs, and so have some striking differences. Both CIAM and IAM are about people. Who can access your systems, how do they prove who they are, and how you can manage access over time. Let's take a look at these two identity management solutions and see how they differ.

<!--more-->


## IAM

While IAM stands for Identity and Access Management, it is actually missing a letter. It really should be EIAM, for Employee Identity and Access Mnagement. It's also called "Workforce", probably because that sounds better than EIAM (how do you even pronouce that?)

IAM is primarily for managing employee identities. There are a number of large vendors who help larger companies manage this problem. The lifecycle is well understood:

* people are onboarded when they are hired
* employees have a certain set of privilegdes needed to do their jobs
* workers may shift roles in a known fashion (also known as a 'promotion' or 'transfer')
* the users can be forced to conform to password policies and other security requirements (what are they going to do, quit?)
* eventually people leave and can be offboarded

IAM is also working in a heterogeonous environment. There will be multiple silos of user data as well as protocols used to convey identity information. LDAP is still alive and well in many companies. I talked to a company once who had rolled up a bunch of hospitals and maintained a number of different directories for years while the integration occurred. There also may be complicated federation between silos of user data, including using standards like SAML.

There are also other entities that may need identity managed by an IAM solution, such as contractors or partners. The common theme is that:

* they are well known and go through defined processes to get their identity
* there's a durable business relationship, whether in the form of wages or contractual agreements

Customers, however, have different expectations.

## CIAM

Customer Identity and Access Management still deals with people and the priviledges and access they have, but there are a number of differences.

First, customers are, well, customers. They are paying you money by buying a good or service from you. They typically have other choices for businesses to transact with. This means there's a different set of expectations. Customers in general can't be expected to have the same commitment to a company or organization that employees or partners will. This means that you need to meet customer's expectations with a CIAM system, just as you do with a product. That includes:

* localization in their language
* consumer grade user experience
* performance like Google, which is what users expect
* if you offer identity federation, it will often be to a social provider like Facebook or Google

Another difference is that there may be a much larger number of users. Each company in the Fortune 500 has an average of 57,400 employees [as of 2019](https://fortune.com/fortune500/2019/), but the number of customers can be many multiples of the number of employees. As an extreme case, Google had 135,000 employees in 2021, but [in 2022 were estimated](https://www.semrush.com/blog/google-search-statistics/) to have 246 million unique users in the US alone. (Sorry for the switching of years, Fortune didn't make the stats easy to find.) XXX? And these customers may not interact with your organization every day. Your employees will.

This has a couple of ramifications for any implementation:

* You will need to plan for much bigger scale and will need higher per-user efficiency.
* On the other hand, plan for some, possibly a majority of, users to be inactive in any given month.
* Many IAM solutions charge dollars/user. For CIAM, you'll want to pay orders of magnitudes less per user.
* You'll want to enable self-service for common account actions, such as registration and credentials management (enabling MFA, resetting a password). Otherwise the customer service load will explode.

Additionally, other departments, including revenue generating ones like marketing and sales, will want access to your CIAM system. This means that any system you use should have the ability to push data into other systems, preferably in real time, that can be used to augment different customer views.

Thankfully, the complexity of permissions tends to be lower with CIAM solutions. While there may still be several types of users, you likely won't have complex cross cutting hierarchies like you will with IAM (team/department/organization/division). Users may have different attributes, but it's unlikely you'll have a thicket of permissions and a huge number of applications to control access to, in contrast with IAM.

In short, with CIAM you can handle more users but the access control will be simpler to model and understand. Additionally, customers won't put up with user interfaces, security requirements or system performance that organizations can impose on employees or partners.

## Conclusion

CIAM and IAM solutions share some common attributes, but there are significant differences as well. IAM solutions are great at supporting and enabling a company's workforce to access permissions they need to do their job. CIAM solutions are simpler and built for scale and customer experience.
