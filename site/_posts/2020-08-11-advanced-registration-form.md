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

I don't know you very well, but I'm guessing you want more users for your application. Registration is a key part of the initial user experience. You need to balance getting the information you need and making it easy for a new user to get started.

<!--more-->

FusionAuth is an auth system, but it also provides user management, registration and more. With FusionAuth, you can build custom registration forms to capture the information you need.

In this blog post, you'll build a self service registration form for a real estate application. When the user registers, they'll see a two step form to capture additional information about their home buying needs. 

If you follow this tutorial, you'll gather the following information when someone registers:

* Email
* Password
* First name
* Phone number
* Geographic area where they are looking
* Minimum house price
* Maximum house price

Because this is a lot of information to ask for, you'll break this up into two pages. We'll be walking through this using the administrative user interface, but everything can be done via [the APIs](/docs/v1/tech/apis/forms), should you need to manage registration forms programmatically.

## FusionAuth setup

If you don't have FusionAuth running, [get it running in 5 minutes](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). 

Then get a license key and activate it. *Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing).* 

Next, [activate your license](/docs/v1/tech/reactor). Whew, that's all done. 

## Create form fields

Now we need to create any custom form fields. To do so, navigate to "Customizations" and then "Form fields". 

You'll see some form fields are already there. These are the default fields available for your custom forms: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/predefined-keys.png" alt="A list of the predefined form fields that you can use for registration." class="img-fluid" figure=false %}

### Custom form fields

The real power of registration form building, however, comes when you add custom fields. You can add as many of these as you'd like. Let's add a couple for our sign up form. 

First, let's add a key of `minprice`. Configure the form field to have a data type of `number` and a `text` form control. The user's minimum price range is useful information. Let's make it required, so that you can't complete registration without providing it. Here's what it will look like before we save the configuration:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-field-min-price-required.png" alt="Adding the minimum price field." class="img-fluid" figure=false %}

You can create as many custom fields as you want and store them in the `registration.data` field under a unique key. `registration.data` is the right place to store data related to a user and specific to an application. As a reminder, [a registration](/docs/v1/tech/core-concepts/registrations) is a link between a user and an application. 

Since this is a real estate application, the minimum price point of the user is germane to this app, so storing it on the registration is the right approach. If we were later to build a mortgage application, there'd be different fields associated with that registration, such as loan amount. 

We can also create custom fields tied to the user. If we wanted to ask for information that multiple applications would use, such as their current address or if they were from out of state, that would be best stored in the `user.data` field.

Beyond configuring a form field to be required, you can also ensure that a field matches a regular expression or a confirmation field. The latter may be useful if you are asking for sensitive data that you want to ensure the user provides correctly.

Let's also add a `maxprice` field and use the same settings. It'll have a different name and key, but the other settings should be the same as `minprice`.

Finally, add a geographic search area, where folks can share where they are looking to buy. It'll be a string, but make it optional, as potential users might not have a good idea of where they're interested in looking at homes.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-field-geographic-area.png" alt="Adding the geographic area field." class="img-fluid" figure=false %}

There are many other available data types, such as date or boolean, and form controls, such as a textarea or select dropdowns. You can even store arrays and maps in the custom data. Please consult [the API docs](/docs/v1/tech/apis/form-fields) for more information. 

If you view the list of fields, you'll notice you've added three fields. They are available for use in the form we're going to build next. They can also be used for future forms as well.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/list-of-form-fields.png" alt="The list of fields with our custom fields added." class="img-fluid" figure=false %}

## Build the form

Next you need to build the form. At this point you can mix and match any of the standard, predefined form fields and the recently added custom form fields. 

Each field can appear in any order on the form; whatever makes the most sense for your audience works for FusionAuth. 

When you create a new form, you'll see a name field and a button to add steps:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/initial-form.png" alt="The blank form, ready to be assembled." class="img-fluid" figure=false %}

The only requirements for a registration form are:

* You must have at least one step.
* You must have either an email or a username field in one of your steps.
* You must have a password field in one of your steps.

To begin building the real estate application form, navigate to "Customizations" and then to "Forms". Click the green "+" button to create a new form, and name it. 

Add the first step, and then the following fields:

* Email
* Password
* First name
* Phone number

When you're done, it should look like this: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-first-step.png" alt="Adding fields to our first step." class="img-fluid" figure=false %}

Just as you can add as many custom form fields, you can also add as many steps as you want. However, please think of the users who are filling out the form and don't add too many steps! 

