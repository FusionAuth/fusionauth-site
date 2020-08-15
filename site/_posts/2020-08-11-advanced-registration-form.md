---
layout: blog-post
title: How to use FusionAuth's advanced registration forms
description: Advanced registration forms let you easily build out multi-step registration forms.
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-advanced-registration-forms client-python
excerpt_separator: "<!--more-->"
---

FusionAuth is an auth system, but it also provides user management. If you're using a customer identity and access management system (CIAM), you want to allow people to register for your application. With FusionAuth, you can now build custom registration forms to capture application specific data.

<!--more-->

In this blog post, you'll build a custom registration form for a real estate application. When the user registers, you'll use a two step form to capture additional information about their home buying needs.

We're going to capture the following information about new users:

* Email
* Password
* First name
* Phone number
* Geographic area
* Minimum house price
* Maximum house price

Because this is a lot of information to ask for, break this up into two pages. We'll be walking through everything using the administrative user interface, but everything can be done via [the APIs](/docs/v1/tech/apis/forms), should you need to automate registration form creation.

## Setup

If you don't have FusionAuth running, set it up [is outlined here](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). 

The next thing you need to do is get a license key. *Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing).*

[Activate your paid edition](/docs/v1/tech/reactor) and then you can start building your form.

Go to "Settings" and create an API key. We'll be using this for easier theme management and to read from user data.XXX perms?

## Use a custom theme

We're going to create a new theme. While we won't be modifying it extensively, we will be changing the error messages and default values. Since themes are assigned at the tenant level, you can either change the theme for the default tenant (which is what this tutorial will do) or create a new tenant. FusionAuth supports multiple tenants out of the box.

Navigate to "Customizations" and then "Themes". Duplicate the existing "FusionAuth" theme. Rename your theme to "Real Estate Application" and save it. 

Before you save it, it should look like this:

Pic TBD

Navigate to "Tenants" and then edit the "Default" tenant. Go to the "General" tab and change the "Login theme" to be the new theme. Save the configuration when the screen looks like:

Pic TBD

We'll modify this theme after we've created the form.

## Create form fields

Navigate to "Customizations" and then "Form fields". Here are the form fields that are available by default. Each of these has a key, such as `user.email`, and these are called "predefined keys".

Pic TBD

You can add as many custom fields as you'd like. Each of these use custom keys. Let's add a couple for our sign up form. Let's add a key of `minprice`. We'll have the data type be a number and use the text form control. Let's leave it as optional. While it is useful information, we don't want to stop someone from signing up if they don't know it or aren't comfortable sharing it. Here's what it might look like before we save the configuration.

Pic TBD

Note that the fieldname is `registration.data.minprice`, which is the full custom key name. We can create as many custom fields as we want and store them in this data field. We can also create custom fields tied to the user.

As a reminder, [a registration](/docs/v1/tech/core-concepts/registrations) is a link between a user and an application. Since this is a real estate application, we'll want information that is germane to this app to be stored on the registration. If we were later to build a mortgage application, there'd be different data associated with that registration. But, on the other hand, if we wanted to ask for additional information better associated with the user, such as their income, that would be best stored in the `user.data` field.

Let's also add a 'maxprice' and use the same settings. It'll have a different key, but is also a number and should be optional.

Finally, we'll add a geographic area. It'll be a string, but let's use the textarea form control to give people a bit more space to tell us what they are looking for.

Pic TBD

There are a number of other types of fields and form controls you can use. You can even store arrays and maps in the custom data. Please consult [the API docs](/docs/v1/tech/apis/form-fields) for more information. We've added three fields and they are available for use in the form we're going to build. 

Pic TBD

## Build the form

Next you need to build the form. Here you can mix and match any of the standard, predefined fields and our custom fields. They may appear in any order on the form, whatever makes the most sense.

The only real requirements are:

* You must have either an email or a username field in one of your steps.
* You must have a password field in one of your steps.

To being building your form, navigate to "Customizations" and then to "Forms". Click the green "+" to create a new form. Name the form. Add the first step and add the following fields:

* Email
* Password
* First name
* Phone number

Pic TBD

You can add as many steps as you want. Create a second step and add these fields:

* Geographic area
* Minimum house price
* Maximum house price

Pic TBD

You can rearrange the field order from this screen, but to change attributes you have to return to the "Fields" section.

When you're done, save the form.

## Use the form

The next step is to use the form for your application. 

Navigate to "Applications" and create a new application. Name it "Real estate search". 

You have to provide a redirect URL for when registration succeeds. Navigate to the "OAuth" tab and enter "https://fusionauth.io" or some other public website that you wouldn't mind landing on once you are registered. 

