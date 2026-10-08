# Example Flask Application

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-python-flask-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Python/Flask application that uses FusionAuth as the identity provider. 
This application will use an OAuth Authorization Code Grant workflow to log a user in and get them access and 
refresh tokens.

This application was built by following the [Python/Flask Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-python-flask-web).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/complete-application` directory contains a fully working version of the application.

## Project Dependencies
* Docker, for running FusionAuth
* Python 3.8 or later, for running the Changebank Python application

## Running FusionAuth
To run FusionAuth, just stand up the docker containers using `docker-compose`.

```shell
docker-compose up
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
