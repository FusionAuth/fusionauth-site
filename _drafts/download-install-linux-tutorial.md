---
layout: blog-post
title: Download and Install FusionAuth Tutorial - Linux
description: Download and install FusionAuth on Linux with these easy steps.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- code
- Identity Management
- tutorial
- video
image: blogs/macos-install.jpg
---
Designed to save developer time and effort, there are only a few simple steps to download and install FusionAuth in your test or production environment. The following tutorial will explain how to install FusionAuth on a Linux system and be up and running in just a few minutes. This is one aspect that makes FusionAuth unique. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. FusionAuth will install and run on a wide variety of systems including:
<!--more-->
- Linux - all distributions (64-bit)
- macOS 10.8 (Mountain Lion) or newer
- Windows Server 2012 R2 (64-bit) w/ Windows Management Framework 5.0 or newer
- Windows 10 (64-bit) w/ Windows Management Framework 5.0 or newer

## Get Started

Before you start installing onto Linux, do a quick check on your system to make sure it meets the minimum requirements. You will need:

- A 64-bit Linux distribution
- A MySQL or PostgreSQL database

It is not necessary that the database be installed locally on the Linux system, as long as you can connect using a JDBC URL, FusionAuth will be able to utilize the database.

Refer to the latest documentation for [System Requirements](/docs/v1/tech/installation-guide/system-requirements "Visit FusionAuth System Requirements") for minimum versions. If you don't yet have a database installed or have one accessible, do this first before you continue.

## Installation Options

The easiest way to get up and running on Linux will be to use the Linux [Fast Path](/docs/v1/tech/installation-guide/fast-path "Fast Path") installation. This method will download the zip packages and unzip them in the current working directory and have you up and running quickly. 

The Fast Path installation may not be right for everyone, it is generally the most useful to get up and running quickly in a development environment. In this article we will be performing a manual installation using the Debian package. This installation method may be more suitable for a production instance of FusionAuth.

If you're using an RPM based Linux distribution, the steps will be nearly identical, you may follow this guide and substitute the RPM package for the debian using the `rpm -i` installation command instead of the `dpkg -i` used in this example. 

FusionAuth may also be run in a Docker container or a Kubernetes cluster, review our installation guide for more information. If you're still on board for a package based Linux installation, then let's do this.

## Download and Install FusionAuth

Start by heading to the [Download](/downloads) page. In this example we are installing onto Ubuntu Linux, so we will download the Debian packages.

FusionAuth is comprised of two web services, the FusionAuth application (`fusionauth-app`) and FusionAuth search engine (`fusionauth-search`). The FusionAuth App bundle provides access to the API and the web-based user interface. The FusionAuth search engine is required by FusionAuth and provides full-text search uses Elasticsearch. While you may optionally use an existing Elasticsearch instance if it meets the minimum requirements, for this example  we will be installing Elasticsearch by way of the `fusionauth-search` package.

We will be using `wget` to download the packages. If you do not have `wget` but would like to install it, you may use `apt-get` command as follows. 

```
sudo apt-get install wget
```

You may also download the packages via a browser and transfer them to the target system if you do not have `wget` and are unable to install it. If you want to find some additional information on what packages you'll be downloading, see the [Packages](/docs/v1/tech/installation-guide/packages) section of the installation guide. 

We will be downloading both the `fusionauth-app` and the `fusionauth-ssearch` bundles. To begin, once your on the  [Download](/downloads) page right-click on the file and copy the destination to your clipboard. Then, paste it at the end of your `wget` command. Repeat this for both bundles, see the example commands below.

```
wget https://storage.googleapis.com/inversoft_products_j098230498/products/fusionauth/1.3.1/fusionauth-app_1.3.1-1_all.deb
wget https://storage.googleapis.com/inversoft_products_j098230498/products/fusionauth/1.3.1/fusionauth-search_1.3.1-1_all.deb
```

In this example we have downloaded version `1.3.1`, you will likely be downloading the latest version which may be more recent than this version. Now that you have the two packages downloaded you will need to install the packages. I am using the `dpkg -i` command to install the Debian packages, see below for an example usage of the install command.

```
dpkg -i fusionauth-app_1.3.1-1_all.deb
dpkg -i fusionauth-search_1.3.1-1_all.deb
```

The last step is to start up FusionAuth. 

```
sudo service fusionauth-search start
sudo service fusionauth-app start
```

## Complete the FusionAuth Setup

Now that both services have been started. You will complete the setup using the browser. In your browser you will navigate to the IP address or hostname of the server where you installed FusionAuth. This may be localhost if you are installing locally. By default FusionAuth Backend will be listening on port 9011 so we will add that to the address. 

Open your browser to the address of FusionAuth, in our example we'll be using `http://localhost:9011`. You should find FusionAuth in maintenance mode, complete the search and database configuration and then you will be prompted to create an admin account and then be logged into FusionAuth.

If you'd like to see additional information on these next steps, review the following installation guides and tutorials.

- [Maintenance Mode](/docs/v1/tech/installation-guide/fusionauth-app#maintenance-mode)
- [Setup Wizard](/docs/v1/tech/tutorials/setup-wizard)

## Learn More About the FusionAuth API

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- FusionAuth
- Tutorials
- Resources
-->
