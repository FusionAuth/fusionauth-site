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

As more of our lives move online, multi factor authentication (MFA) becomes more important as a way of keeping our accounts secure. 

As a user, you should enable MFA on any accounts containing valuable data. 

As a developer or software creator, you need an understanding of MFA, including what factors are available and when you might consider requiring additional ones during user authentication or other actions. 

## What is Multi Factor Authentication?

When a user is authenticating, they are providing proof of who they are. There are three broad categories of proof:

* What the user knows. A password is an example. 
* What the user has, such as a device.
* What the user is; one example would be a fingerprint.

Each of these methods of proof is called a 'factor'. Factors have to be kept secure. They should not be sharedi, in order to ensure that the person who is authenticating is associated with the correct user account. 

Multi factor authentication is best understood as requiring two or more factors in order to authenticate a user. MFA is a superset of two factor authentication (2FA). With MFA an arbitrary number of factors of proof can be required. With 2FA, the number of factors is limited to two.

Multi factor authentication isn't just for online user accounts, though. If you are accessing a safe deposit box in a bank, you need a key (something you have) and a signature (something you are) or an id (another thing you have). 

This article will focus on online MFA, however. 

The majority of user accounts have a password as the first factor. You might be working in such a system right now. As engineering teams become more aware of the problem of user account hijacking and the real world consequences of this issue, they are requiring additional factors of authentication. 

## Why use MFA

Building a secure, available system requires ensuring only authorized people and software agents have access to it. This is a foundational concern.

Authentication, which ensures that a system knows who the user is, and authorization, which controls what a given user can access, both play a role in controlling access. While you can control what an actor is doing without knowing who they are, it's far more typical to tie these concepts together.

If your users have only one factor of authentication, it can be stolen. At that point, you as a developer or operator will have limited ability to stop a thief. You'll need to rely on noticing other behavior to determine who is legitimate and who is not, which is difficult to do at scale. The thief will have the same access as the user with the stolen credentials, because they will be indistinguishable from that user.

Unfortunately, passwords are being stolen regularly. While systems can help prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users can protect themselves by practicing good password hygiene, requiring another factor increases obstacles to illicit access.

In particular, if another factor is required as part of the login process, the security of the account can go up dramatically. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

Implementing MFA is a partnership with your users, however. Some factors are easier for system developers to implement and keep secure. Others require more effort and care from users providing them. 

### The balance

However, even though MFA is more secure, you shouldn't necessarily require it for all actions. It's a balance, like many parts of software engineering; you want to make the user login experience as smooth as possible while minimizing chances of account takeover. Friction in the authentication process will annoy some percentage of your users and negatively affect your application's success. 

Additionally, users don't love an application for the login experience. They want to solve their problems. Part of the user experience rests on how widely deployed a solution is; if it's easy to use, but you can't find the hardware, then it isn't really easy to use.

Listen to your users when you are discussing MFA requirements. You don't want them to circumvent MFA in ways that will damage system security. At the same time they may need to be educated. Do you know people who still write down passwords on sticky notes? I do.

As a developer, you need to balance between the user experience and account takeover risk. In some situations the call is easy. If your site lets users vote on cat pictures, MFA isn't really required. If your site transfers money to arbitrary people, on the other hand, it should require MFA.

These scenarios are at opposite ends of the security and user experience spectrum:

{% include _image.liquid src="/assets/img/advice/mfa/security-ux-spectrum.svg" alt="More secure or easier to use?" figure=false %}

The hard part is the situations where the answer isn't obvious. What are some situations where you should consider requiring multi factor authentication?

## When to require multiple factors of authentication

There are a variety of situations where you should require an increased level of assurance during authentication. 

Sometimes the type of the user account is the deciding factor. At other times it is the access requested. Depending on your application and organization, legal requirements or corporate policies may control.

### Administrative accounts

Privileged accounts with higher levels of access need to use MFA.

These administrator or operator accounts can wreak havoc if misused or compromised. Therefore you should require MFA on all admin accounts. In extremely sensitive systems, all changes to a system could require providing additional factors.

### High value accounts

