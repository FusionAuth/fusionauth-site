---
layout: advice
title: Multi Factor Authentication
description: What is multi factor authentication and why is it important?
author: Dan Moore
image: advice/breached-password-detection/expert-advice-breached-password-detection.png
category: Security
date: 2021-02-05
dateModified: 2021-02-05
---

As more of our lives move online, multi factor authentication (MFA) becomes more important for keeping our accounts secure. As a user, enable MFA on any accounts containing valuable data. As a developer or software creator, you should have an understanding of MFA, what types are available and when you might consider requiring additional factors for user authentication. 

## What is MFA?

When a user is authenticating, they need to provide proof of who they are. A person can do this in a few ways:

* What they know, a password, for example.
* What they have, such as a code from a device you possess.
* What they are, like a fingerprint.

Each of these is called a 'factor'. Multi factor authentication is, therefore, requiring two or more factors in order to authenticate.

MFA is slightly different from two factor authentication (2FA) because in the former case, the number of factors are not limited to two. 2FA is a subset of MFA.

Multi factor authentication isn't limited to systems on the Internet, either. If you have a safe deposit box, to get in, you provide a key (something you have) and a signature (something you are) or an id (another thing you have). However, this article will assume that the first factor of authentication will be a password, something the user knows.

More and more online systems are requiring MFA to access accounts. Let's turn to why you'd use MFA as a developer.

## Why use MFA

A foundational part of building a secure available system is to ensure that only people and software that should have access to it, do. Authentication, which ensures that users are who they say they are, and authorization, which ensures that users have access to only what they should, are key parts of managing access.

If your users have only one factor of authentication, it can be stolen by a bad actor. Whether it is the key to a safe deposit box or the password to a email account, if a user loses control of that single factor, that account can no longer be trusted. In particular, things users know, such as passwords, can and are being stolen regularly. While systems can prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users can protect themselves by practicing good password hygiene, adding another factor increases the obstacles to anyone else obtaining that account.

Adding factors to authentication can improve the security of your users' account. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

It's a balance, because as a developer, you want to make the user login experience as smooth as possible while balancing the need to minimize account compromise. After all, any friction in the login process will annoy some percentage of your users. Plus your users don't use your application for the login, they want to have their problem solved. 

As a developer, you need to balance between the degraded user experience and the risk of account takeover. If your site lets users vote on cats, MFA may never be required. If your site lets users transfer money, it should require it. The hard part is the vast number of situations where the answer isn't that obvious. What are some situations where you should consider requiring multi factor authentication?

## When is MFA typically used

There are a number of situations where MFA makes sense. Sometimes it is the type of account that matters, sometimes it is metadata around the access, and other times it is external laws or policies.

### High value accounts

Privileged accounts, which have higher levels of access to systems, should use MFA. These adminstrator accounts often have the ability to wreak havoc if they were misused. Therefore, as a developer, you should require MFA on admin accounts. You may want to require MFA for every login or even every action which mutates a system with this type of account.

There are also plenty of other high value accounts where MFA should be required. These accounts don't have elevated system privileges, but instead control information or actions. Compromise of these accounts will have significant negative repercussions.

An example of such an account would be a bank account. You don't want users to lose their account access and learn that someone had drained their savings. Another example would be email. Beyond the personal information often present in email inboxes, because so many password reset solutions send email, compromise of this account means that many other accounts are at risk.

### Risky actions

There may be times when a user has already been authenticated but is performing an action that is riskier than usual. This is also known as "step up auth". Examples of risky actions include:

* Changing a password or username
* Resetting a password
* Spending money
* Creating a new user with elevated privileges
* Changing system settings
* Modifying settings that would affect other factors such as email or phone number

When this happens, requiring another level of authentication helps ensure that the person taking the riskier action is actually the owner of the account. Since these actions may be both legitimate and of intense interest to attackers who have gained access to the account, preventing the latter from undertaking them makes sense.

### Legal or organizational policies

