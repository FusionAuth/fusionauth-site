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

Want to install FusionAuth but want to use Homebrew instead of Docker or manually installing the zip files? No problem. Our goal is to be the fastest and easiest authentication platform to deploy wherever you want it. We have a Homebrew formula that will get you up and running in minutes. Here's how it works, and a few more details on how we pulled it together.
<!--more-->

## Installing Via Brew

If you just want to get FusionAuth up and running and aren't interested in how we did it, here's all you need. It's pretty simple.

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

See the whole process in action in this quick video.
<video autoplay loop>
  <source src="https://s3.us-east-2.amazonaws.com/io.fusionauth/resources/brew.webm">
  Your browser does not support the video tag.
</video>

## How We Built the Homebrew Formula

Building the Homebrew formula for FusionAuth was pretty straightforward. Homebrew formulas already support downloading a zip to start a "build" so we just put our normal download url into the formula url and generate a sha256 for added security.

The next steps were unpacking the zip into a format that brew could use effectively, and putting all of the persistent
things in either `var` or `etc`. A normal install using our fast installer script will result in all of the pieces
being laid down on top of the same directory until everything required is there. With brew every piece
must get its own directory for easy cleanup and separation. To resolve this and some persistence I mapped the following directories out of their respective apps directory to new locations.

* `config` -> `etc/fusionauth`
* `logs` -> `var/log/fusionauth`
* `java` -> `var/fusionauth/java`
* `data` -> `var/fusionauth/data` (Only for search)

Finally, I found that brew was trying to correct all of the modules inside of the `elasticsearch` directory. It was pretty aggressive about it even though they are already portable binaries. This was spitting out a nasty looking error/warning to anyone that installed the formula. Not what we want to see. I ended up `tar`ing up the modules during the install
phase and extracting them back out during post install to avoid the nasty logs. (Brew can't seem to differentiate between
library formulas that are meant to be linked against and dynamically loaded binaries used internally by a program.)

To test all of this I used `brew install --debug -v ./Formula/fusionauth-${app}.rb` which allowed me to test the
formulas locally without constantly iterating through Github.

After working though the minor issues, I ended up with a solid Homebrew formula that makes it simple to install and manage the FusionAuth files. I hope it works well for you, but let me know if you have any questions or issues.