There are also plenty of high value user accounts where MFA can help prevent unwanted account compromises. These accounts don't possess elevated privileges, but allow the user to access data or take actions with real world consequences. Compromise of these accounts can have negative repercussions.

An example of such an account is online access to a bank account. You don't want users to learn that someone drained their savings because of a stolen password.

Another example is an email account. Beyond the private information often present in email accounts, they represent a risk to accounts in other systems. Many password reset flows send an email to a known address and allow the recipient of that email to reset a password for a system. Compromise of an email account means that many other accounts assocated with this user are at risk.

### Risky actions

When a user has already authenticated but is performing a dangerous action, MFA provides extra security. 

This is also known as "step up auth", because the additional factor is required at the moment a more privileged action is requested. Examples of such actions include:

* Changing a password or username
* Modifying configuration impacting other factors, such as an email or phone number
* Creating a new user with elevated privileges
* Changing system settings

These types of actions can be legitimate, but could also be used by someone who has compromised a user account. You can partially mitigate the damage of a compromised account by implementing step up auth. An attacker may be able to access the account, but won't be able to take damaging action.

### Laws or organizational policies

If your application is used by certain organizations or stores personally identifiable information, you may need to require multi factor authentication for users. As part of the NIST risk management framework, for example, Authenticator Assurance Level 2 requires: ["proof of possession and control of two different authentication factors..."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes an MFA requirement is not explicit, however. If you are looking to be SOC2 certified, MFA may be required, even though the term is never mentioned in the [SOC "Trust Services Criteria"](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf). Section CC6.1 of the SOC document specifies "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely" without outlining implementation details. In this case, talk to your auditor about MFA requirements as well as other required controls.

When planning MFA, make sure you review any relevant laws, standards or corporate policies.

### When the user's actions look suspicious

An auth system has a unique viewpoint into who is signing in. Information is supplied which is assessed and results in an answer to the question: "is this user who they are claiming to be?" 

Some data is provided by the user explicitly, such as the username and password. 

But every auth system has access to implicit data such as:

* The date and time of access
* Connection information like the IP address, location, and user agent
* Whether this device been used to access this service before
* How many times the user has logged in recently

Such data can help determine if the person behind the authentication request is legitimate. For instance, if a user accesses a system from the USA but 24 hours later there is a request from Germany with the same credentials, the request deserves scrutiny. It's possible it is legitimate, after all airplanes exist. But also possible that there is something nefarious going on in Germany that the user might want to know about. 

Requiring MFA before access is allowed when suspicious activity occurs provides another check against stolen credentials. That German hacker could have acquired a user's password, but it's harder to provide a one time passcode sent to the user's phone as well.

## Commonly used factors

Beyond a password, what are other ways a user can prove who they are?

As mentioned above, there are three main categories. 

* What they know.
* What they have.
* What they are.

The more factors you require, the more security access is. No online system, however, is 100% secure. All of these options have trade offs, and some require more cooperation from the end user.

Solution availability, security and user experience all play a role in determining what solution is best for your users. When you are choosing additional MFA for your application, consider how widely deployed the options are among your users or your potential audience. 

Below is a diagram displaying the relative deployment and security of various factors. When deciding, ask your users about MFA options, unless you will be providing all your users with specific solutions. All your potential users may have physical devices or phones with biometric hardware, which makes that option more reasonable. You can also allow multiple factors and let users select one that works for them.

{% include _image.liquid src="/assets/img/advice/mfa/security-deployment-spectrum.svg" alt="Secure, sure, but is it available?" figure=false %}

Let's look at each category and examine the factors within each one.
xxx

### What you have

Having possession of something such as a physical object or access to a separate user account, is a great additional authentication factor.

#### TOTP

A software or hardware time-based one time password (TOTP) generator is one example. This consists of an application such as Google Authenticator, Aegis Authenticator or Authy, a secret seed created once in an environment where the user is known, and a shared algorithm. The algorithm generates a pseudo random numeric code based on the seed. The seed and algorithm are shared between the auth system and the generator application. When the user wants to sign in, the seed is combined with the current time by the algorithm to generate a code. 

Both the application and your server have all the information needed to generate the code. Therefore, the server can compare the code it calculates with the code the user provides. If they match, the user has possession of the secret. 

This is a common factor. A [2021 Ponemon Institute survey](https://www.nass.org/sites/default/files/2020-04/Yubico%20Report%20Ponemon%202020%20State%20of%20Password%20and%20Authentication%20Security%20Behaviors.pdf) of 2000 users and IT professionals found 35% of users protect their personal accounts with TOTP using hardware.

To preserve the security of this system, as a developer, you need to keep the initial secret safe. The user must maintain control of the generator application. 

#### SMS

Text messaging, also known as SMS, is another common factor. The system sends an out of band text message to a mobile phone number previously provided by the user. The authentication system knows the contents of the text message since it sent it. 

The user provides the texted message content, which is typically a string of numbers or alphanumeric characters. If it matches up, the user has possession of a device capable of receiving this text message.

To keep this factor safe, the physical or software phone must be in possession of the user. As a developer, do not allow a mobile number to be changed unless the user has authenticated with MFA.  Otherwise an attacker with a password could log in, change the mobile number to one they control, and then would be able to provide the MFA code sent to the new device.

Additionally, there's an attack where a bad actor takes over your phone number without getting your phone or changing the number to which the code is sent. These can range from social engineering attacks, where a customer service rep is convinced you have set up a new phone and simply need to update their SIM card records, to more sophisticated attacks which target cell phone networks. 

SMS has weaknesses that have been exploited, but mostly it's safe. High value systems such as banking websites often use SMS as one of their factors. Google researchers found in 2019 that a text message ["helped block 100% of automated bots, 96% of bulk phishing attacks, and 76% of targeted attacks."](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html)

There's not a lot you can do as a developer to make this factor more secure. Users, on the other hand, can contact their cell phone providers and ask about how phone number transfers are handled to understand possible social engineering attacks. Users can also set up a software service such as Google Voice or Twilio to receive text messages.

#### App push

Your phone isn't limited to running a TOTP application or receiving text messages, it can also have a specialized application that uses push notifications to provide a code. Similar to text messages, this code is generated by the authenticating system and sent to the user. 

The user proves they received the notification by sharing that code with the authenticating system. The server can encrypt the code before sending and the application can decrypt it on the phone to ensure the code can't be tampered with or read.

Such systems are effective. In 2019, Google researchers found that such on-device prompts ["helped block 100% of automated bots, 99% of bulk phishing attacks, and 90% of targeted attacks."](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html)

Similar to text messages, the security of these systems is really up to the provider of the push notification. However, I hear Apple and Google are pretty good at this kind of thing.

With any of the above MFA options which use information sent to a phone as an authentication factor, encourage your users to configure the device to require local authentication before any applications are accessed. Also, encourage them to ensure notifications and SMS messages can't be read without the user authenticating first.

#### Phone call

#### Email

Email can be used in the same way as SMS or app notification. The goal is to provide an out of band code to a user. The user provides the code to the system and the presumption is that the user owns the email account to which the code was sent. Possession of the email account is the additional authentication factor. 

As a developer, you need to ensure that you have verified the email to which the code is sent before sending the code. Registration is a great time to verify this email. You also need to ensure that the email address can't be changed in your system without a user providing multiple factors of authentication. 

This factor is often more convenient because email accounts can be accessed from multiple different computers, as opposed to the phone based solutions above, which are typically tied to one device. This same convenience, however, means that this choice can be less secure, depending on user behavior. Users, for their part, must ensure their email account is secured with multiple factors and that no one else has access. 

#### A physical device

Physical devices used for authentication, such as Yubikeys, can provide another factor. These devices work with your computer or your phone to offer a factor. Depending on the device, the user either plugs in the device to a computer or passes the device close enough for wireless communication during the authentication process. 

These devices differ from the other factors in the category because they cost money. This makes them acceptable for administrative or high value accounts, but makes this choice problematic for a broad user base which will likely not have such devices.

As a developer, you will need to build in support for the device using an SDK or a standard the device is compatible with, such as WebAuthN. Your users will need to ensure they don't lose it and have it available whenever they authenticate.

### What you know

A password is a common factor from this category.

The other options suffer from the same strengths and weaknesses as passwords:

* No physical manifestation
* Easily stolen or inadvertently shared
* Prone to social engineering attacks

As a developer, be wary of using these options.

#### Questions and answers

With questions and answers, the auth system you are building requests answers to questions at a time when the user is known to be present; typically user registration. The questions and answers are saved. When the system determines a user must provide another factor at authentication, one of the saved questions is provided. The user answers the question and if the answer matches what the system has, the factor is successfully provided.  

This method has been commonly used in the past for when resetting passwords, but is no longer recommended by [institutions such as NIST](https://pages.nist.gov/800-63-FAQ/#q-b15). 

A similar solution is to provide a list of facts about a user and have them select the accurate fact. For example, "What street did you live on?" might be the question, and the answers would be pulled from a list of publicly available information. 

In general this type of solution isn't optimal because one of two scenarios will occur:

* The user will pick questions and answers that are true and thus can be found out by others. Such facts can be shared inadvertently on social media. There's also an astonishing amount of public records information available for sale.
* The user will pick questions and answers that are not true. In this case, it's essentially another password that needs to be stored safely.

As a developer, avoid this. If you must implement it, let the user provide their own questions; this will increase the randomness of the answers provided and let them pick private information. You can also use this in combination with another, more secure factor.

If you are a user and forced to use this as a factor, choose the second path. Remember random answers or, even better, store them in a password manager. For example, if a question is "what was your first pet's name", and your first pet's name was Fluffy, pick anything other than "Fluffy". Anything. Perhaps "h941TphXOL3h0ws7M0U2" or "relevance-middle-horoscope". You want to prevent someone from learning the name of your childhood pet from your mother's Facebook post and using that information to gain illicit access. 

#### Double blind passwords 

A double blind password augments the security of a password factor. This is not an independent factor type and is entirely in control of the user. As a user, though, you can use it to increase the security of your highest value accounts, such as your email or bank accounts. 

You as a developer cannot enforce the use of a double blind password. However, it is an interesting way to increase the security of an account, so deserves a brief mention.

The idea is that a user splits a password into two pieces. One is stored in a password manager or other secure location; the other is memorized. When the password is entered, both strings are combined to provide the true password. This is also known as a horcrux, a term from the popular Harry Potter novels.

This method protects against your password manager being compromised, but not a password being stolen in other ways.

### Who you are

The final category is "who you are". These factors are tied to your physical body or your behavior; they must be shared security with the authentication system. 

As a developer, these are really intriguing options: nothing to forget or lose. Support for each option, so you'll need to consider that.

In addition, people's bodies change over time, so these factors should have some room for error. Make sure you include other options or have a fallback plan when someone has a new haircut.

#### Physical biometric

These factors identify you based on your body. Examples include facial recognition, which identifies a user from the shape and look of their face, fingerprint scanning, voice identification, and retinal scanners, which look at the variations in the tissue of a user's eye. This type of factor is difficult to lose or forge. 

To implement authentication using biometric factors as a developer, first choose your solution. Make sure you understand which hardware is required and how widespread access is, what the error rates are, whether the solution's test population matches your own, and what software support is needed to implement this choice.

An alternative is to use what is integrated with the operating system which your application's users have. All of the major operating systems for both phones and computers have some level of support for these solutions. 

* Android has the [Biometric library](https://developer.android.com/jetpack/androidx/releases/biometric).
* iOS supports [Face ID and Touch ID](https://developer.apple.com/design/human-interface-guidelines/ios/user-interaction/authentication/).
* Windows has [Windows Hello](https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello), which integrates with hardware such as a fingerprint scanner.
* MacOS has [Touch ID](https://support.apple.com/guide/mac-help/touch-id-mchl16fbf90a/mac).

If you are building web applications, use the [WebAuthn W3C standard](https://www.w3.org/TR/webauthn-2/), which lets the browser access the operating systems biometric implementations. We'll cover this in more detail below.

#### Behavioral biometrics

This category of biometrics uses your behavior to identify and authenticate you. 

An example of this is gait recognition technology, though this is mostly used for user identification rather than authentication. 

Another option is your keystroke pattern; that is, how you type, the rhythm of your keystrokes, the errors you make and the timing between key strikes. Done properly, this can identify a user without any action on their part, and could be a complement to some of the more explicit factors mentioned above. 

However, there's wide individual variation, even within a single day, of keystroke patterns, which can be problematic. A [study from 2013](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3835878/) determined "The literature study suggested that keystroke dynamics biometrics are unlikely to replace existing knowledge-based authentication entirely and it is also not robust enough to be a sole biometric authenticator."

### Standards

The [WebAuthn W3C standard](https://www.w3.org/TR/webauthn-2/) is an evolving standard. As of early 2021 it had not yet become a Proposed Recommendation. However, it is supported by [many major browsers](https://caniuse.com/webauthn).

Using this standard allows you to implement physical biometric authentication or other high security factors. The browser vendor has integrated with the operating system, which has in turn integrated with the hardware required for solutions such as fingerprint identification. If the application in question is accessed through a browser, all that's left for you to do is integrate with the browser API calls. Oh, and test. Make sure you spend some time testing the variety of different scenarios.

The WebAuthn standard works not just with biometric identification, but with others as well, including physical devices such as Yubikey.

You may hear the term FIDO mentioned when WebAuthn is discussed. [FIDO2](https://fidoalliance.org/fido2/) is a set of specifications, of which WebAuthn is one.

## Relaxing MFA

MFA is all about providing additional security by ensuring that a user who is accessing a system is authenticated correctly.

However, there may be times when you want to explicitly disable MFA. You can disable MFA for a given user for a period of time for a device, or for a user account that previously required MFA. As a developer, you'll want to allow this because it makes the user experience better.

### Known Devices

This form of MFA relaxation often takes the form of a "trust this device" or "this is not a public computer" checkbox during authentication. In this case, the authentication system records that this device can be trusted. The trust can be forever or for a certain duration, after which MFA is again required. 

With a browser you can implement this with a cookie; an expiring, missing or removed cookie causes MFA to be required at the next login. Other devices have similar local storage mechanisms where such preferences can be stored.

### Turning Off MFA For a User

At times, you might want to relax all MFA requirements for a user account. This is a high risk operation, since one of the main purposes of MFA is to increase user account security. Removing MFA opens the users' account up to being hijacked by someone possessing only one factor of authentication, such as a password. However, you might need to do this because the user has lost one of the required factors associated with their account. 

Make sure you provide controls around this action so it isn't abused.

This could require a human to be in the loop. If it is a manual process, performed by a customer service rep trained in other ways to authenticate a user, perhaps with private data that only the company and the user would know, such as the amount of the last bill, the rep can use their judgement. A user would call in and provide proof of their identity before MFA was turned off for their account. This approach is vulnerable to social engineering.

Another option is self service codes. Provide a set of one time use codes at the moment MFA is turned on. Build a system which accepts these codes to turn off MFA for the account, should the user need to do so. 

In both of these cases, the user is still providing additional factors of authentication. It's simply more flexible because of the human intervention or the one time use.


what do you do? 
plan for some kind of mfa for some kind of users
talk to your users about what they have access to
offer it to let users step up if they want to
pick accessible solutions that are secure
use step up auth to guard dangerous actions

## Applying MFA requirements

You should strive to embed the choices about when to require MFA in a central, easily changed location in your application. These choices will change over time as a system evolves. New features will be built, and some of them may require a step up. Distinct classes of users will appear, about which the system may require different levels of assurance.

This policy configuration should itself be protected and only allow privileged users, perhaps with a recent multi factor authentication.

If you don't have organization or user wide policies, you should allow a user to set up MFA. This allows security conscious users to take their account security more seriously. They can evaluate their own security posture and make choices that make sense to them. For example, one person may run their entire life through their gmail account, while others may use it only occasionally as a throwaway email account. In the former case, MFA makes sense; in the latter it may not.

However, in general, if you are worried about what a compromised account could do to either your systems or your users' data, you should strongly encourage or require MFA.

