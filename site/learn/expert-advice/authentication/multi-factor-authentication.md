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

When a user is authenticating, they provide proof of who they are. There are three broad categories for this type of proof:

* What they know. A password is an example. 
* What they have, such as a code from a device a user possesses.
* What they are; something like a fingerprint.

Each of these methods of proof is called a 'factor'. Factors have to be kept secure and not shared to be useful in authenticating a user. Multi factor authentication is best understood as requiring two or more factors in order to authenticate.

MFA is a superset of two factor authentication (2FA). With MFA an arbitrary number of factors of proof can be required. With 2FA, the number of factors is limited to two.

Multi factor authentication isn't just for online user accounts. If you are accessing a safe deposit box, you need a key (something you have) and a signature (something you are) or an id (another thing you have). 

However, the focus of this article is MFA in the context of online account access. Because of that, this article will assume that one factor of use authentication is a password. More and more online systems are requiring proof beyond such a password to access accounts. Before discussing other types of factors, let's turn to why you'd use MFA when securing accounts.

## Why use MFA

Building a secure, available system requires ensuring only authorized people and software agents have access. Authentication, which ensures that users are who they say they are, and authorization, which controls access are both important in doing so. 

If your users use only one factor of authentication, it can be stolen by a bad actor, who will now have access as if they were the user whose credentials had been compromised. Whether it is the key to a safe deposit box or the password to an email account, if a user loses control of the factor allowing access, data and systems can be accessed by those who possess the stolen factor. 

Secrets users know, such as passwords, are being stolen regularly. While systems can help prevent unauthorized access by [detecting stolen passwords](/learn/expert-advice/security/breached-password-detection/) and users can protect themselves by practicing good password hygiene, requiring another factor increases obstacles to anyone else obtaining that access. 

In particular, if a factor that is not in the "something you know" category is added as part of the login process, the security of the account can go up dramatically, as the factors in the other two categories are more difficult to steal. Microsoft researchers found that accounts are ["99.9% less likely to be compromised"](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/your-pa-word-doesn-t-matter/ba-p/731984) if MFA is used.

Implementing MFA is a partnership with your users. Some forms are easier for system developers to implement and keep secure. Others require more effort and care from users providing them. 

### The balance

However, even though it is more secure, as a developer, you shouldn't necessarily require it everywhere. It's a balance; you want to make the user login experience as smooth as possible while minimizing chances of account takeover. Friction in the authentication process will annoy some percentage of your users. 

Additionally, your users don't love your application for the login experience, they want to solve their problems. User experience includes how widely deployed a solution is; if it's easy to use, but you can't find the hardware, then it isn't really easy to use.

Listen to your users when you are discussing MFA requirements. You don't want them to circumvent MFA in destructive ways; at the same time they may need to be educated. How many of you know people who still write down passwords?

As a developer, you need to balance between the more difficult user experience and the risk of account takeover. If your site lets users vote on cat pictures, MFA may never be required for user accounts. If your site lets users transfer money, on the other hand, it should require MFA.

These scenarios are at opposite ends of the security and user experience spectrum:

{% include _image.liquid src="/assets/img/advice/mfa/security-ux-spectrum.svg" alt="More secure or easier to use?" figure=false %}

The hard part is the situations where the answer isn't obvious. What are some situations where you should consider requiring multi factor authentication?

## Times to require multiple factors of authentication

There are a variety of situations where you should require an increased level of assurance during authentication or authorization. Sometimes the type of account matters, other times it is the access requested, and sometimes it is legal requirements or corporate policies.

### Administrative accounts

Privileged accounts with higher levels of access should use MFA. 

These administrator or operator accounts can wreak havoc if misused or compromised. Therefore you should require MFA on admin accounts. Require MFA for every login. In extremely sensitive systems, all changes to a system could require additional factors.

### High value accounts

There are also plenty of high value normal user accounts where MFA can help prevent unwanted account compromises. These accounts don't possess elevated privileges, but do control data or actions that are important to the user. Compromise of these accounts can have negative repercussions.

An example is online access to a bank account. You don't want users to lose their account access and learn that someone drained their savings. 

Another example is email. Beyond private information often present in email accounts, these represent risk to other accounts. Many password reset solutions send an email; therefore compromise of this account means that many other accounts of this user are at risk.

### Risky actions

When a user has already authenticated but is performing a dangerous action, MFA provides extra security. 

