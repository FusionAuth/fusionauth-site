---
layout: blog-post
title: Allowing a user to modify the data from a custom registration form
description: Advanced registration forms let you easily build out multi-step registration forms, but how do you read the data that is stored?
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-advanced-registration-forms client-python
excerpt_separator: "<!--more-->"
---

Once a user registers with a custom form, you can view the data in the administrative user interface. But how can you allow the user to view or change the data themselves?

<!--more-->

Previously, we built a [self service registration form](TBD) for a real estate application. It was a two step form which captured specific information about their home buying needs. We also themed the [registration form](TBD). This tutorial builds on the [previous two](TBD) and will walk you through building a python flask application to let a user sign in and modify their registration data. 

While this tutorial will reference the previous registration form, you can adapt it to your own existing registration flow as well.

## Prerequisites

You'll need the following installed before you start this tutorial:

* python3
* pip3

Setting up everything else will be documented here.

## FusionAuth setup

Go to "Settings" and create an API key. We'll be using this for scripted theme management, so configure these allowed endpoints:

* `/api/user`: all methods

You may also specify no specific endpoint methods. This creates a super-user key, so beware. That is fine for this tutorial, but for production, please limit access.

## Create the basic python app

Make a directory and change into it.

Run this command to set up your virtual 

python3 -m venv venv



## Conclusion

This post reveals a glimpse of the full flexibility of FusionAuth themes. You can use the full power of [Apache Freemarker](https://freemarker.apache.org/), Java ResourceBundles, CSS, and JavaScript to customize and localize these pages. As mentioned previously, it's also worth checking out the [theme documentation](/docs/v1/tech/themes). 

If you are using the FusionAuth registration forms, be sure to customize the default templates, both to improve user experience and also to make sure the brand is cohesive. FusionAuth's themes can be manipulated both in the administrative user interface and via the API.

But what about the information the user provides when they are registering? This user information is available via the FusionAuth APIs, in the `user.data` and `registration.data` fields. It is also available for viewing, but not editing, in the administrative user interface. 

You can retrieve and modify user data using the [APIs](/docs/v1/tech/apis) and in a future blog post we'll see exactly how to do that.

