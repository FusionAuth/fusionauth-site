---
layout: advice
title: Multi-factor Authentication for Developers
description: What is multi-factor authentication and why is it important?
author: Dan Moore
image: advice/mfa/expert-advice-multi-factor-authentication-for-developers-header-image.png
category: Authentication
date: 2021-02-19
dateModified: 2021-02-19
---

As more of our lives move online, multi-factor authentication (MFA) becomes increasingly important as a way of keeping our accounts secure. As a user, you know you should enable MFA on any accounts containing valuable data or which you want to keep safe. 

As a developer or software engineer, MFA may seem a bit mysterious. This article will cover:

* What MFA is
* Why it is important
* What factors are available 
* When you might consider requiring MFA

At the end, you should have a good understanding of options for integrating MFA into your applications, and how to start doing so.

## What is multi-factor authentication (MFA)?

When a user is authenticating, they are providing proof of who they are. There are four broad categories of proof:

* What the user knows. A password is an example. 
* What the user has, such as a device.
* What the user is; one example would be a fingerprint.
* Where the user is, possibly ascertained by using GPS.

Each of these methods of proof is called a 'factor'. Factors must be kept secure. They should not be shared, in order to ensure that the authenticating user is associated with the correct account. 

Multi-factor authentication is best understood as requiring two or more factors in order to authenticate a user. MFA is a superset of two factor authentication (2FA). With MFA an arbitrary number of factors of proof can be required. With 2FA, the number of factors is limited to two.

Multi-factor authentication isn't just for online user accounts, though. If you are accessing a safe deposit box in a bank, you need a key (something you have) and a signature (something you are) or an id (another thing you have). However, this article will focus on online MFA.

The majority of user accounts have a password as a factor. You might be working in such a system right now. As engineering teams become more aware of the problem of user account hijacking and its real world consequences, more are allowing or requiring additional factors of authentication. 

## Why use multi-factor authentication (MFA)?

Building a secure, available system requires ensuring only authorized people and software agents have access to it. This is a foundational concern.

Authentication, which ensures that a system knows who the user is, and authorization, which controls what a given user can access, both play a role in building such a system. While you can control what an actor is doing without knowing who they are, it's far more common to tie authentication and authorization together.

If your users have only one factor of authentication, it can be stolen, especially if it is a password. At that point, you as a developer will have limited ability to stop the thief. Your system will have to notice suspicious behavior to determine who is legitimate and who is not. This can be done, but is complex to do at scale. If you can't determine illicit access, the thief will have the same privileges as the user whose stolen credentials are being used; they will be indistinguishable from that user.

Unfortunately, passwords are being stolen regularly. While systems can help prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users can protect themselves by practicing good password hygiene, requiring another factor increases the obstacles to a bad actor.

In particular, if another factor is required as part of the login process, account security can increase dramatically. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

Implementing MFA is a partnership with your users, however. Some factors are easier for system developers to support. Others require more effort and care from users.

### The balance between user experience and security risk

However, though MFA is more secure, you shouldn't require it everywhere. It's a balance, like many parts of software engineering; you want to make the user login experience as smooth as possible while minimizing chances of account takeover. Users don't love an application for the login experience. They want to solve their problems. Friction in the authentication process will annoy some percentage of your users and negatively affect your application's success. 

User experience isn't only about how easy the factor is to use. It's also about how widely deployed a solution is. If, say, retinal scanning is trivial to use, but users don't have or can't find the hardware, then it isn't really that easy after all.

Listen to your users when considering factors. You don't want them to circumvent MFA in ways that will damage system security. At the same time they may need to be educated. Do you know people who still write down passwords on sticky notes? I do.

As a developer, you need to balance between the user experience and the risk of account takeover. In some situations the call is easy. If your site lets users vote on cat pictures, MFA isn't really required. If your site transfers money to arbitrary people, on the other hand, it should require MFA. These scenarios are at opposite ends of the security and user experience spectrum:

