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

Once a user registers with a custom form, you can view the data in the administrative user interface. But how can you allow the user to view or change the data themselves?

<!--more-->

Previously, we built a [self service registration form](/blog/2020/08/27/advanced-registration-form) for a real estate application. It was a two step form which captured specific information about their home buying needs. We also themed the [registration form](TBD). This tutorial builds on the previous two and will walk you through building a python flask application to let a user sign in and modify their registration data. 

While this tutorial will reference the previous registration form, you can adapt it to your own existing registration flow as well.

## Overview

Before jumping into the code, let's outline what this blog post will help you do. It'll walk through setting up a basic Flask application to interact with FusionAuth.

The Flask application will let log in or register, and then will present profile information to them. This data will be retrieved in two ways, one with a standards based python OAuth library, and the second with the FusionAuth client library?

Why two ways? If all you need is data that is OIDC compatible, then you should stick with standards. Using the standard library also gets you an access token that you can use with other data providers, such as APIs you build or any other software which uses JWTs for authorization decisions.

> What's the difference between OAuth and OIDC? OAuth is a framework for authorization which delivers tokens to present to other systems to gain access. OIDC is a framework built on top of OAuth which provides user data and authentication information.

However, if you need access to information beyond what the OIDC spec provides, you need to use a different approach. An example of such data is the home pricing preference data captured by the registration form. To access this, you'll need to use the FusionAuth client libraries.

At the end of the day, you'll end up with a self service portal like this:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/final-screen.png" alt="The self service profile management portal." class="img-fluid" figure=false %}

## Prerequisites

You'll need the following installed before you start this tutorial:

* python3
* pip3

And of course you'll need to have a registration form and FusionAuth set up. If you want to be walked through this, check out the previous post on [advanced registration forms](/blog/2020/08/27/advanced-registration-form) and [on theming the form](TBD). If you already have a form set up, full speed ahead!

## FusionAuth setup

Go to "Settings" and create an API key. We'll be using this for scripted theme management, so configure these allowed endpoints:

* `/api/user`: all methods
* `/api/user/registration`: all methods
* `/api/form`: `GET` only
* `/api/form/field`: `GET` only

You may also specify no endpoint methods when you create the key. This creates a super-user API key, so beware. This is fine for a tutorial, but for production, please limit access.

Update your application settings. Navigate to the "Applications" section, then the "OAuth" tab. Add `http://localhost:5000/callback` to the "Authorized request origin URLs" field. Set the logout URL to be `http://localhost:5000`.

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/flask-oauth-portal/oauth-tab-of-application.png" alt="Configuring the FusionAuth application for the flask portal." class="img-fluid" figure=false %}

## Setting up the python virtual environment

