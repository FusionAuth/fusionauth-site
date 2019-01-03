---
layout: blog-post
title: Download and Install FusionAuth Tutorial - Linux
description: Download and install FusionAuth on Linux with these easy steps.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- FusionAuth
- Tutorials
- Resources
tags:
- FusionAuth
- code
- Identity Management
- tutorial
- video
image: blogs/NEEDIMAGE
---
Designed to save developer time and effort, there are only a few simple steps to download and install FusionAuth in your test or production environment. The following tutorial will explain how to install FusionAuth on a Linux system and be up and running in just a few minutes. This is one aspect that makes FusionAuth unique. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. FusionAuth will install and run on a wide variety of systems including:
<!--more-->
- Linux - all distributions (64-bit)
- Mac OS X 10.8 (Mountain Lion) or newer
- Windows Server 2008 SP2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows Server 2008 R2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows 7 SP1 (64-bit) w/ Windows Management Framework 3.0 or newer

We will share tutorials for these systems in the near future, but please contact us at dev@fusionauth.io if you need help before they are released.

## Get Started

Before you start installing onto Linux, do a quick check on your system to make sure it meets the minimum requirements. You will need:

- A 64-bit linux build of an RPM or Debian-based distribution.
- A MySQL or PostgreSQL database

Refer to the latest documentation on [fusionauth.io/docs](https://fusionauth.io/docs/v1/tech/ "Visit FusionAuth Documentation") for minimum versions. If you don't yet have a database installed, do this first before you continue.

## Download and Install FusionAuth

Start by going to fusionauth.io and logging into your account. (Use the [FusionAuth Setup Wizard](https://fusionauth.io/blog/NEEDLINK/using-the-passport-setup-wizard/ "FusionAuth Setup Wizard post") to establish your account.) On your accounts page you will see your licenses. On the right side select the Download button. This will take you to the product download page. In this example we are installing onto Ubuntu Linux, so we will download the Debian packages.

<img class="aligncenter size-full wp-image-8209" src="" alt="Download and Install FusionAuth Downloads" width="1200" height="591">

FusionAuth is comprised of two web services, the FusionAuth backend and FusionAuth search engine. The FusionAuth Backend bundle provides access to the API and the web-based user interface. The search engine is required by FusionAuth and provides full-text search uses Elasticsearch. In this video we will download and install both services.

<img class="aligncenter size-full wp-image-8210" src="" alt="Download and Install FusionAuth Search" width="1200" height="591">

We will be using [Wget](https://www.gnu.org/software/wget/ "Jump to Wget site") to download the packages. If you do not have the command line tool Wget available you may optionally download the packages via a browser and transfer them to the target system.

First, you’ll want to right-click on the file and copy the destination to your clipboard. Then, paste it at the end of your Wget command. Once you have the backend bundle downloaded, repeat the same steps for the search engine files.

<img class="aligncenter size-full wp-image-8211" src="" alt="Download and Install FusionAuth Install Code" width="1200" height="591">

Next, you will need to install the two packages that you just downloaded. I am using the "dpkg -i" command to install backend and search engine. Finally, you will need to start these services. **IMPORTANT: Start the FusionAuth Search Engine before the FusionAuth back end.**

## Complete the FusionAuth Setup

Now that both services have been started. You will complete the setup using the browser. In your browser you will navigate to the IP address or hostname of the server where you installed FusionAuth. This may be localhost if you are installing locally. By default FusionAuth Backend will be listening on port 9011 so we will add that to the address. When the page loads you will be prompted for your license key.

<img class="aligncenter size-full wp-image-8212" src="" alt="Download and Install FusionAuth Maintenance" width="1200" height="591">

If you do not have the key handy, you can find it on your FusionAuth account page.

<img class="aligncenter size-full wp-image-8213" src="" alt="Download and Install FusionAuth Get Key" width="1200" height="591">

Once the key is verified you will be prompted to complete the database configuration in order to finish the setup. If you need any help with these steps, you can refer to our [installation documentation](https://fusionauth.io/docs/1.x/tech/getting-started/ "Open Getting Started Documentation Page") at fusionauth.io, or feel free to email dev@fusionauth.io.

## Learn More About the FusionAuth API

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.
