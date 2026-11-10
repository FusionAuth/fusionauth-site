# Deploy FusionAuth with Kubernetes

The files and commands shown in the [Deploy with k8s](https://fusionauth.io/docs/deploy/production/kubernetes/fusionauth-deployment) guide.

* `values.yaml`: the chart values the guide sets, with placeholders like `<database-host>`
* `sidecar-values.yaml`: the optional sidecar example
* `gateway.yaml`: the Gateway API resources that expose FusionAuth over HTTPS through Envoy Gateway
* `commands/`: one file per command block in the guide
* `minikube/`: the PostgreSQL and Elasticsearch manifests and commands from the [Local Cluster with minikube](https://fusionauth.io/docs/deploy/production/kubernetes/minikube) guide

## Test

`bash tests/test.sh` creates a [kind](https://kind.sigs.k8s.io/) cluster, deploys PostgreSQL and Elasticsearch with the commands in `minikube/commands/`, runs every command in `commands/` with the placeholders filled in, and checks that:

1. FusionAuth reads its database and search passwords from Secrets.
1. FusionAuth connects to PostgreSQL over TLS, and to Elasticsearch with basic authentication.
1. FusionAuth answers through the port forward and over HTTPS through the Gateway.
1. The Gateway redirects HTTP to HTTPS, and FusionAuth builds its public URLs with `https`.

The test needs Docker, Helm, kubectl, OpenSSL, and curl. It downloads kind if it isn't installed, and keeps its kubeconfig and Helm repositories in a temporary directory. It runs the FusionAuth version in the repository's `fusionauth-version` file, or `FUSIONAUTH_VERSION` if set. The minikube guide's Elasticsearch has no certificate, so the test connects to it over `http` instead of the `https` that `values.yaml` uses, as the minikube guide tells readers to.