{% include _image.liquid src="/assets/img/advice/mfa/security-ux-spectrum.svg" alt="More secure or easier to use?" figure=false %}

The hard part is the situations where the answer isn't obvious. What are some situations where you should consider requiring multi-factor authentication?

## When to require multiple factors of authentication

There are many situations where you need a higher level of assurance about the actor behind the credentials. Sometimes the type of the user account is the deciding factor. Other times it is the access requested. Depending on your application and organization, legal requirements or corporate policies may control.

### Administrative accounts

Privileged accounts with higher levels of access need to use MFA.

These administrator or operator accounts can wreak havoc if misused or compromised. Therefore you should require MFA on all admin accounts. In extremely sensitive systems, all changes could require providing additional factors.

### High value accounts

There are also plenty of high value user accounts where MFA can help prevent unwanted account compromises. These accounts don't necessarily possess elevated privileges, but allow data access or actions with real world consequences. Compromise of these accounts can have negative repercussions.

An example of such an account is an online bank account. You don't want users to learn that someone drained their savings because of a stolen password.

Another example is an email account. Beyond the private information often present in email accounts, they represent a risk to accounts in other systems. Many password reset flows send an email to a known address and allow the recipient of that email to modify the password. Compromise of an email account means that any other accounts associated with this user are at risk.

### Risky actions

When a user has already authenticated but is performing a dangerous action, MFA again provides extra security. This is also known as "step up auth", because the additional factor is required at the moment a more privileged action is undertaken. Examples of such actions include:

* Changing a password or username
* Modifying setting which impact other factors, such as an email or phone number
* Creating a new user with elevated privileges
* Changing system settings

These types of actions can be legitimate, but could also be used by someone who has compromised a user account. You can partially mitigate the damage of a compromised account by implementing step up auth. An attacker may be able to access account data, but won't be able to take damaging action.

### Laws or organizational policies

