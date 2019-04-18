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

Do you want to install FusionAuth but want to use Homebrew instead of Docker or a using a boring zip file? No problem. Our goal is to be the fastest and easiest authentication platform to deploy, wherever and whenever you want. We have a Homebrew formula that will get you up and running in minutes. In this post I'll show you how it works provide some details on how we pulled it together.
<!--more-->

## Installing Via Brew

TL;DR. If you just want to get FusionAuth up and running and aren't interested in how we did it, here's all you need. It's pretty simple.

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

Building the Homebrew formula for FusionAuth was pretty straightforward. Homebrew formulas already support downloading a zip to start a "build" so we just put our normal download url into the formula url and generate a `sha256` hash for added security.

The next steps were unpacking the zip into a format that brew could use effectively, and putting all of the persistent things in either `var` or `etc`. A normal install using our Fast Path installer script will result in all of the pieces being laid down on top of the same directory until everything required is there. With brew every piece must get its own directory for easy cleanup and separation. To resolve this and some persistence I mapped the following directories out of their respective apps directory to new locations.

* `config` -> `etc/fusionauth`
* `logs` -> `var/log/fusionauth`
* `java` -> `var/fusionauth/java`
* `data` -> `var/fusionauth/data` (Used only for the fusionauth-search package)

Finally, I found that `brew` was trying to correct all of the modules inside of the `elasticsearch` directory. It was pretty aggressive about it even though they are already portable binaries. This was spitting out a nasty looking error or warning to anyone that installed the formula. Not what we want to see. I ended up `tar`ing up the Elasticsearch modules during the install phase and extracting them back out during post install to avoid the nasty logs. These warnings seem to be because Brew can't differentiate between library formulas that are meant to be linked against and dynamically loaded binaries used internally by a program. **_START_TODO_** Can we add a link to thread or something that discuss this issue? **_END_TODO_**

During development I was able to test this using the following command which allowed me to test the formulas locally without constantly iterating through Github. This can be very handy so you do not have to push, test, debug and repeat.
 
`brew install --debug -v ./Formula/fusionauth-${app}.rb` 

After working though the minor issues, I ended up with a solid Homebrew formula that makes it simple to install and manage the FusionAuth files. I hope it works well for you, but let me know if you have any questions or issues.


## The Code

Below I have included the code used to create our formula and what every piece of it does.

### The Basics (Terminology)

A Brew Formula is a ruby script that contains well-known methods and fields for getting anything installed.
 
A Brew Bottle is a snapshot of a formulas final state that can be laid down quickly and easily without any actual install steps.
(With the exception of post install steps)

A Brew Cask is a macos application. It is usually defined by its .app extension and is usually entirely self contained. These are
used when an application doesn't have a simple formula for installing something and the application already has a mac app
artifact/distributable. 

A Brew Tap is a source for getting formulas. By default the shorthand is <org>/<tap> which equates to a github repo under <org>/homebrew-<tap>
that has a folder inside called Formula which then contains any number of ruby files, each of which is an installable formula.

### Extending the Formula

This is the most basic state for a formula which contains meta data for description, homepage, and a download url. The url is also
associated with a sha256 for added security. This is where our formula started.

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

### Install