If your application is going to be used by certain organizations or to store certain kinds of personally identifiable information, you may need to require multi factor authentication. As part of the NIST risk management framework, for example, Authenticator Assurance Level2 requires: ["proof of possession and control of two different authentication factors is required through a secure authentication protocol."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes the requirement is not explicit. If you are looking to be SOC2 certified, on the other hand, you will likely have to use MFA, even though the term is never mentioned in the SOC "Trust Services Criteria" documentation. CC6.1 specifies "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely" without outlining implementation details. In this case, talk to your auditor about MFA requirements (among many other things).

### When things look suspicious

The system processing authentication has a unique viewpoint into who is signing in. There's explicitly provided data like the username and password, but also metadata such as:

* The time of access
* Connection information such as IP address
* Whether this device has been used to access this service before
* Access patterns

All of these can be used to help determine if the person behind the authentication request is legitimate. For instance, if a user accessed the system from the USA but then 24 hours later a request from Germany with the same credentials, this request deserves some scrutiny. It's possible it is legitimate, but may not be.

Another common event that triggers a higher level of authentication assurance is when a user signs in from a new device. For example, Google's GSuite can be configured in such a way as to require MFA for the initial authentication from a new device, but not after. Then, if you delete your cookies or use a different browser, MFA is required again, because to GSuite these situations look like access from a different device.

### Example

Resetting a password is a common login flow that almost everyone uses multiple factors to secure. This is because changing a user's password is a high risk activity. The system needs to know who you are, but it should require more clarity than it might in other situations where the stakes are lower.

In this case, the two factors typically are:

* what you know: the email address or username of the account
* what you have: access to the email inbox

## What additional factors are commonly used?

Beyond the typical password factor, what are other ways a user can prove they are who they say they are?

As defined above, there are three main options. Let's look at each in turn.

### What you have

Having something that is independent from the account that the user has is a great way to prove that they are legitimate.

#### TOTP

A common option is a software or hardware time-based one time password (TOTP) generator. These solutions, such as Google Authenticator, Aegis Authenticator or Auth, generate a pseudo random numeric code based on a secret seed. The seed can be shared between your system and the generator. Then, when the user wants to sign in, the seed is combined with the current time to generate the code. 

Both the the generator and the server have the secret seed, the current time and the algorithm to generate the code. Therefore, the server can compare the code calculated with the code provided and see if they match. To preserve this, you need to keep the initial secret safe and maintain control of the generator, whether that be on your phone or a separate device.

#### SMS

Simple message service, or SMS, is another common option. Here, the system sends an out of band text message to a previously provided mobile phone number. The authentication system knows the contents of the text message; it sent it! The user provides the content, typically a string of numbers or alphanumeric characters. To keep this factor safe, the physical or software phone must be kept in possession of the user. As a developer, you should also not allow a mobile number to be changed unless the user has authenticated with MFA. Otherwise an attacker with a password could log in, change the mobile number to one they control, and then be able to provide the MFA code sent to the new phone.

Additionally, there's an attack vector where a bad actor takes over your phone number without getting your phone or changing the number associated with your account. These can range from social engineering attacks, where a customer service rep is convinced you set up a new phone, to more sophisticated attacks which target cell phone networks. SMS has weaknesses that have been exploited, but mostly it's safe. High value systems such as banking websites often use SMS as one of their factors. To make it even more secure, contact your cellphone provider and ask about their policy around new phone activation to help prevent social engineering attacks. You can also set up a software service such as Google Voice or Twilio to receive the SMSes; make sure you secure the SMS service well.

#### App push

Your phone isn't limited to being a TOTP software provider or receiving text messages, it can also have a specialized application that uses push notifications to provide a code. Again, this code is generated by the authenticating system and sent to the user. The user proves possession of their phone with the push notification application installed by sharing that code with the authenticating system. The application can encrypt the code before sending and decrypt it on the phone to ensure it can't be tampered with or read over the wire. 

With any of the phone based MFA options, set up the device to require authentication before these applications are accessed, such as Face ID or a pin. Ensure notifications and SMS messages can't be read without the user authenticating.

#### Email

Email can be used in the same way as SMS; to provide an out of band code to a user. After providing the code to the system, the presumption is that the user owns the email account. Possession of access to the email account is the additional authentication factor. 

Users must ensure that their email account is secured and that no one else has access. Similarly to SMS, you as the developer must ensure that the email address of a user's account can't be changed by an actor who has only authenticated with a password.

#### A physical device

Physical devices that are specialized for authentication, such as Yubikeys, can provide another factor. These devices work with your computer or your phone to offer either another factor or single sign-on. As a developer, you will need to build in support for the device using an SDK or a standard it works with, such as WebAuthN. Your users will need to ensure they don't lose it.

### What you know

There are a couple of commonly used factors that are based on what you know. These suffer some of the same issues as passwords, in that they can be stolen, socially engineered or otherwise acquired by bad actors. As a developer, be wary of using these.

#### User questions

In this scenario, the system requests answers to questions when the user registers. These are stored off and when the user needs to provide another factor of authentication, one of the questions is asked. This method is commonly used for resetting passwords, but is no longer recommended by [institutions such as NIST](https://pages.nist.gov/800-63-FAQ/#q-b15). A variant of this that I've seen is to provide a list of facts about a user and have them select the accurate fact. For example, "What street did you live on?" might be the question, and the answers would be pulled from a list of publicly available information. 

If you are a user and are asked to provide this as a factor, the best option is to enter random answers. Remember them or, even better, store them in a password manager. For example, if a question is "what was your first pet's name", and your first pet's name was Fluffy, pick anything other than "Fluffy". Perhaps "h941TphXOL3h0ws7M0U2" or "relevance-middle-horoscope". This prevents someone from learning the name of your childhood pet from a post on Facebook and using that information to gain illicit access. 

If you are a developer implementing this, first, try to avoid implementing this solution and pick one of the other factors available. If you must implement it, let the user to enter their own questions; this will increase the randomness of the answers provided.

#### Double blind passwords 

This is a way to augment the security of a password factor, so is a bit different than some of the other factors discussed. The idea is that you split your password into two pieces. One is stored in a password manager, and the other is memorized. Then, when the password is entered, both strings are combined to provide the true password. This is not an option you can undertake as a developer, however. As a user, though, you can use it to increase the security of your highest value accounts, such as your email or bank accounts. However, it only protects against your password manager being compromised, not the password being stolen from the receiving system.

This is also known as a horcrux, a term from the popular Harry Potter novels.

### Who you are

The final category of options for multi factor authentication is "who you are". These factors are tied to your physical body, but are conveyed to the system authenticating you in a secure fashion. As a developer, these are really intriguing options: nothing to forget or lose. However, people's bodies change over time, so make sure you include biometrics as another option or have a fallback plan for when someone has a new haircut.

#### Physical biometric

Physical biometric factors identify you based on part of your body. Examples include Face ID, which identifies a user from the shape and look of your face, fingerprint identification which matches fingerprints, and retinal scanners, which look at the variations in the tissue of a user's eye. The benefits of this solution is that the authentication mechanism is difficult to lose or forge. 

To implement authentication using biometric factors as a developer, you'll either need custom hardware, specialized software or integration with an operating system. All of the major operating systems for phones and computers have some level of support for these solutions. 

#### Behavioral biometrics

These biometric factors use your behavior to identify and authenticate you. One form of this is gait recognition technology, though this is mostly used for user identification rather than authentication. 

Another example is your keystroke pattern; that is, how you type, the rhythym of your keystrokes, the errors you make and the timing between key strikes. Done properly, this can identify a user without any action on their part, and could be a complement to some of the more explicit factors mentioned above. 

However, there's wide individual variation, even within a single day, of keystroke patterns. If you implement a system like this you'll want to be able to tune it.

### Standards

WebAuthn is a standard recently approved by the W3C standards body which link some of these types of authentication factors into the browser. This makes it easier as a developer to implement physical biometric authentication, for example. The browser vendor has already integrated with the operating system, which has in turn integrated with the hardware required for solutions such as fingerprint identification. If the application in question is accessed through a browser, all that's left for a developer to do is integrate with the browser API calls. 

WebAuthn standard works with a variety of the above factors, including physical devices such as Yubikey and the aforementioned fingerprint solution. 

FIDO2 is a set of specifications, of which WebAuthn is one.

## Disabling MFA

There are other issues to consider when, as a developer, you are implementing MFA. You may want to provide a way to disable MFA.

There are two main dimensions for disabling MFA.

### Disabling MFA for a device

The first is at the device level. This often takes the form of a "trust this device" or "this is not a public computer" checkbox during authentication. In this case, the system records that this device can be trusted. The trust usually extends for a certain duration, after which MFA is required. 

With a browser this can be implemented with a cookie, and removing the cookie will cause MFA to be required at the next login. Other devices have similar local storage mechanisms where such preferences can be stored.

### Disabling MFA for a user

The second is disabling MFA for a user. This is obviously a high risk operation, since one of the main strengths of MFA is that multiple forms of proof of identity are provided, and removing them opens the users' account up to being hijacked by someone possessing only one factor of authentication, say a password.

However, you might do this because the user has lost one of the factors previously associated with their account. Just make sure you provide controls around this.

One possible control is to have this be a manual process, performed by a customer service rep trained in other ways to authenticate a user. So a user would call in or chat and provide proof that they were who they said they were before MFA is turned off. 

Another option would be self service. You can provide a set of codes at the moment MFA is turned on that are one time use. These can then be used to circumvent MFA should the user need to do so. 

In both of these cases, it's worth noting that the user is still providing additional factors of authentication, they are simply more flexible, because of the human intervention, or one time use, in the case of the codes.

In either situation, the disabling of MFA is in itself a privileged operation and you should ensure that the user is authenticated to the standards needed.

hhh....

what about if someone else gets another factor?

resetting a password as an example
what you know
and 
what you have

#### Re-entering your password

Many applications allow you to authenticate once with your username and password and then require you to re-enter it if you are modifying your account information. This is an example of MFA because 

