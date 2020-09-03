---
layout: blog-post
title: Building a user profile portal with Flask, OAuth, and APIs
description: Advanced registration forms let you easily build out multi-step registration forms, but how do you lets the users modify their profile data?
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-advanced-registration-forms client-python
excerpt_separator: "<!--more-->"
---

Once a user registers, you can view their data in the administrative user interface. But how can you allow the user to view or change their data themselves?

<!--more-->

Previously, we built a [self service registration form](/blog/2020/08/27/advanced-registration-form) for a real estate application. It was a two step form which captured specific information about their home buying needs. We also themed the [registration form](/blog/2020/09/01/theme-registration-form). This tutorial builds on the previous two and will walk through building a python flask application to let a user sign in and modify the profile data they provided at registration. 

While this tutorial will reference the previous registration form, you can adapt it to an existing registration flow too.

This is part of a three part series. Here are all the posts:

1. [How to use FusionAuth's advanced registration forms](/blog/2020/08/27/advanced-registration-form)
1. [How to theme FusionAuth's advanced registration forms](/blog/2020/09/01/theme-registration-form)
1. Building a user profile portal with Flask, OAuth, and APIs (this one)

## Overview

Before jumping into the code, let's outline what this blog post will cover. You'll learn how to set up a Flask application to use FusionAuth as a user data store. This post will only have one application and one tenant, but FusionAuth supports multiple tenants and applications out of the box, so if you need that logical separation, you got it.

The Flask application will let users log in or register. After a user has been authenticated, it will display their profile information. This data will be retrieved in two ways, using both a standards based python OAuth library, `requests_oauthlib`, and with the FusionAuth [open source python client library](https://github.com/fusionauth/fusionauth-python-client).

Why two ways? If all you need is data that is provided by an OpenID Connect (aka OIDC), then you should stick with standards, as this will give you maximal portability. `requests_oauthlib` can easily retrieve an access token that your software can present to other services which expect credentials. These may be APIs you build or any other applications which use JWTs for authorization decisions.

> What's the difference between OAuth and OIDC? OAuth is a standardized framework for authorization which delivers tokens to present to other systems to gain access. OIDC is another standardized framework built on top of OAuth which provides user data and authentication information.

However, if you need information beyond what OIDC provides, you will need to use a different approach. An example of such data is the home pricing preference information captured by the registration form built previously. To access this data, you'll need to use the FusionAuth client libraries.

At the end of the day, you'll end up with a self service portal like this:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/final-screen.png" alt="The self service profile management portal." class="img-fluid" figure=false %}

## Prerequisites

You'll need the following pieces of software installed before you start this tutorial:

* python3
* pip3

And of course you'll need to have a registration form and FusionAuth set up. If you want to be walked through that process, check out the previous post on [advanced registration forms](/blog/2020/08/27/advanced-registration-form) and [on theming the form](/blog/2020/09/01/theme-registration-form). If you already have a form set up, full speed ahead!

## FusionAuth setup

Go to "Settings" and create an API key. We'll be using this for to pull the data, so configure these allowed endpoints:

* `/api/user/registration`: all methods
* `/api/form`: `GET` only
* `/api/form/field`: `GET` only

You may also specify no endpoint methods when you create the key. This creates a super-user API key, so beware. Such a key is fine for a tutorial, but for production, please limit access.

Next, update your application settings. Navigate to the "Applications" section, then the "OAuth" tab. Add `http://localhost:5000/callback` to the "Authorized redirect URLs" field. Set the logout URL to be `http://localhost:5000`.

These changes ensure that after the user signs in to FusionAuth, they can be sent back to the Flask application endpoint which can process the authorization code and exchange it for an access token, as well as display their profile data. Additionally, once the user logs out, they'll be sent back to the Flask index page. At the end, the app configuration would look like this:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/oauth-tab-of-application.png" alt="Configuring the FusionAuth application for the flask portal." class="img-fluid" figure=false %}

## Setting up the python virtual environment

Make a directory for this codebase. You could call it something flashy, but I'm going to create one called `flask`. `cd` into it, as that's where you'll create the entire portal application. To set up your virtual environment in this tutorial, you're going to use `venv`: `python3 -m venv venv`. This lets us install libraries locally.

Next, activate this virtual environment by running this command: `. venv/bin/activate`. You should now see `(venv)` in front of your shell prompt:

```shell
(venv) dan@MacBook-Pro flask % 
```

> There are other python tools out there which provide similar functionality to `venv`, such as `pyenv` and `pipenv`.

Next, let's install needed libraries. First, you're going to install flask, which is an extremely lightweight python framework for building applications. You'll be using `pip` for all the library installation.

```shell
pip3 install Flask
```

Next, install an OAuth library, `requests_oauthlib`. You can read [more about it](https://requests-oauthlib.readthedocs.io/en/latest/), but this library makes it easy to interact with any standards compliant OAuth or OIDC implementation. You'll use it to build standard URLs and retrieve the access token:

```shell
pip3 install requests_oauthlib
```

Finally, while some data is available from OIDC endpoints, retrieving profile data stored in the `registration.data` field requires the FusionAuth client library. To install it, use this command:

```shell
pip3 install fusionauth-client
```

The setup is all done. Let's get to coding.

## Setting up the home page

As always, you can jump ahead and [view the completed code](https://github.com/FusionAuth/fusionauth-example-flask-portal) if you'd like.

First, create a file called `oauth.py`. This is the main entry point for all our code and will contain almost all of our logic. Here are the contents of a basic flask application:

```python
from requests_oauthlib import OAuth2Session
from flask import Flask, request, redirect, session, url_for, render_template
from flask.json import jsonify
from fusionauth.fusionauth_client import FusionAuthClient

import json
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config.from_object('settings.Config')

@app.route('/', methods=["GET"])
def homepage():
  return render_template('index.html')

if __name__ == "__main__":
  app.secret_key = os.urandom(24)
  app.run(debug=True)
```

You are going to use flask templates to create the HTML pages. Create a directory called `templates` and a file called `index.html` in that directory. Put the following markup in there:

```html
<!doctype html>
<title>Hello from FusionAuth</title>
<body>

This is a sample OAuth/Flask application. 
</body>
</html>
```

Start the application by running this command in your terminal:

```shell
FLASK_APP=oauth.py python3 -m flask run
```

You should see this output:

```
 * Serving Flask app "oauth.py"
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Heed that warning! What you'll be using during this tutorial is a development server, please don't put it into production. If you visit `http://localhost:5000` with your browser, you'll see this:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/simple-app-screen.png" alt="The initial Flask page." class="img-fluid" figure=false %}

What you just did was start up flask and having it display a rendered template. Not too much logic in there, so next, let's add in some OAuth action and provide a login and registration link.

## Setting up OAuth

You've already installed an OAuth python library, so now it is time to use it. Let's use the configuration capabilities of flask to keep our environment specific config values separate. Create a file named `settings.py`; add this to the contents:

```python
class Config(object): 
  CLIENT_ID="85a03867-dccf-4882-adde-1a79aeec50df"
  CLIENT_SECRET="5E_pVQeSQ2v4d7ckDy6rz_Z0HZjNSShUEbWPRYst2hg"
  FA_URL='http://localhost:9011'
  AUTHORIZATION_BASE_URL='http://localhost:9011/oauth2/authorize'
  TOKEN_URL='http://localhost:9011/oauth2/token'
  USERINFO_URL='http://localhost:9011/oauth2/userinfo'
  REDIRECT_URI='http://localhost:5000/callback'
```

`CLIENT_ID` and `CLIENT_SECRET` are both available in the application you created in previous tutorials. To retrieve them now, navigate to "Applications" and click the green magnifying glass to view these values:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/application-screen-fusionauth.png" alt="Finding the client id and client secret values." class="img-fluid" figure=false %}

The rest of the configuration values are standard OAuth/OIDC endpoints as well as the URL of your Flask application. You should only need to modify those if you are running FusionAuth or flask on a different host or port.

Let's update `index.html` as well, to add links for login and registration. Here's the new HTML:

```html
<!doctype html>
<title>Hello from FusionAuth</title>
<body>

This is a sample OAuth/Flask application. 
<br/>
<br/>
{% if user %}
  <div>
    <a href='/logout'>Logout</a>
  </div>
  <h1>Hello {{ user.email }}!</h1>
{% else %}
  <div>
    Log in or register to update your profile.
  </div>
  <div>
    <a href='/login'>Login</a> | <a href='/register'>Register</a>
  </div>
{% endif %}
</body>
</html>
```

In this template, if the `user` variable exists, the user's email address is shown. Otherwise it displays login or registration links. 

Finally, update `oauth.py` to provide the routes you added to the template. Below is the entire updated file, but we'll examine each method one at a time after the code block:

```
from requests_oauthlib import OAuth2Session
from flask import Flask, request, redirect, session, url_for, render_template
from flask.json import jsonify
from fusionauth.fusionauth_client import FusionAuthClient

import json
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config.from_object('settings.Config')

@app.route('/', methods=["GET"])
def homepage():
  user=None
  if session.get('user') != None:
    user = session['user']
  return render_template('index.html', user=user)

@app.route("/logout", methods=["GET"])
def logout():
  session.clear()
  return redirect(app.config['FA_URL']+'/oauth2/logout?client_id='+app.config['CLIENT_ID'])


@app.route("/login", methods=["GET"])
def login():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])
  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(authorization_url)

@app.route("/register", methods=["GET"])
def register():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])

  # registration lives under non standard url, but otherwise takes exactly the same parameters
  registration_url = authorization_url.replace("authorize","register", 1)

  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(registration_url)

@app.route("/callback", methods=["GET"])
def callback():
  expected_state = session['oauth_state']
  state = request.args.get('state','')
  if state != expected_state:
    print("Error, state doesn't match, redirecting without getting token.")
    return redirect('/')
    
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  token = fusionauth.fetch_token(app.config['TOKEN_URL'], client_secret=app.config['CLIENT_SECRET'], authorization_response=request.url)

  session['oauth_token'] = token
  session['user'] = fusionauth.get(app.config['USERINFO_URL']).json()

  return redirect('/')


if __name__ == "__main__":
  app.config.from_object('settings.Config')

  app.secret_key = os.urandom(24)
  app.run(debug=True)
```

First, the home page route:

```python
# ...
@app.route('/', methods=["GET"])
def homepage():
  user=None
  if session.get('user') != None:
    user = session['user']
  return render_template('index.html', user=user)
# ...
```

This route looks in the session and sets a `user` variable if it exists. As you recall from above, the template has logic based on the existence of this variable.

Next, let's examine the link generation routes:

```python
# ...
@app.route("/logout", methods=["GET"])
def logout():
  session.clear()
  return redirect(app.config['FA_URL']+'/oauth2/logout?client_id='+app.config['CLIENT_ID'])

@app.route("/login", methods=["GET"])
def login():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])
  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(authorization_url)

@app.route("/register", methods=["GET"])
def register():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])

  # registration lives under non standard url, but otherwise takes exactly the same parameters
  registration_url = authorization_url.replace("authorize","register", 1)

  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(registration_url)
# ...
```

All of these build links when called, and then send a redirect to the generated URL. 

> You don't need these routes. You could hard code URLs into the template. But doing this makes for a more maintainable application, as well as nicer looking URLs.

The `/login` route uses the `requests_oauthlib` library to generate a proper authorization URL. The parameters for this URL are all defined by the [RFC](https://tools.ietf.org/html/rfc6749). When the link is clicked, the end user will be shown the FusionAuth themable hosted pages, where they may log in. 

`/logout` deletes the user's session and calls the FusionAuth `logout` endpoint. This ensures that the systems where user state is maintained, your application and FusionAuth, have logged out the user. 

The `/register` route uses the `requests_oauthlib` library to generate the URL, just like the `/login` route. But it also modifies the URL: `registration_url = authorization_url.replace("authorize","register", 1)`. What's going on there? 

This code works because the registration process in FusionAuth is embedded in an OAuth Authorization Code grant. The `register` endpoint takes the same parameters. When someone is done registering for an application, they are in the same state as if they'd logged in:

* A valid `redirect_uri` must be provided.
* The callback code at the `redirect_uri` can call the `token` endpoint to receive a JWT. It also receives and should check the `state` parameter.
* The user is authenticated. 

Let's look at the callback route, which the authorization server, FusionAuth, will redirect the browser to after the user signs in:

```python
# ...
@app.route("/callback", methods=["GET"])
def callback():
  expected_state = session['oauth_state']
  state = request.args.get('state','')
  if state != expected_state:
    print("Error, state doesn't match, redirecting without getting token.")
    return redirect('/')
    
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  token = fusionauth.fetch_token(app.config['TOKEN_URL'], client_secret=app.config['CLIENT_SECRET'], authorization_response=request.url)

  session['oauth_token'] = token
  session['user'] = fusionauth.get(app.config['USERINFO_URL']).json()

  return redirect('/')
# ...
```

This code checks to see that the `state` parameter is the same value as was sent when the user signed up or signed in. Then it fetches the access token using the authorization code. This is embedded in `request.url` and parsed out by the library with no effort on our part.

Finally, we set some session variables and then redirect to the home page route. That page re-renders the template, providing the user object.

Since the FusionAuth OAuth server is running on `localhost` without TLS, you need to let the OAuth library know that you are okay with that. Otherwise you'll see this error:

```
oauthlib.oauth2.rfc6749.errors.InsecureTransportError: (insecure_transport) OAuth 2 MUST utilize https.
```

To avoid that, start your flask server in a slightly different way:

```shell
OAUTHLIB_INSECURE_TRANSPORT=1 FLASK_APP=oauth.py python3 -m flask run
```

Now, visit `http://localhost:5000` in your browser. You'll be able to register or log in. You'll see this screen, presumably with a different email address:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/oauth-portal-page.png" alt="The portal page when you authenticate with OAuth." class="img-fluid" figure=false %}

## Editing profile data

You could stop here if you wanted, I suppose. You're showing the user data that is retrieved from the [`userinfo` OIDC endpoint](/docs/v1/tech/oauth/endpoints#userinfo), and you could display other data like the user's name. 

But you're no schmuck. You want more. I promised the ability to edit the profile data, and the below code will deliver.

Let's take that next step and display not only the user's email address, but also the data they provided on registration. You'll even pull the form field configuration dynamically. This means that if you change the configuration of your custom fields, to, say, make a profile field optional, the portal update form will change in response.

> At this point, you're changing from using OIDC to using the FusionAuth APIs.

First, add more configuration settings. Update your `settings.py` file like so:

```python
class Config(object): 
  CLIENT_ID="85a03867-dccf-4882-adde-1a79aeec50df"
# ...
  USERINFO_URL='http://localhost:9011/oauth2/userinfo'
  REDIRECT_URI='http://localhost:5000/callback'
  API_KEY='3_g6FQBuatlmxRSITB64FnkliODvtWMuAHxaPB0M3IU'
  FORM_ID='7a7e08db-5aee-4c28-b5b7-7ec7f7cedf14'
```

The changes add an API key (which you added when configuring FusionAuth) and the form id for the advanced registration form. The latter was created in the [initial blog post](/blog/2020/08/27/advanced-registration-form). To find the `FORM_ID`, navigate to "Customizations" then "Forms". You'll see the form identifier on the list of forms:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/form-id-display.png" alt="Finding the form id for your advanced registration form." class="img-fluid" figure=false %}

The `FORM_ID` allows our code to retrieve the form fields which comprise that form. 

Let's update the `index.html` file to display the user's data as well as to generate a form to update that data:

```html
<!doctype html>
<title>Hello from FusionAuth</title>
<body>

This is a sample OAuth/Flask application. 
<br/>
<br/>
{% if user %}
  <div>
    <a href='/logout'>Logout</a>
  </div>
  <h1>Hello {{ user.email }}!</h1>

  {% if error %}
    <p style="color:red">Error: {{ error }}</p> 
  {% endif %}
  <div>
  <h3>Current preferences</h3>
  {% if registration_data %}  
    {% for key in registration_data.keys() %}
      <p>
      {% if key == 'geographicarea' and registration_data['geographicarea'] | length > 0 %}
        Geographic area: {{registration_data['geographicarea']}}
      {% endif %}
      {% if key == 'maxprice' %}
        Maximum home price: {{ "$%.0f"|format(registration_data['maxprice'])}}
      {% endif %}
      {% if key == 'minprice' %}
        Minimum home price: {{ "$%.0f"|format(registration_data['minprice'])}}
      {% endif %}
      </p>
    {% endfor %}
  {% endif %}

  </div>
  <div>
  <h3>Update your preferences</h3>

    <form action="/update" method="post">
      {% if registration_data %}  
        {% for key in registration_data.keys() %}
          <p>
          {% if key == 'geographicarea' %}
            Geographic area: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['geographicarea']}}' />
          {% endif %}
          {% if key == 'maxprice' %}
            Maximum home price: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['maxprice']}}' />
          {% endif %}
          {% if key == 'minprice' %}
            Minimum home price: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['minprice']}}' />
          {% endif %}
          </p>
        {% endfor %}
      {% endif %}
      <input type="submit" value="Update"></input>
    </form>
  </div>
{% else %}
  <div>
    Log in or register to update your profile.
  </div>
  <div>
    <a href='/login'>Login</a> | <a href='/register'>Register</a>
  </div>
{% endif %}
</body>
</html>
```

Here are the changed, relevant sections. First, this is displays the profile information:

```html
<!-- ... -->
<h3>Current preferences</h3>
{% if registration_data %}  
  {% for key in registration_data.keys() %}
    <p>
    {% if key == 'geographicarea' and registration_data['geographicarea'] | length > 0 %}
      Geographic area: {{registration_data['geographicarea']}}
    {% endif %}
    {% if key == 'maxprice' %}
      Maximum home price: {{ "$%.0f"|format(registration_data['maxprice'])}}
    {% endif %}
    {% if key == 'minprice' %}
      Minimum home price: {{ "$%.0f"|format(registration_data['minprice'])}}
    {% endif %}
    </p>
  {% endfor %}
{% endif %}
<!-- ... -->
```

This display code iterates and displays the values in the `registration_data` array. If appropriate, the field is formatted. 

The code which builds a form for updating is also worth checking out:

```html
<!-- ... -->
<form action="/update" method="post">
  {% if registration_data %}  
    {% for key in registration_data.keys() %}
      <p>
      {% if key == 'geographicarea' %}
        Geographic area: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['geographicarea']}}' />
      {% endif %}
      {% if key == 'maxprice' %}
        Maximum home price: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['maxprice']}}' />
      {% endif %}
      {% if key == 'minprice' %}
        Minimum home price: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['minprice']}}' />
      {% endif %}
      </p>
    {% endfor %}
  {% endif %}
  <input type="submit" value="Update"></input>
</form>
<!-- ... -->
```

This builds a form from the same `registration_data` array. But it does something else which you might find intriguing. Let's take a deeper look at the maximum price form field, which has some additional newlines added below:

```html
<!-- ... -->
Maximum home price: 
  <input 
  type='{{fields['registration.data.'+key].control}}' 
  {% if fields['registration.data.'+key].required %}required{% endif %} 
  name='{{key}}' 
  value='{{registration_data['maxprice']}}' />
<!-- ... -->
```

How are the `type` and `required` attributes determined? What is this `fields` value? 

The source of this mysterious `fields` value are the form field definitions. If the field definition changes, the form field generated is modified as well.

Let's look at the code, where `registration_data` and `fields` variables are set up. Here's the entire `oauth.py` file, but below we'll examine the changes:

```python
from requests_oauthlib import OAuth2Session
from flask import Flask, request, redirect, session, url_for, render_template
from flask.json import jsonify
from fusionauth.fusionauth_client import FusionAuthClient

import json
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config.from_object('settings.Config')

@app.route('/', methods=["GET"])
def homepage():
  user=None
  registration_data=None
  fields = {}
  if session.get('user') != None:
    user = session['user']
    fusionauth_api_client = FusionAuthClient(app.config['API_KEY'], app.config['FA_URL'])
    user_id = user['sub']
    application_id = user['applicationId']
    client_response = fusionauth_api_client.retrieve_registration(user_id, application_id)
    if client_response.was_successful():
      #print(client_response.success_response)
      registration_data = client_response.success_response['registration'].get('data')
      fields = get_fields(fusionauth_api_client)
    else:
      print(client_response.error_response)
  return render_template('index.html', user=user, registration_data=registration_data, fields=fields)

@app.route("/update", methods=["POST"])
def update():
  user=None
  error=None
  fields=[]
  fusionauth_api_client = FusionAuthClient(app.config['API_KEY'], app.config['FA_URL'])
  if session.get('user') != None:
    user = session['user']
    user_id = user['sub']
    application_id = user['applicationId']

    client_response = fusionauth_api_client.retrieve_registration(user_id, application_id)
    if client_response.was_successful():
      #print(client_response.success_response)
      registration_data = client_response.success_response['registration'].get('data')
      fields = get_fields(fusionauth_api_client)
      for key in fields.keys():
        field = fields[key]
        form_key = field['key'].replace('registration.data.','')
        new_value = request.form.get(form_key,'')
        if field['control'] == 'number':
          registration_data[form_key] = int(new_value)
        else:
          registration_data[form_key] = new_value
      patch_request = { 'registration' : {'applicationId': application_id, 'data' : registration_data }}
      client_response = fusionauth_api_client.patch_registration(user_id, patch_request)
      if client_response.was_successful():
        #print(client_response.success_response)
      else:
         error = "Unable to save data"
         return render_template('index.html', user=user, registration_data=registration_data, fields=fields, error=error)
  return redirect('/')

@app.route("/logout", methods=["GET"])
def logout():
  session.clear()
  return redirect(app.config['FA_URL']+'/oauth2/logout?client_id='+app.config['CLIENT_ID'])


@app.route("/login", methods=["GET"])
def login():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])
  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(authorization_url)

@app.route("/register", methods=["GET"])
def register():
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  authorization_url, state = fusionauth.authorization_url(app.config['AUTHORIZATION_BASE_URL'])

  # registration lives under non standard url, but otherwise takes exactly the same parameters
  registration_url = authorization_url.replace("authorize","register", 1)

  # State is used to prevent CSRF, keep this for later.
  session['oauth_state'] = state

  return redirect(registration_url)

@app.route("/callback", methods=["GET"])
def callback():
  expected_state = session['oauth_state']
  state = request.args.get('state','')
  if state != expected_state:
    print("Error, state doesn't match, redirecting without getting token.")
    return redirect('/')
    
  fusionauth = OAuth2Session(app.config['CLIENT_ID'], redirect_uri=app.config['REDIRECT_URI'])
  token = fusionauth.fetch_token(app.config['TOKEN_URL'], client_secret=app.config['CLIENT_SECRET'], authorization_response=request.url)

  session['oauth_token'] = token
  session['user'] = fusionauth.get(app.config['USERINFO_URL']).json()

  return redirect('/')

def get_fields(fusionauth_api_client):
  fields = {}
  client_response = fusionauth_api_client.retrieve_form(app.config['FORM_ID'])
  if client_response.was_successful():
    #print("form")
    field_ids = client_response.success_response['form']['steps'][1]['fields']
    for id in field_ids:
      client_response = fusionauth_api_client.retrieve_form_field(id)
      if client_response.was_successful(): 
        field = client_response.success_response['field']
        fields[field['key']] = field
  else:
    print(client_response.error_response)
  return fields

if __name__ == "__main__":
  # This allows us to use a plain HTTP callback
  app.config.from_object('settings.Config')

  app.secret_key = os.urandom(24)
  app.run(debug=True)
```

Two routes have changed or been added. The index, or `/`, route has a lot more going on now. The `/update` route is new. Additionally, a helper method, `get_fields` has been added. Let's look at each of these in turn. First up, the index route:

```python
# ...
@app.route('/', methods=["GET"])
def homepage():
  user=None
  registration_data=None
  fields = {}
  if session.get('user') != None:
    user = session['user']
    fusionauth_api_client = FusionAuthClient(app.config['API_KEY'], app.config['FA_URL'])
    user_id = user['sub']
    application_id = user['applicationId']
    client_response = fusionauth_api_client.retrieve_registration(user_id, application_id)
    if client_response.was_successful():
      registration_data = client_response.success_response['registration'].get('data')
      fields = get_fields(fusionauth_api_client)
    else:
      print(client_response.error_response)
  return render_template('index.html', user=user, registration_data=registration_data, fields=fields)
# ...
```

This route examines the `user` object, which was returned from the successful authentication. It pulls off the `sub` attribute, which is the user identifier and looks something like `8ffee38d-48c3-48c9-b386-9c3c114c7bc9`. It also retrieves the `applicationId`. Both of these existed on the user object before, but the previous code ignored them. 

Once those ids are available, the registration object is retrieved using a previously created FusionAuth client. The registration object's data field is placed into the `registration_data` variable and passed to the template for display. The helper method, to be examined below in more detail, is also called and whatever it returns is made available to the template as the `fields` variable.

Now, about that helper method. Let's take a look at `get_fields`:

```python
# ...
def get_fields(fusionauth_api_client):
  fields = {}
  client_response = fusionauth_api_client.retrieve_form(app.config['FORM_ID'])
  if client_response.was_successful():
    field_ids = client_response.success_response['form']['steps'][1]['fields']
    for id in field_ids:
      client_response = fusionauth_api_client.retrieve_form_field(id)
      if client_response.was_successful(): 
        field = client_response.success_response['field']
        fields[field['key']] = field
  else:
    print(client_response.error_response)
  return fields
```

This looks at the form and retrieves ids of all fields on the second step: `['form']['steps'][1]`. It then gets all each field configuration. 

The code then adds that form field configuration information to a dictionary, keyed off of the key of the field. A key is a string like `registration.data.minprice`. This dictionary is what is used to build certain attributes of the update form, as shown above. This would need to be modified to loop over steps if you had more than one step collecting profile data.

The final relevant section of code is the `/update` route handler, shown below:

```python
# ...
@app.route("/update", methods=["POST"])
def update():
  user=None
  error=None
  fields=[]
  fusionauth_api_client = FusionAuthClient(app.config['API_KEY'], app.config['FA_URL'])
  if session.get('user') != None:
    user = session['user']
    user_id = user['sub']
    application_id = user['applicationId']

    client_response = fusionauth_api_client.retrieve_registration(user_id, application_id)
    if client_response.was_successful():
      #print(client_response.success_response)
      registration_data = client_response.success_response['registration'].get('data')
      fields = get_fields(fusionauth_api_client)
      for key in fields.keys():
        field = fields[key]
        form_key = field['key'].replace('registration.data.','')
        new_value = request.form.get(form_key,'')
        if field['control'] == 'number':
          registration_data[form_key] = int(new_value)
        else:
          registration_data[form_key] = new_value
      patch_request = { 'registration' : {'applicationId': application_id, 'data' : registration_data }}
      client_response = fusionauth_api_client.patch_registration(user_id, patch_request)
      if client_response.was_successful():
        pass
      else:
         error = "Unable to save data"
         return render_template('index.html', user=user, registration_data=registration_data, fields=fields, error=error)
  return redirect('/')
# ... 
```

This code retrieves the user's registration object for this application. It then updates the `data` object with new values, perhaps transforming a field from a string to a different datatype if required. Currently it handles only the `number` type, but could be extended to handle `boolean` or other data types.

After the object has been updated, a `PATCH` request is made. This updates only the `data` field.

## Putting it all together

You can run the code with the display and update of profile data in the same way you did previously: 

```shell
OAUTHLIB_INSECURE_TRANSPORT=1 FLASK_APP=oauth.py python3 -m flask run
```

You'll see the same initial page prompting a login or registration. When you register or sign in, you'll see this page:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/final-screen.png" alt="The self service profile management portal." class="img-fluid" figure=false %}

The user can now register and update their profile information whenever they want. As a reminder, you can see and use all this code by checking out the [GitHub repo](https://github.com/FusionAuth/fusionauth-example-flask-portal).

## Next steps

If you want to take this tutorial further, here are some improvements:

* Make the portal look nicer by using a modern CSS framework.
* Split up the flask `config` into dev/staging/prod objects.
* Last but certainly not least, build out the real application! You have profile data from the end user, now send them some homes they might be interested in.

## Conclusion

The code in this application uses both standard OAuth and OIDC to retrieve data. It also uses the FusionAuth APIs. The flask application you built can retrieve and modify users' data, allowing them to make changes to the data provided at registration.

We've reached the end of this blog series about registration forms. You have all the pieces to put together a registration flow for custom applications. You can create the registration form, theme it and provide your user a way to update their profile data.

Happy coding!