After you've examined the first step, create a second one. Add your custom fields to learn more about their house hunt.

* Geographic area of interest
* Minimum house search price
* Maximum house search price

After you've added these fields to the form, you'll see this:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/form-second-step.png" alt="Adding fields to our second step." class="img-fluid" figure=false %}

Feel free to rearrange the form fields within each step by clicking the arrows to move a field up or down. The form configuration specifies steps and display order of fields. If you need to move a field between steps, delete it from one step and add it to another. To change field attributes, data type, form control, or validation, return to the "Fields" section and make your changes. 

When you're done tweaking the form to your liking, save it.

## Specify the form for your application

Now that you've created a form with custom fields, the next step is to specify which applications should use it. Forms and form fields can be reused in any application and any tenant. Since FusionAuth supports multiple tenants in any instance, you can easily reuse the fields and forms you've created. You simply have to assign the registration form to the application, which is the next step for this tutorial.

Navigate to the "Applications" tab and create a new FusionAuth application. As a reminder, an application is anything a user can sign into: a web application, native app, API, anything. In this case, you are still building out the real estate application; pick something snappy and descriptive. How about "Real estate search"? 

You must configure a redirect URL, this is where the user is sent when registration succeeds. To set this up, navigate to the "OAuth" tab of your application and enter "https://fusionauth.io" or any other public website. For a production application, of course, you'd instead specify where a user should be sent after they register. Each application may have multiple redirect URLs. You configure where to send a user after successful registration by adding a `redirect_uri` to the registration form link.

We also must configure an application to allow users to register themselves. To do so, navigate to the "Registration" tab and enable "Self service registration". Then check the "Advanced" option and select the form you created. Before you click the "Save" button, you'll see a screen like this: 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/application-with-custom-form-configured.png" alt="Specifying a custom registration form for our application." class="img-fluid" figure=false %}

Return to the list of applications. 

The form is configured, so the next step is to sign up. 

## Sign up

The long awaited moment is here! In just a few clicks, you'll see the glory of your custom registration form.

But first, we need to find the registration URL. Do so by clicking on the green magnifying glass on the list of applications. The "Registration URL" is highlighted below:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/viewing-application-details.png" alt="Finding the registration URL." class="img-fluid" figure=false %}

Now that you have the URL, open up an incognito window and navigate to this URL. You can see that the first screen asks for your first name, email address, password and phone number. It also lets you know how many registration steps there are.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/first-screen-unthemed.png" alt="The first page of the custom registration flow." class="img-fluid" figure=false %}

Put some information in there. Don't be shy! 

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/first-screen-for-user-filled-out.png" alt="The first page of the custom registration flow with information in it." class="img-fluid" figure=false %}

The second screen asks for additional information: the minimum and maximum home prices and your area of geographic interest. Fill out the second screen with all the parameters for your dream home. I picked a wide range of price points, myself.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/user-registers-second-screen-50kmin.png" alt="The second page of the custom registration flow with information in it." class="img-fluid" figure=false %}

Click "Register" to complete your sign up. You'll be sent to the configured redirect URL value, but let's check out the account you just created.

## A user signup from the admin's view

Flip back to your administrative user interface, in the browser where you are logged into FusionAuth, and navigate to the "Users" section. You'll see that you have been registered:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/list-users-screen.png" alt="A list of users, including the one just registered." class="img-fluid" figure=false %}

If you go to the "User data" tab on the account details page, you can see the information you filled out as well:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/displaying-user-data.png" alt="The user data tab of the newly registered user." class="img-fluid" figure=false %}

You have a custom registration form and a user can sign up successfully. Nice work! This user information is available from the FusionAuth APIs, in the `user.data` and `registration.data` fields. You can retrieve and modify that data using the [APIs](/docs/v1/tech/apis).

Sorry to end on a down note, but there's trouble in paradise. The placeholders for the fields are not very user friendly. For example, `user.firstName` is an understandable hint, but it'd be better to say "Your first name". Hints also disappear as soon as you type in them, so displaying a label close to the control will help potential users.

Never fear, changing the theme will be covered in a future blog post. 

## Conclusion

Allowing your customers to quickly and easily register themselves lets you focus on the parts of your application that they are actually registering for. 

With advanced registration forms, you can now create, via the API or the administrative user interface, unlimited registration forms. You can then associate these forms easily with your applications, gathering user information over multiple steps.

