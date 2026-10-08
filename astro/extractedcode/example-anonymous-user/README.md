# Example Anonymous User Application

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-anonymous-user). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This application builds on the [FusionAuth Flask Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-python-flask-web).

It has additional pages:

* A page showing the Changebank video. A user who views this page will have an anonymous, shadow user account created for them in FusionAuth. This account will record the number of times this page is visited. This anonymous account will not be visible to the user.
* An account conversion page, where a user can create an account by providing an email address. If they have an anonymous account, the data in that account will be carried over to the full account.
* A webhook receiver, which will, upon email verification, update the user's `data` field to reflect account conversion.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/complete-application` directory contains a fully working version of the application.

## Project Dependencies
* Docker, for running FusionAuth
* Python 3.8 or later, for running the Changebank Python application

## Running FusionAuth
To run FusionAuth, just stand up the docker containers using `docker compose`.

```shell
docker compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App
To run the application, first go into the project directory

```shell
cd complete-application
```
Set up a Python virtual env and installing the project dependencies.

```shell
python -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt
```

Then use the `flask run` command to start up the application.

```shell
flask --app server.py run
```

If you're going to be working on the application and want hot reloads of the server code, add the `--debug` flag.

```shell
flask --app server.py --debug run
```

Visit the local webserver at `http://localhost:9012/` and sign in using the credentials:

* username: richard@example.com
* password: password
