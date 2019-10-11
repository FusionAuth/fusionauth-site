---
layout: blog-post
title: "Deactivating, Reactivating, and Deleting A FusionAuth User in Python"
description: "This is a step-by-step guide to deactivate, reactivate, or delete a user within your applications using API calls from the FusionAuth-Client Python library."
author: Amy Martin
excerpt_separator: "<!--more-->"
categories: blog
tags:
image: blogs/python-fusionauth-deactivate.png
---

Did you know that you can deactivate, reactivate, or delete a user within your applications using API calls from the FusionAuth-Client Python library? These tools are great for data conscious organizations, executing your organization’s data handling compliance policies (_[Learn more about GDPR data compliance here](/blog/2019/01/29/white-paper-developers-guide-gdpr)_), and fast user management for developers using FusionAuth. This tutorial will give us a chance to explore more of the FusionAuth-Client Library for Python while learning about these three valuable API calls.

<!--more-->

## Here’s what we’ll cover:
1. Introduction to FusionAuth User Management in Python
1. Verifying Server Applications, Libraries, and Dependencies
1. Obtaining a Test User Account ID
1. How to Deactivate a User
1. How to Reactivate a User
1. How to Delete a User
1. Troubleshooting and Common Errors
1. Summary

## What you’ll need:
- [FusionAuth - Download now](/download)
- [FusionAuth-Client Python Library](/docs/v1/tech/client-libraries/python)
- [Python](https://www.python.org/downloads/) (this tutorial uses Python 3.5.2)
- [Python PIP Package Manager](https://pypi.org/project/pip/)
- [Python3 VENV Virtual Environment Package](https://docs.python.org/3/library/venv.html)
- Text Editor or [Favorite Python IDE](https://atom.io/)
- Terminal Access (this tutorial uses Ubuntu 16.04.6 LTS)
- Web Browser (for accessing FusionAuth UI)


## Introduction to FusionAuth User Management in Python

Today we will be exploring three FusionAuth-Client functions: `deactivate_user`, `reactivate_user`, and `delete_user` with code examples in Python. By the end of this tutorial, you should be familiar with these three client API calls and how we can use them to manage users in web applications. This tutorial is part of an introduction to the Fusion-Auth Client for Python series. If you missed our first tutorial, [From Setup to First App](/blog/2019/10/01/implementing-fusionauth-python), it’s a great starting point for first-time FusionAuth users. We definitely recommend that you check it out.

## Verifying Server Applications, Libraries, and Dependencies

If you completed our first FusionAuth Python tutorial, you should already have FusionAuth, Python, PIP, VENV, and the FusionAuth-Client Library for Python already installed and running. If you’re unsure or new to FusionAuth, let’s verify that these are working before we get started.

## FusionAuth Server UI

Open up a web browser and go to [http://127.0.0.1:9011](http://127.0.0.1:9011) or the web address pointing to your FusionAuth installation. If it’s not running, start the Fusionauth Search and Application services. You can do this on DEB or RPM Linux servers with:

```bash
$ sudo service fusionauth-search start
$ sudo service fusionauth-app start
```

_Read our documentation for [installation details](/docs/v1/tech/installation-guide/fast-path) for other platforms._

For this tutorial I’m going to use [VENV](https://docs.python.org/3/library/venv.html), Python’s Virtual Environment Library, for app development and testing. If you have VENV installed in a folder called `venv` on your server like we did in the last tutorial, you can browse to the folder and start the virtual environment server with:

```bash
$ source venv/bin/activate
```

If you don’t see `(venv)` prepended to your command prompt, your virtual environment is not running. It should look like this:

```bash
(venv) $
```

If the FusionAuth-Client Python library is not already installed for venv, you can install it now with:

```bash
(venv) $ pip install fusionauth-client
```

Change directories to your preferred test application directory, and let’s get started!

## Obtaining a Test User Account ID

For this tutorial, we’ll first need a test `user ID` that is registered with FusionAuth.

**IMPORTANT:** If your FusionAuth server only has one admin user listed, you should definitely use a separate test user account for this tutorial. Create a new one before you continue.

In a web browser, let’s go to **Users** in the FusionAuth UI. Select a test user, and under Actions, navigate to **Manage**, which should look like this.

{% include _image.html src="/assets/img/blogs/action-manage-button.png" alt="Manage user" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

On the **Manage User** page in the FusionAuth UI, you’ll see the user ID located directly under the user’s Email address. In this instance, it’s `4e0f2af0-33a2-4001-8631-0f8225e65f1c`.

Copy it into a text editor and set it off to the side. We’ll be using it in a moment and throughout the rest of the tutorial.

{% include _image.html src="/assets/img/blogs/terry-test-account.png" alt="Terry test user info" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

## How to Deactivate a User with FusionAuth-Client

Now that we have our test User ID credentials, open up another instance of your text editor or open your favorite Python IDE and let’s create a new application. We’ll call this application `deactivate.py`.

Now, we will import the FusionAuth-Client Library for Python just like we did in the previous tutorial.

```python
from fusionauth.fusionauth_client import FusionAuthClient
```

Below this, we will want to tell our app to make the appropriate API calls to FusionAuth. **Add your own API key and server information**.

```python
#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-OWN-API-KEY', 'http://localhost:9011')
```

Now, we will need that UserID for our test user for this next code example. Within `client.deactivate_user` flip back over to your text editor, copy the ID string, and replace this argument with your own test UserID that you selected.

```python
# Deactivate A User with deactivate_user
client_response = client.deactivate_user('YOUR-USER-ID')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)
```

When finished, your code should look similar to this:

```python
from fusionauth.fusionauth_client import FusionAuthClient

#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-OWN-API-KEY', 'http://localhost:9011')

# Deactivate A User with deactivate_user
client_response = client.deactivate_user('YOUR-USER-ID')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)
```

Save the program to your server, make sure that `venv` is running, and execute the program with `deactivate.py`. If successful, you’ll see a response of `None`.

Now, let’s head on over to a web browser, and browse to **Users** so that we can check out our user. You should notice that the account associated with the UserID we provided is now locked. It will look something like this:

{% include _image.html src="/assets/img/blogs/terry-example-locked.png" alt="Terry is now locked" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

If your application was successful, congratulations! Continue on with user reactivation. If not, check your steps or review the error codes below.

## How to Reactivate A User With FusionAuth

Reactivating a user is as easy as deactivating one. Same as before, grab your familiar headers, importing the client library, API key, and Server URL.

```python
from fusionauth.fusionauth_client import FusionAuthClient

#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-OWN-API-KEY', 'http://localhost:9011')
```

Now let’s call our `reactivate_user` function. Use the same user ID as you did in the previous example.

Add the `reactivate_user` function to our application. Be sure to replace the `reactivate_user` client argument of `YOUR-USER-ID` with your own selected userID.

```python
# Reactivate A User
client_response = client.reactivate_user('YOUR-USER-ID')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)
```

Save and execute the `reactivate.py` application on your server. Upon success, you’ll get a client response that should look something like this, displaying the user’s profile information:

```bash
{
  'user': {
    'fullName': 'Terry Example',
    'firstName': 'Terry',
    'twoFactorEnabled': False,
    'lastLoginInstant': 1570201693585,
    'birthDate': '1980-01-01',
    'preferredLanguages': [
      'en'
    ],
    'mobilePhone': '4245555555',
    'insertInstant': 1570120644496,
    'tenantId': '31626131-3938-6231-3634-663636656635',
    'timezone': 'Pacific/Honolulu',
    'id': '4e0f2af0-33a2-4001-8631-0f8225e65f1c',
    'email': 'terry@example.com',
    'active': True,
    'registrations': [{
      'id': 'd449fca4-1a75-4967-ab19-5a55f8fe9507',
      'lastLoginInstant': 1570201693585,
      'timezone': 'Pacific/Honolulu',
      'usernameStatus': 'ACTIVE',
      'verified': True,
      'applicationId': '55e36f88-f3ba-4423-8b70-80232c7de8ad',
      'insertInstant': 1570145686702,
      'username': 'terry@example.com'}],
    'twoFactorDelivery': 'None',
    'verified': True,
    'passwordChangeRequired': False,
    'usernameStatus': 'ACTIVE',
    'passwordLastUpdateInstant': 1570200258584,
    'lastName': 'Example',
    'username': 'terry@example.com'
  }
}
```

Refresh the **Users** page in your browser and you’ll now notice that the lock icon has disappeared beside our test user and the account has been reactivated.

{% include _image.html src="/assets/img/blogs/terry-example-unlocked.png" alt="Terry is now unlocked" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

## How to Delete A User With FusionAuth-Client

For our next trick, we will be deleting a test user from the server. If you filled out a lot of profile information on your regular test user, you might want to create an empty test user for this tutorial. Just be sure to grab their UserID from the **Actions-->Manage** section of FusionAuth.

{% include _image.html src="/assets/img/blogs/delete-test-user.png" alt="A user to delete" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

Pop open your Python editor, and create a new file called `deleteuser.py`. Add the FusionAuth_client Library, Your API key, and your server info.

```python
from fusionauth.fusionauth_client import FusionAuthClient

#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-API', 'http://localhost:9011')
```

Now, add this section to the application, replacing the userID with your own:

```python
# Delete User For A Given ID
client_response =client.delete_user('USER-ID')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)
```

Save and execute your `deleteuser.py` application. (**Caution:** Executing this action will actually delete the user.)

If successful, you will get a response of `None` and the user will now be deleted from FusionAuth. You can test this again by refreshing the **Users** page in your browser.  

## Troubleshooting Common Errors

What if your app didn’t quite work? Here’s a list of error codes that your app or server might return:

### Code 401

**Description:** “_You did not supply a valid Authorization header. The header was omitted or your API key was not valid. The response will be empty. See [Authentication](/docs/v1/tech/apis/authentication)._”

**What this usually means:** Your API key is likely invalid. Did you remember to replace the code example API key with the one from your new application? Did you copy your Application ID instead of your API key? Open up a web browser and go to **Settings > API Keys**, check your API key, and try again.

### Code 503

**Description:** “_The search index is not available or encountered an exception so the request cannot be completed. The response will contain a JSON body._”

**What this usually means:** Check to see if your FusionAuth Search index service is running. If it’s running, browse to **Users** in the UI.


If you see a message like, “_Error - FusionAuth encountered an error while processing your request. If the problem persists, contact FusionAuth support for assistance_” you may just need to restart FusionAuth Search.

{% include _image.html src="/assets/img/blogs/error-message-screen.png" alt="Error Message Screen" class="img-fluid full mb-4" figure=false %}

To restart FusionAuth Search service type

```bash
$ sudo service fusionauth-search start
```

If you’re using a Cloud instance like AWS EC2, AWS Lightsail, or Google Cloud, try restarting the server instance and restarting all FusionAuth services to resolve the issue.

```bash  
$ sudo service fusionauth-search start
$ sudo service fusionauth-app start
```

### Error: No module named fusionauth.fusionauth_client

**Description:**

```
Traceback (most recent call last):
  File "test.py", line 1, in <module>
	from fusionauth.fusionauth_client import FusionAuthClient
ImportError: No module named fusionauth.fusionauth_client
```

**What this usually means:** Do you have the FusionAuth-Client Library already installed? If so, did you execute the application outside of venv? Browse to the directory containing venv, and activate `venv`:

```bash
$ source venv/bin/activate
```

Then, change directories to your `fusionapps` folder and try again:

```bash
(venv) $ python test.py
```

TODO - NEED CALLOUT BOX
### Additional Error codes
Didn’t find your error here? Visit [https://fusionauth.i/docs/v1/tech/apis/users](/docs/v1/tech/apis/users) for more response codes, or visit [https://fusionauth.io/docs/v1/tech/troubleshooting/](/docs/v1/tech/troubleshooting/) for more troubleshooting suggestions. You can also ask a question on [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth) or open an issue on [Github](https://github.com/FusionAuth/fusionauth-issues/issues/new/choose). As always, if you have a support contract feel free to [contact FusionAuth support](mailto:support@fusionauth.io).


## Summary

This was a quick introduction to user management in FusionAuth with Python. We explored how to deactivate, reactivate, and delete a user with some examples of client responses that our application can call from the FusionAuth API. Be sure to check out some of our [other tutorials](/docs/v1/tech/tutorials/), explore our repos on [Github](https://github.com/FusionAuth/), and take a look at what else you can do with FusionAuth's [RESTful APIs](/docs/v1/tech/apis/).

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users. [Find out more](/ "FusionAuth Home") about FusionAuth and download it today.

[Learn More](/){: .btn .btn-primary}
