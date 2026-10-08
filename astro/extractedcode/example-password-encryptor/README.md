> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-password-encryptor). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

## Example Password Hasher

If you need to write a custom hasher (also known as a password encryptor) to import users into FusionAuth, you may use this example build. This is intended to be used with the Writing a Plugin guide provided in the FusionAuth documentation.

Writing a Plugin guide is found here:  https://fusionauth.io/docs/v1/tech/plugins/writing-a-plugin

### Example code

Any example password hashers provided in this repository is provided to assist in your deployment and management of FusionAuth.
 Use of this software is not covered under the FusionAuth license agreement and is provided "as is" without warranty. https://fusionauth.io/license

More sample password hashers for various algorithms can be found in the [fusionauth-contrib](https://github.com/FusionAuth/fusionauth-contrib/tree/master/Password%20Hashing%20Plugins) repository.

If there's a password hasher you'd like to see that isn't available, please [open a GitHub issue](https://github.com/fusionauth/fusionauth-issues/issues).

### Building

### Building with Maven


```bash
$ mvn install
```


### Building with Savant

**Note:** This project uses the Savant build tool. To compile using Savant, follow these instructions:

```bash
$ mkdir ~/savant
$ cd ~/savant
$ wget http://savant.inversoft.org/org/savantbuild/savant-core/1.0.0/savant-1.0.0.tar.gz
$ tar xvfz savant-1.0.0.tar.gz
$ ln -s ./savant-1.0.0 current
$ export PATH=$PATH:~/savant/current/bin/
```
