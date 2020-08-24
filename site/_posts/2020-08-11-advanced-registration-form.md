---
layout: blog-post
title: How to use FusionAuth's advanced registration forms
description: Advanced registration forms let you easily build out multi-step registration forms.
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-advanced-registration-forms
excerpt_separator: "<!--more-->"
---

I don't know you very well, but I'm guessing you want more users for your application. Registration is a major part of the initial user experience. As an application developer, you need to balance getting the information you need with making it easy for a new user to get started.

<!--more-->

FusionAuth is an auth system, but it also provides user management, registration and more. With FusionAuth, you can build custom registration forms to capture the information you need. In this blog post, you'll build a self service registration form for a (fake) real estate application. When the user registers, they'll see two steps, one for basic account information and the other to capture additional information about their home buying needs. 

If you follow this tutorial, you'll end up with a form that asks a new user for the following:

* Email
* Password
* First name
* Phone number
* Geographic area where they are looking
* Minimum house price
* Maximum house price

Because this is a lot of information to ask for at once, you'll break this up into two pages. We'll be walking through this using the administrative user interface, but everything can be done via [the APIs](/docs/v1/tech/apis/forms), should you need to manage registration forms programmatically.

## FusionAuth setup

If you don't have FusionAuth running, [get it going in 5 minutes](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). 

Then get a license key and activate it. *Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing).* 

Next, [activate your license](/docs/v1/tech/reactor). Whew, all the FusionAuth set up is done. 

## Create form fields

Now you need to create custom form fields. To do so, navigate to "Customizations" and then "Form fields" after logging into the administrative user interface. You'll see some form fields are already there. These are the default fields available for your registration forms: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/predefined-keys.png" alt="A list of the predefined form fields that you can use for registration." class="img-fluid" figure=false %}

You can mix and match these form fields on a new form. If that's all you need, you can avoid creating custom form fields. But if you need anything new, you'll want to create a new form field.

### Custom form fields

The real power of registration form building can be seen when you add custom fields. You can add as many of these as you'd like. 

You can store values in any of the predefined user fields such as `user.fullName`. But you can also use the `data` field on both the `registration` and the `user` objects to store arbitrary data. 

`registration.data` is the right place to store data related to a user's account but specific to an application. As a reminder, [a registration](/docs/v1/tech/core-concepts/registrations) is a link between a user and an application. 

Since this is a real estate app, the minimum price point of the user is germane to this application. Storing it on the registration is the right approach. If you were later to build a mortgage application using FusionAuth as its auth layer, there'd be different fields, such as loan amount, associated with that registration. 

You can also create custom fields tied to the user alone. If you wanted to ask for information that multiple applications would use, such as a current mailing address, that would be best stored in the `user.data` field.

Let's add a couple fields to your sign up form. 

First, add a minimum price. Configure the form field to have a data type of `number` and a `text` form control. The user's minimum price point is useful information, so let's make it required. This means a new user can't complete registration without providing a value. Here's what it will look like before we save the configuration:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-field-min-price-required.png" alt="Adding the minimum price field." class="img-fluid" figure=false %}

Beyond configuring a form field to be required, you can also ensure that a field matches a regular expression or a confirmation field. The latter may be useful if you are asking for sensitive data that you want to double check that the user provides correctly.

Let's also add a maximum price field and use the same settings. Use a key of `maxprice`; keys must be unique within the registration. It'll have a different name as well, but the other settings should be the same as the `minprice` field created first.

Finally, add a geographic search area. This lets new users share where they are looking to buy. It'll be a string, but make it optional, as potential users might not have a good idea of where they're interested in looking at homes.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-field-geographic-area.png" alt="Adding the geographic area field." class="img-fluid" figure=false %}

There are many other available data types, including dates or booleans. There are also other, more targeted form controls, such as a textarea or select dropdowns. You can even store arrays and maps. Please consult [the API docs](/docs/v1/tech/apis/form-fields) for more information. 

After saving the above additions, if you view the list of fields, you'll notice you've added three fields. They are available for use in the form you're going to build next. They can also be used for future forms as well.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/list-of-form-fields.png" alt="The list of fields with our custom fields added." class="img-fluid" figure=false %}

## Build the form

Next you need to build the form. At this point you can mix and match any of the standard, predefined form fields and your recently added custom form fields. 

Fields can appear in any order on the form; whatever makes the most sense for your audience works for FusionAuth. When you create a new form, you'll see a name field and a button to add steps:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/initial-form.png" alt="The blank form, ready to be assembled." class="img-fluid" figure=false %}

The only requirements for a registration form are:

* You must have at least one step.
* You must have either an email or a username field in one of your steps.
* You must have a password field in one of your steps.

To begin building the real estate application form, navigate to "Customizations" and then to "Forms". Click the green "+" button to create a new form, and name it. How about something snappy, like "Real estate application signup"? Add the first step, and then the following fields:

