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
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/python/requirements.txt %}
```

Then, copy and paste the following code into the `setup.py` file.

```python
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/python/setup-flask.py %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [Python client library](/docs/v1/tech/client-libraries/python) documentation for more information." %}


You’ll use a virtual environment `venv` to keep your workspace clean.

```shell
python -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt
```

Now run the setup script, replacing `<your API key>` with the value of the API key noted earlier.

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE python setup.py
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
python setup.py
```

This configures FusionAuth for your {{page.technology}} application.

When you’re done, you can log in to your instance and examine the new application configuration that the script created for you.

## Create Your {{page.technology}} Application

Now you are going to create a {{page.technology}} application. While this section builds a simple {{page.technology}} application, you can use the same configuration to integrate your complex {{page.technology}} application with FusionAuth.

First, make a directory:

```shell
mkdir setup-flask && cd setup-flask
```

Now, create a new `requirements.txt` file to include {{page.technology}}. Add the `flask`, `python-dotenv`, and `authlib` plugins so that your requirements file looks like this:

```text
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-python-flask-guide/main/setup-flask/requirements.txt %}
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

You can now start writing the code for your Flask application. Create a new file called `server.py` and add the following code into it:

```python
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-python-flask-guide/main/setup-flask/server.py %}
```

The code uses `json` to process data from the FusionAuth API, `os.environ`, `dotenv.find_dotenv`, and `dotenv.load_dontenv` to load environment variables, `urllib.parse.quote_plus` and `urllib.parse.urlencode` to build the logout URL, `authlib.integrations.flask_client.OAuth` to handle OIDC verification, and various `flask` modules to facilitate the app’s functionality.

The `login` route redirects to FusionAuth to handle user authentication and the `callback` route, is called by FusionAuth after a successful login to generate an access token.
The, `logout` route, simply clears the session and redirects the user to the base URL. This route will be called by FusionAuth after a successful logout from FusionAuth.

Now create a new folder called `templates` and navigate to it.

```shell
mkdir templates && cd templates
```

Add a new file called `home.html` and insert the following into it.


```html
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-python-flask-guide/main/setup-flask/templates/home.html %}
```


## Testing the Authentication Flow

Once you have completed the steps above, you should have a folder that is structured as follows.

```
integrate-fusionauth
|
|__ .env
|
|__ docker-compose.yml
|
|__ requirements.txt
|
|__ setup.py
|
|__ setup-flask
|  |
|  |__ .env
|  |
|  |__ requirements.txt
|  |
|  |__ server.py
|  |
|  |__ templates
|     |
|     |__ home.html
|
|__ venv
   |
   |__ ...
```

Navigate to the `setup-flask` directory and execute the following command to run your app:

```shell
python server.py
```

This should return the following.

```
 * Serving Flask app 'server.py'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://localhost:5001
```

Open an incognito window and navigate to `http://localhost:5001`.

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-homepage.png" alt="Flask application home page." class="img-fluid bottom-cropped" width="1200" figure=false %}


Then click <span class="uielement">Login</span>.

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-login.png" alt="Flask application login page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Enter the <span class="field">email</span> and <span class="field">password</span> that you assigned to your FusionAuth user. If login is successful, you should see your OpenID profile information.

{% include _image.liquid src="/assets/img/docs/integrations/flask-integration/flask-profile.png" alt="Flask application profile page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Now, click <span class="uielement">Logout</span>. If successful, you should be brought back to the `Hello Guest` homepage.

The full code for this guide can be found [here](https://github.com/FusionAuth/fusionauth-example-python-flask-guide).
