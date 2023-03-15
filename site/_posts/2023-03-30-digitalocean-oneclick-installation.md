---
layout: blog-post
title: Deploying FusionAuth on DigitalOcean using the One-click Installer
description: Revised version of the guide from the DigitalOcean Marketplace
author: Dean Rodman, Bradley Van Aardt
category: blog
excerpt_separator: "<!--more-->"
---

In this tutorial, you will install FusionAuth onto a Kubernetes cluster hosted on DigitalOcean. You can install FusionAuth with one click from the DigitalOcean marketplace, but you will need to follow some additional steps in order to host your FusionAuth instance on a publicly accessible IP. 

## Prerequisites

In order to follow along with this tutorial, you need to have a DigitalOcean account, which you can sign up for [here](https://www.digitalocean.com/go/developer-brand). You will also need to install the following command line tools:

- [`doctl`](https://docs.digitalocean.com/reference/doctl/how-to/install/), the DigitalOcean command line interface
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/), the Kubernetes command line interface
- [`helm`](https://helm.sh/docs/intro/install/), a helpful third-party tool for managing Kubernetes applications.

Click the links above and follow the instructions for installing, configuring and authenticating each tool for your system.

## Installation

You can install FusionAuth on DigitalOcean by clicking the "Install App" button at [this link](https://marketplace.digitalocean.com/apps/fusionauth).

{% include _image.liquid src="/assets/img/blogs/digitalocean/digitalocean-install-app.png" alt="Install FusionAuth from DigitalOcean marketplace" class="img-fluid" figure=false %}

On the following screen, select "Install". By default, this will install FusionAuth on a new Kubernetes cluster, though you can choose an existing cluster from the dropdown if you have one.  

{% include _image.liquid src="/assets/img/blogs/digitalocean/digitalocean-select-cluster.png" alt="Select Kubernetes cluster to install FusionAuth on" class="img-fluid" figure=false %}

You will then be taken to the cluster configuration page. The default values here will work. You may want to choose the project to install under, and give a more readable name to the cluster. After that, you can scroll down to the bottom of the page and click "Create Cluster".  Three nodes will be created in order for FusionAuth to work properly: one for the database, one for elasticsearch, and one for the FusionAuth API.

{% include _image.liquid src="/assets/img/blogs/digitalocean/digitalocean-create-cluster.png" alt="Settings configuration for new Kubernetes cluster" class="img-fluid" figure=false %}

FusionAuth may take several minutes to install. Once it does, you can click on its name to access guide, resources, settings and more. Select the "Overview" panel, and click "Get Started" to the second step "Connecting to Kubernetes". There you will you find a command on the "Automated" tab, in the the "Overview" panel with the appropriate value for `<YOUR_CLUSTER_ID>`.

```sh
doctl kubernetes cluster kubeconfig save <YOUR_CLUSTER_ID>
```

Running that command in your terminal (assuming you have already installed the [DigitalOcean command line tool](https://docs.digitalocean.com/reference/doctl/how-to/install/)) should return the following.

```sh
Notice: Adding cluster credentials to kubeconfig file found in "/Users/<USERNAME>/.kube/config"
Notice: Setting current-context to <YOUR_CLUSTER_NAME>
```

FusionAuth is now running on a publicly accessible IP address. To retrieve this address, run the following command in your terminal:

```sh
export SERVICE_IP=$(kubectl get svc --namespace fusionauth fusionauth -o jsonpath='{.status.loadBalancer.ingress[0].ip}') \
echo http://$SERVICE_IP:9011/
```

This command will output URL address to the terminal. Navigate to this URL in your web browser. You will be taken to the FusionAuth Setup Wizard. [Complete these steps](https://fusionauth.io/blog/2019/02/05/using-the-setup-wizard) to start using FusionAuth on your public Kubernetes cluster, provisioned by DigitalOcean.

## Monitoring

You can confirm that all three deployments, `db`, `fusionauth`, and `search`, are running with the following [`helm`](https://helm.sh/docs/intro/install/) command:

```sh
helm list -n fusionauth
```

You can also check the status of all running pods with the following [`kubectl`](https://kubernetes.io/docs/tasks/tools/) command:

```sh
kubectl get pods -n fusionauth
```

## Upgrading FusionAuth

As new versions of FusionAuth are released, you can use this bash script, using [`helm`](https://helm.sh/docs/intro/install/), to upgrade to the latest version. 

```sh
#!/bin/sh

set -e

################################################################################
# repo
################################################################################
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add fusionauth https://fusionauth.github.io/charts
helm repo update > /dev/null


################################################################################
# chart
################################################################################
STACK="fusionauth"
CHART="fusionauth/fusionauth"
NAMESPACE="fusionauth"

if [ -z "${MP_KUBERNETES}" ]; then
  # use local version of values.yml
  ROOT_DIR=$(git rev-parse --show-toplevel)
  VALUES="$ROOT_DIR/stacks/fusionauth/values.yml"
else
  # use github hosted master version of values.yml
  VALUES="https://raw.githubusercontent.com/digitalocean/marketplace-kubernetes/master/stacks/fusionauth/values.yml"
fi

# Retrieve current passwords and set them again during upgrade.
DB_FUSIONAUTH_USER_PASSWORD=$(kubectl -n $NAMESPACE get secrets fusionauth-credentials -o jsonpath='{.data.password}' | base64 -d)
DB_POSTGRES_USER_PASSWORD=$(kubectl -n $NAMESPACE get secrets fusionauth-credentials -o jsonpath='{.data.rootpassword}' | base64 -d)

helm upgrade "$STACK" "$CHART" \
--namespace "$NAMESPACE" \
--values "$VALUES" \
--set database.password="$DB_FUSIONAUTH_USER_PASSWORD" \
--set database.root.password="$DB_POSTGRES_USER_PASSWORD"
```

Save the script into a file, `fusionauth-upgrade.sh`. If you're on macOS or Linux, you can make the file executable by running the following command in your terminal:

```sh
chmod +X fusionauth-upgrade.sh
```

Then execute the script by running:

```sh
./fusionauth-upgrade.sh
```

## Uninstalling FusionAuth

To uninstall FusionAuth, you can use the following bash script:

```sh
#!/bin/sh

set -e

################################################################################
# chart
################################################################################
STACK="fusionauth"
NAMESPACE="fusionauth"

helm uninstall -n "$NAMESPACE" search
helm uninstall -n "$NAMESPACE" db
helm uninstall "$STACK" --namespace "$NAMESPACE"

helm repo remove fusionauth

kubectl delete ns fusionauth
```

Save the script into a file, `fusionauth-uninstall.sh`. If you're on macOS or Linux, you can make the file executable by running the following command in your terminal:

```sh
chmod +X fusionauth-uninstall.sh
```

Then execute the script by running:

```sh
./fusionauth-uninstall.sh
```

## What to do if your cluster is destroyed

If you destroy your kubernetes cluster using the "Actions->Destroy" button on your DigitalOcean admin console, without first running the uninstall script in the previous section, you will need to follow some steps to ensure that subsequent installs work properly.

The main problem to solve is that you will need to free up the `fusionauth` namespace, but you need to connect to a Kubernetes cluster to do this. Therefore, you will need to create a new cluster, delete the namespace, and then continue installing as per usual.  

Start by returning to [the marketplace installation page](https://marketplace.digitalocean.com/apps/fusionauth) and click `Install App`. Create your new cluster as normal. FusionAuth will attempt to install, but will ultimately display a general `Installation Failed` error.

{% include _image.liquid src="/assets/img/blogs/digitalocean/digitalocean-installation-failed.png" alt="Installation failed after destroying old cluster" class="img-fluid" figure=false %}

This is because the kubernetes namespace `fusionauth` is still taken up by the previous installation. You need to delete this namespace in order to install FusionAuth again, but since you've already deleted your cluster, the `helm` and `kubectl` commands from the uninstall script above will not be able to connect and execute.  

To fix this, you can set the Kubernetes context to the new cluster that you've just created. To do that, select the "Overview" panel, and click "Get Started" to get to the second step "Connecting to Kubernetes". There you will you find a command on the "Automated" tab, in the the "Overview" panel with the appropriate value for `<YOUR_CLUSTER_ID>`, pointing to the new cluster

```sh
doctl kubernetes cluster kubeconfig save <YOUR_CLUSTER_ID>
```

{% include _image.liquid src="/assets/img/blogs/digitalocean/digitalocean-connecting-to-kubernetes.png" alt="command line prompt to connect to your Kubernetes cluster" class="img-fluid" figure=false %}

That command should return the following.

```sh
Notice: Adding cluster credentials to kubeconfig file found in "/Users/<USERNAME>/.kube/config"
Notice: Setting current-context to <YOUR_CLUSTER_NAME>
```

Now that you've set the context to your new cluster, you can execute `kubectl delete` to free up the `fusionauth` namespace.

```sh
kubectl delete namespace fusionauth
```

At this point, you can navigate back to the "Marketplace" tab and click "Try again" to continue the installation as normal.

## Next steps

You've now deployed a FusionAuth instance on a public Kubernetes cluster hosted on DigitalOcean. From here, you can [create an application](https://fusionauth.io/docs/v1/tech/core-concepts/applications) and [register users to it](https://fusionauth.io/docs/v1/tech/tutorials/register-user-login-api) to implement a login page. Be sure to check out the [guides](https://fusionauth.io/docs/v1/tech/guides/) for more information about how to implement FusionAuth's many features into your application.