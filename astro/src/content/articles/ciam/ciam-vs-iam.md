---
title: CIAM vs. IAM - Customer Identity vs. Identity Access Management Explained
description: "Learn the differences between CIAM and IAM. From user experience to scale and security, this guide breaks down which solution fits your needs best."
section: CIAM
author: Dan Moore
icon: /img/icons/ciam-vs-iam.svg
darkIcon: /img/icons/ciam-vs-iam-dark.svg
---

Both Customer Identity and Access Management (CIAM) and IAM (Identity and Access Management) solutions control how people access your application or system. This includes who can access what, how do they prove who they are, and how you manage this access over time. CIAM and IAM have some similarities, but at their heart they serve different needs and audiences. 

Let's take a look at a fictional company and when a CIAM or IAM system would be a good fit.

Pied Piper is building out an empire with their middle-out compression. They have hundreds of customers and dozens of employees.

When they onboard a new employee, they want to ensure the employee has access to Google Drive, an internal Slack, Zendesk, GitHub, and a few other custom built applications. If an engineer is hired, they need to be added to a certain GitHub team, whereas if a marketer is hired, they need to be given an account on Hubspot and Zapier. Strong auditing and accountability are requirements. Users must use MFA for compliance reasons (SOC2!) and are expected to authenticate to these applications daily.

This use case is a perfect fit for **IAM**.

When Pied Piper gets a new customer, the customer will self register, pay for access to the compression system API, and begin using it. They also need access to Zendesk for filing support tickets. Users need to be able to reset their password, update their plan, and access the API, all in a self-service manner. Some customers will use the API, complete their integration and not login again for months. A few customers want to use MFA, but most of them don't care about it. Some customers don't want the hassle of a new login, so want to log in with GitHub or Google.

In contrast to the first one, this use case is a perfect fit for a **CIAM solution**.

Now, let's take a closer look at these two identity management patterns.

## IAM

While IAM stands for Identity and Access Management, it is actually missing a letter. It really should be termed EIAM, for Employee Identity and Access Management, or even WIAM, Workforce Identity and Access Management. This is commonly called "workforce" as well, probably because that sounds better than WIAM or EIAM (how do you even pronounce EIAM?).

IAM is really about managing employee and partner identities. There are a number of vendors who have software aimed at solving these problems. The employee identity lifecycle is well understood:

* people are on-boarded when they are hired
* employees have a certain set of privileges needed to do their jobs
* workers may shift roles in a controlled fashion (also known as a 'promotion' or 'transfer')
* users can be forced to conform to password policies and other security requirements (what are they going to do, quit?)
* eventually people leave and will then be offboarded

Much of this holds true for partners, such as vendors and contractors, as well.

IAM solutions are typically deployed in a heterogeneous environment. Silos of user data are expected and different protocols are the norm. There also may be complicated federation between these user data silos.

For example, LDAP is still alive and well in many companies. I talked to a company which purchased a number of hospitals. They maintained multiple different employee directories for years, and laughed when I talked about consolidation.

The common attributes of IAM users are:

* they are known and verified, through paperwork such as an offer letter or employment contract
* there are defined processes to get credentials
* there's a durable business relationship

Customers, however, are different. For starters, you don't pay them, they pay you. Let's look at some of the other ways CIAM system requirements differ from those of IAM solutions.

## CIAM

Customer Identity and Access Management also handles people, privileges and access, but there are differences from IAM.

First, customers are, well, customers.

They are buying a good or service from you, and paying you for it. They often have options when it comes to choosing to transact with you.

Users of a CIAM system may not even be full customers. Unlike an IAM solution, when someone has access or doesn't, CIAM users may be potential customers, evaluating your solution. Contrast that with IAM: you aren't going to give a potential employee access to your systems no matter how much you trust them.

Finally, because of their options and the revenue they provide, you want to delight customers.

## CIAM Expectations

Because of the alternatives they have and their experience as consumers, customers have a different set of expectations. Customers lack the commitment to a company or organization that employees or partners have. You will be rewarded for meeting or exceeding customer expectations for all product interactions, including the login process.

Some ways to exceed customer expectations that are relevant to CIAM solutions include:

* localized messages in their language
* consumer grade user experience, including error message and user interface
* response speed like Google search
* allowing them to choose their communication methods
* ensuring they can manage their profile and consents if they so choose
* social identity federation with Facebook or Google (of course the best social provider depends on your geography and audience)

It's not only users that have high expectations of a CIAM system. Marketing and sales departments, among others, will want access to the data your CIAM system holds.

It must have the ability to disseminate appropriate user data into other applications, preferably in real time. Such data should be scrubbed if needed, to preserve privacy. The ingested data can be used to improve the customer experience as well as to achieve company goals like increased sales.

## More users, less interaction

Another difference between CIAM and IAM is that there will be many more users in a CIAM system. Typically the difference is an order of magnitude or more.

Companies have thousands of employees, but serve a customer population many times larger. Google had 135,000 employees in 2021, but [billions of users](https://www.semrush.com/blog/google-search-statistics/). Basecamp had fewer than 100 employees, but had [millions of users](https://expandedramblings.com/index.php/basecamp-statistics-and-facts/).

This impacts pricing. Many IAM solutions charge on the order of dollars/user/month. For CIAM, because of the numbers, you should pay orders of magnitudes less per active user.

There's also the fact that customers will not interact with your organization or application every day. In contrast, employees will, at least on their non-vacation days. Due to marketing campaigns, seasonal trends or even the day of the month, with a CIAM there are spikes in usage that you'll want to prepare for.

The increased number of users and irregular activity means:

* You have to plan for scale and higher per-user resource efficiency.
* On the other hand, plan for some segments users to be inactive in any given month.
* You'll want to enable self-service common account actions, such as registration, enabling security measures and password resets. Otherwise your customer service load will explode.

## Permission complexity

The complexity of modeled permissions tends to be lower with CIAM. While there may still be different roles for users that will affect your application, what you won't have is complex cross cutting permission hierarchies like IAM systems.

For workforce solutions, other entities play a role in permissions, such as the team, the department, the organization, or the division. The relationship between the user, the resource and these entities all influence access to specific applications or functionality. This complexity is, of course, on top of the attributes of the user.

With CIAM, most systems won't have this hierarchical thicket of permissions. You also might have fewer applications to which you must control access.

## Summing up CIAM

All of the above requirements illustrate that a CIAM system isn't necessarily simpler than the typical workforce IAM solution, but does have different constraints.

With CIAM you must support more users with unique access patterns. On the other hand, the access control requirements will be simpler to model and understand. 

Customers won't put up with user interfaces, security requirements or system performance that organizations can inflict on employees or partners.

## What about CRM?

A CIAM system is different from a Customer Relationship Management (CRM) tool, such as Salesforce or Hubspot.

The purpose of CRM is to record the interactions with a customer and the audience is internal. While you might have different channels and other data structures in a CRM, it's not a multi-purpose login experience for your customers.

On the other hand, the purpose of CIAM is to allow the user to manage and control their identity, from credentials to profile data to MFA, with as much self-service as possible to empower the customer. Additionally, CIAM is focused on access control for different applications.

## Conclusion

CIAM and IAM solutions share attributes. They both help developers and businesses control user access to applications. But there are significant differences as well.

IAM solutions solve the problem of supporting and enabling a company's workforce to access applications they need to do their job.

CIAM systems, on the other hand, are built for scale and customer experience. 
