---
layout: blog-post
title: The making of FusionAuth brew install
description: 
author: Tyler Scott
excerpt_separator: "<!--more-->"
categories: blog
tags:
- User Management
- FusionAuth
- code
- user data
- Identity Management
- brew
- homebrew
image: blogs/storing-user-data.jpg
---

Installing fusionauth made simple.
<!--more-->

Installing via brew
----

Installing FusionAuth via brew is extremely simple.

```bash
brew tap fusionauth/fusionauth
brew install fusionauth-app fusionauth-search
```

Then to start it run the following:

```bash
brew services start fusionauth-search
brew services start fusionauth-app
```

<video autoplay>
  <source src="https://s3.us-east-2.amazonaws.com/io.fusionauth/resources/brew.webm">
  Your browser does not support the video tag.
</video>

How it was made
----

Building the Homebrew formula for fusionauth was pretty straightforward because fusionauth already ships
in a versatile zip layout. 

First, the formula already supports downloading a zip to start a "build" so we just put our normal download
url into the formula url and generate a sha256 for added security.

Next, was just unpacking the zip into a format that brew could use effectively and put all of the persistent
things in either var or etc. A normal install using our fast installer script will result in all of the pieces
being laid down on top of the same directory until everything required is there. In the case of brew every piece
must get its own directory for easy cleanup and separation. To resolve this and some persistence I map the
the following directories out of the respective apps directory to other places.

* `config` -> `etc/fusionauth`
* `logs` -> `var/log/fusionauth`
* `java` -> `var/fusionauth/java`
* `data` -> `var/fusionauth/data` (Only for search)

Finally, I found that brew was trying to correct all of the modules inside of the elasticsearch directory and
it was pretty aggressive about it even though they are already portable binaries. This was spitting out a pretty
gross looking error/warning to anyone that installed the formula so I ended up taring up the modules during the install
phase and extract them back out during post install to avoid the gross logs. (Brew can't seem to differentiate between
library formulas that are meant to be linked against and dynamically loaded binaries used interally by a program)

To test all of this I used `brew install --debug -v ./Formula/fusionauth-${app}.rb` which allowed me to test the
formulas locally without constantly iterating through github.
