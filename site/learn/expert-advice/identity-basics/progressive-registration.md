---
layout: advice
title: Progressive registration
description: 
author: Dan Moore
image: advice/multi-in-single-article.png
category: Identity Basics
date: 2020-09-08
dateModified: 2020-09-08
---

# Progressive registration

Signing up for accounts is something we're all familiar with. It's a gateway to many of the applications we want and need. But it's not really fun. After all, we're signing up because we want to get access to the application, not because we want to set up yet another username and password.

Pic TBD

Progressive, or multi-step, registration is one way to make the sign up process less unpleasant. This article will discuss aspects of progressive registration and how to make it successful.

## Is registration needed

However, before you implement anything, ask if your application can get by without registration?

Ask yourself these questions:
* Are there subsets of functionality you can offer to anonymous users? 
* Can you leverage social login to make for a smoother experience? 
* If you are targetting enterprise users, can you integrate with their internal identity providers? 
* Would passwordless login work?

The tradeoff with the above options is less control over users' data and the login experience, but reduced sign up friction. These solutions won't be a fit for every application, but they will remove some of user angst and may lead to higher conversions, so are well worth considering and testing.

## Ease the pain of registration

If you've decided you need a registration form, winnow down how much information you are asking for. The fewer fields the better. There may be data needed for certain features of your application; ask for it when that feature is first visited. 

If a form field is optional, clearly mark it as so. Even better, don't ask for optional data on the initial registration, but request that information later, as the user is more engaged.

Provide clear error messages if validation fails. Use both client side validation, which is faster, and server side validation, which is secure.

Avoid complicated password validation rules. Allow users to use a password manager and have the focus be on avoiding passwords known to be insecure. 

You do want to make sure that people enter data correctly. If there are any fields that it's critical to get correct, such as a government ID, use a confirmation field. Even though you are asking for more information, if the stakes of getting it wrong are high, the additional request is worth it.

Make use of the full suite of HTML elements. Dropdowns and radio buttons are well known, but number and email input fields leverage browsers' built-in validation as well.

## Registration steppers

A stepper is a UX element which shows the user how many steps are required to complete the action:

> Steppers display progress through a sequence by breaking it up into multiple logical and numbered steps.

https://material.io/archive/guidelines/components/steppers.html

Splitting up a registration form into steps allows you to ask for more data, but in a more friendly manner. Group the fields logically. Have the first form step be minimal, perhaps just an email address, so that potential users aren't frightened off. Once they take that first step, they'll be more committed to finishing LINK TBD.

However, splitting a form up into steps means that you'll need to maintain some state across the form. You can keep that state in hidden form parameters or in the user's session. You could also keep it in the database and progressively add to the user's registration as they provide more information, but that means that any required information must be submitted on the first step, limiting the flexibility.

follow form best practices? TBD

## Sensitive information

You'll be collecting sensitive information in the registration from. This will likely be a password, but may be other information such as a government ID. If you are collecting these, you have a couple of options for securing such data:

* Save asking for this information until the last step. Since the registration form will be sent over TLS, the data will be secure.
* Allow it to be sent on any step, but keep it in the session and merge it back into the user's data at the final setp.
* Allow it to be sent on any step. Store it encrypted in the client side form on subsequent steps.

Each of these options has tradeoffs.

If you wait to ask for any sensitive information until the last step, you are limiting the flexibility of your form design. If you ask for more than one piece of sensitive data, you're forced to put them on the same, last page.

Keeping the value in the session means you'll have to partially process the form and remove the sensitive information after it has been submitted. Then you'll need to add it back in before the form is fully processed.

Encrypting the data and storing it locally means that you can use normal form frameworks, but you'll need to additionally process the sensitive data. If you choose this path, you can use a symmetric key since you'll be decrypting it in the security of your server environment; the browser shouldn't need to read the data after the step .




https://material.io/archive/guidelines/components/steppers.html#steppers-types-of-steps

https://ux.stackexchange.com/questions/87679/what-do-you-call-a-point-by-point-like-slacks-registration-ui

https://www.interaction-design.org/literature/topics/progressive-disclosure

https://unbounce.com/conversion-rate-optimization/how-to-optimize-contact-forms/

https://cxl.com/blog/cialdinis-principles-persuasion/

https://go.forrester.com/blogs/12-02-20-have_you_signed_in_with_facebook_recently/?cm_mmc=RSS-_-MS-_-1711-_-blog_2684

https://www.nngroup.com/articles/web-form-design/

https://www.nngroup.com/articles/progressive-disclosure/
