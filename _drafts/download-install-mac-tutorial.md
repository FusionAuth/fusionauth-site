---
layout: blog-post
title: Download and Install FusionAuth - Mac OS
description: Download and install FusionAuth on Mac OS with these easy steps.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- code
- Identity Management
- tutorial
- video
image: blog/NEEDIMAGE
---

Similar to the [Linux process](/blog/NEEDLINK/download-install-passport-tutorial/ "FusionAuth Linux Install Tutorial"), there are only a few steps to download and install FusionAuth in your test or production environment. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. The following tutorial will explain how to install FusionAuth for Mac OS and be up and running in just a few minutes. It will also install and run on:

- Linux - all distributions (64-bit) - [View installation](/blog/NEEDLINK/download-install-passport-tutorial/ "FusionAuth Linux Install Tutorial")
- Mac OS X 10.8 (Mountain Lion) or newer
- Windows Server 2008 SP2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows Server 2008 R2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows 7 SP1 (64-bit) w/ Windows Management Framework 3.0 or newer

We will share tutorials for these systems in the near future, but please contact us at dev@fusionauth.io if you need help before they are released.
<!--more-->

## Get Started

Before you start installing onto MacOS, do a quick check on your system to make sure it meets the minimum requirements. You will need:

- Mac OS X 10.8 Mountain Lion or newer
- MySQL 5.6.1 database or newer
- Or PostgreSQL 9.5 database or newer

**NEED IMAGE Download and Install FusionAuth MacOS Requirements**


Refer to the latest documentation on [fusionauth.io/docs](/docs "View documentation") for minimum requirements. Be sure to install your database before you continue.

## Download and Install FusionAuth

Start by going to fusionauth.io and logging into your account. (If you haven’t already, use the [FusionAuth Setup Wizard](/blog/NEEDLINK/using-the-passport-setup-wizard/ "FusionAuth Setup Wizard post") to establish your account.) Select the “my account” option in the top right of the page. Find your FusionAuth Licenses and select the blue download button on the right side of the page.

You are now on the downloads page. This page has links to all of the needed files to install and run FusionAuth. You will notice there are file types for Linux, Mac OS and Windows. For this demonstration I will be using the MAC OS X files.

**NEED IMAGE Download and Install FusionAuth MacOS Downloads**

There are two file packages to download - the Backend AND the Search Engine Package. Make sure to download both, I will briefly cover what each one is for in a later step.

Selecting the FusionAuth Backend ZIP file for MAC will download the file to wherever your browser sends downloaded files. Again, make sure you download BOTH the Search engine AND the backend for OSX. As a final note, at this time you can ignore the Database downloads section. The FusionAuth backend will automatically create a database for you upon your initial login to FusionAuth.

## Install FusionAuth Search Engine

Now that you have the zip files for the backend and search engine downloaded we will need to extract and install them. Let start with the search engine. The Search Engine package contains the Elasticsearch Service that FusionAuth uses to index and search for users.

Use Finder to navigate to where you downloaded the search engine package. In my system I used the <span class="lang:java decode:true crayon-inline ">Downloads</span> folder. From there extract the package to any destination folder that you like. For convenience, I have created the directory ```inversoft``` to extract the files to.

After extracting,  you will want to start the search engine service. The search engine should always be started before the backend. To start this service open Terminal, and enter this command

```
$ > PASSPORT_HOME>/fusionauth-search-engine/elasticsearch/bin/elasticsearch -d
```

**NEED IMAGE Download and Install FusionAuth MacOS Elasticsearch**

Keep in mind your file location may be different than this tutorial so replace the directory with your own directory that contains the search engine files.

## Install FusionAuth Backend

Repeat the same process to extract and move the backend files. The backend is the web service that handles all API calls and provides the web-based management interface to FusionAuth.

To start the backend service run this command from your terminal.

```
$ <PASSPORT_HOME>/fusionauth-backend/apache-tomcat/bin/startup.sh
```

**NEED IMAGE Download and Install FusionAuth MacOS Backend**

Next, access FusionAuth’s Maintenance Mode setup via the browser. If you installed FusionAuth Backend on your local machine, you’ll access this interface by opening ```http://localhost:9011``` in your browser. If FusionAuth is running on a remote server, change the server name in the URL to match your server’s name.

The first step of Maintenance Mode will prompt you to enter your license Id. You can retrieve your license Id from the FusionAuth website by logging into your FusionAuth account and copying the key from the licenses page.

## Configure FusionAuth’s Database

The next step will be to configure the database connection to allow FusionAuth to configure the database. To complete this step you will need to confirm the database type, host, port and database name. The connection type defaults to MySQL with the default MySQL port of 3306. If you are connecting to a PostgreSQL database the default port is 5432, although your configuration may be different.

**NEED IMAGE Download and Install FusionAuth MacOS Database**

In the **Super User credentials** section you will need to supply FusionAuth with a username and password to the database so that it may create a new database and configure the FusionAuth schema. The provided credentials must have adequate authority to complete this successfully. These credentials are not persisted and only utilized to complete maintenance mode.

The final section labeled <strong>FusionAuth credentials</strong> will be used to define a new database user to own the FusionAuth schema and connect to the database when FusionAuth starts up. While default values for this section have been provided, at minimum the password field should be modified to utilize a password of higher entropy. These credentials will be saved to the **fusionauth.properties**  configuration file.

Click the submit button once you have completed this form and if the provided credentials and database connection information was correct you should see an **in progress** panel indicating that FusionAuth is starting up. Once this step completes FusionAuth will be running and ready for you to complete the initial configuration using the [FusionAuth Setup Wizard](/blog/NEEDLINK/using-the-passport-setup-wizard/ "FusionAuth Setup Wizard post"). If you need any help with these steps, efer to our [installation documentation](/docs/1.x/tech/getting-started/ "Open Getting Started Documentation Page") at fusionauth.io, or feel free to email dev@fusionauth.io.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- FusionAuth
- Tutorials
- Resources
-->
