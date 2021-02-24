---
layout: blog-post
title: Authentication as a Service Security Due Diligence Tips
description: Before you choose an Authentication as a Service (AaaS) vendor, what kind of security due diligence should you perform?
author: Mihir Patel
image: blogs/security-due-diligence/authentication-as-a-service-security-due-diligence-tips-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

Within today's software development ecosystem, third-party vendors are a common part of system architecture. 

Specifically, Authentication-as-a-Service (AaaS) is growing fast. Their out-of-the-box capabilities enable engineering teams to focus on building features valuable to business rather than spending time and resources on reinventing the wheel of securing application access.

<!--more-->

But outsourcing isn't as simple as it sounds. Vendor management is time-consuming and can introduce significant risks to the business if due diligence isn't observed.
 
_This blog post is an excerpt from [Performing Due Diligence on Authentication Vendors](/learn/expert-advice/identity-basics/due-diligence-authentication-vendors/)._

## The need for due diligence

[The 2017 Equifax data breach](https://en.wikipedia.org/wiki/2017_Equifax_data_breach) consumed many organizations, including mine where I was on the information security (Infosec) team. The breach exposed the personal data of hundreds of millions of people: social security numbers, names, addresses, and more. Thankfully, our organization had the right policies in place to safeguard the personal data and no data was compromised. 

If you do outsource authentication capability, then putting in your due diligence is a must.
 
_Due diligence_ is a series of steps that requires research and testing the capabilities of a third-party vendor. Going through this very intentional exercise is absolutely crucial before you onboard an AaaS into your system, as it can prevent future issues with security, performance, engineering, and pricing.

## Think about the security standards of the authentication provider

Security is at the top of the list of due diligence tasks and should come as no surprise. Letting unauthorized parties get access to systems leads to loss of consumer confidence and financial penalties from regulators. Putting in effort to make sure an AaaS offers proper security is critical.

Authentication providers should have strong guardrails to protect your users' confidential data and minimize the possibility of security breaches. 

Work with potential authentication providers and your internal stakeholders on the following items to ensure security standards are met before integrating a vendor's offering:

1. Include all business and technology stakeholders to facilitate the security review. This will allow you to map which business segments will rely on the authentication provider. Make a practice of communicating your findings with these stakeholders as you move through these steps.
1. Ask your vendor to fill out a questionnaire. This is a standard practice to understand security policies established by authentication providers. These questions should cover all security details, for example, how often are passwords reset? How are credentials stored? Where are they stored?
1. Ask for an encryption policy. It should have guidance on hashing, digital signature policy, and cryptography topics, and these policies should align with your internal security standards. For TLS, the standard is to use [128-bit, 192-bit, or 256-bit encryption](https://www.clickssl.net/blog/128-bit-ssl-encryption-vs-256-bit-ssl-encryption) to prevent unauthorized access to data in transit. Does your authentication provider offer encryption of data at rest?
1. Common Vulnerabilities and Exposures (CVEs) happen. How does your vendor respond when a CVE occurs. How quickly is a fix released and how do they communicate the security issues to you?
1. Understand who will own responsibility in case of a cyber attack. Lawsuits arise when responsibilities are not well understood, so take particular care here. You should have a workflow diagram labeling each section with _vendor's name_ or _your company's name_ to indicate each party's areas of responsibility.
1. During the procurement process, obtain all required security policy documents applicable to your industry or business. Ensure security policies cover [PII](https://www.dol.gov/general/ppii#:~:text=Personal%20Identifiable%20Information%20(PII)%20is%20defined%20as%3A&text=DOL%20internal%20policy%20specifies%20the,to%20which%20they%20have%20access), [HIPAA](https://www.hhs.gov/hipaa/index.html), and [GDPR, Article 33](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) standards if your business falls under specific industry criteria. You should also obtain [SOC2](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html) reports from any potential AaaS. This auditing procedure ensures that data and privacy are securely managed to protect the interests of your organization and the privacy of your clients.

There's always more to do with security, but the items above should be a good place to start. 

## What else should you consider?

While important, there are other aspects to consider when performing due diligence. Various other areas you should be checking into for a potential AaaS include:

* Performance
* Engineering implementation effort
* Pricing 

To learn about those aspects and more, read [Performing Due Diligence on Authentication Vendors](/learn/expert-advice/identity-basics/due-diligence-authentication-vendors/).
