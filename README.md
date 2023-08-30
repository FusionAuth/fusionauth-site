## FusionAuth Site 

https://fusionauth.io

The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? Please report using an issue or submit a pull request.

Thanks!
 - FusionAuth team

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

Before you merge your site changes with CSS dependencies to master:

* do a CSS version release, which will bump the version (see instructions in that repo for more)
* update the version number in `site/_includes/_head.liquid`
* update the dependency in the `fusionauth-site` savant build file.
* run `sb css`
* check in the new css files.


## Deploying to S3

This section is only useful if you work for FusionAuth. Sorry!

Only `master` is ever released. You should work on a feature branch so that nothing is inadvertently released, but you must merge to `master` before you release. On every project, including this site, `master` should always be completely clean and able to be released at anytime.

Deploying happens automatically via a GitHub action when `master` is updated.

## Modifying Cloudfront behavior

Cloudfront is our CDN. We have other sources of web content and it manages them all.

The key file is `src/cloudfront/fusionauth-website-request-handler.js` which is what handles all redirectrs or other items.

If you are adding a page that is an index page, update `indexPages`.

If you are moving a page around, update `redirects`.

If you are adding a new top level directory that is pulled from the S3 bucket, make sure you:

* add a behavior in CloudFront. Default to `Redirect HTTP to HTTPS` for the `Viewer Protocol Policy` and `Managed-CachingOptimized` for the `Cache policy name` unless you have reasons to use something else.
* if you are adding a top level file, add an entry to the `s3Paths` array
* if you are adding a top level directory, add an entry to the `s3Prefixes` array

If you do anything to this file, realize it takes time to deploy too. You can see it in the `Functions` section of Cloudfront, but it typically takes 10ish minutes.


## Sitemap

This section is only useful if you work for FusionAuth. Sorry!

This is the state of things as of Aug 2023.

The root sitemap is at https://fusionauth.io/sitemap-all.xml . This is defined as the root sitemap by `robots.txt`, which is managed by jeykll.

https://fusionauth.io/sitemap-all.xml is a static file managed by astro.

It points to a variety of different sitemaps which are generated by different software systems.

Astro and jekyll generate sitemaps for all their content.

Jekyll generates site/docs/sitemap.xml by iterating over all the docs. It does the same thing for how-tos and blogs (pre-migration).

Webflow manages https://fusionauth.io/sitemap.xml I'm not sure how that file is updated.

Astro generates https://fusionauth.io/sitemap-index.xml which points to https://fusionauth.io/sitemap-0.xml which includes all content astro generates. Astro does not include any changefreq or priority fields. [Per the docs](https://docs.astro.build/en/guides/integrations-guide/sitemap/): `Note that changefreq and priority are ignored by Google.`

For dev, astro thinks it is running under fusionauth.io, so the sitemap will be incorrect, but if you append the path to the dev website, you'll see the results.
