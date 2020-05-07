---
layout: blog-post
title: Implementing FusionAuth with Python - From Setup to First App
description: This is a step-by-step guide to building your first functional Python application and retrieving user profile information with FusionAuth.
author: Amy Martin
image: blogs/introduction-fusionauth-python2.jpg
category: blog
excerpt_separator: "<!--more-->"
---

Welcome to our FusionAuth Python Library introduction tutorial! Today we will take a tour of the FusionAuth-Client Library for Python and get to know the basics of FusionAuth. This step-by-step guide will walk you through FusionAuth setup to building your first functional Python application with FusionAuth and then retrieving user profile information.

<!--more-->

Our goal is to demonstrate the basics of FusionAuth and let you verify your API credentials before diving into functional Python FusionAuth-Client web applications using Python frameworks and micro frameworks like Django and Flask. Of course if you're already familiar with FusionAuth and have these libraries and dependencies installed, you can go ahead and skip to the next section [Deactivating, Reactivating, and Deleting A FusionAuth User in Python](/blog/2019/10/08/deactivating-reactivating-deleting-user-fusionauth-python)!

## What We'll Cover

1. Installing FusionAuth and Initializing Services
1. Configuring FusionAuth, Creating an Application and API Key
1. Creating a new User through the FusionAuth Admin UI
1. Registering a User to an Application through the FusionAuth Admin UI
1. Installing Python PIP Package Manager
1. Installing VENV Virtual Environment for Python
1. Installing the FusionAuth-Client Python Library
1. Creating and Executing a Python app to retrieve user profile information
1. Creating a new FusionAuth User and Registering them to an Application with Python
1. Troubleshooting Common Errors
1. Summary

