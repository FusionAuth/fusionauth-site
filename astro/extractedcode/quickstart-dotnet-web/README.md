# Quickstart: .NET app with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-dotnet-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a .NET app that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
- [.NET](https://dotnet.microsoft.com/en-us/download): This in the needed framework to run .NET applications.
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).
- [Visual Stuido Code](https://code.visualstudio.com/download): The editor for making changes to code.
  - Alternatively, You can user other editors as well.

This app has been tested with .NET 7.0.7

### FusionAuth Installation via Docker

The root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### .NET complete-app

The `complete-app` directory contains a minimal .NET app configured to authenticate with locally running FusionAuth.

To run the application:
* Endure the FusionAuth server is running as noted above or update the applicationsettings.json to reflect the FusionAuth server you are using.

```
cd complete-application
dotnet run
```

Now vist the .NET app at [http://localhost:9012](http://localhost:9012)
You can login with a user preconfigured during Kickstart, `richard@example.com` with the password of `password`.

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-dotnet-web for a step by step guide on how to build this .NET app integrated with FusionAuth by scratch.

### Troubleshooting

* I get `This site can’t be reached localhost refused to connect.` when I click the Login button

Ensure FusionAuth is running in the Docker container.  You should be able to login as the admin user, `admin@example.com` with the password of `password` at http://localhost:9011/admin

* I get an error page when I click on the Login button with message of `"error_reason" : "invalid_client_id"`

Ensure the value for `ClientId` in the file `appsettings.json` matches client id configured in FusionAuth for the Example App application at http://localhost:9011/admin/application/

* I have previously run the application and am now getting a 403 error on the unsecured index page.

Clear your browser cache and try again.

* I get 'Maintenance Mode Failed' error when I visit http://localhost:9011.

Tear down the docker container for the server and restart it.
```
docker compose down -v
docker compose up -d
```

* I do not see the changes I made reflected in the application when I publish and run from the command line.

Delete the Debug folder in the complete-application/bin directory and try to publish and run again.
