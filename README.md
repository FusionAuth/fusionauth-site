# FusionAuth Site

Hosted at [https://fusionauth.io](https://fusionauth.io).

The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? File an issue or submit a pull request.

> NOTE: To build the docs site, see the [docs README](/astro/README.md).

## Build Entire Site

To build the entire site:

1. Install a JDK, for example [OpenJDK](https://openjdk.org/install/):

   ```console
   brew install openjdk
   ```

1. Set up [Savant](http://savantbuild.org/):

   ```
   mkdir ~/savant
   cd ~/savant
   wget http://savant.inversoft.org/org/savantbuild/savant-core/1.0.0/savant-1.0.0.tar.gz
   tar xvfz savant-1.0.0.tar.gz
   ln -s ./savant-1.0.0 current
   export PATH=$PATH:~/savant/current/bin/
   ```
   
   To persist this change, add `~/savant/current/bin` to your `PATH` that in `.zshrc` or `.bashrc`.

1. Build the site:

   ```
   sb serve
   ```

## CSS changes

This project depends on CSS from the `fusionauth-style` project.

## Deploy

Deploying happens automatically via a GitHub action when `main` is updated.

## Redirects

[redirects.json](src/redirects.json) specifies our redirect rules. This file is published to s3 and read by a Lambda function that processes redirects for the site. When modifying the file:

* Keep items in alphabetical order!
* If you are moving a page around, update `redirects`.
* If you are adding a page that is an index page, update `indexPages`.
* If you are adding a new top level file or directory that's pulled from the S3 bucket, make sure you:
  * Add a behavior in CloudFront. You'll need to submit a PR in [fusionauth-site-infra](https://github.com/FusionAuth/fusionauth-site-infra/) for this change.
  * If you are adding a top level file, add an entry to the `s3Paths` array.
  * If you are adding a top level directory, add an entry to the `s3Prefixes` array.
