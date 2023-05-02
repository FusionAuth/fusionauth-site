---
layout: doc
title: Integrate Your Python Flask Application With FusionAuth
description: Integrate your Python Flask application with FusionAuth
navcategory: getting-started
prerequisites: python3 and pip3
technology: Python Flask
language: Python
---

## Integrate Your {{page.technology}} Application With FusionAuth

{% include docs/integration/_intro.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the [{{page.language}} client library](/docs/v1/tech/client-libraries/python). You can use the client library with an IDE of your preference as well.

First, create the required files:

```shell
touch requirements.txt setup.py
```

Now, cut and paste the following requirements into `requirements.txt`:

```text
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-flask-integration/main/requirements.txt %}
```

Then, copy and paste the following code into the `setup.py` file.

```python
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-flask-integration/main/setup.py %}
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
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-flask-integration/main/setup-flask/requirements.txt %}
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
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-flask-integration/main/setup-flask/templates/home.html %}
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

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-homepage.png" alt="Flask application home page." class="img-fluid bottom-cropped" width="1200" figure=false %}


Then click <span class="uielement">Login</span>.

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-login.png" alt="Flask application login page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Enter the <span class="field">email</span> and <span class="field">password</span> that you assigned to your FusionAuth user. If login is successful, you should see your OpenID profile information.

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-profile.png" alt="Flask application profile page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Now, click <span class="uielement">Logout</span>. If successful, you should be brought back to the `Hello Guest` homepage.

The full code for this guide can be found [here](https://github.com/ritza-co/fusionauth-flask-integration-guide).