When it came time to create the install script we use the formulas built in file utils on well-known [locations](https://github.com/Homebrew/brew/blob/master/docs/Formula-Cookbook.md#variables-for-directory-locations)
which can install anything that was inside of your download archive. Everything inside of the install function is done relative
do a temporary location called the `buildpath` and your job is to do any work you need to do and install the finished result to
the prefix.

In our case fusionauth ships ready to go and we just need to move things into the prefix. We start by moving our bin dir to
the prefix sbin directory. We don't want the default commands exposed to the users path because it would be confusing to have
a `startup.sh` and a `shutdown.sh` exposed to a users terminal. Instead I created an alias to start and stop as my last step and
put that alias file in the bin dir (which will be exposed to the users path)

Then we install the bulk of our project to its on directory in the prefix and then do a bunch of symlinking to some of the other
brew directories to make sure the files in those symlinks get persisted between installs/updates. (When a brew formula is updated,
all of its files are deleted except for the ones put in `etc` or `var`). We do the symlinking because our startup scripts
expects our java, logs, and config to be in specific directories relative to its own location.

```ruby
def install
  prefix.install "bin" => "sbin"
  prefix.install "fusionauth-app"
  etc.install "config" => "fusionauth" unless File.exists? etc/"fusionauth"
  prefix.install_symlink etc/"fusionauth" => "config"
  (var/"fusionauth/java").mkpath unless File.exists? var/"fusionauth/java"
  prefix.install_symlink var/"fusionauth/java"
  (var/"log/fusionauth").mkpath unless File.exists? var/"log/fusionauth"
  prefix.install_symlink var/"log/fusionauth" => "logs"

  (bin/"fusionauth").write <<~EOS
    #!/bin/bash
    case "$1" in
      start)
        #{prefix}/sbin/startup.sh
        ;;
      stop)
        #{prefix}/sbin/shutdown.sh
        ;;
      *)
        echo "Options are start/stop"
        ;;
    esac
  EOS
end
```

### Post Install

After install is complete you can also do any post install tasks you like. For `fusionauth-app` I didn't do any special tasks
in post install so mine was empty.

A useful note though: I ran into brew trying to relink and move the modules that are shipped with elasticsearch. It would eventually
fail to do so (fortunately) but print out a nasty error. This error would display for any user and might be confusing. To "fix" this
issue I read on github that it is recommended to remove any offending dylibs, relink, or just bypass brew by pushing them to the
`post_install` phase which is how search avoids the error/warning. Search will tar up the modules directory and delete it, then post
install will un`tar` it so that brew will leave the files alone. The alternative is to delete all of the elasticsearch modules which
felt like a worse solution.

Also, to anyone that decides to repeat this process. Keep in mind that `post_install` is run from your prefix directory, your
original `buildpath` is already gone so be sure you store your files in the `prefix` so you still have access to them by the time
post_install is getting executed.

```ruby
def post_install
  # Fix all the dylibs now that brew will leave them alone
  system("tar", "-xPf", prefix/"fusionauth-search/elasticsearch/modules.tar", "-C", prefix/"fusionauth-search/elasticsearch")
  rm_f prefix/"fusionauth-search/elasticsearch/modules.tar"
end
```

### Caveats

Caveats is usually meant for problems that might exist now because of a limitation in brew or something incompatible
with macos, etc. Another use for this is to let people know as they install something where the logs and config are located.

This message is always displayed to the user during install and can also be retrieved via `brew info`.

Example:

```ruby
def caveats; <<~EOS
    Logs:   #{var}/log/fusionauth/fusionauth-app.log
    Config: #{etc}/fusionauth/fusionauth.properties
  EOS
end
```

Which causes brew to print (during install or info):

```
==> Caveats
Logs:   /usr/local/var/log/fusionauth/fusionauth-app.log
Config: /usr/local/etc/fusionauth/fusionauth.properties
```

### The PLIST!

If you would like your application to run as a service then you will want/need to include a plist as well. Brew will automatically
install this where it needs to go if you define a method called plist. I build the one used in fusionauth by referencing
this link: http://www.manpagez.com/man/5/launchd.plist/.

This will execute the required command to start our app and uses macs launchd so it will manage state and shutdown automatically.

Example service start:

```bash
brew services start fusionauth-app
```

Example plist:

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

### Bonus

If you don't want to have your application bottled because it is already fast or prebuilt then you can include

```ruby
bottle :unneeded
```

If you have a something in your bin dir for starting up as an alternative to using `brew services` you can include
the following. (The string is the command they should use)

```ruby
plist_options :manual => "fusionauth start"
```

## Summary

Brew is a fantastic package manager for macOS. We hope you enjoy our FusionAuth formula! Feel free to rip off our code for your own project!
[https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula](https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula "Jump to GitHub")