## What You'll Need
- [MySQL](/docs/v1/tech/installation-guide/database#install-mysql)
- [FusionAuth](/download)
- [Python](https://www.python.org/downloads/) (this tutorial uses Python 3.5.2)
- [Python PIP Package Manager](https://pypi.org/project/pip/)
- [Python3 VENV Virtual Environment Package](https://docs.python.org/3/library/venv.html)
- Text Editor or [Favorite Python IDE](https://atom.io/)
- Terminal Access (this tutorial uses Ubuntu 16.04.6 LTS)
- Web Browser

_For a complete list of system requirements for FusionAuth, [visit our documentation](/docs/v1/tech/installation-guide/system-requirements)._

Ready? Let's get started!

## Installing FusionAuth and Initializing Services

FusionAuth has several options for installation. Before installing FusionAuth, be sure that you have MySQL installed and running with Superuser credentials at hand.

Today, we're going to use the Fast Path method to install FusionAuth on an Ubuntu server.


```bash
sh -c "curl -fsSL https://raw.githubusercontent.com/FusionAuth/fusionauth-install/master/install.sh | sh"
```

Upon successful installation, you should see, **Installation is complete. Time for tacos.**

_For other [Fast Path install scripts](/docs/v1/tech/installation-guide/fast-path) and methods of installation, check out our [installation guide](/docs/v1/tech/installation-guide/)._

Now, let's start FusionAuth Search and App services:

```bash
sudo service fusionauth-search start
sudo service fusionauth-app start
```

With installation complete and services started, let's open up a web browser and navigate to [http://127.0.0.1:9011](http://127.0.0.1:9011) or the web address pointing to your FusionAuth installation. If you're connected over SSH, be sure to first tunnel in to port 9011 so that we can access the server's localhost.

## Configuring FusionAuth

The first time you access your new FusionAuth installation, you'll be prompted to [complete the Setup Wizard](/docs/v1/tech/tutorials/setup-wizard). The Setup Wizard will prompt you for your database endpoint, root user credentials, and credentials for the FusionAuth to access the database (you can use existing MySQL credentials here, or FusionAuth will create a new MySQL user). You'll create an administrator account that you'll use every time you login to the FusionAuth UI. After accepting the license and hitting submit you'll need to enter your database Superuser credentials. Then you'll come to a dashboard where you'll be prompted to create an application, a FusionAuth API key, and server email settings. E-mail settings can be found in the FusionAuth UI under **Settings-->Tenants-->Edit Tenant-->Advanced-->SMTP Settings**.

For now, we will focus on creating an application and an API key.

_Learn more about the [Setup Wizard and First Time Login](/docs/v1/tech/tutorials/setup-wizard)._


## Creating an App

Once you've completed installation and first time configuration, we will want to create a new Application for our Python projects.  In FusionAuth, the concept of an Application is anything that you can log into. If you've navigated away from the prompts in the Dashboard, go to **Applications** in the UI.

There will be an application that has already been created named "FusionAuth" by default and have very few customizable settings relative to our other applications. This is the FusionAuth administration application that you are currently logged into.

{% include _image.liquid src="/assets/img/blogs/edit-application-screen.png" alt="Edit Application Screen" class="img-fluid full mt-2 mb-4" figure=false %}

If you click the edit icon on the "**FusionAuth**" application, you can see this application only has the option to toggle JWT on or off, or set Access and ID tokens to populate a lambda. For now, we will leave this as it is and hit **Save**.

{% include _image.liquid src="/assets/img/blogs/save-icon.png" alt="Save" class="img-fluid mb-4 mx-auto d-block" figure=false %}

We want to create a separate app for our Python application to utilize, so let's go ahead and do that now. Select the green plus sign at the top right of the page to add an App.

{% include _image.liquid src="/assets/img/blogs/add-button.png" alt="Add" class="img-fluid mt-2 mb-4 mx-auto d-block" figure=false %}

You should come to a page that looks like this:

{% include _image.liquid src="/assets/img/blogs/add-application-screen.png" alt="Add Application Screen" class="img-fluid full mb-4" figure=false %}


Give your application a name. We will call ours "**pythonapp**". The name is just for us to recognize our app in the FusionAuth UI and is for display purposes only. An Application ID will be specified automatically on **Save**.


At this point, you can explore the many application settings FusionAuth has to offer as there are lots more options than the FusionAuth default application. We will not need to change or add anything else to the app at this time. When you're ready, hit **Save**.

{% include _image.liquid src="/assets/img/blogs/save-icon.png" alt="Save" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

Once the Application is saved, FusionAuth assigns an App ID. In this example, our App ID is `55e36f88-f3ba-4423-8b70-80232c7de8ad`.

{% include _image.liquid src="/assets/img/blogs/applications-screen.png" alt="Applications Screen" class="img-fluid full mb-4" figure=false %}

We are now ready to create an API Key!

## Creating an API Key

Next let's set up an API Key. It's fast and only takes a moment. Navigate to the API area under **Settings-->API Keys**. Then, select the add API Key button which will be a green plus sign at the top right area of the page.

{% include _image.liquid src="/assets/img/blogs/add-button.png" alt="Add" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

A new API key will be automatically populated. Since we will want to make this API Key a "Superuser" we will leave the **Endpoints** untoggled. This means that our API should be good for all "Get," "Post," "Put," and "Delete," actions we specify with our app. You can optionally give this API Key a description, then hit **Save**.

{% include _image.liquid src="/assets/img/blogs/save-icon.png" alt="Save" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

## Adding a User

Next, we'll need a test user registered with FusionAuth. Go to **Users** in the dashboard. Click on the green **Add User** button at the top right of the page.

{% include _image.liquid src="/assets/img/blogs/add-user-button.png" alt="Add user" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

Our user's Username and Password are the same for this example. Fill out as many details as you want about your test user. For now, since we're using a dummy email account, we will deselect the "**Send email to setup password**" toggle switch, and turn off two-factor authentication.

{% include _image.liquid src="/assets/img/blogs/add-user-toggle-screen.png" alt="Add User Screen" class="img-fluid full mb-4" figure=false %}

We will be using this Username, `terry@example.com` in our test code. When finished, select **Save**.

## Register the User to our Application

At this point, we will go ahead and register our test user with the application "**pythonapp**" we created for this project. This is an optional step to the process, but demonstrates how to grant a user access and user roles to applications we create in FusionAuth.

In the User's menu, beside our test user, select "**Manage**" .

{% include _image.liquid src="/assets/img/blogs/action-manage-button.png" alt="Manage user" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

On the following **Manage User** page, you'll see a button that says, "**Add registration**."

{% include _image.liquid src="/assets/img/blogs/manage-user-add-registration-screen.png" alt="Manage User Add Registration Screen" class="img-fluid full mb-4" figure=false %}

This will take you to a page that looks something like this:

{% include _image.liquid src="/assets/img/blogs/add-user-registration-screen.png" alt="Add User Registration Screen" class="img-fluid full mb-4" figure=false %}

From here, we will want to select our test application, "**pythonapp**". We will match the username with the same username as our sample user's email address. If our application had user roles defined, we could assign them to this user. We can also define the user's Timezone and set Language preferences.

Once you're done, hit **Save**. Now that we are finished setting up our user, it's time to finish configuring the rest of our testing environment.

## Installing Python PIP Package Manager

Let's open up a terminal connection to FusionAuth. First, we want to verify our current version of Python and that it's installed.

```bash
$ python3 -V
```

The response should look something like this.

```bash
Python 3.5.2
```

If Python is not yet installed (for Ubuntu/Debian), we can install it with:

```bash
$ sudo apt-get update
$ sudo apt-get install python
```

_For installing on other platforms, visit [https://www.python.org/downloads/](https://www.python.org/downloads/)._

Now, let's install the Python PIP Package manager. PIP will allow us to quickly install individual Python packaged libraries, or libraries as defined by an application's `requirements.txt` file.

**For Ubuntu/Debian:**

```bash
$ sudo apt-get install python-pip
```

_For installing on other platforms, visit: [https://pip.pypa.io/en/stable/installing/](https://pip.pypa.io/en/stable/installing/)._

To verify the installation, we will want to run:

```bash
$ pip --version
```

Which should return something like this:

```bash
pip 19.2.3 from /usr/lib/python3.5/dist-packages (python 3.5)
```

If it displays an older version you can update pip with:

```bash
pip install --upgrade pip
```

We are now ready to install a virtual environment for Python.

## Installing VENV (Virtual Environment for Python)

With Python and PIP installed successfully, let's install VENV, the Virtual Environment for Python. First of all, what is VENV? VENV allows us to install multiple Python environments for testing and running our web applications. In practice, it's good to use because it separates each app's environment from our system's site directories. VENV gives each virtual environment access to their own Python binaries, matching the Python binary on the host server, while at the same time allowing each environment to have its very own set of Python packages installed within its dedicated site directory.  

Let's go ahead and install VENV For Ubuntu/Debian:

```bash
$ sudo apt-get install python3-venv -y
```

_For installing VENV on other platforms, visit: [https://docs.python.org/3/library/venv.html](https://docs.python.org/3/library/venv.html)._

With VENV installed successfully, we are now ready to create a virtual environment for our FusionAuth application.

Let's create a new directory and navigate to it.

```bash
$ mkdir fusionapps
$ cd fusionapps
```

Once inside, we will want to use venv to create a folder called venv and execute the virtual environment:

```bash
$ python3 -m venv venv
```

This just created a copy of Python and all of its binaries, the standard Python library, PIP, and all of its supporting files inside a virtual environment living in the directory "venv".  

Now, let's execute VENV with the startup script:

```bash
$ source venv/bin/activate
```

You'll now notice that VENV's virtual environment bin directory will be prepended to the very beginning of the command prompt. This means you're operating inside of the Python virtual environment you created and are currently using. Since we named ours venv, it will look something like this:

```bash
(venv) $
```

To deactivate the virtual environment, simply enter:

```bash
(venv) $ deactivate
```

_Learn more about [using venv](https://docs.python.org/3/library/venv.html) and [installing other Python modules](https://docs.python.org/3/installing/index.html)._

## Installing the FusionAuth-Client Python Library

With VENV now installed, let's proceed to install the FusionAuth-Client Python Library inside our Virtual Environment. If venv is deactivated, let's activate it first.

```bash
$ source venv/bin/activate
```

Now, let's install the FusionAuth-Client Python Library:

```bash
(venv) $ pip install fusionauth-client
```

The FusionAuth Client Python Library is now installed in our virtual environment, ready for apps!

## Creating and Executing a Python App to Display User Profile Information
For this part of the tutorial, you'll need two things that we created earlier:

1. Your FusionAuth API Key
1. Any username from a registered FusionAuth user on the server

Open up your favorite text editor or Python IDE, and let's get started!

First, let's create a new file and name it `test.py`.

Once we are inside the newly created file, we will tell our Python app to import the FusionAuth-Client library:

```python
from fusionauth.fusionauth_client import FusionAuthClient
```

Next, we'll need to add our API Key and URL for the FusionAuth server.
Yours will be different. If you don't remember your API Key, navigate to **Settings-->API Keys**.

Your API Key should be in the "ID" field. If you're missing an API Key, you'll need to create one to continue. Once you have your API key, replace `YOUR-OWN-API-KEY` with your own in the code below:

```python
#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-OWN-API-KEY', 'http://localhost:9011')
```

Now, let's try to retrieve a registered user's profile information via username from our FusionAuth identity server by adding the following code to our application:

```python
# Retrieve a user by Username
client_response = client.retrieve_user_by_username('terry@example.com')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)

# Create a new user programmatically
# Register the user
# retriever the user
```

Breaking this down: `client.retrieve_user_by_username` calls the FusionAuth API and asks it to retrieve and print the user's profile information. In this instance, the Username and the user's email address are both the same. Username is specified at time of user registration. In this code example, you will want to replace `'terry@example.com'` with an actual registered user on your FusionAuth identity server. Otherwise, it tells the application to print an error response.

Put it all together, and your test program should look similar to this:

```python
from fusionauth.fusionauth_client import FusionAuthClient

#  You must supply your API key and URL here
client = FusionAuthClient('YOUR-OWN-API-KEY', 'http://localhost:9011')

# Retrieve a user by email address
client_response = client.retrieve_user_by_username('terry@example.com')
if client_response.was_successful():
	print(client_response.success_response)
else:
	print(client_response.error_response)
```

When you're ready, save the `test.py` application and copy it to the designated folder, `fusionapps`. Now we're ready to execute the program.

Open up a terminal again. If you don't see `(venv)` appended to your `$path`, your virtual environment is not running. Change directories to the directory containing your `venv` virtual environment directory.

```bash
$ cd /path/to/directory/containing/venv/directory
```

You'll recall we execute venv with:

```bash
$ source venv/bin/activate
```

With venv activated, let's change directories to your `fusionapps` folder.

```bash
(venv) $ cd fusionapps
```

Now, the moment we've been waiting for. Execute the test file we just created.

```bash
(venv) $ python test.py
```

If successful, our application should return a client response like this:

```json
{
  "user": {
    "id": "36ca6fa1-a3e0-4de9-abd5-ed6855ea3b50",
    "firstName": "Terry",
    "active": True,
    "passwordLastUpdateInstant": 1569515253001,
    "usernameStatus": "ACTIVE",
    "twoFactorDelivery": "None",
    "timezone": "America/New_York",
    "birthDate": "1980-01-01",
    "preferredLanguages": [
      "en"
      ],
    "verified": True,
    "tenantId": "31626131-3938-6231-3634-663636656635",
    "username": "terry@example.com",
    "mobilePhone": "4245551212",
    "passwordChangeRequired": False,
    "fullName": "Terry Example",
    "insertInstant": 1569515252886,
    "lastName": "Example",
    "twoFactorEnabled": False,
    "email": "terry@example.com"
    }
}
```

Congrats, you've just created your first Python application with the FusionAuth-Client Library!

## Creating a New FusionAuth User and Registering Them to an Application with Python

Optionally, we can create new users and register them to applications with Python. Let's give it a try!

Let's create a new application, and call it `user.py`.

The first thing we will want to do is import the `sys` module and call the FusionAuth Client Python library:

```python
import sys
from fusionauth.fusionauth_client import FusionAuthClient
```

Next, we need to add our FusionAuth API key and URL.

Replace the argument with your own API Key. Recall that you can find your API Key in the FusionAuth UI by navigating to **Settings-->API Keys**.

```python
# You must supply your API key and URL here
client = FusionAuthClient('jJXzUm35UeUzUKJqKoYdMIGYRMYzQsmIgrJcaKyGYuI', 'http://127.0.0.1:9011')
```

Since we want to register our new User to an application, let's specify the application ID. We can find this again in the FusionAuth UI under *Applications*. In this example, we use our own application ID for the app, "**pythonapp**", but you'll want to replace this ID with your own:

```python
# You must supply your Application Id here
application_id='55e36f88-f3ba-4423-8b70-80232c7de8ad'
```

Now, let's create our user. Here, we can specify optional user roles in our application. We are also telling FusionAuth to skip user **E-mail Verification** and **Password Set E-mail**. If we wanted to enable either of these, we would simply switch the argument to `true`.

```python
# Here we create a user and register them to our application in a single request

# This can alternatively be achieved in two steps, first creating the user, then registering them

user_registration_request = {
    'registration': {
        'applicationId': application_id,
        'roles': [
            'user',
            'community_helper'
        ]
    },
    'user': {
        'birthDate': '1980-01-01',
        'email': 'jerry@example.com',
        'password': 'password',
        'firstName': 'Jerry',
        'lastName': 'Example',
        'twoFactorEnabled': False,
        'username': 'jerryexample'
    },
    'sendSetPasswordEmail': False,
    'skipVerification': False
}
```

Finally, let's specify our `client_response`.

```python
client_response = client.register(None, user_registration_request)
if client_response.was_successful():
    print(client_response.success_response)
else:
    sys.exit(client_response.error_response)
```

When you're finished, the application should look something like this:

```python
import sys
from fusionauth.fusionauth_client import FusionAuthClient

# You must supply your API key and URL here
client = FusionAuthClient('jJXzUm35UeUzUKJqKoYdMIGYRMYzQsmIgrJcaKyGYuI', 'http://localhost:9011')

# You must supply your Application Id here
application_id='55e36f88-f3ba-4423-8b70-80232c7de8ad'

# Here we create a user and register them to our application in a single request

# This can alternatively be achieved in two steps, first creating the user, then registering them

user_registration_request = {
    'registration': {
        'applicationId': application_id,
        'roles': [
            'user',
            'community_helper'
        ]
    },
    'user': {
        'birthDate': '1980-01-01',
        'email': 'jerry@example.com',
        'password': 'password',
        'firstName': 'Jerry',
        'lastName': 'Example',
        'twoFactorEnabled': False,
        'username': 'jerryexample'
    },
    'sendSetPasswordEmail': False,
    'skipVerification': False
}

client_response = client.register(None, user_registration_request)
if client_response.was_successful():
    print(client_response.success_response)
else:
    sys.exit(client_response.error_response)
```

Go ahead and save this to a folder on your test server, and let's change directories to the directory containing venv. Fire it up with:

```terminal
$ source venv/bin/activate
```

Change directories to your folder containing `user.py` and execute it with:

```
(venv) $ python user.py
```

If successful, you should see a response that looks something like this:

```json
{
  "user": {
    "id": "36ca6fa1-a3e0-4de9-abd5-ed6855ea3b50",
    "firstName": "Terry",
    "active": true,
    "passwordLastUpdateInstant": 1569515253001,
    "usernameStatus": "ACTIVE",
    "twoFactorDelivery": "None",
    "timezone": "America/New_York",
    "birthDate": "1980-01-01",
    "preferredLanguages": [
      "en"
    ],
    "verified": true,
    "tenantId": "31626131-3938-6231-3634-663636656635",
    "username": "terry@example.com",
    "mobilePhone": "4245551212",
    "passwordChangeRequired": false,
    "fullName": "Terry Example",
    "insertInstant": 1569515252886,
    "lastName": "Example",
    "twoFactorEnabled": false,
    "email": "terry@example.com"
  }
}
```

Navigate to **Users** in the FusionAuth UI. You should now see a new user created and registered to an application!

{% include _image.liquid src="/assets/img/blogs/manage-user-screen.png" alt="Manage User Screen" class="img-fluid full mb-4" figure=false %}


## Troubleshooting Common Errors
What if your app(s) didn't quite work? Here's a list of common error codes that your app or server might return:

### Code 401

**Description:** "_You did not supply a valid Authorization header. The header was omitted or your API key was not valid. The response will be empty. See [Authentication](/docs/v1/tech/apis/authentication)._"

**What this usually means:** Your API key is likely invalid. Did you remember to replace the code example API key with the one from your own FusionAuth server? Did you copy your Application ID instead of your API key? Open up a web browser and go to **Settings > API Keys**, check your API key, and try again.

### Code 503

**Description:** "_The search index is not available or encountered an exception so the request cannot be completed. The response will contain a JSON body._"

**What this usually means:** Check to see if your FusionAuth Search index service is running. If it's running, browse to **Users** in the UI.


If you see a message like, "Error - FusionAuth encountered an error while processing your request. If the problem persists, contact FusionAuth support for assistance," you may just need to restart FusionAuth Search.

{% include _image.liquid src="/assets/img/blogs/error-message-screen.png" alt="Error Message Screen" class="img-fluid full mb-4" figure=false %}


To restart FusionAuth Search service type

```
$ sudo service fusionauth-search start
```

If you're using a Cloud instance like AWS EC2, AWS Lightsail, or Google Cloud, sometimes restarting the server instance and restarting all FusionAuth services will also resolve the issue.

```  
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

**What this usually means:** Do you have the FusionAuth-Client Library already installed? If so, did you execute the application outside of venv? Browse to the directory containing venv, and activate venv:

```
$ source venv/bin/activate
```

Then, change directories to your fusionapps folder and try again:

```
(venv) $ python test.py
```

### Other Errors?
Didn't find your error here? Visit [https://fusionauth.io/docs/v1/tech/apis/users](/docs/v1/tech/apis/users) for more response codes, or visit [https://fusionauth.io/docs/v1/tech/troubleshooting](/docs/v1/tech/troubleshooting) for more troubleshooting suggestions. You can also ask a question on [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth) or open an issue on [Github](https://github.com/FusionAuth/fusionauth-issues/issues/new/choose). As always, if you have a support contract, feel free to [contact FusionAuth support](mailto:support@fusionauth.io).

## Summary

Hopefully your first test application was a success! We covered how to install and setup FusionAuth, Python, and the FusionAuth-Client Library for Python. We explored code examples, wrote, and executed a Python application in the Python Virtual Environment (venv) for retrieving user profile information from FusionAuth, and we covered how to create Applications and API Keys. We also looked at creating a User and registering them to an application with Python!

Now that we've covered some of the basics, let's move on to some code examples for actions we can perform using the FusionAuth-Client Python Library which will allow us to work with registered users within FusionAuth! **Next: [Deactivating, Reactivating, and Deleting A FusionAuth User in Python](/blog/2019/10/08/deactivating-reactivating-deleting-user-fusionauth-python)**

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users. [Find out more](/ "FusionAuth Home") about FusionAuth and download it today.

[Learn More](/){: .btn .btn-primary}
