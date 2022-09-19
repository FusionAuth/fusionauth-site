## FusionAuth Site 

https://fusionauth.io


The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? Please report using an issue or submit a pull request.

Thanks!
 - FusionAuth team



## Building

If you want to submit a PR or test a change to fix a link, etc it may be helpful for you to build and run locally.

This project is built using jekyll and asciidoc, you'll need to have ruby installed.

### Install

Install these programs:

- java
- ruby (2.7.0)
- plantuml
- git

`gem install bundle`
`bundle install`

### Setup Savant

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


## Deploying

This section is only useful if you work for FusionAuth. Sorry!

Only `master` is ever released. You should work on a feature branch so that nothing is inadvertently released, but you must merge to `master` before you release. On every project, including this site, `master` should always be completely clean and able to be released at anytime.

You may want to run `bundle install` to ensure that you have all the needed gems.

Make certain that you set the `ALGOLIA_API_KEY` environment variable to the `Admin API Key` value found in the Algolia dashboard. This key is used to push any changes to the index at build time. This takes some time, so you can avoid it with the `--skipReindex` switch.

Make sure that java8 is the first java in your path. If you have the standard FusionAuth setup, you can do this temporarily by running this command: `export PATH=~/dev/java/current8/bin/:$PATH`.

You need to have AWS credentials (access key, secret access key) with permissions to access the S3 bucket and CloudFront distribution. You need to make those available to the process. I use environment variables, but any method outlined here: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html will work.

After `master` contains what you want to release, there is a Savant build target called `push`. When you run `sb push` it will pull `master`, re-build and update the website.

### Example

If you are doing everything via environment variables:

```
ALGOLIA_API_KEY=... PATH=~/dev/java/current8/bin/:$PATH AWS_ACCESS_KEY_ID=AKIA... AWS_SECRET_ACCESS_KEY=Jffp... sb push
```

### Troubleshooting

If you see an error message like:

```
Exception in thread "main" java.lang.ExceptionInInitializerError
	at org.jruby.Ruby.newInstance(Ruby.java:266)
	at s3.website.Ruby$.rubyRuntime$lzycompute(Ruby.scala:4)
	at s3.website.Ruby$.rubyRuntime(Ruby.scala:4)
	at s3.website.model.Config$$anonfun$15.apply(Config.scala:229)
	at s3.website.model.Config$$anonfun$15.apply(Config.scala:227)
	at scala.util.Try$.apply(Try.scala:192)
	at s3.website.model.Config$.erbEval(Config.scala:227)
	at s3.website.model.Site$$anonfun$2.apply(Site.scala:28)
	at s3.website.model.Site$$anonfun$2.apply(Site.scala:27)
	at scala.util.Success.flatMap(Try.scala:231)
	at s3.website.model.Site$.parseConfig(Site.scala:27)
	at s3.website.model.Site$.loadSite(Site.scala:100)
	at s3.website.Push$.push(Push.scala:62)
	at s3.website.Push$.main(Push.scala:40)
	at s3.website.Push.main(Push.scala)
Caused by: java.lang.RuntimeException: unsupported Java version: 15
	at org.jruby.RubyInstanceConfig.initGlobalJavaVersion(RubyInstanceConfig.java:1878)
	at org.jruby.RubyInstanceConfig.<clinit>(RubyInstanceConfig.java:1585)
	... 15 more
```

You are running the wrong version of java. Doublecheck your path.