You can jump ahead and [read the completed code](https://github.com/FusionAuth/fusionauth-example-flask-portal) if you'd like.

Make a directory, `flask` and change into it.

Run this command to set up your virtual environment. This lets us install libraries locally:

`python3 -m venv venv`

Next, activate the virtual environment by running this command:

`. venv/bin/activate`

You should now see `(venv)` in front of your shell prompt:

```shell
(venv) dan@MacBook-Pro flask % 
```

> There are other python tools out there which provide similar functionality to `venv`, such as `pyenv` and `pipenv`.

Next, let's install some needed libraries. 

First, you're going to install flask, which is an extremely lightweight way to build applications in python:

`pip3 install Flask`

Next, you should install an OAuth library, `requests_oauthlib`. You can read more about it [here](https://requests-oauthlib.readthedocs.io/en/latest/). This library makes it very easy to interact with any standards compliant OAuth and OIDC server. You'll use it to interact with FusionAuth for building standard URLs and retrieving the access token:

`pip3 install requests_oauthlib`

Finally, while some of the functionality is available from endpoints specified by standards, others will require use of the FusionAuth client library. To install that, use this command:

`pip3 install fusionauth-client`

## Setting up the home page

The first thing to do is create a file called `oauth.py`. 

Here are the contents:

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

Create an directory `templates` and a file called `index.html` in that directory. Put the following in there:

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

You should see this in the terminal:

```
 * Serving Flask app "oauth.py"
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

And if you visit the page in your browser, you'll see this:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/simple-app-screen.png" alt="The initial Flask page." class="img-fluid" figure=false %}

What you are doing here is starting up flask and having it display a rendered template. 

Next, let's add in some OAuth action and provide a login and registration link.

## Setting up OAuth

You've already installed the OAuth library, so now you just need to use it. Let's use the configuration capabilities of flask to store items that you'll need. Create `settings.py` and put the following code into it:

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

`CLIENT_ID` and `CLIENT_SECRET` are both available in the application you created previously. To get them now, go to "Applications" and click the green magnifying glass to view these values. 

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/application-screen-fusionauth.png" alt="Finding the client id and client secret values." class="img-fluid" figure=false %}

The rest of the values are standard OAuth/OIDC endpoints as well as your Flask application. You should only need to modify them if you are running FusionAuth or your Flask servers at a different host.

Let's update `index.html` too, to add links for login and registration:

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

In this template, if `user` is passed to it, it displays the user's email address. Otherwise it displays login or registration links. 

Finally, let's update `oauth.py` to provide these routes. This is a lot of code, but we'll examine each method one at a time below.

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
  # This allows us to use a plain HTTP callback
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

This route looks in the session and sets a `user` variable if it exists. As you might recall from above, the template switches on the existence of this variable.

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

All of these build links and then redirect them. `/logout` simply deletes the user's session and then calls the FusionAuth logout endpoint. This ensures that both places where the user state is maintained, your application and FusionAuth, have logged out the user. 

> You don't need these routes. You could hardcode URLs into the template. But doing this makes for a more maintainable application, as well as nicer looking URLs.

The `/login` route uses the library to build an authorization URL. When clicked, the end user will be shown the FusionAuth hosted pages (which are themeable). 

The `/register` route uses the same library to generate the URL but also modifies it: `registration_url = authorization_url.replace("authorize","register", 1)`. What's going on here? 

This happens because the registration process in FusionAuth is embedded in an OAuth Authorization Code grant, so takes all the same parameters. However, registration is obviously different from authentication, so it's a different URL endpoint. 

This fact means that when someone is finished registering, they are in the same place as if they'd logged in:

* A valid `redirect_uri` must be provided.
* The callback code at the `redirect_uri` can call the `token` endpoint to receive a JWT. It also receives the `state` parameter.
* The user is authenticated. 

Let's look at that callback code:

```python
#...
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
#...
```

This code first checks to see that `state` is the same value as was sent when the user clicked on one of the links. Then it fetches the access token using the aauthorization code. This is embedded in the `request.url` and parsed out by the library with no effort on our code's part.

Finally, we set some session variables and then redirect to the home page. That page re-renders the template, providing the user object.

Now, since the FusionAuth OAuth server is running on `localhost` without TLS, you need to let the OAuth library know that it's okay. Otherwise you'll see this error:

```
oauthlib.oauth2.rfc6749.errors.InsecureTransportError: (insecure_transport) OAuth 2 MUST utilize https.
```

So you need to start your server with a slightly different command: 

```shell
OAUTHLIB_INSECURE_TRANSPORT=1 FLASK_APP=oauth.py python3 -m flask run
```

If you do so, you'll be able to register or login and end up at this screen:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/oauth-portal-page.png" alt="The portal page when you authenticate with OAuth." class="img-fluid" figure=false %}

## Editing profile data

You could stop here, if you wanted, I suppose. You're showing the user data that is retrieved from the [`userinfo` standard endpoint](/docs/v1/tech/oauth/endpoints#userinfo). But you probably want more. 

Let's take the next step and display not just the user's email address, but their registration specific data. You'll even pull the form field data dynamically so if you add more custom fields, the portal will display those as well.

> At this point, you're switching from standard OIDC endpoints to using the FusionAuth APIs.

To do this, first you need to add more settings. Update your `settings.py` file:

```python
class Config(object): 
  CLIENT_ID="85a03867-dccf-4882-adde-1a79aeec50df"
  CLIENT_SECRET="5E_pVQeSQ2v4d7ckDy6rz_Z0HZjNSShUEbWPRYst2hg"
  FA_URL='http://localhost:9011'
  AUTHORIZATION_BASE_URL='http://localhost:9011/oauth2/authorize'
  TOKEN_URL='http://localhost:9011/oauth2/token'
  USERINFO_URL='http://localhost:9011/oauth2/userinfo'
  REDIRECT_URI='http://localhost:5000/callback'
  API_KEY='3_g6FQBuatlmxRSITB64FnkliODvtWMuAHxaPB0M3IU'
  FORM_ID='7a7e08db-5aee-4c28-b5b7-7ec7f7cedf14'
```

You are adding an API key (which you added when configuring FusionAuth) and the form id for the advanced registration form (added in the [initial blog post](/blog/2020/08/27/advanced-registration-form)). To find the value for `FORM_ID`, naviage to "Customizations" then "Forms" and view your form.

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/form-id-display.png" alt="Finding the form id for your advanced registration form." class="img-fluid" figure=false %}

This will be used to pull the form fields.

Let's update the `index.html` file to both display and allow updating of the user's data.

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

Here are the relevant sections. First, this is the section displaying the information:

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
  </div>
<!-- ... -->
```

This code iterates each of the values in the `registration_data` object, which is provided to the template, and displays them. If appropriate, it'll format the field.

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

This builds a form from the same `registration_data` value. But it does something else intriguing. Let's take a deeper look at the maximum price form field:

```html
<!-- ... -->
Maximum home price: <input type='{{fields['registration.data.'+key].control}}' {% if fields['registration.data.'+key].required %}required{% endif %} name='{{key}}' value='{{registration_data['maxprice']}}' />
<!-- ... -->
```

How are the `type` and `required` attribues determined? What is this `fields` value? 

The source of this mysterious `fields` value is the form field definitions that were created previously. This means that if the field definition changes, such as if a field becomes required, the form field generated here will adhere to the same rules.

Let's look at the code, where `registration_data` and `fields` are actually generated. Again, here's the entire `oauth.py` file, but below we'll examine the 

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
          # TODO must handle all types here otherwise the data gets out of sync
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

Two routes have changed or been added. The `/` route has a lot more going on now. The `/update` route is new. And a helper method, `get_fields` has been added. Let's look at each of these in turn.

```python
#...
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
#...
```

This now looks at the `user` object, and pulls off the `sub` attribute. This is the user identifier, which looks like `8ffee38d-48c3-48c9-b386-9c3c114c7bc9`. It also pulls the `applicationId` from the same object. Both of these existed on the user object before, but the previous code ignored them. 

Once that data is available, the registration object is retrieved using a previously created client. This is placed into the `registration_data` variable and passed to the template.  The helper method (which will be examined below in more detail) is also called and whatever it returns is made available to the template.

Here's the `get_fields` method:

```python
#...
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
```

This looks at the configured form and pulls all the field ids on the second step (`['form']['steps'][1]`) and then retrieves the full form field configuration. Then it adds the data to a dictionary, keyed off of the field key, such as `registration.data.minprice`. This dictionary is then iterated in the `index.html` template, as shown above. 

This would need to be modified if you had more than one step which collected profile data.

The final interesting section of code is the `/update` route handler, shown below:

```python
#...
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
#...
```

This code pulls the registration and then updates the `data` object with any new values, perhaps transforming a field from a string to a different datatype if needed. Right now it only handles the `number` type, but if your profile data includes other types, it should be extended. 

Then, after the object has been updated, a `PATCH` request is made. This only updates the `data` field. Other parts of a user registration can be modified without worrying about collision or inadvertent overwrites.

## Putting it all together

You can run this updated code in the same way as you did the previous incarnation: 

```shell
OAUTHLIB_INSECURE_TRANSPORT=1 FLASK_APP=oauth.py python3 -m flask run
```

You'll see the same initial page, but when you register or sign in, you'll see this page:

{% include _image.liquid src="/assets/img/blogs/flask-oauth-portal/final-screen.png" alt="The self service profile management portal." class="img-fluid" figure=false %}

The user can now register and update their profile whenever they want.

As a reminder, you can see and use all this code by checking out the [GitHub repo](https://github.com/FusionAuth/fusionauth-example-flask-portal).

## Next steps

If you want to take this tutorial further, here are some ways to improve it:

* Make the portal look better by incorporating a modern CSS framework like Tailwind.
* Split up the flask config into dev/staging/prod sections.
* Last but certainly not least, build out the real application! You have profile data from the end user, now send them some homes they might be interested in!

## Conclusion

The code in this uses both standard OAuth/OIDC ilibraries and FusionAuth APIs. The flask application you build can retrieve and modify users' data, allowing them to make changes to the data they provided on registration.

You have all the pieces to put together a user registration or login flow for any number of custom applications. You can create the registration form, theme it and provide your user a way to update their profile data.


