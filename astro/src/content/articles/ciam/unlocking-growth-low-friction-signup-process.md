---
title: "Optimizing Sign-Up Flows with CIAM: Reduce Friction, Drive Growth"
description: Learn how to create seamless sign-up flows with CIAM solutions. Discover strategies to reduce user friction, improve conversions, and unlock business growth.
section: CIAM
author: Hannah Sutor
icon: /img/icons/user-signup-process.svg
darkIcon: /img/icons/user-signup-process-dark.svg
---

Customer Identity and Access Management (CIAM) is a critical component of any modern digital business strategy. At its core, CIAM is about providing users with seamless and secure access to digital products and services. Sometimes, when thinking about authentication flows, it can be easy to get caught up in the details. I’d like to take a step back and discuss the overall value of a sometimes overlooked piece of the CIAM puzzle: the value of low-friction user signups.

Sign-up friction refers to the amount of time, effort, and information required for users to create an account and access a digital service. Low sign-up friction is essential for a successful CIAM strategy because it improves user acquisition, retention, and satisfaction. By making it easy for users to sign up and access your digital services, you can create a positive user experience that builds trust, loyalty, and ultimately drives business growth. Let’s take a deeper dive into the value of low sign-up friction, and some ideas for improving this area of your product. 


## Streamlining user experience: the value of low friction CIAM for businesses

There’s only one first impression.

The signup process is a critical piece of the first impression that your customers have of your product. There’s only one chance to make that first impression - friction on the first experience can set the stage for a negative impression that may cause a user to question signing up in the first place. You never hear, “wow, that signup process was so great!”. But if the experience is negative, customers will not only refuse to engage with your product, but will often share their sentiment with others.

A customer who signs up is much more valuable than an onlooker. By handing over some of their personal information, and consenting to be tied into your product ecosystem, including further communication, customers are showing a high level of trust. 

An important part of furthering this trust is using the signup experience to set the stage for account security. You can use a password complexity policy, multi-factor authentication, CAPTCHA, email verification, or a combination of these things. But make sure you provide a balance between security and ease of signup. 


## Less friction = increased conversion rates

The easier it is for a user to onboard into your product, the more users will complete the flow - it’s as simple as that. A successful sign up is vital, since it creates the following value for both the business and the user:

* Access to the product: The user gains access to the software and can begin using it. This allows the user to take advantage of the features and benefits that the software provides.

* Customization options: Depending on the flow, signing up may allow the user to customize their experience. This can include things like setting preferences, saving settings, or creating a personalized profile.

* User data and analytics: For the business, sign-ups provide valuable data and analytics about user behavior and preferences. This information can be used to improve the product and make it more tailored to the needs of the user.

* Customer engagement: Sign-ups allow the business to engage with users and build a relationship with them. This can lead to increased brand loyalty and customer retention.

* Marketing and sales opportunities: Sign-ups can also be used as a marketing and sales tool, enabling the business to capture user data and target them with relevant offers or promotions.


## How friction shows up

In order to understand how to make your sign up easier for your users, I want to share some ways that friction reveals itself.


### Lack of flexibility

Expect that the ways users will want to sign up are as diverse as the users themselves - you need to provide multiple ways for users to provide their personal information, establish their credentials, and authenticate. One way to accomplish this is to allow users to sign in with an existing account using a library like OmniAuth for rails or Python Social Auth for your python application. These libraries support many common social media platforms and enterprise authentication providers.

Keep in mind your expected audience when considering what types of sign-ups to support: allow login with Slack if you are building a Slackbot, Facebook if you are building a consumer facing app, SAML or LDAP if you are building a B2B product, and Google or Apple if you are building a mobile app.

Also important is building accessibility into your signup process. Differences in physical and cognitive abilities must be taken into consideration. For example, memory impairments might be a challenge. For this, you can provide password recovery options or simplified login workflows to ensure that users can successfully sign up and log in. Accounting for differences pays dividends in ensuring your product is inclusive and accessible by all.

WebAuthn is an exciting development in the authentication world that adds yet another option for login flexibility. It is a standard that enables users to authenticate themselves using biometrics, such as facial recognition or fingerprint scanning, or a physical security key. The best part about it? It can be used to completely replace a password. Now that Apple, Google, and Microsoft have all added WebAuthn support into their products, passwordless authentication, which once seemed futuristic, is becoming a reality.


### Lack of transparency

Privacy has been front and center in technology headlines lately. The era of reckless data collection and use is slowly fading. Customers are more cognizant of the information being asked of them:is it _really_ required? Why? Will my information be sold?

Building trust in the sign up process means being transparent about the data you are collecting. Collect only the information you _need_ to show user value initially - you can always ask for more profile data later, once the user understands the benefits of your product.

When signing up, users should have access to a clearly worded privacy policy to let them know what will happen with their data. Companies that are transparent with their users are differentiating themselves. By having a “plain English” version of your privacy policy, or better yet, by providing your users granular control over _how_ their data is used, and which attributes of it are used, you are showing that you respect your customer. 


### Poor security flows

It can’t be overstated how important security is as a part of your sign up flow. It’s important to put security measures into place when the user signs up and to make them non-negotiable or, at the very least, opt in by default.

