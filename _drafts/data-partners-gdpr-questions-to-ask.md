---
layout: blog-post
title: 'Data Partners And The GDPR: Questions To Ask'
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Technology
- Passport
- Resources
- White Paper
tags:
- Passport
- CIAM
- resources
- identity
- gdpr
- white pape
---
<p><img class="aligncenter size-full wp-image-8242" src="" alt="Data Partners and the GDRP - Questions" width="1200" height="600"></p>
<p><span style="font-weight: 400;">By now, you should be fully aware of the </span><a href="/blog/2018/04/25/understanding-data-privacy-gdpr/"><span style="font-weight: 400;">GDPR’s data requirements</span></a><span style="font-weight: 400;"> for your own application, but have you talked with your data partners? If your application takes advantage of third-party tools and components to add functionality or track user information, they need to be compliant as well. The new regulations state that data privacy needs to be maintained throughout the entire lifecycle of an application, through every data controller and processor. Take the time to ask your data partners how they ensure GDPR compliance, including their security framework and how they manage data.</span></p>
<p><!--more--></p>
<p><span style="font-weight: 400;">If your data partners do not have a clearly defined and documented data strategy, you could be exposing your company to substantial risk. Here are a few questions to get the discussion started:</span></p>
<p><b>Q: Where are their servers and computers physically located? Can you choose a location? </b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">Even if a service is cloud-based, the physical location of the servers could impact how the GDPR applies to you.</span></p>
<p><b>Q: How does their platform pseudonymize user data as it integrates with external systems?</b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">When user data is integrated with their system, is new data personally identifiable, or connected to an alias? The more disconnected, the safer it will be.</span></p>
<p><b>Q: What is their protocol for notification in case of a data breach?</b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">This is vital since your company will need to notify your users within 72 hours. Your provider should be able to notify you so you can comply.</span></p>
<p><b>Q: How do they comply with your users’ right of access and erasure? </b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">How will your company coordinate efforts so users can view their data and request data erasure?</span></p>
<h2>Questions for Identity and Access Management Partners</h2>
<p><span style="font-weight: 400;">If you are considering an identity and access management solution <a href="/products/identity-user-management?utm_source=post&amp;utm_medium=internal&amp;utm_campaign=site" target="_blank" rel="noopener">like FusionAuth</a>, here are additional questions that will provide insights into how they address security and data privacy.</span></p>
<p><b>Q: What are their default password constraints, and are they adjustable?</b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">This is a basic question to begin with. They should have a diverse set of requirements and be able to adjust them if needed.</span></p>
<p><b>Q: What password hash do they use, and do they use unique salts and/or peppers?</b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">Modern standard hash algorithms like SHA-3, Bcrypt, PBKDF2 and Scrypt are designed to make brute force attacks much more difficult. If they are using standard MD5, run.</span></p>
<p><b>Q: How difficult is it to increase their hash’s intensity for new users? Existing users? </b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">Hackers will always develop more sophisticated techniques, and computer processing power is always increasing. Will their system be able to adjust to protect against evolving attacks?</span></p>
<p><b>Q: Is their database directly accessible from outside your system? </b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">Limiting direct access to the database is a first line of defense against exploits and attacks. </span></p>
<p><b>Q: Are requests within their system secure? How robust is your authentication for internal API requests?</b></p>
<p style="padding-left: 30px;"><span style="font-weight: 400;">Using a variety of authentication credentials within the system creates an added layer of security and limits what can be done if a hacker gains access. </span></p>
<h2><span style="font-weight: 400;">Learn More: Developer’s Guide to the GDPR</span></h2>
<p><span style="font-weight: 400;">The GDPR is sure to bring changes to the way developers plan applications and manage partners. It doesn’t restrict the types of applications and experiences developers can build, but it does place the need for data privacy ahead of the business needs of the company. To learn more about the GDPR and how it will impact developer’s responsibilities, <a href="/resource/developers-guide-gdpr?utm_source=post&amp;utm_medium=internal&amp;utm_campaign=site"><span style="font-weight: 400;">download</span></a> our </span><b>Developer’s Guide to the GDPR</b><span style="font-weight: 400;">. It covers the essential information developers need to understand to stay compliant and avoid steep fines possible under the regulation.</span></p>
<p style="text-align: center;"><a class="orange-button-material medium w-button" href="/resource/developers-guide-gdpr?utm_source=post&amp;utm_medium=internal&amp;utm_campaign=site">Download Now</a></p>