Go to the "Registration" tab and enable "Self service registration."

Then you want to check the "Advanced" option and select the form you just created. 

Click "Save".

When you edit the application, you should see a screen something like this:

Pic TBD

You can easily find the registration URL by clicking on the green magnifying glass on the list of applications and looking for the "Registration URL".

Pic TBD

Let's check it out! Open up an incognito window and paste the "Registration URL" into the URL bar. 

You can see that the first screen asks for first name, email address, password and phone number:

Pic TBD

And the second has a text area and asks for the pricing info. If you flip back to your administrative user interface, where you are logged into FusionAuth, and navigate to "Users", you'll see the user has been registered. If you go to the "User data" tab of the new user's details page, you can see the information they filled out as well.

Pic TBD

But there are some issues. The placeholders for the fields are not very user friendly. `user.firstName` is understandable, but it'd be better to say "Your first name". And the geographic area doesn't even have a description, making it hard for people to know what to put in there.

We can solve these by updating the theme.

Make sure you close the incognito window. You've been logged in, and when you make the changes, you'll want to be signed out. Closing the incognito window is the easiest way to do that.

## Theme the form

Let's theme the form to make the registration look a bit better. Themes are a big topic, so this tutorial isn't going to cover making the entire experience beautiful. If you are interested in that, check out the [themes documentation](/docs/v1/tech/themes/) for more information. 

What you are going to do is:

* Correct the hints in the text boxes so it is easier for the registering user to know what to put in the boxes
* Add a title to the geographic area textbox

In the administrative user interface, navigate to "Customizations" and then "Themes". Copy the theme id; mine is `de03191a-9369-4732-a9c4-0467d1f26482`.

### Modifying a theme via API

At this point, you have two options. You can edit the messages directly in the user interface, or you can use the API to edit them on the command line. In this tutorial, we're going to do the latter for the messages. These scripts assume you are running FusionAuth on localhost:9011, if not, adjust accordingly. These scripts are [also available on GitHub](https://github.com/FusionAuth/fusionauth-theme-management).

The first thing to do is to pull down the messages into a text file for easy editing. Below is a shell script to convert the JSON into a nice newline delimited file. It assumes you have [jq](https://stedolan.github.io/jq/) and python3 installed. 

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

`defaultmessages.txt` ends up looking like this:

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

It's long, about 200 lines. A version of this file for different languages is also available in the [`fusionauth-localization`](https://github.com/FusionAuth/fusionauth-localization) project.

You will want to focus on the "Custom Registration" section.

```
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
```

You'll want to add the placeholders to the section with this comment:
```
# Custom Registration forms. These must match the domain names.
```

The keys must match the form field keys we created earlier. Here's what you'd add to set up placeholders.

```
user.firstName=Your first name
user.mobilePhone=Your mobile phone num
registration.data.minprice=Minimum home price
registration.data.maxprice=Maximum home price
registration.data.minprice=Where are you looking?
```

Then you'll want to add validation messages to the section starting with
```
# Custom Registration form validation errors.
```

You can examine the `Default validation errors` section for an example of all the errors that you can handle. You may append the fieldname to provide more specific errors. For example:

```
[blank]registration.data.minprice=Minimum home price required
[blank]registration.data.maxprice=Maximum home price required
```

Note that if you make any changes with a double quote in them, please escape it: `\"`. This will help when you turn this file back into JSON. After you've made all your changes to the `defaultmessages.txt` file, you'll turn it back into the JSON format, add the keys and quotes previously stripped off, and the call `PATCH` on this theme object. `PATCH` only updates the elements of an object provided. You can do this with this shell script:

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

When you go to your registration URL, you should now see nice placeholders:

pic TBD
{% include _image.liquid src="/assets/img/blogs/breached-password-detection/enable-breached-password-check.png" alt="Enabling breached password detection." class="img-fluid" figure=false %}

### Additional validation

Should you need it, there is additional validation available. You can ensure that a field matches a certain regular expression or that it matches a confirmation field. The latter may be useful if you are asking for sensitive data that you want to ensure the user provides correctly.

All this is set at the form field level. The form is the display order of the form fields and nothing more.

## Conclusion

Allowing your customers to quickly and easily register themselves lets you focus on the parts of your application that they are actually registering for. With advanced registration forms, you can now create, via the API or the administrative user interface, unlimited registration forms. You can then associate these forms easily with your applications, gathering user information over multiple steps.

This user information is available from the FusionAuth APIs, in the `user.data` and `registration.data` fields. You can retrieve and modify that data using the [APIs](/docs/v1/tech/apis) and in a future blog post we'll see exactly how to do that.
