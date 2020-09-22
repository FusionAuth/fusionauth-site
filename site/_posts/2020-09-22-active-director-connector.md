---
layout: blog-post
title: Authenticating with AWS Managed ActiveDirectory and LDAP
description: 
author: Dan
image: blogs/node-microservices-gateway/building-a-microservices-gateway-application.png
category: blog
tags: feature-connectors feature-ldap
excerpt_separator: "<!--more-->"
---

Microsoft's ActiveDirectory is a common enterprise directory product. However, you might want to connect FusionAuth to ActiveDirectory. If you are building applications for both internal and external users, you can let FusionAuth act as a CIAM for your external users, but delegate authentication of internal users to ActiveDirectory.

<!--more-->

This is accomplished using the FusionAuth LDAP connector. This post will explain how to set up such a connection between FusionAuth and ActiveDirectory. The ActiveDirectory servers are set up using the AWS Managed AD service, but the configuration and concepts explained in this post will work with any Microsoft ActiveDirectory instance.

## Prerequisites

There are a few steps you need to take before you can dive into configuring the connection. 

You are going to use ASP.NET to run an application that only LDAP users should have access to, so make sure you have dotnetcore installed.

Then, ensure you have FusionAuth installed and running. You can download and install FusionAuth [using Docker, RPM, or a number of other ways](/docs/v1/tech/installation-guide/). 

*The LDAP Connector you'll use is a feature of the paid editions. You can sign up for a free trial of the [FusionAuth Developer Edition](/pricing).*

Make sure you've [activated your instance](/docs/v1/tech/reactor) to enable the LDAP Connector.

Next, make sure you have an ActiveDirectory instance up and running. In addition, make sure it is accessible to FusionAuth, as they will need to communicate. In my case, since AWS Managed AD doesn't by default expose an interface to the outside world, I stood up a FusionAuth server in the same subnet. You could use a VPN or proxy in front of ActiveDirectory as well.

You can test that you can access the ActiveDirectory instance from your FusionAuth server by installing `ldapsearch` and testing access. For an EC2 instance running Amazon Linux, run these commands:

```shell
sudo yum install openldap-clients
ldapsearch -H ldap://xx.xx.xx.xx
```

where `xx.xx.xx.xx` is the IP address or DNS name of your ActiveDirectory instance.

If you see this error message: 

```
ldap_sasl_interactive_bind_s: Can't contact LDAP server (-1)
```

That means the LDAP server is not accessible via the network. If you see this error message:

```
SASL/EXTERNAL authentication started
ldap_sasl_interactive_bind_s: Unknown authentication method (-6)
	additional info: SASL(-4): no mechanism available: 
```

That means that LDAP is telling you two things. First, "hey bonehead, you have to provide me some credentials". Second, that you can connect from your FusionAuth server to LDAP. 

### Configuring AWS Managed AD

This post isn't focused on installing AWS Managed AD or any other ActiveDirectory configuration, so I'll leave you to the tender mercies of AWS's documentation with just an outline of what I did. If, however, you have a running ActiveDirectory instance you can access with `ldapsearch` you can skip this entire section.

To get AWS Managed AD set up so that I could connect it with FusionAuth, I had to:

* Create a VPC with two subnets
* [Create a AWS Managed AD Directory](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/ms_ad_getting_started_create_directory.html)
* Stand up a Windows server instance in the ActiveDirectory's subnet
* [Install the MacOS RDP client](https://apps.apple.com/app/microsoft-remote-desktop/id1295203466) and [connect to that instance](https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/troubleshoot-connect-windows-instance.html)
* [Manually join the Windows EC2 instance to the ActiveDirectory directory](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/join_windows_instance.html)
* [Install the AD tools and create a user](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/ms_ad_manage_users_groups.html)

This post will set up the EC2 instance inside the private subnet, so the connection between FusionAuth and AWS Managed AD won't use any form of TLS. But for production, please ensure that the connection between the two servers is secured, especially if the connection is going over the open internet.

### ActiveDirectory Users

You are going to want to create two users in ActiveDirectory.

The first will be an adminstrative user who has at least read access to the section of the directory where the users to be authenticated are.

The second user is someone who will log in to FusionAuth, but be authenticated against ActiveDirectory. 

pic TBD adding a user in activedirectory

## Configure FusionAuth

Next, you want to add an application in FusionAuth. An application is anything a user can sign into. We're going to reuse an [existing ASP.NET Razor Pages application](/blog/2020/05/06/securing-asp-netcore-razor-pages-app-with-oauth). While important, the application isn't the focus of this blog post, so if you want to learn more, check out the past article.

In the "OAuth" tab, add a redirect URL of "http://localhost:5000/signin-oidc". Add a logout redirect of "http://localhost:5000/". Note the `Client ID` and `Client Secret` values.

pic TBD

## Configure LDAP connector

tbd

## Set up and run the web application

Clone [the ASP.NET Core application](https://github.com/FusionAuth/fusionauth-example-asp-netcore) from GitHub. Follow the instructions in the README, including updating the `appsettings.json` value.

Publish the binary: `dotnet publish -r win-x64` (if you are on windows). Then 
Start the application 
bin\Debug\netcoreapp3.1\win-x64\publish\SampleApp.exe




get AWS managed active directory set up
add a user
configure the connector
sign in as that user

migrate
multi tenant
other ldap servers
This post has was helpful when trying to https://tylersguides.com/guides/search-active-directory-ldapsearch/
