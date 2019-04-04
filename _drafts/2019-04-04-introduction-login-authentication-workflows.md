---
layout: blog-post
title: Introduction to Login and Authentication Workflows
description: Introduction to application types, login and authentication workflows. Start here to learn how to architect and design an effective authentication system.
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- authentication workflows
image: blogs/types-logins-authentication-workflows.png
---

So you are building an application and you need login and authentication for your users. No problem! Just build a form so the user can submit a username and password and you are good to go, right? We all wish it was this simple. The fact is, there are many different application types and as many different types of authentication methods. Which is best?

<!--more-->

## Basic Application Types

The type of login and authentication workflows that are best depend a lot on your application. Is it a web app served through a browser, or is it built specifically for a device? This will make a big difference in how the app can authenticate users. Here are three of the most common application types and a brief description of each. Are there more application types? Of course there are, and there are many ways to blend between these basic types, too. Understanding these basics will help guide your decisions when defining the most effective authentication workflows for you.

**Traditional web application**<br>
Simply put, these are applications that load a web page in a browser. They make a request to a server that returns a page based on the URL. When the user clicks a link, button or submits a form, the browser makes a new request and the server returns a new page with a different URL. A traditional web application has multiple pages that deliver the user’s information and experience.

**Single-page application**<br>
Single-page applications (SPAs) are similar to traditional web applications, but they load a single URL to the browser and dynamically update what is displayed as the user interacts with it. Many modern web applications are built this way to provide a more immediate and reactive experience that users appreciate.

**Native mobile application**<br>
Unlike traditional and single-page applications, native mobile applications aren’t viewed in a browser. They are downloaded from a store (or installed from some other type of media) and are run on the operating system of the device they are on. The apps from the Apple Store or Google Play are native apps and run on phones, tablets, or desktop devices.

## Login and Authentication Workflows

<img src="/assets/img/articles/login-type-xmlhttprequest.png" alt="" class="float-left img-fluid" /> Understanding the application type is important because it puts controls on the methods used to authenticate users and the workflows that you will need to build. Traditional apps can only use the two HTTP methods `GET` and `POST` that are supported by browsers. Single-page apps have more flexibility by using the `XMLHttpRequest` functionality of the browser's JavaScript, so they can invoke all of the standard HTTP methods including `GET`, `POST`, `PUT`, and `DELETE`. Native applications usually call APIs to handle user interaction and input and take advantage of various libraries and protocols that manage user access.


Once you choose your application type, you can plan out the specific authentication workflows that will work best for your app. Think through your authentication scenarios and understand what you’ll need from the beginning-it sucks to have to come back and rework it all later. Trust me.

<img src="/assets/img/articles/diagram-example.svg" alt="" class="float-right mb-3 ml-3 img-fluid" />

To take the next step and go into detail on specific authentication workflows, read **FusionAuth’s** [Types of Logins and Authentication Workflows](/articles/logins/types-of-logins-authentication-workflows). This resource is designed to help you architect and design an effective authentication system for an application. It doesn’t list every possible option, but gives the most common and recommended authentication workflows used by a majority of developers.

Each workflow diagram details the authentication workflows for a user visiting a store and forum for the same company. In the store the user is required to login to view their shopping cart. In the forum they must login to view forum posts. We also provide examples of **common attack vectors** that hackers could use if portions of the system are compromised. These cases might be theoretical or based on known exploits such as XSS (cross-site scripting). We hope you find it useful.

[Types of Logins and Authentication Workflows](/articles/logins/types-of-logins-authentication-workflows "Jump to Types of Logins and Authentication Workflows"){: .btn .btn-primary}

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, passwordless login, social login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn more about FusionAuth](/ "FusionAuth Home"){: .btn .btn-primary}
