---
layout: blog-post
title: Update custom user data in the admin UI
description: Once you have custom user data in the FusionAuth system, how can you update it?
image: blogs/controlling-hotspot/controlling-a-hotspot-with-fusionauth-authentication.png
author: Dan Moore
category: blog
tags: feature-advanced-registration-forms
excerpt_separator: "<!--more-->"
---

Custom registration data is useful, but how can you manage it? After people register, you may want to add more information to their profile. Sometimes this happens automatically, via other systems. In that case, you can use the API. But what if you want to allow employees or other humans to update a user's profile?

<!--more-->

Let's set the stage. Suppose you created a custom registration form for a real estate search application, as outlined in [this blog post series](/blog/2020/08/27/advanced-registration-form/). But you now want to update users' profiles as they move through the home buying process.

As of [FusionAuth version 1.20](/blog/2020/10/27/announcing-fusionauth-1-20/), you can now manage that data from within the administrative user interface. In this post, we'll walk through how to set this up and why you might want to.

This post assumes you've installed FusionAuth and created a custom registration form, as outlined in those blog posts. If blog posts aren't your jam, you can also read the [Advanced Registration Form guide](/docs/v1/tech/guides/advanced-registration-forms/) and set up your form that way.

*Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing/).*

## Why use custom admin forms?

Using custom admin forms lets users with access to the FusionAuth interface manage custom user and registration data. All this functionality is available out of the box. Previous to this release, you had to build your own application to edit custom user data. 

Having this functionality in the FusionAuth admin screen means never having to use the APIs (unless you want to).

But perhaps you don't want to expose all of the FusionAuth settings to employees who need to be able to update user profile data? 

FusionAuth roles to the rescue. The FusionAuth application has over 15 roles that offer fine grained control.

## Setting up a user manager account

Let's set up a user manager account. First, sign in as an admin. 

Create or edit a user account. Go to the "Registrations" tab and add or edit the user's FusionAuth registration. Choose the `user_manager` role. Such a role restricts the actions that this user can now take. FusionAuth has a rich set of roles. Note that your own applications can have unlimited roles as well.

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/adding-user-manager-role-to-user.png" alt="Setting the user_manager role for a user." class="img-fluid" figure=false %}

Save that user. If you view the user details screen, you can see that they now have the `user_manager` role in the FusionAuth application.

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/user-with-user-manager-role.png" alt="A user with the user_manager role." class="img-fluid" figure=false %}

You'll log in as that user in a bit, but for now, let's continue to create the custom registration form.

## Create the custom fields

You will add one new field. The new field will be the status of a user. Since this is a real estate application, you want to keep track where the user is in the purchase process.

You are going to add a status field with the following values:

* Looking
* Assigned to a realtor
* Under contract
* Closed
* Other

This field isn't useful at user registration, other than perhaps to default to "Looking", so employees will manage it in the admin screen. Let's add this field. Navigate to "Customizations", then "Form Fields". Add a new field:

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/adding-user-status-field.png" alt="Adding the user status field." class="img-fluid" figure=false %}

Don't make this form field required. Doing so would require a user to provide a value for it at registration time.

## Adding the form

Next, you need to add a registration form. This will include any registration fields that should be editable. In this case, you'll add the existing custom fields from the registration form:

* Minimum price
* Maximum price
* Geographic area

As well as the field you just added above.

Navigate to "Customizations", then "Forms". Add a new form. Give it an intelligent name, and then a type of "Admin Registration". This type means that this form is used to edit registrations. Remember, a registration is a mapping between a user and an application.

Now let's add the form fields to the registration. You could create multiple sections in this form, but for only four fields it hardly seems worth it. 

At the end, the new form should look like this: 

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/admin-registration-form.png" alt="Setting up the admin registration editing form." class="img-fluid" figure=false %}

Make sure you save it off. Next up, associating the form with the real estate application.

## Tying a form to an application

Now that the form is ready to go, you need to configure the application to use it. 

To do so, navigate to "Applications" and then edit your application. Go to the "Registration" tab and the "Form Settings" section. Change the "Form" value to the form you added.

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/associating-form-with-application.png" alt="Configuring an application to use the admin registration editing form." class="img-fluid" figure=false %}

Save the application. Simple, eh? This form will now be used any time you add or edit a registration for this application.

Next up, you'll use the form to edit a user who has previously registered. You'll change their status to "Closed". Cha-ching, you just made some imaginary money.

## Editing a user's registration data

Sign out of your admin account.

Sign in with the user manager account you previously created. See, I told you we'd come back to that account. 

Edit a user who has registered for the application and you can change their real estate data as well as their `userstatus`. 

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/edit-user-registration.png" alt="Editing a user's registration." class="img-fluid" figure=false %}

Note that this user manager account doesn't have access to any FusionAuth functionality beyond user management. If they hack the URL, they'll see this screen, stating clearly they are unauthorized.

{% include _image.liquid src="/assets/img/blogs/custom-admin-registration-form/dinesh-hacking-urls.png" alt="Trying to access forbidden FusionAuth URLs." class="img-fluid" figure=false %}

## Go further

If you were paying attention, you noticed that the title of the newly added field is `registration.data.userstatus` in the form. This isn't great, but it is happening because the field name hasn't been added to the messages properties file. You can update it by editing that file. More in [this blog post](/blog/2020/09/01/theme-registration-form/), which updated the properties file for other custom fields.

If you wanted to take action on the modification of the registration data, you could [use a webhook](/docs/v1/tech/events-webhooks/) to listen for registration data change. For example, you could automatically purchase some champagne every time a user's status is changed to "Closed".

## In conclusion

This new functionality lets you build flexible user management interfaces without writing any code at all. All of the power of the different form controls, validation rules, and multiple sections are available to you. 

While this post built a custom admin registration form, you can also build them for the user editing form as well. 

Happy coding!

