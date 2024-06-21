## FusionAuth Site 

https://fusionauth.io

The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? Please report using an issue or submit a pull request.

Thanks!<br/>
&nbsp;&nbsp;&nbsp;– FusionAuth team

## Building

If you want to submit a PR or test a change to fix a link, etc it may be helpful for you to build and run locally.

### Building with Docker

If you have Docker installed your machine, you can use it to build and serve the site. To make things easier, there's a [`run-docker`](./run-docker) script to build the container image and mount some cache volumes to speed up future processes.

To build the site and serve it locally, execute `./run-docker --serve` to start the Docker container with a local HTTP server available at [localhost:4000](http://localhost:4000). For more information, see [Build and run a local HTTP server](#build-and-run-a-local-http-server).

You can just build the site with no HTTP server by executing `./run-docker`.

### Building on your host machine

This project is built using jekyll and asciidoc. You'll need to have ruby installed.

#### Install

Install these programs:

- java
- ruby (2.7.5)
- plantuml
- git

`gem install bundle`
`bundle install`

##### Build Errors
On M1 Macs, you may receive an error similar to:
```text
Gem::Ext::BuildError: ERROR: Failed to build gem native extension.

    current directory: /Users/<username>/.rbenv/versions/2.7.5/lib/ruby/gems/2.7.0/gems/eventmachine-1.2.7/ext
/Users/<username>/.rbenv/versions/2.7.5/bin/ruby -I /Users/mark/.rbenv/versions/2.7.5/lib/ruby/site_ruby/2.7.0 extconf.rb
```

To fix this, rebuild the eventmachine gem using:
```shell
gem install eventmachine -v '1.2.7' -- --with-ldflags="-Wl,-undefined,dynamic_lookup"
bundle install
```

#### Setup Savant

We use the Savant build tool. In order to build and run this project, you'll need to first setup Savant.

Linux or macOS

```
mkdir ~/savant
cd ~/savant
wget http://savant.inversoft.org/org/savantbuild/savant-core/1.0.0/savant-1.0.0.tar.gz
tar xvfz savant-1.0.0.tar.gz
ln -s ./savant-1.0.0 current
export PATH=$PATH:~/savant/current/bin/
```

You may optionally want to add `~/savant/current/bin` to your PATH that is set in your profile so that this change persists. You'll also need to ensure that you have Java >= 8 installed and the environment variable  `JAVA_HOME` is set.

### Build and run a local HTTP server

```
sb serve
```

For more information on the Savant build tool, checkout [savantbuild.org](http://savantbuild.org/).

If you are modifying the doc search and want to use a different Algolia index for testing, update the settings in `_config.yml`. To manually refresh the document search index, use this command: `ALGOLIA_API_KEY='<admin api key>' bundle exec jekyll algolia`

If you want to clean your Jekyll install, run `bundle exec jekyll clean`.

### CSS changes

This project depends on CSS from the `fusionauth-style` project.

If you are making changes to the CSS, you'll need to do the following:

* clone that repo, make changes there on a branch
* when your changes are done, run `sb int` which pushes up an integration build (similar to a maven snapshot) to the savant repo.
* edit your css dependency var to be something like this (with the appropriate version number):
```
fusionauthWebsiteStyleVersion = "0.2.27-{integration}"
```
* then you can commit this and other folks can pull down your changes

Each time you make a CSS change, you can run `sb int` in `fusionauth-style` and then `sb css` in this project to pull down the latest CSS.

#### Releasing CSS changes

Before you merge your site changes with CSS dependencies to `main`:

* do a CSS version release, which will bump the version (see instructions in that repo for more)
* update the version number in `site/_includes/_head.liquid`
* update the dependency in the `fusionauth-site` savant build file.
* run `sb css`
* check in the new css files.


## Deploying to S3

📝 _This section is only useful if you work for FusionAuth. Sorry!_

Only `main` is ever released. You should work on a feature branch so that nothing is inadvertently released, but you must merge to `main` before you release. On every project, including this site, `main` should always be completely clean and able to be released at anytime.

Deploying happens automatically via a GitHub action when `main` is updated.

## Deploying Redirect Rules

📝 _This section is only useful if you work for FusionAuth. Sorry!_

The [redirects.json](src/redirects.json) file specifies our redirect rules. This file is published to s3 and read by a Lambda function that processes redirects for the site.

* If you are moving a page around, update `redirects`
* If you are adding a page that is an index page, update `indexPages`
* If you are adding a new top level file or directory that's pulled from the S3 bucket, make sure you:
    * Add a behavior in CloudFront. You'll need to submit a PR in [fusionauth-site-infra](https://github.com/FusionAuth/fusionauth-site-infra/) for this change.
    * If you are adding a top level file, add an entry to the `s3Paths` array
    * If you are adding a top level directory, add an entry to the `s3Prefixes` array

⚠️ _When updating this file, please keep items in alpha order._

## Sitemap

📝 _This section is only useful if you work for FusionAuth. Sorry!_

This is the state of things as of Nov 2023.

The sitemap is generated during the Astro build by [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/).

As of today, we still have static sitemaps that were generated by Jekyll, located in [astro/public](astro/public). These static sitemaps reference the sitemap generated by Astro.


