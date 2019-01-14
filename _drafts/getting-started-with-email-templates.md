---
layout: blog-post
title: Getting Started with Email Templates In FusionAuth
description: Emails should represent your brand, and FusionAuth's email templates help you do that with ease.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- tutorial
- video
- setup
image: blogs/Email-Templates-in-FusionAuth-Main.jpg
---

The email templates in FusionAuth can be customized allowing you to have your visual brand consistent across all customer touch points. In the video below we show you how to set up the email templates to be ready to use FusionAuth's integrated email features.
<!--more-->
FusionAuth ships with three templates to support standard workflows.
- Forgot Password
- Setup Password
- Verify Email

You should customize these templates with your branding, but at a minimum, you will need to make minor edits prior to using them in production. To enable emails, you will need to modify the URL used in the template to be publicly accessible.

**NOTE:** Email features require that the SMTP setup has been completed. Review your FusionAuth dashboard, if you see a box labeled "Email settings" you will need to complete that task first. View the [Using the FusionAuth Setup Wizard tutorial](NEEDLINK/blog/2018/03/06/using-the-passport-setup-wizard/) to see how to complete the SMTP configuration.

{% include _image.html src="/assets/img/blogs/Email-Templates-in-FusionAuth-Setup.jpg" alt="Email Templates in FusionAuth Setup" class="mr-md-4" figure=false %}


## Editing the Email Templates in FusionAuth

Once your SMTP configuration is complete, navigate to the **Settings** option in the left side menu, then select **Email Templates.** This is the  Email Template page. Here you will see the three default Email templates provided by FusionAuth.

{% include _image.html src="/assets/img/blogs/Email-Templates-in-FusionAuth-View-Templates.jpg" alt="Email Templates in FusionAuth View Templates" class="mr-md-4" figure=false %}

In addition to the template name, you will see the unique ID of the template, this will be used when using the email APIs during your integration. For each template you may select **Edit, View,** or **Delete** from the provided row actions. Selecting the **View** action is helpful to preview how the template will render. **Delete** will permanently remove an email template and this action cannot be undone. You will be prevented from completing the **Delete** operation if the template in use by the FusionAuth configuration. To create a new template, you may click on the green **Add** button in the top right corner.

## Edit Email Verification

Next, we will take a deeper look at the provided Email Verification template. We will modify this template to prepare it for use in our production application. To begin, click the blue **Edit** icon for the Email Verification template. This is the Edit Email Template page.

{% include _image.html src="/assets/img/blogs/Email-Templates-in-FusionAuth-Edit-Templates.jpg" alt="Email Templates in FusionAuth Edit Templates" class="mr-md-4" figure=false %}


On the top section labeled **Base Information** you will see the **Template Id**. This value is used by the Email APIs during integration and cannot be changed. The remainder of the fields in this section may be modified. The **Default Subject** and the **Default From Name** fields are marked with a code symbol indicating they may utilize replacement variables.

## Required: Modify the Default URL

Once the Base Information has been modified to your liking we will move to the bottom section labeled **Options**. Here you have access to edit the HTML and Text versions of the templates.

{% include _image.html src="/assets/img/blogs/Email-Templates-in-FusionAuth-Edit-Code.jpg" alt="Email Templates in FusionAuth Edit Code" class="mr-md-4" figure=false %}

The URL in the default template is configured to use **localhost** which will not work properly for your production instance. You will need to modify the HTML and Text body to reflect the publicly available FusionAuth URL. There is a preview button in the bottom right that will allow you to review how the email body will look prior to saving the template changes.

While most modern Email clients will render emails using the HTML template, you must also provide a plain text version of your Email Template. Repeat the same process for the Text template.  

## Edit the Localization

The last tab on the bottom section of the page is labeled **Localization**. Adding localized versions of your template allows FusionAuth to select a localized version based upon the recipient's preferred locale.

{% include _image.html src="/assets/img/blogs/Email-Templates-in-FusionAuth-Localization.jpg" alt="Email Templates in FusionAuth Localization" class="mr-md-4" figure=false %}

Using Email Template localization allow you to communicate with your users in their preferred language which makes for a better user experience.

You can create customized HTML and text versions for the localized template. If you leave this blank, FusionAuth with use the HTML you created on the Edit page. Be sure to click **Submit** in the bottom left corner. Once submitted you will see the name of your localized template on the **Locale** heading on the **Localization** tab.

To save all changes on your email template, click the blue **Save** in the top right. Once saved you will return to the Email Template page. For each email template you want to use, you will need to repeat these steps.

If you have additional questions or require assistance please let us know through [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub").

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- FusionAuth
- Tutorials
-->
