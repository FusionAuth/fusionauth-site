## FusionAuth Site 

https://fusionauth.io


The FusionAuth site is open source, found a bug, an issue, or a typo in our docs? Please report using an issue or submit a pull request.

Thanks!
 - FusionAuth team



## Building

If you want to submit a PR or test a change to fix a link, etc it may be helpful for you to build and run locally.

This project is built using jekyll and asciidoc, you'll need to have ruby installed.

### Setup Savant

We use the Savant build tool, in order to build and run this project, you'll need to first setup Savant.

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

If you are making changes to CSS in `fusionauth-style`, do the following:

* clone that repo, make changes there on a branch
* when your changes are done, run `sb int` which pushes up a integration build (similar to a maven snapshot) to the savant repo.
* edit your css dependency to be something like this (with the appropriate version number):
```
dependency(id: "io.fusionauth:fusionauth-style:fusionauth-website-style:0.2.12-{integration}:css")
dependency(id: "io.fusionauth:fusionauth-style:fusionauth-website-style:0.2.12-{integration}:css.map")
```
* then you can commit this and other folks can pull down your changes

Each time you make a css chang, you can run `sb int` in `fusionauth-style` and then `sb css` in this project to pull down the latest CSS.

Before you merge to master, of course, you must do a CSS version release and update the dependency in the `fusionauth-site` savant build file.

## Deploying

This section is only useful if you have access to the FusionAuth web server(s).

Make certain that you set the `ALGOLIA_API_KEY` environment variable to the `Admin API Key` value found in the Algolia dashboard. This key is used to push any changes to the index. Make certain that you set the `ALGOLIA_SEARCH_ONLY_API_KEY` environment variable to the `Search only API Key` value found in the Algolia dashboard. This key is used to retrieve results.

Only master is ever released. You should work on a feature branch so that nothing is inadvertently released, but you must merge to master before you release. Master on every project should always be completely clean and able to be released at anytime.

After master contains what you want to release, there is a Savant build target called push. When you run `sb push` it will pull master, re-build and updates the website.

If your user is different on the webserver than on your localhost, you'll want to use the --user switch:

`sb push --user=yourremoteusername`
