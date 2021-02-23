---
layout: advice
title: Performing Due Diligence on Authentication Vendors
description: What kind of due diligence should you do when evaluating identity as a service vendors?
author: Mihir Patel
image: advice/registration-best-practices/expert-advice-best-practices-for-registration-forms.png
category: Identity Basics
date: 2021-02-24
dateModified: 2021-02-24
---

Within today's software development ecosystem, third-party vendors are a common part of system architecture. Specifically, [Authentication-as-a-Service (AaaS) is growing fast](https://www.marketsandmarkets.com/Market-Reports/identity-access-management-iam-market-1168.html). Their out-of-the-box capabilities enable engineering teams to focus on building features valuable to business rather than spending time and resources on reinventing the wheel of securing application access.
 
But outsourcing isn't as simple as it sounds. Vendor management is time-consuming and can introduce significant risks to the business if due diligence isn't observed.
 
For example, [the 2017 Equifax data breach](https://en.wikipedia.org/wiki/2017_Equifax_data_breach) consumed many organizations, including mine where I was on the information security (Infosec) team. The breach exposed the personal data of hundreds of millions of people: social security numbers, names, addresses, and more. Thankfully, our organization had the right policies in place to safeguard the personal data and no data was compromised. 
 
We had communicated to our clients right away about the breach and ensured all servers were being patched up in case there was a leak. Our AppSec team rolled out a patch over the weekend to all of our internal servers including the ones where we hosted our third-party vendors. The team deliberately worked with our clients ensuring them the steps taken to protect them and their data. We had mitigated a huge security event. We consistently maintained information on internal servers which also listed all on-premise servers that hosted third-party vendors. 
 
Obviously, it pays to invest effort in vendor management, especially in light of a security breach. It's important that a vendor is able to provide risk assurance, meet compliance standards, and provide analytics and reliable service when partnering with you for functional responsibilities. But if managing vendors is so critical, then you may wonder why you'd want to outsource identity management to a third-party provider in the first place. If your core competencies are in building UX and UI, you want to focus on that, and not the effort of building (and learning how to build) a complex and costly authentication system. Using a reliable authentication system can mitigate operational and security risks for your business.
 
Of course, if you do outsource authentication capability, then putting in your due diligence is a must.
 
_Due diligence_ is a series of steps that require research and testing the capabilities of a third-party vendor. Going through this very intentional exercise is absolutely crucial before you onboard an AaaS into your system, as it can prevent future issues with security, performance, engineering, and pricing.

In this article, I'll discuss the various areas you should be checking into for a potential AaaS, including security, performance, engineering implementation, and pricing.

## Security
Security is at the top of this list and should come as no surprise. Letting unauthorized parties get access to systems leads to loss of consumer confidence and financial penalties from regulators. Putting in effort to make sure an AaaS offers proper security is critical.

Authentication providers should have strong guardrails to protect your users' confidential data and minimize the possibility of security breaches. Work with potential authentication providers and your internal stakeholders on the following items to ensure security standards are met before integrating them:

1. Include all business and technology stakeholders to facilitate the security review. This will allow you to map which business segments will rely on the authentication provider. Make a practice of communicating your findings with these stakeholders as you move through these steps.
1. Ask your vendor to fill out a questionnaire. This is a standard practice to understand security policies established by authentication providers. These questions should cover all security details, for example, how often are passwords reset? How are credentials stored? Where are they stored?
1. Ask for an encryption policy. It should have guidance on hashing, digital signature policy, and cryptography topics, and these policies should align with your internal security standards. For TLS, the standard is to use [128-bit, 192-bit, or 256-bit encryption](https://www.clickssl.net/blog/128-bit-ssl-encryption-vs-256-bit-ssl-encryption) to prevent unauthorized access to data in transit. Does your authentication provider offer encryption of data at rest?
1. CVEs happen. How does your vendor respond when a CVE occurs. How quickly is a fix released and how do they communicate the security issues to you?
5. Understand who will own responsibility in case of a cyber attack. Lawsuits arise when responsibilities are not well understood, so take particular care here. You should have a workflow diagram labeling each section with _vendor's name_ or _your company's name_ to indicate each party's areas of responsibility.
1. During the procurement process, obtain all required security policy documents applicable to your industry or business. Ensure security policies cover [PII](https://www.dol.gov/general/ppii#:~:text=Personal%20Identifiable%20Information%20(PII)%20is%20defined%20as%3A&text=DOL%20internal%20policy%20specifies%20the,to%20which%20they%20have%20access), [HIPAA](https://www.hhs.gov/hipaa/index.html), and [GDPR, Article 33](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) standards if your business falls under specific industry criteria. You should also obtain [SOC2](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html) reports from any potential AaaS. This auditing procedure ensures that data and privacy are securely managed to protect the interests of your organization and the privacy of your clients.

Of course, we could dive deeper into security due diligence, but the items above should be a minimum place to start.

## Performance 
Naturally, there's a tradeoff between building an infrastructure in-house and outsourcing. What you decide will have implications on your services. Auth0, Okta, and FusionAuth are performant services, but you should have preliminary benchmarks to measure initial performance against, with and without AaaS. You can use your performance metric to benchmark against external vendors to make sure they can meet your SLA and performance standards.

First, we need to conduct benchmark testing. If we don't know what we are measuring against, performance metrics don't mean much. Coordinate testing measures on some of the following topics with your QA team:

1. Begin with load testing. Some vendors put restrictions on load testing. But if your release process includes [Change Advisory Board (CAB)](https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/success/quick-answer/change-advisory-board-setup.pdf) approval, you need to conduct end-to-end load testing to get approval for production releases. Reach out to an account manager or sales team from the third-party vendor to request load testing.
1. Many applications error out if response time is not within an implicit timeout range. Every application has different needs. Define explicit timeouts based on your users' location and complexity of their tasks. Then ask yourself if these thresholds sufficiently meet your Service Level Agreements (SLA) with your clients.
1. What is the authentication provider [failover strategy](https://searchstorage.techtarget.com/definition/failover)? Are business continuity and disaster recovery policies in place? Outages happen, but your software application won't work without authentication. Understanding your vendor's failover strategy will help you evaluate business risks during outages. For some businesses, and especially in enterprise space, authentication services should be highly available, otherwise SLAs will be breached leading to client loss.
1. Introducing an authentication service in your architecture can lead to latency issues. Sign-ins will have to go through the authentication provider's data center before a user can start interacting with your features. This extra round trip can be costly unless the service is hosted on premise or in the same Availability Zones as your cloud provider.
1. How is maintenance handled and communicated? If your business is global, local maintenance can impact clients globally. If your  business is global, you need a vendor who can support your services in different time zones. Vendor maintenance needs to be communicated to all impacted teams across the globe, and you have to make sure you know who exactly is responsible for that maintenance and releasing communication. Ensure your vendor communicates clearly and directly.
 
## Engineering Implementation
Authentication is a simple concept but a costly and complex infrastructure, which is exactly why [AaaS is on the rise](https://www.globenewswire.com/news-release/2020/05/09/2030657/0/en/Global-Authentication-Services-Industry.html#:~:text=Authentication%20Services%20market%20worldwide%20is,to%20grow%20at%20over%2020.). Outsourcing critical pieces of software development can help engineering teams deliver high-impact features without losing velocity.
 
Authentication providers need to keep this in mind while selling you on their service. If implementation is not straightforward, then it's not as beneficial. Here are some ways to ensure the process of AaaS implementation doesn't cost you market velocity:
 
1. User Experience (UX) is key for developers. While it's arguably not the primary objective of procurement teams, developers are the primary users of AaaS. AaaS UX should be developer-friendly and not too difficult to navigate. Dashboards should have relevant data with appropriate graphs and tooling. Documents should be well-written. Otherwise outsourcing a service that gets underutilized can have financial consequences, such as paying for tools you don't use. Don't wing this. Ask your developers to review the AaaS developer experience or build a proof of concept.
1. Documentation is the lifeblood of implementation teams. No one wants back-and-forth emails or waiting on an engineering sales rep to answer questions about implementation. Well-thought-out documentation should list API calls that are easy to understand. It should also have an education center, FAQ section, change-log, release notes, workflow diagrams, and definitions of technical terms. And just as you should have open communication with the vendor for maintenance, you'll want to ensure your developers have forums or other venues for asking implementation questions.
1. Single sign-on (SSO) via Google, Facebook or GitHub is becoming a common feature for online accounts. It's helpful because users don't have to recreate login credentials every time they create a new retail profile or media streaming account. Your authentication service should provide a widget or page with a single sign-on (SSO) page.
1. Sign-on widgets and other UX features should be hardware agnostic. A smooth implementation should be available regardless of OS, be it Linux, Windows, or macOS. The same goes for mobile devices—both iOS and Android should be a seamless experience.
1. Does the authentication provider integrate with an LDAP directory service? For many organizations, user information and entitlement is stored on LDAP servers. Authentication providers should be able to delegate authorization against the LDAP directory. This is important for midsize to large organizations because LDAP is universal to managing user directory and access management. This allows organizations to add or remove access when an employee is terminated or discharged from an organization.
 
## Pricing
Authentication-as-a-Service (AaaS) can be very economical if you don't want to be in the datacenter business. But before you onboard a provider, you need to understand your own business model. For example, if you have free users and scale overnight, you need to be able to cover those expenses.

Conducting due diligence on pricing is every bit as critical as the previous elements covered in this article. You don't want surprises as your application grows. [AWS Cognito](https://aws.amazon.com/cognito/pricing/) is a perfect example when it comes to pricing transparency. Here are some questions to keep in mind when you're considering an AaaS's pricing:

1. For out-of-the-box solutions, what is the pricing per authentication?
1. Have some understanding of your expected user base size and how that will affect the price of the service.
1. Is there an admin tool where pricing is consistently being updated based on current usage?
1. Many organizations are split into several P&Ls (Profit & Loss centers). Is an authentication provider able to segregate pricing based on P&L units?
1. Does the authentication provider charge for trial users who are nonpaying customers?
1. What are the pricing level tiers? Does the cost go down as authentication goes up?
 
##Conclusion

To wrap up, vendor management and risk assessment is an important piece of onboarding a third-party service for many reasons. Performing due diligence can address security concerns, performance issues, implementation concerns, and pricing transparency, and understanding the limitations of your vendors is key to preventing security challenges down the road. 
 
As a result, the due diligence process should be extremely detailed, and it should play a critical role before procurement. At minimum, you should:

- Know your security standard and measure it against your vendor's security standard.
- Understand your performance needs and assess whether the vendor can offer the same or better performance.
- Assess whether implementation is going to be easy for your engineering team.
- Know the cost of the services.
 
At the end of your assessment, understand the tradeoffs. Do the benefits outweigh the risks? Often, partnering up with a third-party provider enables your business to focus on what you do best, delivering value to your end customer. 
 
 

