---
layout: blog-post
title: The what, why and when of multi-factor authentication
description: What is multi-factor authentication and when should developers require it?
author: Dan Moore
image: blogs/orbitvu-fusionauth-story/orbitvu-chose-fusionauth-for-architectural-flexibility-great-support-and-customizability-header-image.png
category: blog
tags: topic-feature-mfa
excerpt_separator: "<!--more-->"
---

As more of our lives and data move online, multi-factor authentication (MFA) becomes increasingly important to help keep our accounts secure. As a user, you should enable MFA on accounts with valuable data. But as a developer or software creator, you need a deeper understanding of MFA, why it's important and when to require it.

<!--more-->

## What is MFA?

When a user authenticates, they are providing proof of who they are. 

There are a few different categories of such types of proof:

* What they know. A password, for example.
* What they have, such as a code from a device a user possesses.
* What they are; something like a fingerprint.
* Where they are, such as on a private network.

Each of these methods of proof is called a 'factor'. Factors must be kept private and not shared to be useful in authenticating a user. 

Multi factor authentication is best understood as requiring two or more factors in order to authenticate.

MFA is a superset of two factor authentication (2FA). With MFA an arbitrary number of factors of proof can be required. With 2FA, the number of factors is limited to two.

Multi factor authentication isn't only for online user account access. When you go to a bank to get documents (or maybe diamonds, if you are a James Bond villain) from a safe deposit box, you usually need a key (something you have) and a signature (something you are). If your signature doesn't match, you can also provide a government issued id (another thing you have). 

However, the focus of this post is MFA in the context of online account access. Because of that and the prevalence of passwords, this post will assume that your users' first factor is a password. 

Let's talk more about why you, as a developer, should enable and encourage your users to use MFA.

## Why use MFA?

A foundational part of building a secure, available system is ensuring only authorized people and software agents access it. Both authentication, which ensures that users are who they say they are, and authorization, which controls access, are critical to achieving this goal. Consider what a compromised account could do to your systems and your users' data, then think about how MFA can help prevent that.

If your users provide only one authentication factor, it can be stolen by a bad actor. This actor now has the same access to the system as the user does.

Secrets users know, such as passwords, are being stolen regularly. While systems can help prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users may protect themselves by practicing good password hygiene, requiring another factor increases the security of user accounts on your system. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

Implementing MFA is typically a partnership with your users. Some forms of MFA are easier for system developers to implement. Others require more effort from users.

### The balance between user experience and account security

Even though MFA is more secure, as a developer, be cautious about requiring it for all system access. In this situation, you are engaged in a fundamental engineering practice: making a tradeoff. 

You want the user login experience to be as smooth as possible while minimizing account takeover opportunities. Friction in the authentication process will annoy some percentage of your users. They are using your application to do a job, not because of deep love of your secure login process. 

Listen to your users when you are discussing MFA requirements. You don't want them to circumvent MFA. At the same time they may need to be educated on the benefits. How many of you know people who still write down passwords on post-it notes? I do.

Acknowledge and address the balance between the friction of the user login experience and the risk of account compromise. Do so in the context of the data your system secures; different data requires different levels of assurance. If your site lets users vote on cat pictures, MFA may never be required. If your site lets users transfer money, or digital assets similar to money, to complete strangers on the internet, on the other hand, it should require MFA.

These scenarios are at opposite ends of the security and user experience spectrum, and the case for MFA, or not, can be made rather easily. More difficult decisions are required when the answer isn't obvious. 

What are some situations where you should consider incorporating multi-factor authentication?

## When should I require multiple factors of authentication?

There are times and circumstances where you, as a system developer, should require an increased level assurance about who is logging in. Often the type of account is relevant, other times it is the requested access, and sometimes it is legal requirements or corporate policies.

### Administrative accounts

Privileged accounts with higher levels of access should use MFA. 

These administrator or operator accounts may wreak havoc if misused or compromised. 

To address this, require MFA on all admin accounts. Require providing additional factors regularly, perhaps at every login. In extremely sensitive systems, all changes to a system could require multiple factors.

### High value accounts

There are also many high value accounts where MFA helps to prevent account compromise. These user accounts don't possess elevated privileges within a system, unlike the aforementioned admin accounts. Instead, they control data or allow actions to be taken with real world consequences.

One example is an online bank account. You don't want users to lose their account access and later learn someone drained their savings. 

Another example is an email account. Beyond the private information often present in inboxes, these represent a risk to many other systems. Password reset solutions often send an email; compromise of an email account means risk to all such accounts of this user.

### Risky actions

When a user has already authenticated, but is performing a dangerous action, MFA provides extra security. This is also known as "step up auth", because the additional factor is required at the moment the risky action is requested. Examples may include:

* Changing a password or username
* Spending money
* Resetting a password
* Creating a new user with elevated privileges
* Changing system settings
* Modifying configuration impacting other factors, such as a user's email or phone number

When an action like this is requested, the system needs certainty about the requester. These actions can be, and often are, legitimate. But they can also be used by someone with illicit access to the user's account to solidify the takeover.

By using step up auth, you can help mitigate the damage of a compromised account. An attacker may be able to access the account and read data from it, but if they don't have the additional factor, they won't be able to undertake actions which can cause more damage.

### Legal or organizational policies

If your application is used by certain organizations or stores personally identifiable information, you may need to require multi-factor authentication for some or all accounts. As part of the NIST risk management framework, for example, Authenticator Assurance Level 2 requires: ["proof of possession and control of two different authentication factors is required..."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes an MFA requirement is not explicit, however. If you are seeking SOC2 certification, you will need to implement MFA, even though multi-factor authentication is never mentioned in the [SOC "Trust Services Criteria"](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf).

From Section CC6.1 of the SOC document: "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely". The document omits specific implementation details. Talk to your SOC2 auditor about required controls.

### When actions look suspicious

An auth system has a lot of information about who is logging in. During authentication, credentials are supplied; the end result is the answer to this question: "Is the user behind this authentication request who they are claiming to be?" 

Some data, such as the username and password, is explicitly provided to the system. But there is also interesting implicit data available such as:

* The date and time of access
* Connection information such as IP address and user agent
* How many times the user has logged in recently
* Has this device been used to access this system before

Such implicit data can help determine if the authentication request is legitimate. For instance, if a user accesses a system from the USA and 24 hours later there is another request from Germany with the same credentials, is the latter valid? Could be, but it could also be that the request from Germany is due to a compromised account. Requiring MFA at such a time allows you to apply extra scrutiny to strange requests.

Another example where you might want additional authentication factors is when a user logs in from a new device. Popular SaaS applications such as Google's GSuite and Mailchimp can be configured to require MFA for only the initial authentication from a new device.

### Applying MFA requirements

Put the MFA requirement configuration in a central location in your application to make it easier to modify. Tying it tightly to the authentication system generally makes sense. Choices about when to require MFA change over time as a system evolves. New features are built. Different types of users are supported.

This policy configuration should itself be protected and only allow access to privileged users with recent multi-factor authentication.

If you don't have organization or user wide policies, at the least allow users to set up MFA. Doing so allows security conscious users to protect their account. They can evaluate their own security posture and make their own sensible choices. For example, one person may run their entire life through their Gmail account, while others may use Gmail only occasionally as a throwaway email address. In the former case, MFA makes sense; in the latter it may not.

If you are worried about what a compromised account could do to either your systems or your users' data, you should strongly encourage or require MFA.
