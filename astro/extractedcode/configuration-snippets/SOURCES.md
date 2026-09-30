# Configuration snippets

These are snapshots of the files displayed in four documentation pages. The external projects remain the source of truth for the complete configurations; this directory intentionally has no `repositoryUrl.txt` and must not be exported over those repositories.

| Local directory | Upstream source | Revision |
| --- | --- | --- |
| `containers/` | https://github.com/FusionAuth/fusionauth-containers/tree/bb01f00edb672c3cd3cdd618d39c1674bd3880f7 | `bb01f00edb672c3cd3cdd618d39c1674bd3880f7` |
| `contrib/` | https://github.com/FusionAuth/fusionauth-contrib/tree/d389f622f4a3e87415e556c60ea5df81e2e689de | `d389f622f4a3e87415e556c60ea5df81e2e689de` |
| `example-docker-compose/` | https://github.com/FusionAuth/fusionauth-example-docker-compose/tree/7f87c0343ae88e51439b9ee91f753d69872ff872 | `7f87c0343ae88e51439b9ee91f753d69872ff872` |

Only files rendered by the documentation were copied. Three local paths avoid repository-wide ignore rules: `sample.env` corresponds to upstream `docker/fusionauth/.env`, and `example-docker-compose/plugin-build/` corresponds to upstream `build/`. If an upstream example changes, review the affected guide before updating its snapshot. The Docker installation page still directs readers to download the current files from `fusionauth-containers`.
