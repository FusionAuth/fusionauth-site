---
layout: blog-post
title: Building the FusionAuth Homebrew Formula
description: FusionAuth easily installs through Homebrew. Here's how we built the Homebrew formula.
author: Tyler Scott
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- code
- brew
- homebrew
image: blogs/homebrew-install.png
---

Do you want to install FusionAuth but want to use Homebrew instead of Docker or using a boring zip file? No problem. Our goal is to be the fastest and easiest authentication platform to deploy, wherever and whenever you want. We have a Homebrew formula that will get you up and running in minutes. In this post I'll show you how it works and provide details on how we pulled it together.
<!--more-->

## Installing Via Brew

TL;DR. If you just want to get FusionAuth up and running and aren't interested in how we did it, here's all you need. It's pretty simple:

```bash
brew tap fusionauth/fusionauth
brew install fusionauth-app fusionauth-search
```

Then run the following to start it up:

```bash
brew services start fusionauth-search
brew services start fusionauth-app
```

How's that for fast and simple? Now you can dive in and start using the API. If this is your first time, you'll need to go through [the Setup Wizard](/blog/2019/02/05/using-the-setup-wizard), and then you'll be good to create users, applications and roles. For specific details, read through our [detailed documentation](/docs/v1/tech/), and let us know if you have any questions on [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") or [Github](https://github.com/FusionAuth/fusionauth-issues "Jump to Github").  

See the whole process in action in this <span class="text-sucess">51</span> second video. Try not to blink.

<div class="embed-responsive embed-responsive-21by9 mb-5 mt-3">
  <video autoplay loop class="embed-responsive-item" controls muted="true">
    <source src="https://s3.us-east-2.amazonaws.com/io.fusionauth/resources/brew.webm">
    <source src="https://s3.us-east-2.amazonaws.com/io.fusionauth/resources/brew.mp4">
    Your browser does not support the video tag.
  </video>
</div>

## How We Built the Homebrew Formula

Before we get to the details, you can check out our Homebrew formulas over at GitHub here:

[https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula](https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula "Jump to GitHub")

Building the Homebrew formula for FusionAuth was pretty straightforward. Homebrew formulas already support downloading a zip to start a "build" so we put our normal download URL into the formula URL and generate a `sha256` hash for added security.

The next steps were unpacking the zip into a format that brew could use effectively, and putting all of the persistent things in either `var` or `etc`. A normal install using our Fast Path installer script will result in all of the pieces being laid down on top of the same directory until everything required is there. With brew every piece must get its own directory for easy cleanup and separation. To resolve these items, I mapped the following directories out of their original directories to new locations:

* `config` -> `etc/fusionauth`
* `logs` -> `var/log/fusionauth`
* `java` -> `var/fusionauth/java`
* `data` -> `var/fusionauth/data` (Used for the fusionauth-search package)

Finally, I found that `brew` was trying to move any dynamic libraries (`dylib` files) it found inside of the package to a common location. Brew is pretty aggressive about moving `dylib`s to a standard location, even though they are already portable binaries. This was spitting out a nasty looking error to anyone that installed the formula. Not what we want to see.

To solve this problem, I modified our Homebrew formula to `tar` up the `dylib`s from the Elasticsearch package during the install phase and extract them back out during post install phase. This ensured that Brew stopped spitting out those nasty error messages. 

Just one more note on this. It seems that Homebrew can't differentiate between library formulas that are meant to be linked against and dynamically loaded binaries used internally by a program. There are some good forum threads and StackOverflow questions on this, but it would be great if Homebrew allowed formula designers to specify an configuration file of `dylib`s it should ignore.

During development, I was able to test this using the following command, which allowed me to test the formulas locally without constantly iterating through Github. This command is very handy and allows you to avoid the cycle of push, test, debug and repeat:
 
`brew install --debug -v ./Formula/fusionauth-${app}.rb` 

After working though a few other minor issues, I ended up with a solid Homebrew formula that makes it simple to install and manage the FusionAuth files. I hope it works well for you, but let me know if you have any questions or issues.


## The Code

Below I have included the code used to create our formula and what every piece of it does.

### Terminology

Homebrew has it's own terminology that is helpful to understand before coding. 

