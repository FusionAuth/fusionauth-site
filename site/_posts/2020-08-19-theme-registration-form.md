---
layout: blog-post
title: How to theme FusionAuth's advanced registration forms
description: Advanced registration forms let you easily build out multi-step registration forms and you can use FusionAuth's full theming power to change how they look.
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-advanced-registration-forms feature-themes
excerpt_separator: "<!--more-->"
---

When a user is registering, you want to provide an on-brand look and feel, as well as a great user experience. In this tutorial, you'll improve an advanced registration form's display.

<!--more-->

Previously, we documented how to to build a [self service registration form](TBD) for a real estate application. There was a two step which captured additional information about their home buying needs. 

However, the form was lacking in a few user interface elements. In particular, it wasn't clear which data a user was supposed to enter into which form field.

This tutorial augments the [previous one](TBD) and walks you through changing the theme. While this tutorial assumes you've worked through the previous one, you can use your own form as well.

## FusionAuth setup

Go to "Settings" and create an API key. We'll be using this for easier theme management and to read from user data, so configure these allowed endpoints:

* `/api/theme`: all methods
* `/api/user`: all methods

You may also specify no specific endpoint settings. This creates a super-user key. Fine for this tutorial, but for production, please limit access.

## Use a custom theme

The next step is to create a new theme. While you won't be modifying it extensively in this post, you will be changing some of the messages to improve the user experience. Since themes are assigned on a tenant by tenant basis, you can either change the theme for the default tenant (what this tutorial does) or create a new tenant. FusionAuth supports multiple tenants out of the box.

Navigate to "Customizations" and then "Themes". Duplicate the existing "FusionAuth" theme. Rename your theme to "Real Estate Application". Before you save it by clicking the blue "Save" icon, it should look like this:

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/duplicate-theme.png" alt="Duplicate your theme to allow for customization." class="img-fluid" figure=false %}

Navigate to "Tenants" and then edit the "Default" tenant. Go to the "General" tab and change the "Login theme" to be the new theme. Save the configuration when the screen looks like:

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/select-login-theme.png" alt="Select your new theme for the default tenant." class="img-fluid" figure=false %}

We'll modify this theme throughout the rest of this blog post.

## Customizing the theme

We can improve the user experience for our form by updating the theme. 

As a reminder, here's what the first step of the form looked like at the end of the form creation post.

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/first-screen-unthemed.png" alt="The first page of the custom registration flow." class="img-fluid" figure=false %}

We're going to add in understandable placeholders and some custom titles, but there's a lot more you can do in terms of making your login pages look like your website; check out the [theming documentation](/docs/v1/tech/themes/) for more.

To begin, in the administrative user interface, navigate to "Customizations" and then "Themes". Copy the theme id which you created above; mine is `de03191a-9369-4732-a9c4-0467d1f26482`.

### Modifying a theme via API

To change the hints and validation messages, you need to edit the messages file. This is a Java properties file, and can be changed via the administrative user inteface or the API. In this post, we're going to use the API to make the changes. This will show the power of the API first approach that FusionAuth takes, as well as providing a way to version control your UX, should you so desire.

