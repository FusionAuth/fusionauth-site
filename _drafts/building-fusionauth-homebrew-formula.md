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

**_START_TODO_**
Can we add a break down of each section in the brew forumula to describe what it does in a general sense to help folks build their own forumula?
**_END_TODO_**


### The Basics

A Brew Forumula is foo.
A Brew Bottle is bar.
A Brew cask is baz.
A Brew Tap is boom.


### Extending the Formula

Bla blah, here is how you extend the formula class to build your crap.

### Install

Let's do this.

### Post Install

Clean up your mess.

### Caveats

You aren't getting of that easy, of course there are caveats. 

### The PLIST!

Ah, the best for last. Let me tell you about my PLIST. 

## Summary

Brew is a fantastic package manager for macOS. We hope you enjoy our FusionAuth formula! Feel free to rip off our code for your own project!
[https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula](https://github.com/FusionAuth/homebrew-fusionauth/tree/master/Formula "Jump to GitHub")