---
layout: blog-post
title: Getting Started with Email Templates In FusionAuth
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Passport
- Tutorials
tags:
- Passport
- tutorial
- video
- setup
---
<p><img class="aligncenter size-full wp-image-8179" src="" alt="Email Templates in FusionAuth Main" width="1200" height="591"></p>
<p><span style="font-weight: 400;">The email templates in FusionAuth can be customized allowing you to have your visual brand consistent across all customer touch points. In the video below we show you how to set up the email templates to be ready to use FusionAuth's integrated email features.</span></p>
<p><!--more--></p>
<p><span style="font-weight: 400;">FusionAuth ships with three templates to support standard workflows. </span></p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Forgot Password</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Setup Password</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Verify Email</span></li>
</ul>
<p><span style="font-weight: 400;">You should customize these templates with your branding, but at a minimum, you will need to make minor edits prior to using them in production. To enable emails, you will need to modify the URL used in the template to be publicly accessible.</span></p>
<p><span style="font-weight: 400;"><strong>NOTE:</strong> Email features require that the SMTP setup has been completed. Review your FusionAuth dashboard, if you see a box labeled "Email settings" you will need to complete that task first. View the </span><a href="/blog/2018/03/06/using-the-passport-setup-wizard/" target="_blank"><span style="font-weight: 400;">Using the FusionAuth Setup Wizard tutorial</span></a><span style="font-weight: 400;"> to see how to complete the SMTP configuration.</span></p>
<p><img class="aligncenter size-full wp-image-8181" src="" alt="Email Templates in FusionAuth Setup" width="1200" height="591"></p>
<h2><span style="font-weight: 400;">Editing the Email Templates in FusionAuth</span></h2>
<p><span style="font-weight: 400;">Once your SMTP configuration is complete, navigate to the </span><b>Settings</b><span style="font-weight: 400;"> option in the left side menu, then select </span><b>Email Templates.</b><span style="font-weight: 400;"> This is the  Email Template page. Here you will see the three default Email templates provided by FusionAuth. </span></p>
<p><img class="aligncenter size-full wp-image-8182" src="" alt="Email Templates in FusionAuth View Templates" width="1200" height="591"></p>
<p><span style="font-weight: 400;">In addition to the template name, you will see the unique ID of the template, this will be used when using the email APIs during your integration. For each template you may select </span><b>Edit, View, </b><span style="font-weight: 400;">or </span><b>Delete</b><span style="font-weight: 400;"> from the provided row actions. Selecting the </span><b>View</b><span style="font-weight: 400;"> action is helpful to preview how the template will render. </span><b>Delete</b><span style="font-weight: 400;"> will permanently remove an email template and this action cannot be undone. You will be prevented from completing the </span><b>Delete</b><span style="font-weight: 400;"> operation if the template in use by the FusionAuth configuration. To create a new template, you may click on the green <strong>Add</strong> button in the top right corner.</span></p>
<h2><span style="font-weight: 400;">Edit Email Verification</span></h2>
<p><span style="font-weight: 400;">Next, we will take a deeper look at the provided Email Verification template. We will modify this template to prepare it for use in our production application. To begin, click the blue <strong>Edit</strong> icon for the Email Verification template. This is the Edit Email Template page.</span></p>
<p><img class="aligncenter size-full wp-image-8183" src="" alt="Email Templates in FusionAuth Edit Templates" width="1200" height="591"></p>
<p><span style="font-weight: 400;">On the top section labeled <strong>Base Information</strong> you will see the<strong> Template Id</strong>. This value is used by the Email APIs during integration and cannot be changed. The remainder of the fields in this section may be modified. The <strong>Default Subject</strong> and the <strong>Default From Name</strong> fields ware marked with a code symbol indicating they may utilize replacement variables. </span></p>
<h2><span style="font-weight: 400;">Required: Modify the Default URL</span></h2>
<p><span style="font-weight: 400;">Once the Base Information has been modified to your liking we will move to the bottom section labeled <strong>Options</strong>. Here you have access to edit the HTML and Text versions of the templates. </span></p>
<p><img class="aligncenter size-full wp-image-8184" src="" alt="`Email Templates in FusionAuth Edit Code" width="1200" height="591"></p>
<p><span style="font-weight: 400;">The URL in the default template is configured to use </span><b>localhost</b><span style="font-weight: 400;"> which will not work properly for your production instance. You will need to modify the HTML and Text body to reflect the publicly available FusionAuth URL. There is a preview button in the bottom right that will allow you to review how the email body will look prior to saving the template changes. </span></p>
<p><span style="font-weight: 400;">While most modern Email clients will render emails using the HTML template, you must also provide a plain text version of your Email Template. Repeat the same process for the Text template.  </span></p>
<h2><span style="font-weight: 400;">Edit the Localization</span></h2>
<p><span style="font-weight: 400;">The last tab on the bottom section of the page is labeled <strong>Localization</strong>. Adding localized versions of your template allows FusionAuth to select a localized version based upon the recipient's preferred locale.</span></p>
<p><img class="aligncenter size-full wp-image-8185" src="" alt="Email Templates in FusionAuth Localization" width="1200" height="591"></p>
<p><span style="font-weight: 400;">Using Email Template localization allow you to communicate with your users in their preferred language which makes for a better user experience.</span></p>
<p><span style="font-weight: 400;">You can create customized HTML and text versions for the localized template. If you leave this blank, FusionAuth with use the HTML you created on the Edit page. Be sure to click <strong>Submit</strong> in the bottom left corner. Once submitted you will see the name of your localized template on the </span><b>Locale</b><span style="font-weight: 400;"> heading on the </span><b>Localization</b><span style="font-weight: 400;"> tab. </span></p>
<p><span style="font-weight: 400;">To save all changes on your email template, click the blue </span><b>Save</b> icon<span style="font-weight: 400;"> in the top right. Once saved you will return to the Email Template page. For each email template you want to use, you will need to repeat these steps.</span></p>
<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/J44P0INFu-c" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe></div>
<p><span style="font-weight: 400;">In this tutorial for email templates in FusionAuth we have taken a look at email templates in FusionAuth and have prepared the Email Verification Template for use in production. If you have additional questions or require assistance please send us a note at </span><a href="mailto:dev@fusionauth.io"><span style="font-weight: 400;">dev@fusionauth.io</span></a><span style="font-weight: 400;">.</span></p>
<h2><span style="font-weight: 400;">Learn More About FusionAuth</span></h2>
<p><span style="font-weight: 400;">FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available on the market. More than a login tool, we provide registration, data search, user segmentation and advanced user management across applications. </span><a href="https://goo.gl/kk4igG"><span style="font-weight: 400;">Find out more</span></a><span style="font-weight: 400;"> about FusionAuth and sign up for a free trial today.</span></p>
<p style="text-align: center;"><a class="orange-button-material small w-button" href="https://goo.gl/kk4igG">Try FusionAuth</a></p>
