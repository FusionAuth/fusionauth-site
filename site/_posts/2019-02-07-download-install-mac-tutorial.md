---
layout: blog-post
title: Download and Install FusionAuth - macOS
description: Download and install FusionAuth on macOS with these easy steps.
author: Brian Pontarelli
image: blogs/macos-install.jpg
category: blog
excerpt_separator: "<!--more-->"
---

Designed to save developer time and effort, there are only a few simple steps to download and install FusionAuth in your test or production environment. The following tutorial will explain how to install FusionAuth on your Macbook and be up and running in just a few minutes. This is one aspect that makes FusionAuth unique. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. FusionAuth will install and run on a wide variety of systems including:

<!--more-->

- Linux - all distributions (64-bit)
- macOS 10.8 (Mountain Lion) or newer
- Windows Server 2012 R2 (64-bit) w/ Windows Management Framework 5.0 or newer
- Windows 10 (64-bit) w/ Windows Management Framework 5.0 or newer

## Get Started

Before you start installing onto macOS, do a quick check on your system to make sure it meets the minimum requirements. You will need:

- A Macbook running macOS 10.8 or newer
- A MySQL or PostgreSQL database

It is not necessary that the database be installed locally, as long as you can connect using a JDBC URL, FusionAuth will be able to utilize the database.

Refer to the latest documentation for [System Requirements](/docs/v1/tech/installation-guide/system-requirements "Visit FusionAuth System Requirements") for minimum versions. If you don't yet have a database installed or have one accessible, do this first before you continue.

## Installation Options

The easiest way to get up and running on macOS will be to use the [Fast Path](/docs/v1/tech/installation-guide/fast-path "Fast Path") installation. This method will download the zip packages and unzip them in the current working directory and have you up and running quickly.

The Fast Path installation may not be right for everyone, it is generally the most useful to get up and running quickly in a development environment. In this article we will be performing a manual installation using the ZIP package. This installation method may be more suitable if you're looking to install a specific version or if you'd just like to know how the sausage is made.

FusionAuth may also be run on Linux, in a Docker container or a Kubernetes cluster, review our installation guide for more information. If you're still on board for installing manually on macOS, then let's do this.

## Download and Install FusionAuth

Start by heading to the [Download](/download) page.

FusionAuth is comprised of two web services, the FusionAuth application (`fusionauth-app`) and FusionAuth search engine (`fusionauth-search`). The FusionAuth App bundle provides access to the API and the web-based user interface. The FusionAuth search engine is required by FusionAuth and provides full-text search uses Elasticsearch. While you may optionally use an existing Elasticsearch instance if it meets the minimum requirements, for this example  we will be installing Elasticsearch by way of the `fusionauth-search` package.

If you'd like to read additional information on the different packages found on the Download page, see the [Packages](/docs/v1/tech/installation-guide/packages) section of the installation guide.

We will be downloading both the `fusionauth-app` and the `fusionauth-ssearch` bundles. To begin, once your on the  [Download](/download) page click on the file you'd like to download and select a download location. We will refer to your download location as `FUSIONAUTH_HOME`, in this example we'll use `~/fusionauth`.

If you're a command line person, feel free to use `wget` if that is your preference, see `wget` example below.

```
mkdir ~/fusionauth
cd ~/fusionauth
wget https://storage.googleapis.com/inversoft_products_j098230498/products/fusionauth/1.3.1/fusionauth-app-1.3.1.zip
wget https://storage.googleapis.com/inversoft_products_j098230498/products/fusionauth/1.3.1/fusionauth-search-1.3.1.zip
```

Once you have downloaded both zip packages to `FUSIONAUTH_HOME` you'll have the following files in a directory.

```
~/fusionauth
> ls -w
fusionauth-app-1.3.1.zip    fusionauth-search-1.3.1.zip
```

In this example we have downloaded version `1.3.1`, you will likely be downloading the latest version which may be more recent than this version.

Next we'll unzip the packages.

```
unzip -nq ./fusionauth-app-1.3.1.zip -d ./
unzip -nq ./fusionauth-search-1.3.1.zip -d ./
```

At this point you may optionally delete the zip packages.

```
rm ./fusionauth-app-1.3.1.zip
rm ./fusionauth-search-1.3.1.zip
```

The last step is to start up FusionAuth.

```
~/fusionauth/bin/startup.sh
```

## Complete the FusionAuth Setup

Next you will complete the setup using the browser. Open your browser to the address of FusionAuth, in our example we'll be using `\http://localhost:9011`. You should find FusionAuth in maintenance mode, complete the search and database configuration and then you will be prompted to create an admin account and then be logged into FusionAuth.

If you'd like to see additional information on these next steps, review the following installation guides and tutorials.

- [Maintenance Mode](/docs/v1/tech/installation-guide/fusionauth-app#maintenance-mode)
- [Setup Wizard](/docs/v1/tech/tutorials/setup-wizard)

## Learn More About the FusionAuth API

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.
