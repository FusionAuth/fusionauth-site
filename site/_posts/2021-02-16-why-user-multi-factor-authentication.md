---
layout: blog-post
title: The what, why and when of multi-factor authentication
description: What is multi-factor authentication and when should you use it?
author: Dan Moore
image: blogs/orbitvu-fusionauth-story/orbitvu-chose-fusionauth-for-architectural-flexibility-great-support-and-customizability-header-image.png
category: blog
tags: topic-feature-mfa
excerpt_separator: "<!--more-->"
---

As more of our lives and data move online, multi-factor authentication (MFA) becomes increasingly important to help keep accounts secure. As a user, you should enable MFA on any accounts containing valuable data. 

But as a developer or software creator, you need a deeper understanding of MFA, why it's important and when to require it.

<!--more-->

## What is MFA?

When a user authenticates, they provide proof of who they are. There are multiple broad types of proof:

* What they know. A password, for example.
* What they have, such as a code from a device a user possesses.
* What they are; something like a fingerprint.
* Where they are, such as on a private network.

Each of these methods of proof is called a 'factor'. Factors must be kept securely and not shared to be useful in correctly authenticating a user. Multi factor authentication is best understood as requiring two or more factors in order to authenticate.

MFA is a superset of two factor authentication (2FA). With MFA an arbitrary number of factors of proof can be required. With 2FA, the number of factors is limited to two.

Multi factor authentication isn't just for online user accounts. When you access a safe deposit box in a bank, you usually need a key (something you have) and a signature (something you are) or a government issued id (another thing you have). 

However, the focus of this post is online account access and MFA. Because of that, I'll assume that your users' first factor is a password. More systems are requiring proof beyond a password to access accounts, though, which is a good idea. 

Let's talk more about why you, as a developer, should enable and encourage your users to use MFA.

## Why use MFA?

A foundational part of building a secure, available system is ensuring only authorized people and software agents access it. Both authentication, which ensures that users are who they say they are, and authorization, which controls access are critical to achieving this goal.

If your users use only one authentication factor, it can be stolen by a bad actor. This actor now has access to the system as if they were the user whose credentials they have. 

Secrets users know, such as passwords, are being stolen regularly. While systems can help prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users may protect themselves by practicing good password hygiene, using MFA to require another factor increases the security of user accounts on your system. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

Implementing MFA is a partnership with your users. Some forms of MFA are easier for system developers to implement and keep secure. Others require more effort and care from users providing them. 

### The balance between user experience and account security

However, even though MFA is more secure, as a developer, avoid requiring it for all system access. You are engaged in a fundamental engineering practice of making a tradeoff; you want the user login experience to be as smooth as possible while minimizing account takeover opportunities. Friction in the authentication process will annoy some percentage of your users, as they typically aren't using your application because of love of the login process. 

Listen to your users when you are discussing MFA requirements. You don't want them to circumvent MFA in destructive ways; at the same time they may need to be educated on the benefits. How many of you know people who still write down passwords on post-it notes?

Balance between the friction of the login user experience and the risk of account compromise, but you should do so in the context of the data your system secures. 

If your site lets users vote on cat pictures, MFA may never be required. If your site lets users transfer money, or digital assets similar to money, to complete strangers on the internet, on the other hand, it should require MFA.

These scenarios are at opposite ends of the security and user experience spectrum, and the case for MFA can be made rather easily. More difficult decisions occur when the answer isn't obvious. 

What are some situations where you should consider incorporating multi-factor authentication?

## When should I require multiple factors of authentication?

There are times and circumstances where you, as a developer, should require an increased level of user identity assurance. Often the type of account is relevant, other times it is the requested access, and sometimes it is legal requirements or corporate policies.

### Administrative accounts

Privileged accounts with higher levels of access should use MFA. 

These administrator or operator accounts may wreak havoc if misused or compromised. You should require MFA on all admin accounts. Require MFA often, perhaps at every login. In extremely sensitive systems, all changes to a system could require proof of additional factors.

### High value accounts

There are also many high value accounts where MFA helps to prevent account compromises. These user accounts don't possess elevated system privileges. Instead, they control data or allow actions to be taken which can have real world negative consequences.

One example is an online bank account. You don't want users to lose their account access and later learn someone drained their savings. 

Another example is an email account. Beyond the private information often present in inboxes, these represent a risk to other systems. Password reset solutions often send an email; compromise of an email account means risk to the other accounts of this user.

### Risky actions

When a user has already authenticated, but is performing a dangerous action, MFA provides extra security. This is also known as "step up auth", because the additional factor is required at the moment of the more privileged request. Examples may include:

* Changing a password or username
* Spending money
* Resetting a password
* Creating a new user with elevated privileges
* Changing system settings
* Modifying configuration impacting other factors, such as an email or phone number

When an action like this is requested, the system may need certainty about the requester. These actions can be and often are legitimate. But they can also be used by someone with illicit access to the user's account.

By using such a step up, you can help partially mitigate the damage of a compromised account. An attacker may be able to access the account and read data from it, but if they don't have the additional factor, they won't be able to undertake actions which can cause more permanent damage.

### Legal or organizational policies

If your application is used by certain organizations or stores personally identifiable information, you may need to require multi-factor authentication for some or all accounts. As part of the NIST risk management framework, for example, Authenticator Assurance Level 2 requires: ["proof of possession and control of two different authentication factors is required..."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes an MFA requirement is not explicit, however. If you are seeking SOC2 certification, you will need to implement MFA, even though multi-factor authentication is never mentioned in the [SOC "Trust Services Criteria"](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf).

From Section CC6.1 of the SOC document: "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely". The document has the requirements, but omits specific implementation details. Talk to your SOC2 auditor about required controls.

### When actions look suspicious

An auth system has a lot of information about who is signing in. In the auth process, different data is supplied with the end result being the answer to this question: "Is the user behind this authentication request who they are claiming to be?" 

Some data is explicitly provided to the system: the username and password. 

But there is also interesting metadata such as:

* The date and time of access
* Connection information such as IP address and user agent
* How many times the user has logged in recently
* Has this device been used to access this service before

This implicit data can help determine if the authentication request is a legitimate one. For instance, if a user accesses a system from the USA but 24 hours later there is another request from Germany with the same credentials, is this legitimate? Could be, but also could be indicative of a compromised account.

Requiring MFA allows you to apply extra scrutiny to strange requests.

Another example where you might want to require additional authentication factors is when a user logs in from a new device. Popular SaaS applications such as Google's GSuite and Mailchimp can be configured to require MFA for the initial authentication from a new device, but not after.

### Applying MFA requirements

You should strive to embed the choices about when to require MFA in a central, easily changed location in your application. Tying it tightly to a central authentication system generally makes sense. Choices about when to require MFA change over time as a system evolves. New features are built. Different types of users are supported.

This policy configuration should itself be protected and only allow privileged users, perhaps with a recent multi-factor authentication.

If you don't have organization or user wide policies, allow users to set up MFA. This allows security conscious users to protect their account. They can evaluate their own security posture and make choices that make sense to them. For example, one person may run their entire life through their Gmail account, while others may use Gmail only occasionally as a throwaway email account. In the former case, MFA makes sense; in the latter it may not.

In general, if you are worried about what a compromised account could do to either your systems or your users' data, you should strongly encourage or require MFA.
