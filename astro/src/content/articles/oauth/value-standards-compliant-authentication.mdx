---
title: The Value of Standards-Compliant Authentication
description: What are common auth standards and why should you consider using them in your application?
author: James Hickey
image: advice/value-standards/the-value-of-standards-compliant-authentication-header-image.png
section: OAuth
date: 2021-06-10
dateModified: 2021-06-10
icon: /img/icons/value-standards-authentication.svg
darkIcon: /img/icons/value-standards-authentication-dark.svg
---

Software applications regularly need access to data from other services on behalf of their users.

For example, an application may need to grab a list of user's contacts from a third-party service, such as their Google contacts. Or it might need to access a user's calendar so the application can create calendar entries for the user. In addition, larger organizations often require employees to have passwordless access to all the applications and services needed to do their jobs.

How can you make sure your systems are giving proper access to other systems and verifying access requests from other applications? Are there easy and trusted ways to build these integrations?

In this article, you'll learn about why it's important to use a standards-compliant authentication protocol when integrating systems.

You'll also learn some specifics about a few of the most commonly used authentication protocols in modern software systems.

## Why Use a Standardized Authentication Protocol?

Why should you consider a standards-based protocol in the first place? There are a number of reasons.

### Security

If you try to build an authentication protocol or procedure--no matter how simple it may seem--you are putting your system at increased risk. It's often said in the context of security, "Don't roll out your own crypto." The same can be said about an authentication protocol primarily used to integrate systems.

Standardized auth protocols are like open-source software: You can trust open-source code when other experts have examined how they work and have publicly vetted them. Likewise, standardized auth protocols have been publicly vetted by experts and are openly trusted. Because of this, many organizations will trust _your_ solutions only if you are using standardized protocols such as OAuth and SAML.

When you use a standardized protocol, you have the peace of mind that comes with knowing your authentication system is following in the footsteps of industry experts and best practices.

### Transferable Learning

What would happen if every time you built a new system's authentication system, you had to create it from scratch? You would have to learn the nitty-gritty details of authentication over and over again.

This would lead to a scenario where you couldn't leverage your hard-won knowledge between projects and employers. If you instead use a ubiquitous protocol like OAuth, there may be subtle differences, but you'll understand the general authentication architecture. If you know how standardized protocols work and what use cases they solve, you can bring that knowledge to other projects and companies.

The same applies when teaching and onboarding new engineers to your team. If you are using a standardized auth protocol, then your new team members are likely to already know about OAuth, SAML, or other standardized protocols. It will be much easier to get these new team members up and running and contributing to these relevant areas of your system.

### Supporting Libraries

Imagine that you have an API with a bespoke authentication implementation. Would you be able to build SDKs or code libraries to interact with your API easily? Since you are using a custom authentication design, you'd have to build the core logic of any code libraries from the ground up every time. And maintain them, forever.

On the other hand, most modern programming languages have code libraries that integrate with standard auth protocols thereby accelerating your development work. By using a standardized auth protocol such as OAuth or SAML, your clients and API consumers can reuse common code libraries for their programming language of choice.

### Interoperability with Other Systems

Using an auth protocol such as OAuth makes your system more interoperable with others. If you are working with a larger enterprise organization, then you need to integrate with other systems all the time. Using a standardized way to do this saves time, mental overhead, and overall cost.

The same applies to external systems. If you have created an API that supports SAML, for example, then your customers will understand how to integrate their solutions and systems with yours much more quickly, and with far fewer headaches.

### Edge Cases

Standards have been used by many different organizations and systems in many different ways. Often edge cases are either handled or explicitly ruled out.

By leveraging a standard, you will gain the benefits of all that knowledge and experience.

## Survey of Authentication Standards

### OAuth

When you need to give a website or application access to your Google account's data, or any other service's data for that matter, OAuth can help to grant access securely. OAuth is perhaps the best-known protocol in the authentication space, so you should know about it. However, it's actually not an authentication protocol, as you'll see later. The current version is OAuth 2.0, though OAuth 2.1 is being drafted.

More specifically, OAuth allows an application to securely gain an access token which can be used to make additional requests to a third-party API or web service. OAuth is a standard that defines this choreography between clients and services to obtain this token.

Here's a diagram of the "implicit" OAuth flow. The official OAuth terms for different actors in the process are in purple:

![The OAuth Implicit grant.](/img/articles/value-standards/oauth-flow.png)

It can be useful to look at the implicit flow to understand the concepts. However, please don't use the implicit grant, as it is extremely vulnerable to XSS attacks. You can learn more about that in [The Modern Guide to OAuth](/articles/oauth/modern-guide-to-oauth#implicit-grant-in-oauth-20).

Today, it's safer to go with a more secure update to OAuth called [PKCE](https://oauth.net/2/pkce/) (often pronounced "pixie") and the Authorization Code grant. Originally intended to enhance OAuth security for mobile applications, this combination provides extra security benefits to all clients using this updated protocol.

#### Authentication vs. Authorization

It is important to understand OAuth is not an authentication protocol. It's an authorization protocol.

> OAuth 2.0 was intentionally designed to provide authorization without providing user identity and authentication, as those problems have very different security considerations that don't necessarily overlap with those of an authorization protocol. -- [OAuth.com](https://www.oauth.com/oauth2-servers/openid-connect/authorization-vs-authentication/#:~:text=OAuth%202.0%20was%20intentionally%20designed,those%20of%20an%20authorization%20protocol.)

Authentication is about _proving you are you_. Authorization is about _delegating access_ or permissions to information.

