# Example Multi-Application Dashboard Using FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-multiapp-dashboard). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository holds code accompanying the FusionAuth application dashboard tutorial at https://fusionauth.io/docs/extend/examples/multi-application-dashboard.

## Project Contents

This project contains a `docker-compose.yml` file and a `kickstart` directory to assist in running your own local FusionAuth server. The `bankApp` and `insuranceApp` directories contain the demonstration Node.js apps that use FusionAuth for authentication.

## Project Dependencies

- Docker

## How To Run

Clone this repository and run the commands below in a terminal opened in this repository.

```sh
docker compose up

# new terminal:
cd bankApp
docker compose up

# new terminal:
cd insuranceApp
docker compose up
```

- Browse to FusionAuth at http://localhost:9011/admin and log in with `admin@example.com` and `password`.
- Browse to Changebank at http://localhost:3000 and log in with the same username and password.
- Browse to Changeinsurance at http://localhost:3001 and log in with the same username and password.
