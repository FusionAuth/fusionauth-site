---
layout: blog-post
title: FusionAuth announces BioTech&trade;
description: A game-changing new factor of authentication.
author: Dan Moore
image: blogs/fusionauth-biotech/biotech-header.png
category: article
tags: april-fools
excerpt_separator: "<!--more-->"
---

FusionAuth is proud to announce a breakthrough in user security, BioTech&trade;. This new technology will help users around the world more easily secure their accounts and data.

<!--more-->

## The problem 

It's well known that passwords alone are simply not enough to provide secure credentials. That's why many applications offer the ability to add additional factors of authentication, also known as multi-factor authentication (MFA).

Per a [recent Microsoft post](https://www.microsoft.com/security/blog/2019/08/20/one-simple-action-you-can-take-to-prevent-99-9-percent-of-account-attacks/):

> By providing an extra barrier and layer of security that makes it incredibly difficult for attackers to get past, MFA can block over 99.9 percent of account compromise attacks. 

But for users, MFA is tedious. You have to set it up. You have to keep track of the additional factor, or rely on built-in services like FaceID and TouchID which require you to trust vendors like Apple and Google.
 
## The solution

The FusionAuth R&D team, with decades of experience in security and software development, saw a clear market opportunity to augment [traditional MFA methods](/learn/expert-advice/authentication/multi-factor-authentication) such as time based one-time password (TOTP), facial recognition, or sending a code via SMS with a new, innovative MFA method.

"The feature is remarkably simple," said CTO Daniel DeGroff. "Rather than send you a code that requires you to keep track of a device or rely on iOS or Android to implement FIDO2 correctly, BioTech&trade; utilizes any bodily fluid to authenticate a user."

By partnering with a number of medical records companies, FusionAuth allows users to provide any bodily fluid, such as saliva, sweat, or tears of frustration as an additional factor of authentication. Because this is advanced biometric identification, FusionAuth called it BioTech&trade;.

It's simple to get started. All administrators have to do is enable the BioTech&trade; multi-factor method in the Tenant settings of their FusionAuth instance:

{% include _image.liquid src="/assets/img/blogs/fusionauth-biotech/tenant-settings.png" alt="The FusionAuth tenant settings screen." class="img-fluid" figure=true %}

Admins can use the API to configure this setting as well, of course.

During the login process, users are prompted to provide a sample of any bodily fluid. They simply drip it in front of the camera and the soon-to-be patented BioTech&trade; algorithm analyzes it and authenticates the user.

Founder Brian Pontarelli continued: "After completing the initial prototype we looked at each other in disbelief. It doesn't get any more satisfying! Everyone has cursed at their computer, now they can spit at it too."

As part of the R&D process, extensive user experience testing validated the research. In one trial, FusionAuth tested the speed and accuracy of two different MFA methods. One was the typical TOTP using Google Authenticator (boring) and the other used BioTech&trade; MFA.

The user was quick to choose the BioTech&trade; option, stating "I mean, all it took was a few tears of joy! Now I won't have to have my phone or YubiKey around to log into my bank account. It's great!"

With a thoughtful look on her face, she added "What other bodily fluids are supported?"

_(FusionAuth is not responsible for any damage done to your keyboard or mobile phone as the result of using BioTech&trade;.)_

## Addressing some security "experts"

However, the FusionAuth team would like to address some criticism. Since the announcement, FusionAuth has come under fire from the security industry. 

These "experts" state that this feature, while helpful to users and obviously beneficial to the user experience, could be exploited by experienced hackers or even people who work out in the same gym. In addition, they claim sensitive biometric data should be protected by law and not used in such a casual fashion.

Our reply: "Haters gonna hate. You don't know crap about security."

**Also, Happy April Fool's Day!**
