---
layout: blog-post
title: "Data Partners And The GDPR: Questions To Ask"
description: Here are the questions you should ask your data partners to make sure they, and you, are GDPR compliant.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- CIAM
- resources
- identity
- gdpr
- white Paper
image: blogs/gdpr-data-partners-questions.jpg
---

By now, you should be fully aware of the [GDPR’s data requirements](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR") for your own application, but have you talked with your data partners? If your application takes advantage of third-party tools and components to add functionality or track user information, they need to be compliant as well. The new regulations state that data privacy needs to be maintained throughout the entire lifecycle of an application, through every data controller and processor. Take the time to ask your data partners how they ensure GDPR compliance, including their security framework and how they manage data.

<!--more-->
If your data partners do not have a clearly defined and documented data strategy, you could be exposing your company to substantial risk. Here are a few questions to get the discussion started:

### Q: Where are their servers and computers physically located? Can you choose a location?

Even if a service is cloud-based, the physical location of the servers could impact how the GDPR applies to you.

### Q: How does their platform pseudonymize user data as it integrates with external systems?

When user data is integrated with their system, is new data personally identifiable, or connected to an alias? The more disconnected, the safer it will be.

### Q: What is their protocol for notification in case of a data breach?

This is vital since your company will need to notify your users within 72 hours. Your provider should be able to notify you so you can comply.

### Q: How do they comply with your users’ right of access and erasure?

How will your company coordinate efforts so users can view their data and request data erasure?

## **Questions for Identity and Access Management Partners**

If you are considering an identity and access management solution like [FusionAuth](https://fusionauth.io "FusionAuth Home"), here are additional questions that will provide insights into how they address security and data privacy.

### Q: What are their default password constraints, and are they adjustable?

This is a basic question to begin with. They should have a diverse set of requirements and be able to adjust them if needed.

### Q: What password hash do they use, and do they use unique salts and/or peppers?

Modern standard hash algorithms like SHA-3, Bcrypt, PBKDF2 and Scrypt are designed to make brute force attacks much more difficult. If they are using standard MD5, run.

### Q: How difficult is it to increase their hash’s intensity for new users? Existing users?

Hackers will always develop more sophisticated techniques, and computer processing power is always increasing. Will their system be able to adjust to protect against evolving attacks?

### Q: Is their database directly accessible from outside your system?

Limiting direct access to the database is a first line of defense against exploits and attacks.

### Q: Are requests within their system secure? How robust is their authentication for internal API requests?

Using a variety of authentication credentials within the system creates an added layer of security and limits what can be done if a hacker gains access.

## Learn More: Developer’s Guide to the GDPR

The GDPR is sure to bring changes to the way developers plan applications and manage partners. It doesn’t restrict the types of applications and experiences developers can build, but it does place the need for data privacy ahead of the business needs of the company. To learn more about the GDPR and how it will impact developers' responsibilities, download our [**Developer’s Guide to the GDPR**](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR"). It covers the essential information developers need to understand to stay compliant and avoid steep fines possible under the regulation.

[Get the Guide](/blog/2019/01/29/white-paper-developers-guide-gdpr){: .btn .btn-primary}
