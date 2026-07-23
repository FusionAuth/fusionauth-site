# Example Django Application

This repo holds an example Python/Django application that uses FusionAuth as the identity provider.

This application was built by following the [Python/Django Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-python-django-web).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/complete-application` directory contains a fully working version of the application.

## Project Dependencies

* Docker, for running FusionAuth.
* Python 3.8 or later, for running the Changebank Python application.
* [mozilla-django-oidc library](https://mozilla-django-oidc.readthedocs.io/en/stable/index.html)

## Running FusionAuth

To run FusionAuth, just start up the docker containers using `docker-compose`.

```shell
docker-compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App

To run the application set up a Python virtual env and install the project dependencies.

```shell
cd complete-application && \
python -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt && \
python mysite/manage.py runserver
```

Visit the local webserver at `http://localhost:8000/` and sign in using the credentials:

* username: richard@example.com
* password: password