This is also known as "step up auth", because the additional factor is required at the moment a more privileged action is taken. Examples of such actions include:

* Changing a password or username
* Resetting a password
* Spending money
* Creating a new user with elevated privileges
* Changing system settings
* Modifying configuration impacting other factors, such as an email or phone number

When such an action is requested, developers of a system need more certainty about who is actually behind it. These types of actions can be legitimate, but could also be used by someone who has compromised a user account.

You can partially mitigate the damage of a compromised account by implementing step up auth. An attacker may be able to access the account, but won't be able to take damaging action.

### Legal or organizational policies

If your application is going to be used by certain organizations or to store certain kinds of personally identifiable information, you may need to require multi factor authentication. As part of the NIST risk management framework, for example, Authenticator Assurance Level 2 requires: ["proof of possession and control of two different authentication factors is required..."](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf). 

Sometimes an MFA requirement is not explicit, however. If you are looking to be SOC2 certified, you will likely require MFA, even though the term is never mentioned in the [SOC "Trust Services Criteria"](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf).

Section CC6.1 of the above SOC document specifies "Persons, infrastructure, and software are identified and authenticated prior to accessing information assets, whether locally or remotely" without outlining implementation details. In this case, talk to your auditor about MFA requirements as well as other required controls.

### When actions look suspicious

An auth system has a unique viewpoint into who is signing in. Many different pieces of information are supplied which result in a binary decision answering the question: "is this user who they are claiming to be?" 

Some of the data is explicitly provided, such as the username and password. But there is also metadata like:

* The date and time of access
* Connection information such as IP address and user agent
* Has this device been used to access this service before
* How many times the user has logged in recently

All of the implicit data can help determine if the person behind the authentication request is legitimate. For instance, if a user accesses a system from the USA but 24 hours later there is a request from Germany with the same credentials, this request deserves some scrutiny. It's possible it is legitimate, but also possible it is not. MFA is an easy way to apply extra scrutiny.

Another common event that triggers a higher level of authentication assurance is when a user signs in from a new device. For example, Google's GSuite can be configured in such a way as to require MFA for the initial authentication from a new device, but not after. Then, if you delete your cookies or use a different browser, MFA is required again, because to GSuite these situations look like access from a different device.

### Applying MFA requirements

You should strive to embed the choices about when to require MFA in a central, easily changed location in your application. These choices will change over time as a system evolves. New features will be built, and some of them may require a step up. Distinct classes of users will appear, about which the system may require different levels of assurance.

This policy configuration should itself be protected and only allow privileged users, perhaps with a recent multi factor authentication.

If you don't have organization or user wide policies, you should allow a user to set up MFA. This allows security conscious users to take their account security more seriously. They can evaluate their own security posture and make choices that make sense to them. For example, one person may run their entire life through their gmail account, while others may use it only occasionally as a throwaway email account. In the former case, MFA makes sense; in the latter it may not.

However, in general, if you are worried about what a compromised account could do to either your systems or your users' data, you should strongly encourage or require MFA.

## Commonly used additional factors

Beyond the typical password, what are other ways a user can prove who they are?

As defined above, there are three main categories. 

* What they know.
* What they have.
* What they are.

Each of these has a certain level of security and ease of use. The more factors you require, the more security you get. Nothing is 100% secure and all of the options have trade offs. Some of these factors require more security cooperation from the end user than others. Another dimension to consider is how widely deployed each of these options is. 

Below is a diagram displaying estimates on deployment and security. Of course, these are generalities; you could have a group of users where physical devices are widely available, and passwords can be made very secure if you use a password manager.

{% include _image.liquid src="/assets/img/advice/mfa/security-deployment-spectrum.svg" alt="Secure, sure, but is it available?" figure=false %}

Let's look at each category and examine the factors within each one.

### What you have

Having possession of something such as a physical object or access to a separate user account, is a great additional authentication factor.

#### TOTP

A software or hardware time-based one time password (TOTP) generator is one example. This consists of an application such as Google Authenticator, Aegis Authenticator or Authy, a secret seed created once in an environment where the user is known, and a shared algorithm. The algorithm generates a pseudo random numeric code based on the seed. The seed and algorithm are shared between the auth system and the generator application. 

When the user wants to sign in, the seed is combined with the current time by the algorithm to generate a code. 

Both the application and your server have all the information needed to generate the code. Therefore, the server can compare the code it calculates with the code the user provides. If they match, the user has possession of the secret. 

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