* First name
* Email
* Password
* Phone number

When you're done, it should look like this: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-first-step.png" alt="Adding fields to our first step." class="img-fluid" figure=false %}

Just as you can add many custom form fields, you can also add as many steps as you want. However, please think of the users who are filling out the form and don't add too many steps! 

After you've examined the first step, create a second one. Add your custom fields to learn more about their house hunt.

* Geographic area of interest
* Minimum house search price
* Maximum house search price

After you've added these fields to the form, you'll see this:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-second-step.png" alt="Adding fields to our second step." class="img-fluid" figure=false %}

Feel free to rearrange the form fields within each step by clicking the arrows to move a field up or down. The form configuration specifies steps and field display order within those steps. If you need to move a field between steps, delete it from one step and add it to another. Each field can live in zero or one steps.

To change field attributes, data type, form control, or validation, return to the "Fields" section to make your changes. When you're done tweaking the form to your liking, save it.

## Specify the form for your application

Now that you've created a form with custom fields, the next step is to specify which applications should use it. Forms and form fields can be reused in any application and any tenant. Since FusionAuth supports multiple tenants per instance, you can easily reuse the fields and forms you've created. For each application, simply assign the registration form to the application. Luckily, this is the next step for this tutorial.

Navigate to the "Applications" tab and create a new FusionAuth application. As a reminder, an application is anything a user can sign into: a web application, native app, API, anything. In this case, you are building out the real estate application; pick something descriptive. How about "Real estate search"? 

You must configure a redirect URL; this is where the user is sent when registration succeeds. To set this up, navigate to the "OAuth" tab of your application and enter "https://fusionauth.io" or another public website. For a production application, of course, you'd instead specify where a user should be sent after registration. Each application may have multiple redirect URLs. Configure where to send a user after successful registration by adding a `redirect_uri` to the registration form link. For this tutorial, you'll only add one and that will be automatically added to the registration URL when you are ready to test drive this from the user's perspective.

On top of setting up the form, you must configure an application to allow users to register themselves. Otherwise, no users will be allowed to create their own accounts. Navigate to the "Registration" tab and enable "Self service registration". Then check the "Advanced" option and select the form you created. Before you click the "Save" button, you'll see a screen like this: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/application-with-custom-form-configured.png" alt="Specifying a custom registration form for our application." class="img-fluid" figure=false %}

Return to the list of applications. Your form is configured, so the next step is to sign up as a user. 

## Sign up

The moment you've been working towards is here! In just a few clicks, you'll see the glory of your custom registration form.

But first, find the registration URL. Do so by clicking on the green magnifying glass on the list of applications. The "Registration URL" is what you want:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/viewing-application-details.png" alt="Finding the registration URL." class="img-fluid" figure=false %}

Now that you have the URL, open up an incognito window and navigate to it. You can see that the first screen asks for your first name, email address, password and phone number. It also lets you know how many registration steps there are.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/first-screen-unthemed.png" alt="The first page of the custom registration flow." class="img-fluid" figure=false %}

Put some information in there. Don't be shy! 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/first-screen-for-user-filled-out.png" alt="The first page of the custom registration flow with information in it." class="img-fluid" figure=false %}

The second screen asks for the additional information: the minimum and maximum home prices and your area of geographic interest. Fill out the second screen with all the parameters for your dream home. I picked a wide range of price points, myself.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/user-registers-second-screen-50kmin.png" alt="The second page of the custom registration flow with information in it." class="img-fluid" figure=false %}

Click "Register" to complete your sign up. You'll be sent to the configured redirect URL value, but let's check out the account you just created in the administrative user interface.

## A user signup from the admin's view

Flip back to the browser window where you are logged into FusionAuth and navigate to the "Users" section. You'll see that there is a new account that was just registered:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/list-users-screen.png" alt="A list of users, including the one just registered." class="img-fluid" figure=false %}

If you go to the "User data" tab on the account details page, you can see the information you filled out as well:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/displaying-user-data.png" alt="The user data tab of the newly registered user." class="img-fluid" figure=false %}

You now have a custom registration form and a user can sign up successfully. Nice work! This user information is available from the FusionAuth APIs, in the `registration.data` fields. You can retrieve and modify that data using the [APIs](/docs/v1/tech/apis).

Sorry to end on a down note, but there's trouble in paradise. The placeholders for the fields are not very user friendly. For example, `user.firstName` is an understandable hint, but it'd be better to say "Your first name". The hints also disappear as soon as you type anything in them, which means people might forget what they are putting where. 

You can solve all these problems by modifying the theme. Never fear, doing so will be covered in a future blog post. 

## Conclusion

Allowing your customers to quickly and easily register themselves lets you focus on the parts of your application to which they are trying to get access. With advanced registration forms, you can create unlimited forms. You can then associate each form easily with one of your applications, re-use them across apps or manage them without writing a single line of code. 

