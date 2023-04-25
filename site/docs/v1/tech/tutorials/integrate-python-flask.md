---
layout: doc
title: Integrate Your Python Flask Application With FusionAuth
description: Integrate your Python Flask application with FusionAuth
navcategory: getting-started
prerequisites: python3 and pip3
technology: Python Flask
language: Python
---

{% include_relative _integrate-intro.md %}

## Prerequisites

For this tutorial, you’ll need to have {{page.prerequisites}} installed. You’ll also need Docker, since that is how you’ll install FusionAuth.

The commands below are for macOS and Linux, but are limited to `mkdir` and `cd`.

## Download and Install FusionAuth

{% include_relative _integrate-install-fusionauth.md %}

## Create a User and an API Key

Next, [log into your FusionAuth instance](http://localhost:9011). You’ll need to set up a user and a password, as well as accept the terms and conditions.

{% include docs/_image.liquid src="/assets/img/docs/integrations/flask-integration/admin-user-setup.png" alt="Admin user setup in FusionAuth." class="img-fluid" width="1200" figure=false %}


Then, you’re at the FusionAuth admin UI. This lets you configure FusionAuth manually. But for this tutorial, you’re going to create an API key and then you’ll configure FusionAuth via the API using the [{{page.language}} client library](/docs/v1/tech/client-libraries/python).

Navigate to <span class="breadcrumb">Settings → API Keys</span>. Click the <span class="uielement">+</span> button to add a new API Key.

{% include docs/_image.liquid src="/assets/img/docs/integrations/flask-integration/api-key.png" alt="API key setup in FusionAuth." class="img-fluid" width="1200" figure=false %}


Copy the value of the <span class="field">Key</span> field and then save the key. It should be a value similar to `CY1EUq2oAQrCgE7azl3A2xwG-OEwGPqLryDRBCoz-13IqyFYMn1_Udjt`.

Doing so creates an API key that can be used for any FusionAuth API call. Note that key value as you’ll be using it later.

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the [{{page.language}} client library](/docs/v1/tech/client-libraries/python). You can use the client library with an IDE of your preference as well.

First, create the required files:

```shell
touch requirements.txt setup.py
```

Now, cut and paste the following requirements into `requirements.txt`:

```text
fusionauth-client==1.42.0
```

Then, copy and paste the following code into the `setup.py` file.

```python
from fusionauth.fusionauth_client import FusionAuthClient
import os
import sys

APPLICATION_ID = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";

#  you must supply your API key
api_key_name = 'fusionauth_api_key'
api_key = os.getenv(api_key_name)
if not api_key:
  sys.exit("please set api key in the '" + api_key_name + "' environment variable")

client = FusionAuthClient(api_key, 'http://localhost:9011')

# set the issuer up correctly
client_response = client.retrieve_tenants()
if client_response.was_successful():
  tenant = client_response.success_response["tenants"][0]
else:
  sys.exit("couldn't find tenants " + str(client_response.error_response))

client_response = client.patch_tenant(tenant["id"], {"tenant": {"issuer":"http://localhost:9011"}})
if not client_response.was_successful():
  sys.exit("couldn't update tenant "+ str(client_response.error_response))

# generate RSA keypair for signing
rsa_key_id = "356a6624-b33c-471a-b707-48bbfcfbc593"

client_response = client.generate_key({"key": {"algorithm":"RS256", "name":"For PythonExampleApp", "length": 2048}}, rsa_key_id)
if not client_response.was_successful():
  sys.exit("couldn't create RSA key "+ str(client_response.error_response))

# create application
# too much to inline it

application = {}
application["name"] = "PythonExampleApp"

# configure oauth
application["oauthConfiguration"] = {}
application["oauthConfiguration"]["authorizedRedirectURLs"] = ["http://127.0.0.1:5000/callback"]
application["oauthConfiguration"]["requireRegistration"] = True
application["oauthConfiguration"]["enabledGrants"] = ["authorization_code", "refresh_token"]
application["oauthConfiguration"]["logoutURL"] = "http://127.0.0.1:5000/logout"
application["oauthConfiguration"]["clientSecret"] = "change-this-in-production-to-be-a-real-secret"

# some libraries don't support pkce, notably mozilla-django-oidc: https://github.com/mozilla/mozilla-django-oidc/issues/397
# since we are server side and have a solid client secret, we're okay turning pkce off
application["oauthConfiguration"]["proofKeyForCodeExchangePolicy"] = "NotRequiredWhenUsingClientAuthentication"

# assign key from above to sign tokens. This needs to be asymmetric
application["jwtConfiguration"] = {}
application["jwtConfiguration"]["enabled"] = True
application["jwtConfiguration"]["accessTokenKeyId"] = rsa_key_id
application["jwtConfiguration"]["idTokenKeyId"] = rsa_key_id

client_response = client.create_application({"application": application}, APPLICATION_ID)
if not client_response.was_successful():
  sys.exit("couldn't create application "+ str(client_response.error_response))

# register user, there should be only one, so grab the first
client_response = client.search_users_by_query({"search": {"queryString":"*"}})
if not client_response.was_successful():
  sys.exit("couldn't find users "+ str(client_response.error_response))

user = client_response.success_response["users"][0]

# patch the user to make sure they have a full name, otherwise OIDC has issues
client_response = client.patch_user(user["id"], {"user": {"fullName": user["firstName"]+" "+user["lastName"]}})
if not client_response.was_successful():
  sys.exit("couldn't patch user "+ str(client_response.error_response))

# now register the user
client_response = client.register({"registration":{"applicationId":APPLICATION_ID}}, user["id"])
if not client_response.was_successful():
  sys.exit("couldn't register user "+ str(client_response.error_response))
```

Then, you can run the setup script. Please note that this setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than "Default". To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. Refer to the [Python client library](/docs/v1/tech/client-libraries/python) documentation for more information.

You’ll use a virtual environment `venv` to keep your workspace clean.

```shell
python -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt
```

Now run the setup script, replacing `<your API key>` with the value of the API key noted earlier.

```shell
fusionauth_api_key=<your API key> python setup.py
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key_1='<your API key>'
python setup.py
```

This configures FusionAuth for your {{page.technology}} application.

When you’re done, you can log in to your instance and examine the new application configuration, the script created for you.

## Create Your {{page.technology}} Application

Now you are going to create a {{page.technology}} application. While this section builds a simple {{page.technology}} application, you can use the same configuration to integrate your complex {{page.technology}} application with FusionAuth.

First, make a directory:

```shell
mkdir setup-flask && cd setup-flask
```

Now, create a new `requirements.txt` file to include {{page.technology}}. Add the `flask`, `python-dotenv`, and `authlib` plugins so that your requirements file looks like this:

```text
flask>=2.2.3
python-dotenv>=1.0.0
authlib>=1.2.0
```

Then, rerun `pip install` to install these new packages.

```shell
pip install -r requirements.txt
```

Next, create a file called `.env` and insert the following into it.

```ini
CLIENT_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e
CLIENT_SECRET=change-this-in-production-to-be-a-real-secret
ISSUER=http://localhost:9011
APP_SECRET_KEY=my_super_secret_key_that_needs_to_be_changed
```

You can now start writing the code for your Flask application. Create a new file called `server.py` and add the following import statements into it:

```python
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for
```

The following code uses `json` to process data from the FusionAuth API, `os.environ`, `dotenv.find_dotenv`, and `dotenv.load_dontenv` to load environment variables, `urllib.parse.quote_plus` and `urllib.parse.urlencode` to build the logout URL, `authlib.integrations.flask_client.OAuth` to handle OIDC verification, and various `flask` modules to facilitate the app’s functionality.

Next, locate the `.env` file and retrieve the `APP_SECRET_KEY` environment variable.

```python
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")
```

Then, register your application with the FusionAuth server.

```python
oauth = OAuth(app)

oauth.register(
    "FusionAuth",
    client_id=env.get("CLIENT_ID"),
    client_secret=env.get("CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
        'code_challenge_method': 'S256' # This enables PKCE
    },
    server_metadata_url=f'{env.get("ISSUER")}/.well-known/openid-configuration'
)
```

Now, you can start adding service routes.

First, add the `login` route, which redirects to FusionAuth to handle user authentication:

```python
@app.route("/login")
def login():
    return oauth.FusionAuth.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )
```

Next, add the `callback` route, which is called by FusionAuth after a successful login and uses the information supplied to it to generate an access token.

```python
@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.FusionAuth.authorize_access_token()
    session["user"] = token
    return redirect("/")
```

Then, add a `logout` route, which simply clears the session and redirects the user to the base URL. This route will be called by FusionAuth after a successful logout from FusionAuth.

```python
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")
```

Finally, add the base route, which uses Flask’s template processor to render HTML that you will supply shortly.

```python
@app.route("/")
def home():
    logout = env.get("ISSUER") + "/oauth2/logout?" + urlencode({"client_id": env.get("CLIENT_ID")},quote_via=quote_plus)

    return render_template(
        "home.html",
        session=session.get('user'),
        profile=json.dumps(session.get('user'), indent=2),
        logoutUrl=logout)
```

Now, just add one more statement to run the app and listen on available interfaces.

```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 5000))
```

The route code is completed.

Now create a new folder called `templates` and navigate to it.

```shell
mkdir templates && cd templates
```

Add a new file called `home.html` and insert the following into it.

```html
{% raw %}
<html>
<head>
  <meta charset="utf-8" />
  <title>FusionAuth OpenID and PKCE example</title>
</head>
<body>
  {% if session %}
      <h1>You are logged in as {{session.userinfo.email}}</h1>
      <h2>Here is your OpenID profile</h2>
      <div><pre>{{profile}}</pre></div>
      <br/>

      <p><a href="{{logoutUrl}}">Logout</a></p>
  {% else %}
    <h1>Hello Guest</h1>
    <p>Please <a href="/login">Login</a> to see your profile</p>
  {% endif %}
</body>
</html>
{% endraw %}
```

## Testing the Authentication Flow

Once you have completed the steps above, you should have a folder that is structured as follows.

```
+integrate-fusionauth
|
+-- .env
|
+-- docker-compose.yml
|
+-- requirements.txt
|
+-- setup.py
|
+--+ setup-flask
|  |
|  +-- .env
|  |
|  +-- requirements.txt
|  |
|  +-- server.py
|  |
|  +--+ templates
|     |
|     +-- home.html
|
+--+ venv
   |
   +-- ...
```

Navigate to the `setup-flask` directory and execute `flask run` to run your app.

```shell
flask --app server.py run
```

This should return the following.

```
 * Serving Flask app 'server.py'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

Open an incognito window and navigate to `http://127.0.0.1:5000`.

{% include docs/_image.liquid src="/assets/img/docs/integrations/flask-integration/flask-homepage.png" alt="Flask application home page." class="img-fluid bottom-cropped" width="1200" figure=false %}


Then click <span class="uielement">Login</span>.

{% include docs/_image.liquid src="/assets/img/docs/integrations/flask-integration/flask-login.png" alt="Flask application login page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Enter the <span class="field">email</span> and <span class="field">password</span> that you assigned to your FusionAuth user. If login is successful, you should see your OpenID profile information.

{% include docs/_image.liquid src="/assets/img/docs/integrations/flask-integration/flask-profile.png" alt="Flask application profile page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Now, click <span class="uielement">Logout</span>. If successful, you should be brought back to the `Hello Guest` homepage.

The full code for this guide can be found [here](https://github.com/ritza-co/fusionauth-flask-integration-guide).