Some examples of good security practices:

* Use MFA. WebAuthn and TOTP are more secure than SMS or magic links.
* Serve pages over SSL
* Allow a user to choose single a login mechanism that aligns best with their security posture
   - If the user has their account managed centrally, they should use single sign-on
   - If the user has a password manager and practices good password hygiene, log in through a username/password pair
* Risk scoring. Detect anomalies and prompt for verification that the user is human, and/or block the login and send an alert

There are some security features that have proven themselves to not _actually_ help security, and instead get in a user’s way. By regularly reviewing NIST’s [digital identity guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html), you can make sure that these outdated practices are not in your flows. 

Some examples of guidelines that are now passé are:

   - Forcing users to change passwords frequently. This was found only to make users add one more character to their existing password, therefore not increasing security for the friction it caused.
   - Masking password inputs. This does not increase security since very rarely is a human standing behind someone when they create a password. It makes it difficult to see if you entered the password correctly, and is no longer recommended. 
   - Security Questions. The answers to security questions are either secure or easy to remember, but almost never both. NIST recommends against using security questions as a tool. 

### No feedback

When things go wrong during sign up, make it easy for your user to know what went wrong and how to fix it. They should know exactly where they are in the onboarding flow - do they need to verify their email address or phone number before all of the features can be used? Tell them - and make it easy peasy to re-start the verification process if needed.


## The user is signed up. Now what?

A user’s journey in your product lives on long after signup is complete. Here are some ways you can ensure low-friction account self-service.


### Self-service profile editing

Things change, and no one knows those changes better than your users. Give them the autonomy to make profile changes on their own - especially for things like e-mail address changes, adding security features to login. This also helps you: it eliminates the support burden if users can solve it themselves, and it also allows you to act on the most up-to-date profile information.

Deciding where user profile data lives can be complicated. You can have it all in the upstream IdP, which simplifies updating and control, but may hamstring the application. You can have it all in the application, which makes updating profile data complicated because you have to do it in many spots. Or you can split it between the IdP and application, which is a common pattern but requires assumptions about how the data will be used.


### Provide continuity

While using your product, users will inevitably need to reauthenticate. It is important that this experience is consistent and not too cumbersome. For example, I think we’ve all experienced the irritation of being forced to re-authenticate too often by a short session timeout. And we’ve all experienced the other side of the coin, when you’ve stayed signed in for so long, even if you haven’t taken action in the application, that you worry about the security of your data.

One way to consider making this flow both secure and accessible is to require a re-authentication for risky actions, such as changing a password or inviting new users to a project. 

In a similar vein, logout and session timeout are important aspects of providing continuity through your application. Be sure that logging out is easy to do - it helps to improve security by preventing unauthorized access to the user's account. Additionally, easy logout allows someone with multiple accounts to access them quickly. Session timeout needs to respect a user’s activity in the application. If they are actively using it, keep the session alive. Make sure that any re-authentication that must occur is respectful of the user’s work, and doesn’t interrupt their workflows or make them lose the work they are doing in the application. For example, ensure that any re-authentication delivers the user back to their current location in an application.


### Alerts are useful for both parties

Alerts provide a lot of value, both in security and ease of use. Use in-application, system events, and e-mail notifications to keep users and SIEM (Security Information and Event Management) systems abreast of any changes to their accounts, such as password changes and suspicious activity.  

These alerts can be useful when triggered further down the authentication flow. Consider that a user may have a username/password pair and then be prompted for a second factor. SMS and TOTP can be brute-forced. If the hacker gets past the username/password pair, alerting on incorrect SMS or TOTP entries may prevent a bad actor from entering if the user realizes in time. 


### Account recovery

When it comes to account recovery, everyone wins with self-service. When users can recover their accounts themselves, it saves you costs in a lessened administrative burden. It also saves the user time: they don’t have to rely on a human on the other end. Who wants to wait on hold for a customer service rep unless required?

The simplest form of account recovery, and the one most amenable to automation, is a “forgot password” flow. This should be part of any CIAM system.

Ultimately, humans are the ones who breathe life into our products. Without them, we wouldn’t have users! It is important to remember that humans have human problems, and there will always be that handful of users that fall into an “unhappy path” you couldn’t have predicted.

It’s important to empower your administrators with the proper tools to fix customer problems swiftly and securely, with a comprehensive audit trail for compliance purposes.


### Offboarding

  Inevitably, users will leave your product. If you are building enterprise software, consider how the company can protect their intellectual property - perhaps through preventing deletion, providing export options, or by retaining the information on the account after it is deleted.   

Keep in mind that if a user returns to your product, you need to decide if you want to recognize that they’ve been there before and potentially restore some of their information. There are pros and cons to providing this ability - the decision about this should be clearly spelled out in your privacy policy, and don’t forget to consult the lawyers. 

## Summing up

Low-friction sign up has a lot of considerations, and is more an art form than a science. By knowing your audience, their security tolerance, and the data you need to collect in order to give your customers a compelling product, you can craft a balance in your sign-up process that both furthers your business and creates an amazing user experience.