Historically, OAuth has been used as both a way of dealing with both authentication and authorization. However, OAuth doesn't define a standard way to provide user information to the requester--so every auth implementation is a little bit different. This removes some of the benefits of using a standardized protocol.

Many developers may also assume that obtaining an access token from a third-party service means that your user was authenticated. But that's not true. An access token _could_ be granted to your application even if your user was not authenticated (that's 100% up to the service you are requesting access to).

Authentication features like getting identity information, session management, and user registration have to be handled some other way. OAuth servers often support OIDC, which we'll cover below.

#### When Is OAuth a Good Choice?

If you are creating an app that needs to get information from another source, then OAuth makes sense. It helps to limit your app's access to your customer's resources, and it facilitates the process of requesting and obtaining permission.

While often misunderstood as an authentication protocol, OAuth is not a standardized solution for authentication, as mentioned above. Let's look at some proper authentication protocols that you _can_ use to authenticate your user.

### OpenID Connect (OIDC)

You've seen that OAuth is a great way to gain access to resources. But it doesn't define a standard way to authenticate your user. [OpenID Connect (OIDC)](https://openid.net/connect/) solves authentication by extending the OAuth 2.0 protocol, what is technically called a "profile" of OAuth.

![OIDC tokens build on OAuth tokens.](/img/articles/value-standards/oidc-extends-oauth.png)

OIDC adds an "Id token" to be returned from the final OAuth request in the flow. This confirms the user was in fact authenticated (unlike the access token, as discussed previously) and also gives you a way to access identity-specific information about the current user.

Beyond these basic features, OIDC can also enable more advanced features such as [session management](https://openid.net/specs/openid-connect-session-1_0.html), [log-out ability](https://openid.net/specs/openid-connect-rpinitiated-1_0.html), [user registration standard](https://openid.net/specs/openid-connect-prompt-create-1_0.html), and more.

#### When Is OpenID Connect a Good Choice?

OIDC is a great choice when you want to allow your users to log into your applications via another service, such as Google, Facebook, Twitter, or other social providers.

Historically, this was done using OAuth along with some customized extras. OIDC provides a solid standard for doing this in a secure and trusted manner.

As mentioned above, OIDC is very often supported by OAuth servers. If you have an OAuth server, check to see if it supports OIDC (FusionAuth does).

### SAML

SAML stands for "Security Assertion Markup Language." It's an SSO (single sign-on) standard that is XML-based. It typically enables business users to sign into their organization's authentication system and automatically log in to the external and third-party applications their employer allows.

SSO offers immense convenience for users. It's also secure in that businesses can have more control over their user's security by enforcing policies such as strong passwords and two-factor authentication. These policies then apply, by proxy, to all their external applications.

While transparent to the user, when they access a configured third-party service, it will issue a request to an authentication system called an "identity provider." If the user is already logged into their organizational identity provider, then it will send a special response to the external application to tell it, "This person is authenticated; let them in!"

#### When Is SAML a Good Choice?

SAML is a great tool for larger organizations to further enhance their users' security. Again, the organization can have full control over a user's authentication policies and force any configured third-party applications and services to "use" the organization's authentication system to verify users. For organizations that are seeking compliance with security programs such as ISO 27001 or SOC 2, SSO is often necessary.

### FIDO

FIDO stands for "Fast Identity Online." It's a set of protocols created by the [FIDO Alliance](https://fidoalliance.org/), a nonprofit group seeking to expunge the use of passwords. In general, the FIDO protocols allow users to authenticate themselves via special devices or applications that use fingerprint readers, facial recognition, or external devices such as special USB dongles. Many websites are also now supporting [WebAuthn](https://fidoalliance.org/fido2/fido2-web-authentication-webauthn/), which is a protocol that enables website logins with FIDO.

FIDO works much like SSH keys. Your device will have a FIDO-enabled "authenticator" application that can generate private and public keys between your device and other services. Your device keeps a private key for that service and sends it a public key. Whenever the device reads your fingerprint, for example, the device's authenticator application will verify you are _you_ and then use public key cryptography to authenticate you to that other service.

This means that attackers can't steal your password. It's also much more convenient than having to enter a password over and over again.

#### When Is FIDO a Good Choice?

FIDO is a great choice for larger organizations that want to keep their users and devices very secure. If an organization chooses to use some type of specialized hardware, such as a [Yubico device](https://www.yubico.com/solutions/passwordless/), that can be a substantial cost. Not only must the devices be purchased, but they must be delivered when employees are onboarded and retrieved when they leave, incurring additional logistical complexity.

However, with growing support for WebAuthn and built-in facial recognition and fingerprint readers on modern PCs, many cloud-based tools are allowing FIDO-based authentication for their websites, lowering the overall cost of using FIDO. Thanks to FIDO's strong security, you'll often see FIDO used in government, insurance, and healthcare.

## Conclusion

You've seen that using a standard authentication protocol is important. It can make sure you are implementing authentication in a trusted and reliable way. Using tools like SSO/SAML can allow your organization to enforce more secure policies that apply across many external applications your organization's users require to do their jobs.

Even better, by using an auth system such as FusionAuth, you don't even need to implement all of these protocols. You can use FusionAuth to manage your user authentication and it comes with support for OAuth, SAML, and OIDC out of the box.

Whatever tools you choose to use, your understanding of when and why OAuth, OIDC, SAML, and FIDO are appropriate can help you choose the best authentication standard for your organization's goals, security posture, finances, and future growth.
