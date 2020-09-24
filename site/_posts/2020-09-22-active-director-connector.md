---
layout: blog-post
title: Authenticating with AWS Managed Active Directory and LDAP
description: 
author: Dan
image: blogs/node-microservices-gateway/building-a-microservices-gateway-application.png
category: blog
tags: feature-connectors feature-ldap client-netcore
excerpt_separator: "<!--more-->"
---

Microsoft's Active Directory is a common enterprise directory. You might want to connect FusionAuth to Active Directory if you are building applications for both internal and external users. You can let FusionAuth act as a CIAM for your external users, but delegate authentication of internal users to Active Directory.

<!--more-->

Applications no longer have to understand LDAP or be able to connect directly to your Active Directory server. Any framework or application which can handle OAuth/OIDC or SAML for access FusionAuth for auth information, but all your user data remains in Active Directory.

You can do this with the FusionAuth LDAP connector. This post will explain how to set up a connection between FusionAuth and Active Directory. For this post, the Active Directory servers are run using [AWS Managed AD](https://aws.amazon.com/directoryservice/active-directory/), but the configuration and concepts explained in this post will work with any Microsoft Active Directory instance.

## Prerequisites

There are a few steps you need to take before you can dive into configuring the connection. 

*The LDAP Connector you'll use is a feature of the paid editions. You can sign up for a free trial of the [FusionAuth Developer Edition](/pricing).*

You are going to use ASP.NET to run an application that only LDAP users should have access to, so make sure you have .NET Core version 3 installed if you want to follow along with the code. If you want to install it on the mac, I found the [bash script here](https://dotnet.microsoft.com/download/dotnet-core/scripts) worked best. 

Then, ensure you have FusionAuth installed and running. You can download and install FusionAuth [using Docker, RPM, or a number of other ways](/docs/v1/tech/installation-guide/). You'll need at least version 1.18.

Make sure you've [activated your instance](/docs/v1/tech/reactor) to enable the LDAP Connector.

Next, make sure you have an Active Directory instance up and running. In addition, make sure it is accessible to FusionAuth, as they will need to communicate. In my case, since AWS Managed AD doesn't by default expose an interface to the outside world, I stood up a FusionAuth server in the same subnet. You could use a VPN, SSH tunnel or HTTP proxy in front of Active Directory as well.

You can test that you can access the Active Directory instance from your FusionAuth server by installing `ldapsearch` and testing access. For an EC2 instance running Amazon Linux, run these commands:

```shell
sudo yum install openldap-clients
ldapsearch -H ldap://xx.xx.xx.xx
```

where `xx.xx.xx.xx` is the IP address or DNS name of your Active Directory instance.

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

That means that LDAP is telling you two things. The first is "hey bonehead, provide me some credentials". Second, that you can connect from your FusionAuth server to LDAP. 

### Configuring AWS Managed AD

This post isn't focused on installing AWS Managed AD or any other Active Directory configuration, so I'll leave you to the tender mercies of AWS's documentation with just an outline of what I did. If, however, you have a running Active Directory instance you can access with `ldapsearch` you can skip this entire section.

To get AWS Managed AD set up so that I could connect it with FusionAuth, I had to:

* Create a VPC with two subnets
* [Create a AWS Managed AD Directory](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/ms_ad_getting_started_create_directory.html)
* Stand up a Windows server instance in the Active Directory's subnet
* [Install the MacOS RDP client](https://apps.apple.com/app/microsoft-remote-desktop/id1295203466) and [connect to that instance](https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/troubleshoot-connect-windows-instance.html)
* [Manually join the Windows EC2 instance to the Active Directory directory](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/join_windows_instance.html)
* [Install the AD tools and create a user](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/ms_ad_manage_users_groups.html)

This post will set up the EC2 instance inside the private subnet, so the connection between FusionAuth and AWS Managed AD won't use any form of TLS. But for production, please ensure that the connection between the two servers is secured, especially if the connection is going over the open internet.

### Active Directory Users

You are going to want to create two users in Active Directory.

The first will be an administrative user who has at least read access to the section of the directory where the users to be authenticated are.

The second user is someone who will log in to FusionAuth, but be authenticated against Active Directory. Below, I'm adding John Stafford.

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/active-directory-add-user.png" alt="Adding a user in Active Directory." class="img-fluid" figure=false %}

## Configure FusionAuth

Next, you want to add an application in FusionAuth. An application is anything a user can sign into. We're going to reuse an [existing ASP.NET Razor Pages application](/blog/2019/05/06/securing-asp-netcore-razor-pages-app-with-oauth). While important, the application isn't the focus of this blog post, so if you want to learn more, check out the previous article. But let's pretend this ASP.NET Razor pages application is an internal payroll application. Only users in Active Directory should be able to access it.

Navigate to "Settings" and then "Key Master" to set up an RSA keypair for your JWT. You need to do this because the default signing key for a JWT in FusionAuth is HMAC, but the ASP.NET library we are going to use doesn't support symmetric keys. Below I'm generating an RSA key pair, but you can import one you've previously created should you need to share one across systems:

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-add-rsa-key.png" alt="Adding an RSA key in Key Master." class="img-fluid" figure=false %}

Create an application called "Internal Payroll App". This is what you are going to let John have access to. In the "OAuth" tab, add a redirect URL of "http://localhost:5000/signin-oidc". Add a logout redirect of "http://localhost:5000/".

Then switch to the "JWT" tab. Enable it and change the signing keys to "For Internal Payroll App".

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-jwt-config.png" alt="Configuring the application's JWT settings to sign with the generated RSA keypair." class="img-fluid" figure=false %}

Save the application and then view it and scroll down to the "OAuth configuration" section, noting the `Client ID` and `Client Secret` values:

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-oauth-config.png" alt="Viewing the application's OAuth settings to record the Client ID and Client Secret values." class="img-fluid" figure=false %}

## Configure LDAP connector

To configure the LDAP connector, you need to do the following:

* Create an LDAP reconcile Lambda to map the directory attributes to FusionAuth user attributes.
* Configure the Connector.
* Add the Connector Policy to the tenant, which configures the domains to which the connector applies.

Seems pretty simple. But let's take these one at a time.

### Create the LDAP lambda

Because FusionAuth has no idea about the structure of your Active Directory, you'll need to create a [reconciliation lambda](/docs/v1/tech/lambdas/ldap-connector-reconcile).

At its most basic, this lambda looks like this:

```javascript
function reconcile(user, userAttributes) {
  // Lambda code goes here
}
```

This lambda isn't too helpful though, as no user attributes are copied. At a minimum, you should set `user.id` and either `user.username` or `user.email`. 

You will receive `userAttributes` that you request from Active Directory (more on that below) and you'll need to assemble them into a `user` object as expected by FusionAuth. The `user` object is thoroughly documented in the [API docs](/docs/v1/tech/apis/users#create-a-user). You'll want to make sure that you have the required user attributes. You also will want to ensure that the user is registered to any FusionAuth applications they need to authorize against, and are made a member of any FusionAuth groups required.

Here's an example Lambda function:

```javascript
// Using the response from an LDAP connector, reconcile the User.
function reconcile(user, userAttributes) {

  user.email = userAttributes.userPrincipalName;
  user.firstName = userAttributes.givenName;
  user.lastName  = userAttributes.sn;
  user.active    = true;
  
  var reg = {};
  reg.applicationId = "f81adc10-04f7-4546-8410-f9837ff248ab"; // the application we want the user registered for
  user.registrations = [reg];
  
  user.id = guidToString(userAttributes['objectGUID;binary']);
}

function decodeBase64(string)
{
	var b=0,l=0, r='',
  m='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  string.split('').forEach(function (v) {
    b=(b<<6)+m.indexOf(v); l+=6;
    if (l>=8) r+=String.fromCharCode((b>>>(l-=8))&0xff);
  });
  return r;
}

function guidToString(b64)
{
  var x = decodeBase64(b64);
  
  console.debug("Binary String: " + x.length + " length: " + x);
  
  var ret = "";
  
  for (i = 3; i >= 0; i--)
  {
    ret += ('00'+x.charCodeAt(i).toString(16)).substr(-2,2);
  }
  ret += "-";
  for (i = 5; i >= 4; i--)
  {
    //ret = ret + ('00' + (charCode & 0xFF00) >> 8);
    ret += ('00'+x.charCodeAt(i).toString(16)).substr(-2,2);
  }
  ret += "-";
  for (i = 7; i >= 6; i--)
  {
    //ret = ret + ('00' + (charCode & 0xFF00) >> 8);
    ret += ('00'+x.charCodeAt(i).toString(16)).substr(-2,2);
  }
  ret += "-";
  for (i = 8; i <= 9; i++)
  {
    //ret = ret + ('00' + (charCode & 0xFF00) >> 8);
    ret += ('00'+x.charCodeAt(i).toString(16)).substr(-2,2);
  }
  ret += "-";
  for (i = 10; i < 16; i++)
  {
    //ret = ret + ('00' + (charCode & 0xFF00) >> 8);
    ret += ('00'+x.charCodeAt(i).toString(16)).substr(-2,2);
  }
  
  return ret;
}
```

The functions `guidToString` and `decodeBase64` help convert the `objectGUID` attribute, is a set of bytes in Active Directory, to a UUID FusionAuth can understand. If you are using version 1.19.7 or later, you can use a built in function instead: `FusionAuth.ActiveDirectory.b64GuidToString(userAttributes['objectGuid;binary'])`. See [the LDAP lambda docs](/docs/v1/tech/lambdas/ldap-connector-reconcile) for more info.

### Configure the connector

Next, navigate to "Settings" and then "Connectors". Create a new Connector and select the LDAP option. You'll see this screen staring back at you:

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-blank-ldap-connector.png" alt="The creation screen for an LDAP Connector." class="img-fluid" figure=false %}

You'll want to provide the following information:

* The LDAP URL, which is the DNS or IP address of your Active Directory server or servers (if load balanced). The schema of this address depends on the security method. Because I'm in the same subnet, I'm using `ldap://192.168.x.x` TBD because that's the IP address of the AWS Managed AD server in this subnet.
* The security method, which is either None, LDAPS (LDAP over SSL) or STARTTLS (LDAP over TLS).
* You can configure the timeouts. If the Connector can't connect or read from the LDAP server for longer than the respective timeout, an error will be written to the log and users who are associated with this Connector will not be able to authenticate.
* Set the Lambda to the name of the Lambda you created previously.
* Set the Base Structure to the DN of where you want to start the search. To search the entire directory, you'd use a structure like: `DC=piedpiper,DC=com`. If you want to search against only engineering, add the organization: `OU=engineering,DC=piedpiper,DC=com`.
* Set the "System Account DN". This is basically the user to connect to Active Directory as. This account will then search for the user who is attempting to authenticate. This is the admin user you created above. For example: `CN=ReadOnlyFusionAuthUser,OU=engineering,DC=piedpiper,DC=com`. You also need to provide the password for this account.
* Configure the "Login Identifier Attribute". This is the attribute value where the username resides. For Active Directory, that is `userPrincipalName`.
* Set the "Identifying Attribute". This is the entry attribute name which is the first component of the distinguished name of entries in the directory. `cn` is the correct value.

Finally, configure profile attributes to request from Active Directory. Anything stored in the Active Directory instance can be requested here, as long as the authenticating user has permissions to retrieve the information. AWS Managed AD [runs Windows Server 2012](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_microsoft_ad.html), so this is [the list of available attributes](https://docs.microsoft.com/en-us/windows/win32/adschema/c-user#windows-server-2012). These will be passed to the lambda as a hash named `userAttributes`. This will differ based on what attributes you want to store in the FusionAuth user. Here's one valid set of values: `cn givenName sn userPrincipalName mail`. These must be added one at a time in the administrative user interface. 

You'll want to make sure you also include in the set of values a unique identifier that can be converted into a GUID. This is what you'll set the user's FusionAuth id to. In this case, Active Directory stores the user's id in binary in the `objectGUID`. The underlying LDAP access tries to treat this as a string, so you need to specify it as a binary object by appending `;binary` to the attribute name: `objectGUID;binary`. The Lambda then decodes this to a v4 GUID which is usable as an identifier within FusionAuth.

After you've added everything, the configuration will look like this, though of course the URL and other configuration will differ:

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-create-active-directory-connector.png" alt="The completed creation screen for an Active Directory LDAP Connector." class="img-fluid" figure=false %}

### Configure the Connector policy

After you've set up the Connector, you need to tell FusionAuth how to use it. In the administrative user interface, navigate to "Tenants", then to the "Default" tenant. Go to the "Connectors" tab to enable the connector. Click "Add policy" and select the connector. You may optionally enter the email domain or domains for which this Connector should be used; add multiple domains on separate lines. You can also add a value of `*` which will cause this connector to be checked for users with any email address. In this case, you'll leave the domain value as `*`.

You can check the "Migrate User" option, which will cause FusionAuth to not check Active Directory for user attributes after the first time. You can read more [about this option](/docs/v1/tech/connectors). For this post, you are continuing to treat Active Directory as the system of record, so leave it unchecked.

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-tenant-connector-policy.png" alt="Setting up the policy for the Active Directory Connector." class="img-fluid" figure=false %}

Order here matters; the Connectors are checked in order until the user is found in one of them. At that point, the user is tied to that Connector and it will be used for future authentication attempts. Make sure that you move the Active Directory Connector above the Default Connector, so that it is tried first.

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/fusionauth-tenant-order-connectors.png" alt="Setting up the policy order for the Active Directory Connector." class="img-fluid" figure=false %}

Note that Connectors are configured on a tenant by tenant basis. FusionAuth supports multiple tenants out of the box, so if you need different Connector domains or orders, you can use multiple tenants.

## Set up and run the web application

Now that you have the ability to authenticate against Active Directory, set up an application to test it out. If you want to write a payroll application, feel free. But for the sake of time, this post will use a previously written application, as mentioned initially. 

To get started, clone [the ASP.NET Core application](https://github.com/FusionAuth/fusionauth-example-asp-netcore) from GitHub. Follow the instructions in the `README`, including updating the `appsettings.json` values:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "SampleApp" : { 
      "Authority" : "https://local.fusionauth.io",
      "CookieName" : "sampleappcookie",
      "ClientId" : "f81adc10-04f7-4546-8410-f9837ff248ab"
   }
}
```

This application was originally written to run on Windows. However, .NET Core is cross platform. If you're on a mac and have the runtime, use the following commands to get it started (instead of the publish and start commands in the `README`).

First, publish the binary: `dotnet publish -r osx.10.14-x64`. Then start up the application: `bin/Debug/netcoreapp3.1/osx.10.14-x64/publish/SampleApp`. 

If you have a different version of the .NET Core macOS runtime, the commands might be a bit different.

## Login with Active Directory

Now, visit `http://localhost:5000` with an incognito window. You'll see this:

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/webapp-initial-page.png" alt="The initial app webpage." class="img-fluid" figure=false %}

To log in, click "Secure" and you'll be taken to the FusionAuth login page. These can of course be [themed](/docs/v1/tech/themes/), but for now the default look and feel will have to do.

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/webapp-login-page.png" alt="The log in pages for the web application." class="img-fluid" figure=false %}

Sign in with the Active Directory user you added (I'll use John's login) and you'll be redirected back to a profile page. Note that I used `john@danadtest.fusionauth.io` as the username. That corresponds to "User UPN logon" value when I created this account in Active Directory, which is also the `userPrincipalName` value, used for the "Login Identifier Attribute" when configuring the Connector.

{% include _image.liquid src="/assets/img/blogs/active-directory-connector/webapp-secured-page.png" alt="The web application profile page." class="img-fluid" figure=false %}

You can also create additional users, both in FusionAuth and in Active Directory. All users in Active Directory will be automatically registered to this application. If you don't add the FusionAuth users to the application, they'll be sent to `Account/AccessDenied`, a page yet to be written. That'll be left as an exercise for the reader.

## Conclusion

If you already have your user data in Active Directory, use it! There's no need to migrate. FusionAuth and Connectors can federate with Active Directory and other LDAP servers. 

Using Connectors gives you the features and APIs of FusionAuth to build your applications. At the same time you can keep your users in an existing directory that you know how to operate or that other systems may depend upon.
