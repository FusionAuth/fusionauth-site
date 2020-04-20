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

## Deploying

This section is only useful if you have access to the FusionAuth web server(s).

Only master is ever released. You should work on a feature branch so that nothing is inadverantly released, but you must merge to master before you release. Master on every project should always be completely clean and able to be released at anytime.

After master contains what you want to release, there is a Savant build target called push. When you run `sb push` it will pull master, re-build and updates the website.

