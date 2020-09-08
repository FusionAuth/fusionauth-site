---
layout: advice
title: Registration forms
description: Users have to register to gain application access. How can you make this as painless as possible?
author: Dan Moore
image: advice/multi-in-single-article.png
category: Identity Basics
date: 2020-09-08
dateModified: 2020-09-08
---

Signing up for accounts is something we're all familiar with. It's a gateway to the applications we want and need. But it's not really fun. Or pleasant. After all, we're signing up because we desire access to the application, not because we want to set up yet another username and password:

{% include _image.liquid src="/assets/img/advice/long-registration-form.png" alt="A long registration form. Honestly? You need my full name and my middle name?" class="img-fluid" figure=false %}

You can make the registration process simpler. And you should.

## Is registration needed at all?

Before you implement any user registration, ask yourself a fundamental question: does your application need registration?

While user registration is common, every step required before seeing the value of your application affects sign up rates. What can you do to avoid the typical registration process?

### Let them try it first

Potential users are trying to kick the tires on your application. From a 2020 masters thesis, [A User-Centered Approach to LandingPage Optimization in a Software-as-a-Service Business"](https://aaltodoc.aalto.fi/bitstream/handle/123456789/44930/master_Meissner_Mai_2020.pdf?sequence=1&isAllowed=y):

> "Visitors have several different needs before deciding to sign up and test the service. The most prominent need is understanding what the service offers and whether it could be a suitable solution for their problem."

Is there functionality, degraded or not, which you can offer to anonymous users? For example, if you are building a drawing application, can you let a user create and download a picture without an account? This degraded functionality will still allow a user to see the value of your application. 

If you are building a site which displays information based on a search, allow users to see the first couple of results without signing up. While teasers may be frustrating, they also reveal the value of what your application provides.

In a [2013 study (PDF)](http://cups.cs.cmu.edu/soups/2013/trustbusters2013/Sign_up_or_Give_up_Malheiros.pdf), found the source of a sign up mattered for conversion:

> The more valuable services are more likely to be considered worth the privacy and effort cost of disclosing personal data, while the least valuable will not. 

Allowing someone to use your application, even in a limited fashion, helps them assess if a signup is worth their time.

### Social or third party login

You can also rely on a third party for account management. Would social login make for a smoother experience? If you are targetting enterprise users, can you integrate with internal identity providers such as ActiveDirectory? 

Different types of users have different third party accounts. If you have a consumer focused application, offer Facebook auth, as almost everyone has a Facebook account. One less password for your potential users to remember, and one less obstacle to signing up. 

If you are targeting enterprise customers, integrate with ActiveDirectory. If developers are your target market, GitHub authentication makes for a simple registration process and signals that you understand their needs.

### Passwordless

Passwordless login allows a user to authenticate with something they have (access to a phone or email account) rather than something they know (a password). While passwordless authentication requires providing contact information, it does remove the need for the user to create and remember yet another password. 

All the above options provide an application with less data than the typical registration process. The benefit is that there's less signup friction. These solutions won't be a fit for every application, but are worth investigating.

## Ease the pain of registration

If you've decided you need a registration form, remember that it is a form first and foremost. Follow known form best user experience practices.

### A form is a form is a form

The Nielsen Norman Group has an excellent article on [Website Forms Usability](https://www.nngroup.com/articles/web-form-design/), with a number of recommendations for improving forms. The number one suggestion is to:

> Keep it short. ... Eliminating unnecessary fields requires more time [to decide what data is truly worth asking for], but the reduced user effort and increased completion rates make it worthwhile. Remove fields which collect information that can be (a) derived in some other way, (b) collected more conveniently at a later date, or (c) simply omitted.

Carefully consider the information you are asking for. The fewer fields the better. While admittedly in a different context, [Imagescape more than doubled a contact form conversion rate](https://unbounce.com/conversion-rate-optimization/how-to-optimize-contact-forms/) by decreasing the number of fields from 11 to 4. There may be data needed only for certain features of your application; ask for it when that feature is first accessed. 

Make sure the form is mobile friendly; test at various screen sizes. Due to the complication of mobile data entry, being mobile friendly is another argument for having as few signup form fields as possible.

If a form field is optional, clearly mark it so. Even better, don't ask for optional data on the initial user registration. Request that information later, when the user is more engaged.

Provide clear error messages if any validation fails. Use both client side validation, which is faster, and server side validation, which is tamper proof. On the topic of tampering, ensure any form is submitted over TLS. This makes sure the submitted information is kept confidential and secure.

Make use of the full suite of HTML elements. Dropdowns and radio buttons are powerful, but number and email input fields leverage browsers' built-in validation and should be used as well. 

### Registration forms have some unique aspects

There are also some considerations specific to registration forms. They are the ateway to your application, beyond any functionality exposed to anonymous users.

What causes angst when a user is signing up? This [2012 paper](https://discovery.ucl.ac.uk/id/eprint/1378346/1/ewic_hci12_diss_paper7.pdf) examined registration for government services and defined sign up friction as "as the imbalance between the business process (user goals) and [required] security behaviour". This study found friction was best explained by the following attributes of a signup process:

* The number of new credentials required
* Any delay in the process, such as waiting for an activation email
* Whether registration requires an interruption of routine 
* The frequency of legally obligated use of the service

Obviously you can't control the last aspect, but minimize the number of new credentials, delays and interruptions of routine in your registration process.

Most registration forms ask for a username and password. Make it clear what valid values are for each of these. If a username is an email address, make sure you allow all valid email addresses, including aliases.

Avoid complicated password validation rules. Allow users to use a password manager and have the focus be on avoiding passwords known to be insecure. 

Obtain proper user consent. Depending on what you are planning to do with user information and what regulatory regime applies, different levels of informed consent may be required. For example, if you are in the USA and are dealing with a child's personal information, you'll want to make sure you get parental consent because of COPPA. 

Ensure new users enter sensitive data correctly. If there are any critical fields, such as a government ID, use a confirmation field to ensure the data is typed correct. This is an exception to the rule of asking for less data. If the stakes of incorrect data entry are high, the additional field is worth the inconvenience.

If you need more than a few pieces of information on registration, consider splitting the sign up form into pieces and using a registration stepper, also known as a multi-step form or a wizard. A stepper is a UX element which shows how many steps are required to complete an action: 

> "[Steppers display progress through a sequence by breaking it up into multiple logical and numbered steps].(https://material.io/archive/guidelines/components/steppers.html)". 

## Multi-step registration

Splitting up a registration form into multiple steps allows you to ask for more data, but without imposing a high initial cognitive cost on a potential user. It also allows you to track registration progress, which gives you information about the user experience. Rather than a registration being an all or nothing proposition, you can see where people fall out of the registration funnel: is it because of step two or step three? It also may increase the conversion rate: Instapage saw an [18% increase in conversion rate](https://instapage.com/blog/multi-step-form-part-2) when they split their registration form into multiple steps.

When creating the pages, group fields logically, as per the Nielsen Norman Group recommendations which suggest "Visually group[ing] related labels and fields". Doing this on separate pages allows you to provide a coherent, logical explanation of why you need the data at each step. If you can't come up with a reasonable explanation, consider removing the fields.

Ask for as little as possible on the first registration step; perhaps just an email address. Once they take that first sign up step, they'll be more committed to finishing, thanks to our [love of consistency](http://changingminds.org/techniques/general/cialdini/consistency.htm).

Make sure you are clear about how many steps the registration process will take. Doing so lets the user assess the effort involved.

### Maintaining state

Splitting a form up into multiple steps requires maintaining state across submissions. If you are using a framework, investigate helper libraries, such as [wicked](https://github.com/zombocom/wicked) for Ruby on Rails or [lavavel-wizard](https://github.com/ycs77/laravel-wizard) for Laravel.

If you are rolling your own solution, you can maintain state in hidden form parameters or in the user's session. Either way, you'll want to serialize entered and validated data and store it. Then, when the form is ready to submit, you can deserialize it all and process it, typically saving it to a datastore.

Another option is to save registration data in the datastore and progressively add to the user's registration information as they work through the steps. This approach has downsides, however. Either any required information must be submitted on the first step, limiting flexibility, or you'll have to have a staging registration table, where partials registrations are stored until completed. 

### Sensitive information and multi-page registration

Typically an application collects sensitive information in a registration form. Passwords are the canonical example, but other types of data also need to be treated carefully, such as a social security number or other government identifier.

When collecting sensitive data, make sure it is kept secure throughout the multi-page process. You have a couple of options:

* Don't ask for this information until the last step. Since the registration form will be sent over TLS, the sensitive data will be secure.
* Keep it in the server side user session until the form is complete.
* Store it encrypted in the client side form data.

Each of these options has tradeoffs. If you wait to ask for any sensitive information until the last step, you are limiting the flexibility of your form design. If you ask for more than one piece of sensitive data, you're forced to put all of them on the same, last page.

Keeping the value in the session means you'll be increasing the size of your user sessions. You will also be forced to use sticky sessions, hindering the scalability of your application. 

Encrypting the data and storing it in a hidden form field means you'll need to additionally process the sensitive data. If you choose this path, use a symmetric key stored only on the server side. Since you'll be decrypting the form field in the security of your server environment, the browser shouldn't need to read the data after it is submitted.