If your application is used by certain organizations or stores personally identifiable information, you may need to require multi-factor authentication for users. As part of the NIST risk management framework, for example, Authenticator Assurance Level 2 requires: ["proof of possession and control of two different authentication factors..."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes an MFA requirement is not explicit, however. If you are looking to be SOC2 certified, MFA may be required, even though the term is never mentioned in the [SOC "Trust Services Criteria"](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf). Section CC6.1 of the SOC document specifies "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely" without outlining implementation details. In this case, talk to your auditor about MFA requirements as well as other required controls.

When planning MFA, make sure you review any relevant laws, standards or corporate policies.

### When the user's actions look suspicious

An auth system has a unique viewpoint into who is signing in. Information is supplied and reviewed; it results in an answer to the question: "is the person providing this information the user who they are claiming to be?" Some data is provided by the user explicitly, such as the username and password. But every auth system has access to implicit data such as:

* The date and time of access
* Connection information like the IP address, location, and user agent
* Whether this device has been used to access this service before
* How many times the user has logged in recently

Such data can help determine if the person behind the authentication request is legitimate. For instance, if a user accesses a system from the USA but one day later there is a request from Germany with the same credentials, the request deserves scrutiny. It's possible it is legitimate; after all, airplanes exist. But also possible that there is something nefarious going on in Germany.

Requiring MFA before access is allowed when suspicious activity occurs provides another check against stolen credentials. That German hacker could have acquired a user's password, but it's harder to steal a one time passcode sent to the user's phone as well.

## Commonly used factors for MFA

Beyond a password, what are other ways a user can prove who they are? As mentioned above, there are four main categories. 

* What they know.
* What they have.
* Who they are.
* Where they are.

The more factors you require, the more secure access is. No online system, however, is 100% secure. All of these options have trade offs, and some require more cooperation from the end user.

Solution availability, security and user experience all play a role in determining what solution is best for your users. When you are incorporating MFA into your application, consider how widely deployed options are among your users or potential audience. 

Below is a diagram displaying estimated relative deployment and security attributes of various factors. When deciding which is right for your application, think about security needs as well as what your users have accessible and can use, unless you will be providing all your users with a factor such as a Yubikey. You can also allow multiple factors and let users select one that works for them.

{% include _image.liquid src="/assets/img/advice/mfa/security-deployment-spectrum.svg" alt="Secure, sure, but is it available?" figure=false %}

Let's look at each category and examine the factors in more detail.

### What you have

Having possession of a physical object or access to a separate user account can be a secure authentication factor. The out of band communication of a one time code is also a form of "what you have".

#### TOTP

A software or hardware time-based one time password (TOTP) generator is a commonly used factor of authentication, especially among developers. This solution consists of:

* A mobile application such as Google Authenticator, Aegis Authenticator or Authy (or analogous hardware)
* A secret seed shared when the user is known to the system; this is often in the form of a QR code
* An algorithm

The [standardized algorithm](https://tools.ietf.org/html/rfc6238) generates a numeric code based on the seed and the time. The seed and algorithm are shared between the auth system and the generator application or hardware. When the user wants to sign in, the code must be provided. 

Both the application and your server have all the information needed to generate the code:

* The seed
* The algorithm
* The current time

Therefore, your server can compare the code it calculates with the code the user provides. If they match, the user is authenticated with another factor of trust.

Depending on your audience, TOTP can be a common factor. A [2021 Ponemon Institute survey](https://www.nass.org/sites/default/files/2020-04/Yubico%20Report%20Ponemon%202020%20State%20of%20Password%20and%20Authentication%20Security%20Behaviors.pdf) of approximately 2000 users and IT professionals found 35% of users protect their personal accounts with TOTP using hardware.

To preserve the security of this system, as a developer, you need to keep the initial secret safe. The user must also maintain control of the generator application or device. 

#### SMS

Text messaging, also known as SMS, is another common factor. The system sends a text message to a mobile phone number provided by the user. The authentication system knows the contents since it generated and sent the message. The user provides the message content, which is typically a string of numbers or alphanumeric characters. If it matches, the user has possession of the recipient device.

To keep this factor safe, the phone must be in possession of the user. As a developer, do not allow a mobile number to be changed unless the user has authenticated with MFA. Otherwise an attacker with a password could log in, change the mobile number to one which they control, and then be able to complete MFA because they'll have the code.

Additionally, with SMS there are attacks where a bad actor takes over a phone number without stealing a phone or modifying the phone number to which the code is sent. These range from social engineering, where a customer service rep is convinced the user has set up a new phone and needs to update the account details to more sophisticated attacks which target cell phone network traffic. 

SMS has weaknesses that have been exploited, but mostly it's safe. High value systems such as banking websites often use SMS as one of their factors. Google researchers found in 2019 that MFA with text messages ["helped block 100% of automated bots, 96% of bulk phishing attacks, and 76% of targeted attacks."](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html)

There's not a lot you can do as a developer to make this factor more secure. Users, on the other hand, can contact their cell phone providers and ask how phone number transfers are handled to understand possible social engineering attacks. Users can also set up a software service such as Google Voice or Twilio to receive text messages to avoid any dependency on a mobile phone provider.

#### Phone call

Receiving a phone call with a code is very similar to the SMS factor. A phone call has the benefit of working for users who do not have a text message capable phone. Other than that, the implementation and issues are much the same.

#### App push

A user's phone isn't limited to running a TOTP application, accepting a phone call, or receiving text messages. Users can also install an application on their phone which receives push notifications. Similar to text messages, this code is generated by the authenticating system and sent to the user. 

The user proves they received the notification by sharing that code with the auth system. The server can encrypt the code before sending it and the application can decrypt it on the phone to ensure the code can't be tampered with or read. Such systems can be very effective. In 2019, Google researchers found that such on-device prompts ["helped block 100% of automated bots, 99% of bulk phishing attacks, and 90% of targeted attacks."](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html)

Similar to phone call and text messages's dependence on the phone network providers, the security of the push notification in transit systems is up to the provider of the push notification. However, I hear Apple and Google are pretty good at this security thing.

With any of the above MFA options using a smartphone as part of the factor, encourage your users to configure the device to require authentication, like a pin, before applications or notifications on the phone can be accessed. 

#### Email

Email can be used in the same way as an SMS or in-app notification by providing a code divorced from the system in question. The user provides that code to the auth system as another factor. This proves the user possesses access to the email account to which the code was sent. 

As a developer, ensure that you have verified the email to which the code is sent before sending the code; when the user registers is a great time to do this. You also need to ensure that the email address can't be changed in your system without a user authenticating using MFA. 

This factor is more convenient because email accounts can be accessed from multiple different computers or devices. Contrast this with the phone based solutions above, which are typically tied to one device. This convenience, however, means that this option can be less secure, depending on user behavior. Users, for their part, must ensure their email account is secured with MFA and that no unauthorized parties have access. 

#### A physical device

Physical devices, such as Yubikeys, can be used for authentication too. These devices work with your computer or your phone. Depending on the device, the user plugs it in to a computer or passes the device close enough for wireless communication during the authentication process. 

These devices differ from the other factors in this category because they cost money. This makes them acceptable for administrators, technical users, or high value accounts. It also makes this factor problematic for a broad user base; they will likely not have such devices.

As a developer, to use this factor, you need to build in support for the device using an SDK or a standard which the device is compatible with, such as WebAuthN. Your users need to ensure they don't lose it and have it available whenever they authenticate.

### What you know

A password is a common factor in this category. Other options here suffer from the same strengths and weaknesses as passwords:

* No physical manifestation
* Easily stolen or inadvertently shared
* Prone to social engineering attacks

As a developer, be wary of using these options for additional factors.

#### Questions and answers

With questions and answers, the auth system you are building requests answers to questions at a time when the user is known to be present, typically at user registration. 

The questions and answers are saved. When the system determines MFA is needed, one of the saved questions is displayed. The user answers the question and if the answer matches what is on record, another proof of identity has been provided.

This method has been commonly used in the past for resetting passwords, but is no longer recommended by [institutions such as NIST](https://pages.nist.gov/800-63-FAQ/#q-b15). 

A similar solution is to provide a list of facts about a user and have them select the accurate one. For example, "What street did you live on?" might be the question, and the answers would be pulled from a list of publicly available information. The list might include a "none of the above" option as well.

In general this factor isn't a good choice because one of two scenarios will occur:

* The user will pick questions and answers that are true and possibly can be learned by others. Such facts may be shared inadvertently on social media. There's also an astonishing amount of public records information available.
* The user will pick questions and answers that are not true. In this case, it's essentially another password which needs to be stored safely by all parties.

As a developer, avoid this factor. If you must implement it, let the user provide their own questions; this will increase the security of the factor, as you are now not limiting the space of possible answers. It also will increase how likely they will be to remember the answers. Make sure you hash answers, too, as they are now essentially a password like entity. 

Like all factors, you could use this option as part of defense in depth solution, in combination with other factors.

Counsel your users to answer these questions wisely. Frankly, they should pick fake answers. For example, if a question is "what was your first pet's name", and their first pet's name was Fluffy, pick anything other than "Fluffy". Anything. Perhaps "fido" or "killer". 

If the user is saving these answers in a password manager, I would even suggest "h941TphXOL3h0ws7M0U2" or "relevance-middle-yellow-horoscope". The goal is to prevent someone from learning the name of a childhood pet from a Facebook post and using that information to gain illicit access. 

#### Double blind passwords 

A double blind password augments the security of a normal password. This is not an independent factor and is entirely in control of the user. It can improve the security of the highest value accounts. As a developer, you cannot suggest nor enforce a double blind password. However, it is an interesting way to increase security, so deserves a brief mention.

With this technique, a user splits a password into two pieces. One is stored in a password manager or other secure location; the other is memorized. When the password is entered, both strings are combined to provide the true password. Someone could conceivably split a password into more than two pieces and store them in different ways as well. This method is also known as a horcrux, a term from the popular Harry Potter novels.

This method protects against the compromise of a password manager or other user side password storage mechanism. However, if the system which stores the hash of a password is compromised, or the password is discovered in transit, a horcrux won't help.

### Who you are

Another factor category is "who you are". These factors are tied to your physical body or your behavior; the information must be translated to a digital format and shared securely with the authentication system. As a developer, such biometrics are really intriguing: nothing to forget or lose. Deployment and access varies, however. 

In addition, people's bodies and behaviors change over time, so these factors must have room for error. While a password or code can match exactly, biometric solutions are more likely to provide a certain accuracy percentage. Allow other factors to be used or have a fallback plan when someone has a new haircut.

#### Physical biometric

These factors identify users based on their body. Examples include facial recognition, which identifies a user from the shape and look of their face, fingerprint scanning, voice identification, and retinal scanners, which look at the variations in the tissue of a user's eye. 

As you might expect, this type of factor is difficult to lose or forge. 

To implement authentication using biometric factors, first choose a solution. Make sure you understand the required hardware and what access to it your users have, what the error rates are, whether the solution's test population matches your own, and what software libraries are needed to implement it.

You could also use biometrics integrated into an operating system. All major operating systems for both mobile phones and computers have some level of biometrics support:

* Android has the [Biometric library](https://developer.android.com/jetpack/androidx/releases/biometric).
* iOS supports [Face ID and Touch ID](https://developer.apple.com/design/human-interface-guidelines/ios/user-interaction/authentication/).
* Windows has [Windows Hello](https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello), which integrates with hardware such as a fingerprint scanner.
* MacOS has [Touch ID](https://support.apple.com/guide/mac-help/touch-id-mchl16fbf90a/mac).

If you are building web applications, use the [WebAuthn W3C standard](https://www.w3.org/TR/webauthn-2/), which lets the browser access the operating systems biometric implementations. We'll cover this standard in more detail below.

#### Behavioral biometrics

This category of biometrics utilizes user behavior as a factor. An example of this is gait recognition technology, which is primarily used for identification rather than authentication. 

Another example is keystroke pattern recognition; that is, how a user types, the rhythm of keystrokes, the errors made, and the timing between key strikes. Done properly, this can identify a user without any action on their part, and could be a complement to some of the more intrusive factors. 

However, there's wide individual variation, even within a single day, of keystroke patterns, which can be problematic. A [study from 2013](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3835878/) "suggested that keystroke dynamics biometrics are unlikely to replace existing knowledge-based authentication entirely and it is also not robust enough to be a sole biometric authenticator."

### Where you are

This is a relatively uncommon factor of authentication. 

To implement this, you need to know where the user was, either through GPS or specific user interfaces only available in certain locations. The system would then have a list of allowed locations and if the user was not in one, the authentication would fail.

This approach has some issues. GPS is not foolproof and can be spoofed; in 2012 a drone was nearly crashed by ["sending false positional data" to it](https://spectrum.ieee.org/telecom/security/protecting-gps-from-spoofers-is-critical-to-the-future-of-navigation). Requiring your users to authenticate from a known set of locations limits the usefulness of many applications.

### Standards

The [WebAuthn W3C standard](https://www.w3.org/TR/webauthn-2/) is evolving. As of early 2021 it had not yet become a Proposed Recommendation. However, it is supported by [many major browsers](https://caniuse.com/webauthn).

Using this standard allows developers to easily incorporate physical biometric authentication or other high security factors. The browser is integrated with the operating system, which is in turn compatible with required hardware for factors such as fingerprint identification or facial recognition. 

If the application in question is accessed through a browser, all that's left for a developer to do is integrate with the browser API calls. Oh, and test. Make sure you spend some time testing a variety of different scenarios.

The WebAuthn standard works not only with biometric identification, but with other factors as well, including physical devices. You may hear the term FIDO mentioned when WebAuthn is discussed. [FIDO2](https://fidoalliance.org/fido2/) is a set of specifications, of which WebAuthn is one.

## Relaxing multi-Factor authentication (MFA) requirements

MFA provides additional security by ensuring that a person accessing a system is authenticated correctly. However, there may be times when you want to explicitly disable MFA, if only for a certain period. 

You can disable MFA when a request is made from a given device, for a period of time, or for a certain user account. As a developer, allowing this in certain circumstances makes the user experience better.

### Known devices

This form of MFA relaxation is often paired with a "trust this device" or "this is not a public computer" checkbox. In this case, the authentication system records that this device can be trusted. The trust can last forever or for a certain duration, after which MFA is again required. This has benefits for the user experience, and as long as the device remains secure and in possession of the user, the trust is warranted.

With a browser you can implement this by setting a cookie. An expiring, missing or removed cookie causes MFA to be required at the next login. Other devices have similar local storage mechanisms where preferences can be saved.

### Turning off MFA for a user

At times, you might want to relax all MFA requirements for a user's account. This is a high risk operation. Removing MFA opens a user's account up to being hijacked by someone possessing only one factor of authentication, the very issue MFA was meant to ameliorate. 

However, you might want to allow this because the user has lost or forgotten one of the required factors. If needed, you'll typically provide a way to do sidestep authentication before logging in. 

Make sure you provide controls around this action so it isn't abused.

Such controls often require a human to be in the loop. A manual process performed by a customer service rep trained to authenticate a user may work. Perhaps the rep can access private data that only the company and the user would know, such as the amount of the last bill. With this information, a rep can verify that a user is who they say they are, and then could disable MFA. This approach is vulnerable to social engineering, however.

Another option is to create self service one time codes. The system provides a set of one time use codes at the moment MFA is turned on. The user saves these and keeps them secret. When a user needs to turn off MFA, the system accepts a code to do so.

Note that in both of these cases, the user is still providing additional factors of authentication, but these are specialised ones, which circumvent the typical automated MFA process. 

## Building MFA

It's all well and good to have a survey of the why, when and how of MFA, but what should you and your fellow team mates actually do about MFA?

Here are four steps you can take:

* Plan out what features and systems need MFA
* Talk to your users to learn what factors make sense
* Build in support for MFA
* Centralize MFA configuration to make it easier to evolve

First, model out your system and determine who should use MFA and when. This depends on the type of data you store, what your application or applications can do, and what your regulatory or compliance regime specifies. Don't consider MFA only at initial authentication; think about where both step up auth and MFA relaxation both may make sense. You can also offer more than two factors and allow users to pick the factors which are most convenient for them.

Don't forget to talk to your end users, or at least a subset of them. The factors which make sense for an online banking application will be different from a corporate intranet app or a consumer application. Plan for the inevitable tradeoff between user experience, solution accessibility and security. Have those conversations as early in the application requirements process as you can.

If shared secrets need to be captured at authentication or registration, build or buy solutions which allow you to do so. These could be questions and answers, a seed for a TOTP solution, or even registering a physical device. 

Plan for a minimum level of MFA, but allow users who want more to go beyond that. Many security conscious users will want to enable MFA for their accounts; allow them to do so. By building this in, you allow users to self select the level of security which makes sense for them. For example, one person may run their entire life through their gmail account, while another may use it only occasionally as a throwaway email account. In the former case, MFA makes sense; in the latter it does not.

Your MFA policies and configuration should be flexible. You can store MFA requirements in a central location in your application, such as your identity provider, a specialized datastore, or in a configuration file. Be aware that these requirements will evolve as technology and your applications do. New features will be built and some of them may require step up. Different kinds of users may start using the system. This policy configuration should itself be protected and only allow privileged users access.