**Brew Formula:** A ruby script that contains well-known methods and fields for getting anything installed.
 
**Brew Bottle:** A snapshot of a formula's final state that can be laid down quickly and easily without any actual install steps, with the exception of post install steps. You can think of a bottle as a pre-built formula, similar to a `.deb` package vs build from source (i.e. Formula).

**Brew Cask:** A macOS application which is usually defined by its `.app` extension and entirely self contained. A cask is used used when an application doesn't have a simple formula for installing something and already has a macOS app. Think of Adobe Photoshop and other macOS desktop applications.

**Brew Tap:** A source for getting formulas. By default the shorthand is `<org>/<tap>` which equates to a github repo under `<org>/homebrew-<tap>` that has a folder inside called `Formula`, which contains any number of ruby files, each of which is an installable formula. A rough equivalent would be a `ppa` or `apt` repo.

### The Formula Parts

In this next section I'll break down each part of the forumula in more detail so you can better understand how to build your own. 

#### Extending the Formula

This is the most basic state for a formula which contains meta data for description, homepage, and a download URL. The URL is also associated with a `sha256` hash for added security. This is where our formula starts:

```ruby
class FusionauthApp < Formula
  desc "FusionAuth App"
  homepage "https://fusionauth.io"
  url "https://storage.googleapis.com/inversoft_products_j098230498/products/fusionauth/1.5.0/fusionauth-app-1.5.0.zip"
  sha256 "14bdc6d65622d502149d175ee0765a586e832ae4ef5b5946ff82aee3c7cfde04"

  def install
    # install stuff
  end

  def post_install
    #noop
  end
end
```

#### Install

When Homebrew is installing the FusionAuth formula, it downloads the Ruby script above and stores it locally in a well known location. Then it executes the Ruby script to determine where to download files from using the `url` field of the class.

Once the `url` file is downloaded, Homebrew extracts the file (usually a ZIP) to a temporary directory. 
 
Next, it executes the `install` function of our Ruby class and the working directory is the temporary directory that Homebrew extracted our ZIP to. This is also known as the `buildpath`. 

Homebrew provides a bunch of variables that define where the package will be installed to. The Ruby script can use these variables install everything into the correct location. Here is a documentation page that lists out all of the Homebrew variables:

