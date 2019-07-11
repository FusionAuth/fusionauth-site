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
