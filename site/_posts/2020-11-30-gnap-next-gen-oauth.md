---
layout: blog-post
title: GNAP is the next iteration of OAuth
description: What is GNAP and why should you care?
image: blogs/custom-admin-registration-form/manage-custom-user-profile-data-in-th-fusionauth-admin.png
author: Dan Moore
category: blog
excerpt_separator: "<!--more-->"
---

The Grant Negotiation and Authorization Protocol is currently being formulated in an IETF working group. This protocol will not be backward compatible with OAuth 2, yet it well worth paying attention to.


<!--more-->

According to the working group charter, this standard will be released in multiple parts beginning in the middle of 2021.



why 


Things that excite me about GNAP



Why GNAP

OAuth2 successful

image ofk

https://github.com/ietf-wg-gnap/gnap-core-protocol/



Letting a user register and provide custom profile data solves the problem of bringing such data into your auth system. But how can you manage the data as it changes over time? 

After people register, you will want to enrich or change their profile. Sometimes this happens via automated systems. In that case, you can use an API. But what if you want to allow employees or other humans to update a user profile data?

<!--more-->

Let's set the stage. Suppose you created a custom registration form for a real estate search application, as outlined in [this blog post series](/blog/2020/08/27/advanced-registration-form/). But you now want to update user profiles as they move through the home buying process.

As of [FusionAuth version 1.20](/blog/2020/10/27/announcing-fusionauth-1-20/), you can now manage such data from within the administrative user interface. In this post, we'll walk through how to set this up and why you might want to.

## Prerequisites

This post assumes you've installed FusionAuth and created a custom registration form, as outlined in the above blog posts. If blog posts aren't your jam, you can also read the [Advanced Registration Form guide](/docs/v1/tech/guides/advanced-registration-forms/) to learn how to set up your form.

*Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing/).*

## Why use custom admin forms?

Using custom admin forms lets users with access to the FusionAuth web interface manage custom user and registration data. This functionality is available out of the box. Previous to this release, you had to build your own app for editing profile information. Having this functionality in the FusionAuth admin screen means never having to use the APIs (unless you want to).

But perhaps you don't want to expose all of the FusionAuth web UI and settings to the employees who only need to be able to update user profile data? 

FusionAuth roles to the rescue! The FusionAuth application has over 25 roles that offer fine grained control. Whether you want to let people only manage themes  or webhooks, consents or lambdas, roles let you lock down access. 

Let's set up an account for managing users.

## Setting up a user manager account

First, sign in as an admin, then create or edit a user. 

Go to the "Registrations" tab and add or edit the user's FusionAuth registration. Select the `user_manager` role. This role restricts the actions that this user can take. (Your own applications can have unlimited roles as well, which you can apply to your users in the same way.)

In this screenshot, the user being edited is assigned the `user_manager` role:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/adding-user-manager-role-to-user.png" alt="Setting the user_manager role for a user." class="img-fluid" figure=false %}

Save the user. If you view the user's details, you can see that they have been assigned the `user_manager` role in the FusionAuth application:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/user-with-user-manager-role.png" alt="A user with the user_manager role." class="img-fluid" figure=false %}

You'll log in as that user later on, but for now, let's create the form for editing the user's registration and profile data.

## Create the custom fields

But first, let's add one new field. The new field will record user status in the home buying process. Since this is a real estate application and you get paid when a user closes, you want to keep track of this small detail.

You'll add a status field with the following values:

* Looking
* Assigned to a realtor
* Under contract
* Closed
* Other

This field isn't useful when a user first registers for your search application, other than perhaps to default to "Looking". Instead, employees will manage it in the admin screen as the user interacts with your company and your application.

Let's add this custom field. Navigate to "Customizations", then "Form Fields". Add a new field:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/adding-user-status-field.png" alt="Adding the user status field." class="img-fluid" figure=false %}

Don't make this form field required, though. Doing so would require a user to select a value at the moment they register.

## Adding the form

Next, you need to add a registration form. This will include any registration fields that should be editable by administrative users. In this case, you'll add the existing custom fields from the registration form:

* Minimum price
* Maximum price
* Geographic area

As well as the field added above.

Navigate to "Customizations", then "Forms". Add a new form. Give it an intelligent name, and a type of "Admin Registration". This means that this form is used to edit FusionAuth registrations. Remember, a registration is a mapping between a user and an application.

Now let's add the form fields. You could create multiple sections in this form, but for only four fields it hardly seems worth it. 

At the end, the new form should look like this: 

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/admin-registration-form.png" alt="Setting up the admin registration editing form." class="img-fluid" figure=false %}

Make sure you save it! Next up, you'll associate the form with the previously created real estate FusionAuth application.

## Tying a form to an application

Now that the form is ready to go, you need to configure the application to use it. 

Navigate to "Applications" and then edit your application. Go to the "Registration" tab and the "Form Settings" section. Change the "Form" value to the form added above:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/associating-form-with-application.png" alt="Configuring an application to use the admin registration editing form." class="img-fluid" figure=false %}

Save the application. Simple, eh? This form will now be used any time you or any other admin user adds or edits a registration for this FusionAuth application.

Forms can be reused across applications and even across tenants. Since FusionAuth supports multi-tenant configurations, if that's what you need, you can build these forms once and reuse them many times. You can also manage the creation and updating of these forms and form fields via the API or client libraries, should you need to be able to modify them programmatically.

Next, you'll use the form to edit a previously registered user. Let's pretend they just bought a home with your company, so you can change their status to "Closed". Cha-ching, you just made some imaginary money.

## Editing a user's registration data

For this section, you'll use the user manager account you set up above. Sign out of your admin account, or open an incognito browser window. Visit the FusionAuth login screen.

Sign in with the user manager account previously created. See, I told you we'd come back to it. 

Edit a user who has registered for the real estate search application and you can change their real estate preference data as well as their `userstatus`:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/edit-user-registration.png" alt="Editing a user's registration." class="img-fluid" figure=false %}

This account doesn't have access to any FusionAuth functionality beyond user management. If a user hacks the URL, they'll see this screen, stating clearly they are unauthorized for the functionality they are trying to access:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/dinesh-hacking-urls.png" alt="Trying to access forbidden FusionAuth URLs." class="img-fluid" figure=false %}

## Go further

If you were paying attention, you might have thought I was pulling a fast one. You will have noticed that the title of the newly added field is `registration.data.userstatus` in the form.

This is suboptimal but it is happening because the field name hasn't been added to the messages, which is where all the text UI elements are retrieved from. You can update that by editing the messages properties. This is covered in more detail in [this blog post](/blog/2020/09/01/theme-registration-form/), which updated the properties file for other custom fields.

If you need to take action when a user's registration data is changed, you could [use a webhook](/docs/v1/tech/events-webhooks/) to listen for that particular event. For example, you could automatically send flowers to the home buyer whenever their status is changed to "Closed". This would require knowing the new home's address as well as an integration with an online flower seller, but is left as an exercise for the reader.

## In conclusion

This new form functionality lets you build flexible user management interfaces without writing any code. The power and customizability of different form controls, validation rules, and multiple sections are all available to you. And while this post built a custom form for managing registrations, you can also build them for the editing custom user data as well. 

Happy coding!