These scripts assume you are running FusionAuth at `http://localhost:9011`; if not, adjust accordingly. These scripts are [also available on GitHub](https://github.com/FusionAuth/fusionauth-theme-management).

### Retrieving a theme file for local editing

First, retrieve the messages. You want them in a text file for easy editing. Below is a shell script to convert the JSON into a nice newline delimited file. Note that it assumes you have [jq](https://stedolan.github.io/jq/) and python3 installed locally.

```shell
API_KEY=<your api key>
THEME_ID=<your theme id>

curl -H "Authorization: $API_KEY" 'http://localhost:9011/api/theme/'$THEME_ID|jq '.theme.defaultMessages' |sed 's/^"//' |sed 's/"$//' |python3 convert.py > defaultmessages.txt
```

The `convert.py` file turns embedded newlines into real ones:

```python
import sys

OUTPUT = sys.stdin.read()
formatted_output = OUTPUT.replace('\\n', '\n')
print(formatted_output)
```

While this script only works for the messages, it can be tweaked to handled other theme attributes. This is left as an exercise for the reader; pull requests welcome.

### Modifying the messages file

When you run the above script, making sure to put in your API key and your theme ID, `defaultmessages.txt` ends up looking like this:

```
#
# Copyright (c) 2019-2020, FusionAuth, All Rights Reserved
#
# Licensed under the Apache License, Version 2.0 (the \"License\");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0

// ...

# Webhook transaction failure
[WebhookTransactionException]=One or more webhooks returned an invalid response or were unreachable. Based on your transaction configuration, your action cannot be completed.
```

It's about 200 lines long. If you are interested in localization, a version of this file for different languages is also available in the [`fusionauth-localization`](https://github.com/FusionAuth/fusionauth-localization) project.

To improve this form, we'll add values to the "Custom Registration" section. Sections in this property file aren't enforced (it's not a `.ini` file) but it's good to change these as little as possible, since upgrades to FusionAuth may change them and you will have merge them.

```
//...
#
# Custom Registration forms. These must match the domain names.
#
user.email=Email
user.password=Password
user.birthDate=Birthdate

#
# Custom Registration form validation errors.
#
[confirm]user.password=Confirm password
//..
```

You'll want to add the placeholders to the section with this comment: `# Custom Registration forms. These must match the domain names.`

The keys must match the form field keys we created in the last post. Here's what you'd add to set up placeholders if you're following along.

```
user.firstName=Your first name
user.mobilePhone=Your mobile phone num
registration.data.minprice=Minimum home price
registration.data.maxprice=Maximum home price
registration.data.minprice=Where are you looking?
```

Then you'll want to add validation messages to the section starting with: `# Custom Registration form validation errors.`.

You can examine the `Default validation errors` section for an example of all the errors that you can handle. You may append the fieldname to provide more specific errors. For example, to display a nice error message when price range information is omitted, you can add these properties:

```
[blank]registration.data.minprice=Minimum home price required
[blank]registration.data.maxprice=Maximum home price required
```

If you make any changes with a double quote in them, please escape it: `\"`. This will prevent issues when you turn this file back into JSON, as you'll have to do to have the changes reflected in FusionAuth. 

### Updating the theme in FusionAuth

After you've made all your changes to the `defaultmessages.txt` file, you need to turn it back into the JSON format, add the keys and quotes previously stripped off, and update the theme. `PATCH` only updates the elements of an object provided, so that's the correct HTTP method to use.

This script performs these conversions on the `defaultmessages.txt` file:

```shell
API_KEY=<your api key>
THEME_ID=<your theme id>

FILE_NAME=out.json$$

awk '{printf "%s", $0"\\n"}' defaultmessages.txt |sed 's/^/{ "theme": { "defaultMessages": "/' | sed 's/$/"}}/' > $FILE_NAME

STATUS_CODE=`curl -XPATCH -H 'Content-type: application/json' -H "Authorization: $API_KEY" 'http://localhost:9011/api/theme/'$THEME_ID -d @$FILE_NAME -o /dev/null -w '%{http_code}' -s`

if [ $STATUS_CODE -ne 200 ]; then
  echo "Error with patch, exited with status code: "$STATUS_CODE
  exit 1
fi

rm $FILE_NAME
```

Run this script with your modified `defaultMessages.txt` file. Find the registration URL by going to the "Application" tab and then viewing your application:

{% include _image.liquid src="/assets/img/blogs/advanced-registration-forms/viewing-application-details.png" alt="Finding the registration URL." class="img-fluid" figure=false %}

Open an incognito window and visit this URL. You should see nice placeholders on the first page.

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/first-screen-themed.png" alt="The first page of the registration form with the correct messages added." class="img-fluid" figure=false %}

If you fill out the first page of the form, you'll see the the second form with placeholders as well.

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/second-screen-themed.png" alt="The second page of the registration form with the correct messages added." class="img-fluid" figure=false %}

### Validation and theming

On the second screen, if you submit the registration form without providing a price range, you're shown the error messages you added above:

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/themed-with-validation-second-screen.png" alt="The second page of the registration form with error messages." class="img-fluid" figure=false %}

Validation is configured on the form field. The form controls which fields are on which steps as well as the display order of the fields.

## Adding labels

You can customize your field display more extensively by modifying the `customField` freemarker macro helper. This is in the "Helpers" section of your theme. 

Rather than use the API to do this, let's edit the helpers directly.

Navigate to "Themes" and edit your theme. Click on "Helpers" and scroll to the bbottom. You'll be modifying the `customField` macro. Here's the default implementation for this freemarker macro:

```
[#macro customField field key autofocus=false placeholder=""]
  [#assign fieldId = field.key?replace(".", "_") /]
  [#local leftAddon = field.data.leftAddon!'info' /]
  [#if field.control == "checkbox"]
    [#if field.options?has_content]
      [@checkbox_list field=field id="${fieldId}" name="${key}" required=field.required autofocus=autofocus options=field.options /]
    [#else]
      [@checkbox field=field id="${fieldId}" name="${key}" required=field.required autofocus=autofocus /]
    [/#if]
  [#elseif field.control == "number"]
    [@input id="${fieldId}" type="number" name="${key}" leftAddon="${leftAddon}" required=field.required autofocus=autofocus placeholder=theme.optionalMessage(placeholder) /]
  [#elseif field.control == "password"]
    [@input id="${fieldId}" type="password" name="${key}" leftAddon="lock" autocomplete="new-password" autofocus=autofocus placeholder=theme.optionalMessage(placeholder)/]
  [#elseif field.control == "radio"]
    [@radio_list field=field id="${fieldId}" name="${key}" required=field.required autofocus=autofocus options=field.options /]
  [#elseif field.control == "select"]
    [@select id="${fieldId}" name="${key}" required=field.required autofocus=autofocus options=field.options /]
  [#elseif field.control == "textarea"]
    [@textarea id="${fieldId}" name="${key}" required=field.required autofocus=autofocus placeholder=theme.optionalMessage(placeholder) /]
  [#elseif field.control == "text"]
    [#if field.type == "date"]
      [@input id="${fieldId}" type="text" name="${key}" leftAddon="${leftAddon}" required=field.required autofocus=autofocus placeholder=theme.optionalMessage(placeholder) class="date-picker" dateTimeFormat="yyyy-MM-dd" /]
    [#else]
      [@input id="${fieldId}" type="text" name="${key}" leftAddon="${leftAddon}" required=field.required autofocus=autofocus placeholder=theme.optionalMessage(placeholder) /]
    [/#if]
  [/#if]
[/#macro]
```

Let's add a label to each field. Right after `[#assign fieldId = field.key?replace(".", "_") /]`, add this code:

```
[#if fieldId == "user_firstName"]
  <label for="${fieldId}">First name:</label>
[/#if]
[#if fieldId == "user_email"]
  <label for="${fieldId}">Email:</label>
[/#if]
[#if fieldId == "user_password"]
  <label for="${fieldId}">Password:</label>
[/#if]
[#if fieldId == "user_mobilePhone"]
  <label for="${fieldId}">Mobile phone #:</label>
[/#if]
[#if fieldId == "registration_data_geographicarea"]
  <label for="${fieldId}">Where are you looking?:</label>
[/#if]
[#if fieldId == "registration_data_minprice"]
  <label for="${fieldId}">Minimum home price:</label>
[/#if]
[#if fieldId == "registration_data_maxprice"]
  <label for="${fieldId}">Maximum home price:</label>
[/#if]
```

When you are done, the `helpers` section should look like this:

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/theme-editor.png" alt="The theme editor after modifying the custom fields helper." class="img-fluid" figure=false %}

Open an incognito window and go through a registration flow again and you should see labels for both steps. As a bonus, because you used the `label` element, you can click on the text label and the browser will put the cursor into the text input field.

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/first-screen-with-labels.png" alt="The first registration step with labels." class="img-fluid" figure=false %}

If you submit information for the first step, you can see that these labels are present on the second step as well:

{% include _image.liquid src="/assets/img/blogs/theming-advanced-forms/second-screen-with-labels.png" alt="The second registration step with labels." class="img-fluid" figure=false %}

This example shows a glimpse of the full flexibility of themes. You can use the full power of [Apache Freemarker](https://freemarker.apache.org/). It's also worth checking out the [theme documentation](/docs/v1/tech/themes). However, this should give you a taste of how you can customize the FusionAuth authentication experience.

## Conclusion

If you are using the FusionAuth registration forms, you will want to customize the default templates, both to improve user experience and also to make sure the brand is cohesive. FusionAuth's themes can be manipulated both in the administrative user interface and via the API.

But what about the information the user provides when they are registering? This user information is available via the FusionAuth APIs, in the `user.data` and `registration.data` fields. It is also available for viewing, but not editing, in the administrative user interface. 

You can retrieve and modify user data using the [APIs](/docs/v1/tech/apis) and in a future blog post we'll see exactly how to do that.