[https://github.com/Homebrew/brew/blob/master/docs/Formula-Cookbook.md#variables-for-directory-locations](https://github.com/Homebrew/brew/blob/master/docs/Formula-Cookbook.md#variables-for-directory-locations)

In our case FusionAuth ships ready to go and we just need to move things into the prefix. I install the bulk of our project to its own directory in the prefix and then do a bunch of symlinking to some of the other Brew directories. This is done to make sure the files in the symlinked directories get persisted between upgrades. When a brew formula is upgraded, all of the files are deleted except for the ones put in `etc` or `var`. I do the symlinking because the FusionAuth startup scripts expect `java`, `logs`, and `config` to be in specific directories relative to FusionAuth's own installation location.

It is worth noting here that by default, Homebrew will symlink any scripts in your `bin` directory to `/usr/local/bin`. You can prevent this by moving them to `sbin` instead.

Here is the `install` function for the `fusionauth-app` formula:

```ruby
def install
  prefix.install "fusionauth-app"
  etc.install "config" => "fusionauth" unless File.exists? etc/"fusionauth"
  prefix.install_symlink etc/"fusionauth" => "config"
  (var/"fusionauth/java").mkpath unless File.exists? var/"fusionauth/java"
  prefix.install_symlink var/"fusionauth/java"
  (var/"log/fusionauth").mkpath unless File.exists? var/"log/fusionauth"
  prefix.install_symlink var/"log/fusionauth" => "logs"
end
```

As mentioned above, we had to remove the `dylib`s in the `fusionauth-search` package to avoid having Homebrew move them into a different location. Here is the `install` function of the `fusionauth-search` formula with the code to remove the `dylib`s:

```ruby
def install
    prefix.install "fusionauth-search"
    etc.install "config" => "fusionauth" unless File.exists? etc/"fusionauth"
    prefix.install_symlink etc/"fusionauth" => "config"
    (var/"log/fusionauth").mkpath unless File.exists? var/"log/fusionauth"
    prefix.install_symlink var/"log/fusionauth" => "logs"
    (var/"fusionauth/java").mkpath unless File.exists? var/"fusionauth/java"
    prefix.install_symlink var/"fusionauth/java"
    (var/"fusionauth/data").mkpath unless File.exists? var/"fusionauth/data"
    prefix.install_symlink var/"fusionauth/data"

    # Hide all the dylibs from brew
    system("tar", "-cPf", prefix/"fusionauth-search/elasticsearch/modules.tar", prefix/"fusionauth-search/elasticsearch/modules", "-C", prefix/"fusionauth-search/elasticsearch")
    (prefix/"fusionauth-search/elasticsearch/modules").rmtree
end
```

#### Post Install

After install is complete you can do any post install tasks you like. For `fusionauth-app` I didn't do any special tasks in post install so mine was empty.

The `post_install` for the `fusionauth-search` on the other hand required that we replaced the `dylib`s we removed during installation. In order to replace the `dylib`s, we simply extracted the `tar` file that we created in the `install` function above. Here is the `post_install` function for `fusionauth-search`:

```ruby
def post_install
  # Fix all the dylibs now that brew will leave them alone
  system("tar", "-xPf", prefix/"fusionauth-search/elasticsearch/modules.tar", "-C", prefix/"fusionauth-search/elasticsearch")
  rm_f prefix/"fusionauth-search/elasticsearch/modules.tar"
end
```

#### Caveats

Homebrew supports a function called `caveats` as part of the Ruby formula class. This function is usually meant for problems that might exist due to a limitation in Homebrew, incompatibilities with macOS, or other issues that arise. Another use for this is to inform the end-user of locations or other information about the package they just installed. 

The return value of the `caveats` function is a String that is displayed to the user during install or when the user executes the `brew info` command.

Here is the `caveats` method of our `fusionauth-app` formula:

```ruby
def caveats; <<~EOS
    Logs:   #{var}/log/fusionauth/fusionauth-app.log
    Config: #{etc}/fusionauth/fusionauth.properties
  EOS
end
```

This causes brew to print this message (during install or info):

```
==> Caveats
Logs:   /usr/local/var/log/fusionauth/fusionauth-app.log
Config: /usr/local/etc/fusionauth/fusionauth.properties
```

#### The PLIST!

If you would like your application to run as a service, you will need to include a plist as well. Brew automatically installs a plist file in the correct location if you define a `plist` function in your formula. Similar to the `caveat` function above, the return value of the `plist` function must be a String that is the content of the file.

Here is the `plist` function of our `fusionauth-app` formula that allows Brew to start FusionAuth as a service:

```ruby
def plist; <<~EOS
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
      <key>KeepAlive</key>
      <true/>
      <key>Label</key>
      <string>#{plist_name}</string>
      <key>ProgramArguments</key>
      <array>
        <string>sh</string>
        <string>catalina.sh</string>
        <string>run</string>
      </array>
      <key>RunAtLoad</key>
      <true/>
      <key>WorkingDirectory</key>
      <string>#{prefix}/fusionauth-app/apache-tomcat/bin</string>
      <key>StandardOutPath</key>
      <string>#{var}/log/fusionauth/fusionauth-app.log</string>
      <key>StandardErrorPath</key>
      <string>#{var}/log/fusionauth/fusionauth-app.log</string>
    </dict>
    </plist>
  EOS
end
```

Once Brew installs the plist file in the correct location, it can use the file with the launch daemon system of macOS to launch the service. To launch the `fusionauth-app` service, you can run this command:

```bash
brew services start fusionauth-app
```

Our plist was built using the examples and information located here: 

http://www.manpagez.com/man/5/launchd.plist/

#### Additional Details

If you don't want to have your application bottled by Brew, then you can include this field in your Ruby formula class:

```ruby
bottle :unneeded
```

Skipping bottling might be a good idea if your formula installs quickly or contains pre-built images already.

## Summary

Brew is a fantastic package manager for macOS. We hope you enjoy our FusionAuth formula. Feel free to rip off our code for your own project and enjoy the brew!
