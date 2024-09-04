---
title: The Demise of Third-Party Cookies and Why You Need to Run Your Own CIAM System
description: What is the future of third party cookies and how does that tie into customer identity and access management?
section: CIAM
author: Kuntal Chakraborty
icon: /img/icons/third-party-cookies-ciam-system.svg
darkIcon: /img/icons/third-party-cookies-ciam-system-dark.svg
---

Third-party cookies track user information like browsing habits, purchases, and other interactions, which helps companies know how to market to their target demographic. By utilizing third-party cookies, companies can track users across multiple websites. However, the collection of personal information raises concern about online privacy. As a result, more and more browsers are allowing users to block third-party cookies.

This, of course, is a big shock to worldwide advertising. How do you make sure you’re reaching a relevant audience who wants your product?

In this article, I’ll explain CIAM, an alternative to third-party cookies, and why you should run your own CIAM solution.

## What Is CIAM?

[Customer Identity Access Management (CIAM)](https://en.wikipedia.org/wiki/Customer_identity_access_management) is a cloud-based solution that lets companies acquire and identify customers, collect *first-party* data, and create basic profiles to build a personalized business.

### What CIAM Is Replacing

A third-party cookie is created by a domain other than the one a user is visiting. They’re usually placed on a website using scripts or tags. In other words, if you're visiting `www.example.com`, then a cookie used by `some-site.com` would be a third-party cookie.

Third-party cookies are predominantly used for advertising. By tracking a user throughout multiple websites, advertising companies can collect a lot of information about the user, including but not limited to websites visited, purchases made, and the interests they show on various websites. This information is used to provide targeted ads that are more relevant to the user.

Because of the sheer amount of data they collect, third-party cookies are seen as a privacy risk and steps are being taken to phase out their use. Companies can be fined for breaking privacy regulations like [GDPR and CCPA](https://www.cookiepro.com/knowledge/gdpr-vs-ccpa/), and browsers like Firefox and Safari have started blocking third-party cookies altogether. Google Chrome plans to do the same [by 2022](https://blog.google/products/ads-commerce/a-more-privacy-first-web/).

First-party cookies are distinct from third-party cookies in that they are generated and stored by a website in its visitor's browser, rather than tracking a user’s overall browsing habits. First-party cookies remember a user’s session on that particular site, as well as basic data about the visitor. They help sites better understand visitor browsing behavior: what users did on that particular website, how often they visit, and so on to build an effective marketing strategy. 

What first-party cookies *don’t* do is allow website owners to know what their users do with other websites that are not part of the same domain.

Still, the data from first-party cookies needs to be stored somewhere. Otherwise, it opens the door to myriad issues for a company: increased infrastructure cost, risk of data breach or non-compliance, difficulty managing customers, to name a few.

### How CIAM Fills the Gap

However, with the right CIAM system, companies can gather relevant data about their customers, grow their businesses, and still keep user privacy intact by enabling users to easily manage their own account profiles and security settings.

A successful CIAM solution should address a few key areas:

* Authentication
* Single sign-on
* Authorization
* Self-service
* Centralized user management
* Privacy

Let’s go over those one by one.

#### Authentication

A proper authentication process takes steps to prevent unauthorized or fake logins and confirms the legitimacy of valid users.

In the authentication process, for better user experience, a CIAM system often allows access by offering options. Not just a username and password, but one-time PINs, short-lived SMS codes, and/or biometric credentials. It is up to the CIAM implementation team to determine what authentication method best suits their users’ needs and the company’s security profile. 

The latest CIAM solutions can offer adaptive authentication features. The process uses contextual or behavioral analytics to decide which authentication method to apply to a customer in a specific situation. For example, a user may need to pass a second layer of authentication in order to access a particular web app or feature, or send an email to the account email address when a new device logs on from another country. 

#### Registration and Single Sign-On

[Single sign-on (SSO)](https://www.cloudflare.com/learning/access-management/what-is-sso/) enables users to sign up and log in to your app or service via an account they already own in a different service known as an identity provider. SSO enhances customer satisfaction by eliminating the need for a separate password while still maintaining proper security. It also saves your users time while logging in. A CIAM system like [FusionAuth](/) provides an [SSO feature](/features/single-sign-on) that can be integrated with numerous applications like WordPress or Shopify.

#### Authorization

Successful authorizations lets businesses confirm that customers have the correct rights to access an application, service, or website. Note that this differs from *authentication* —think of authentication as proving that the key a user holds belongs to them, and authorization as having the correct key to get through the door a user wants to open. A CIAM system usually has role-based or group-based authorization, and sometimes offers granular permission management.

#### Self-Service

The self-service feature of a CIAM system gives users the power to manage many of their own settings or tasks without contacting your customer service team. These might include registering for service, resetting passwords, managing security settings, and accepting or canceling updated terms of use or consenting to other agreements. This is critical to allow your business to scale while keeping customers happy.

#### Centralized User Management

The user management aspect of a CIAM system enables administrators to update user access permissions and apply security policies for protected business operations.

To ensure user privacy, it’s important to limit who can see customer information. Allowing customers to manage their own identity reduces the necessity of company admins having access to that data. A CIAM system can also integrate with other applications (like CRMs) or data stores and provide a single centralised view of your customers.

With the flexible architecture of a CIAM system, you don't have to worry about spending time and money on a separate identity management solution. FusionAuth, for example, provides an [intuitive user management feature](/platform/user-management).

#### Profile Management

One of the biggest benefits of a CIAM system ties back to the start of this article, where we covered the demise of third-party cookies. With a CIAM system, you can begin to build a profile of your users from their interactions on your website. You can also layer in interactions with customer service representatives, mobile applications, and other CRM systems. Whether the CIAM is the system of record or you are using the data there to feed into other systems, the profile data of your customers can help you understand your customers better.

Ensure that your CIAM system has a full-featured API so that it’s easy to move data to and from this system.

#### Privacy

I’ve already briefly mentioned privacy regulations like [GDPR](https://gdpr-info.eu/) and [CCPA](https://oag.ca.gov/privacy/ccpa) that provide structure for maintaining data privacy policies. A CIAM system enables companies to easily manage their data and account settings from one portal, while ensuring that they’re following necessary regulations. The user data is kept internal to the business, and is not shared with third parties.

## Why You Should Use CIAM

Given the attributes of a robust CIAM solution, you can probably already see the positive impact it can have on your marketing efforts. Let's go over the advantages a CIAM can bring.

### Improved Customer Experience

A good CIAM solution provides users an easy registration and login experience. The end result is a much higher customer satisfaction and an increased conversion rate. It's a known fact that users can grow frustrated if [they have to fill in large forms](https://blog.hubspot.com/blog/tabid/6307/bid/6746/Which-Types-of-Form-Fields-Lower-Landing-Page-Conversions.aspx) while registering for a service. With the SSO option provided by a CIAM, you can eliminate registration forms altogether and enable a smooth one-click signup.

### Security and Compliance

A robust CIAM solution can protect against hacks or frauds, as well as provide compliance with data protection laws. A CIAM solution in conjunction with multi-factor authentication and brute force protection can stop malicious actors from accessing customer data. When so configured, it can monitor the activities of internal employees and alert admins in case of suspicious access to sensitive data.

## Other Solutions

CIAM is not the only solution for the obsolescence of third-party cookies. Quite a few other solutions exist, although none as robust as a CIAM.

For example, interest-based advertising, [Federated Learning of Cohorts (FLoC)](https://github.com/WICG/floc), is one alternative solution to third-party cookies without resorting to your own CIAM system. FLoC is a proposed browser standard, created by Google, that provides interest-based ads without letting advertisers know your identity. Users are categorized into *cohorts*—groups of users based on similar interests. The groups are large enough to make a user semi-anonymous to advertisers.

FLoC however, isn't as glorious a solution as it claims to be. The question with FLoC is, "Do you trust Google?" Given that they have an ocean of information about millions of internet users, the answer is probably no. Beyond that, [fingerprinting and other tracking methods](https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea) can still make a user stand out in a cohort.

## Conclusion

The demise of third-party cookies may affect the advertising industry for a time, but alternative solutions like CIAM solutions can reshape the business model, combining necessary customer data security with a seamless user experience.

If you’re looking for a full-featured CIAM solution, take a look at [FusionAuth](/). An excellent platform for secure access management, it is fully customizable, supports unlimited users, and provides an API for easy integration with all of the apps essential to your business.

