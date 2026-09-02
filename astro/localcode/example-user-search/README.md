# Example: Using FusionAuth User Search

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/example-user-search). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This example shows shell scripts illustrating how to use FusionAuth's powerful user search.

## Prerequisites
You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/): Presumably you already have this on your machine if you are looking at this project locally; if not, use your platform's package manager to install git, and `git clone` this repo.
* [Docker](https://www.docker.com): If you wish to run FusionAuth from within a Docker container.

## Installation
To install, do the following in a shell/Terminal window:

* `git clone https://github.com/fusionauth/fusionauth-example-user-search`
* `cd fusionauth-example-user-search`: This is the root of the example.

## FusionAuth Configuration

This example assumes that you will run FusionAuth from a Docker container. In the root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, a `docker-compose up` from within this (root) directory will bring FusionAuth up on your machine.

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called Kickstart: when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use. It will perform all the necessary setup to make this demo work correctly.

[Click here](http://localhost:9011/) to verify it is up and running.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose by executing `docker-compose down -v`. FusionAuth will only apply the Kickstart settings when it is first run (e.g., it has no data configured for it yet).

## Run

To run, do the following:

* In one shell, run `docker-compose up`
* In another shell, `cd examples`. There are three directories, one for each kind of search.

There is one shell script, `examples/search.sh` that you can run. It takes an argument of a `-request.json` file.

* `examples/search.sh examples/ids/ids-request.json` runs the ids search
* `examples/search.sh examples/query/user-data-simple-request.json` runs one of the query searches

## More

Here's a [FusionAuth user search guide](https://fusionauth.io/docs/v1/tech/guides/user-search-with-elasticsearch) which corresponds to this example application.

