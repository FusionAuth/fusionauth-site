If you already have a FusionAuth Cloud instance, you can use that, but for the sake of simplicity, this tutorial will assume you are using a locally hosted instance. There are detailed setup guides in the [documentation](/docs/v1/tech/installation-guide/docker/), but the short version is that once you have Docker and Docker Compose set up and installed correctly, you can run the following command in a new directory to download and execute the necessary files.

```shell
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/main/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/main/docker/fusionauth/.env
docker compose up
```
