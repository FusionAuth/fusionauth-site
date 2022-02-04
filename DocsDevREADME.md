## Documentation Style Guidelines

Here are some guidelines to follow when writing documentation (everything under `/site/docs`.

- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing. 
- Use `Id` instead of `ID` when describing a unique identifier
- Use `logged in` instead of `logged-in`
- Don't use complex breadcrumbs styling. Use `->` because Asciidoc converts this to a nice Unicode arrow. Breadcrumbs should look like this `[breadcrumb]#foo -> bar -> baz#`
- If you are referencing a URL as a setting and don't want it to be hyperlinked, preface it with a `\`. For example: `\https://fusionauth-example.zendesk.com`
- If you are referencing a field in a form or JSON API doc, use the `[field]` class (rather than backticks): `[field]#Issuer#`
- Don't abbreviate FusionAuth, use the full name.
- When you have a list of values, use this phrase to prefix it: "The possible values are:"
- Use single backticks when specifying a value that is not a field.
- When using images that are cropped, add `top-cropped` and/or `bottom-cropped` roles as appropriate. Use `box-shadow` only when an image isn't captured in the manner documented below. It's used only when we have screenshots of things that do not have a box shadow and are all white and blend in too much with our white background. No other image classes are needed when creating documentation.
- References to `http://127.0.0.1` should be updated to `[http://localhost` and remove hyperlinks to `localhost`
- The class used for images should be updated to `class="img-fluid"`.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- Include fragments that are shared between different sections of the doc should be stored in the `shared` directory.
- All `link`s should be fully-qualified and always include a slash at the end (i.e. `link:/docs/v1/tech/apis/users/` not `link:users`)
- All code snippets within any documents should have indenting formatted to 2 spaces
- If something is new in a version, mark it with something like this:

  [NOTE.since]
  ====
  Available Since Version 1.5.0
  ====

- If updating an article, please add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)

- When writing posts, you have access to callouts.
  
  ![important-call](https://user-images.githubusercontent.com/16090626/112875860-f75a4000-9081-11eb-8119-799db8cfc385.png)
  ![note-call](https://user-images.githubusercontent.com/16090626/112875861-f7f2d680-9081-11eb-8fa7-360c0460618e.png)
  ![tip-call](https://user-images.githubusercontent.com/16090626/112875862-f7f2d680-9081-11eb-845f-09c37a7bcf6d.png)

  - There are three callout liquid files `_callout-tip`, `_callout-important`, `_callout-note`
  - They can be accessed as so:
    ```markdown
    {% include _callout-tip.liquid
    content=
    "<your-content-here-and-markdown-compatible-strings-accepted>"
    %}
    ```


- If you are building a file to include across multiple sections of documentation, make sure you preface the filename with `_` and use dashes to separate words: `_login-api-integration` not `_login_api_integration`.
- If you are including a file in the docs/asciidoctor, do not prepend the include file path with `/`. Instead, use the full path: `include::docs/v1/tech/samlv2/_saml_limitations.adoc[]`. Otherwise you will get `WARNING: include file is outside of jail; recovering automatically` messages.
- If a doc pulls code from an example application, use the include directive against the raw github repo. You can also pull sections with tags or line numbers. See the 5 minute guide for an example.
- If a doc gets long consider adding a table of contents in the top section or breaking it into multiple documents. To generate a table of contents from section headers, run this script:
```
egrep '^[=]+ ' site/docs/v1/tech/doc.adoc |sed 's/=//' |sed 's/=/*/g'|sed 's/* /* <</'|sed 's/$/>>/'
```

For API docs:
- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when [field]#theOtherField.enabled# is set to true.
  ```
- If a feature is only available when using a paid edition, use the `shared/_premium-edition-blurb-api.adoc` fragment for API fields, and `shared/_premium-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields.
- If a feature is only available when using a enterprise edition, use the `shared/_enterprise-edition-blurb-api.adoc` fragment for API fields, and `shared/_enterprise-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If you are working in the `/api/identity-providers` folder there is a `README` there to help you understand the structure and layout of the documentation for the Identity Providers API.

For blog posts:
- Indent all code with two spaces per level.
- Single spaces should be used instead of double spaces after a period.
- We use rouge for code formatting. Supported languages are listed here: https://github.com/rouge-ruby/rouge/tree/master/lib/rouge/lexers
- Blog post headers should have only the first word and any proper nouns are capitalized.
  (quick check is: `grep '^## \([^ ].*\)\{0,1\}' site/_posts/<post>.md`)
- For site navigation, use double quotes: Navigate to "Tenants" and then to the "Password" tab.
- For field names, use double quotes: "Login Identifier Attribute".
- For values, use back ticks: `userPrincipalName`.
- If appropriate, use tags. Here are the following tag types. They are separated with spaces. These are freeform, so feel free to add multiple and choose what works.
- All references to `stackoverflow.com` should be updated and direct to the community forum at `https://fusionauth.io/community/forum/`
-- `client-<langname>` if the post refers to a specific language we have a client library for (use `client-javascript` for JS even though our client lib is typescript). These show up on the client libraries page.
-- `tutorial` for tutorials. These show up on the tutorial page.
-- `tutorial-<langname>`, `tutorial-<framework>` for a tutorial in a specific language or framework.
-- `tutorial-feature` for a tutorial for a given feature (how to use a lambda, for example)
-- `tutorial-integration` for a tutorial doing an integration with another software package (nodebb, for example)
-- `topic-<topic>` for general topics. 
-- `topic-community-story` for any community stories you do.
-- `feature-<topic>` for specific features. These will show up on the feature page.

For documentation posts:
- Headers should be title-case.  (see https://titlecase.com/ to check if you would like. No caps on articles 👍)

For lists:
- Capitalize the first word.
- Have a period on the end if it is a sentence, otherwise don't.

### Proper names and other verbiage
- macOS
- Elasticsearch
- .NET Core
- OAuth and OAuth2
- Identity Provider
- Connector
- Kickstart
- multi-factor authentication
- multi-tenancy/multi-tenant
- two-factor

## Git

* Open a PR with changes. Tag someone to review it.
* Merge using the GitHub interface or using a merge commit.
* Don't `push -f` in general. Unless you know what you are doing.

## Tagging

Tag your blog posts.

If they feature any client libraries, tag them with `client-[langname]` and they will automatically appear on the client libraries page. `client-javascript` appears on the typescript page, since that is the supported client library.

If they highlight a feature, tag them with `feature-[featurename]` and if there's a feature page, they'll appear there. `feature-breached-password-detection` for example.

If they are a tutorial, add `tutorial` and they will appear on the tutorials page in the docs. You can also add `tutorial-[langname]` if it focuses on a language, `tutorial-feature` if it is a FusionAuth feature (webhooks, themes, etc) and `tutorial-integration` if it is an integration tutorial (nodebb, wordpress, etc). If it is for an advanced feature/reactor feature, add `tutorial-reactor-feature`. Those are all separate sections. 

If it is a community story, tag with `topic-commmunity-story`. Right now that doesn't do anything, but it will.

If it is a story about an upgrade, tag it with one of these tags:

* `topic-upgrade-homegrown`
* `topic-upgrade-saas`
* `topic-upgrade-opensource`

As well as the competitor name if mentioned: `topic-upgrade-cognito`.

Separate tags with spaces: `topic-upgrade-homegrown topic-community-story`

## Sizing Window for Screenshots

When adding screenshots to the documentation, articles or blogs, use a normalized browser window size. The following apple Script should be used to build a consistent browser window.

Note that you must have at least `1100` pixels of screen height. If you do not, your dimensions will be skewed. Go to `System Preferences > Display` then choose `More Space` or the next selection up from your current selection to ensure you have enough space available.

You will also want to ensure that you do not have scroll bars omni-present, this will affect the UI when taking screenshots. See `System Preferences > General > Show scroll bars` and ensure `When scrolling` is selected.

Also note that you should be resizing the image down to 1600px wide. If you are resizing up, something is wrong and your images will be fuzzy. 

```appleScript
set theApp to "Safari"

# Docs/blog screens
#set appHeight to 1100
#set appWidth to 1080

# Wider UI screens
#set appHeight to 1100
#set appWidth to 1550

# Video
#set appHeight to 1100
#set appWidth to 1550

# Maintenance Mode Screens
#set appHeight to 1100
#set appWidth to 900

tell application "Finder"
	set screenResolution to bounds of window of desktop
end tell

set screenWidth to item 3 of screenResolution
set screenHeight to item 4 of screenResolution

tell application theApp
	activate
	reopen
	set xAxis to 640
	set yAxis to 360
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
```

## Screenshot Standards

- Use light mode when capturing screenshots
- Make sure you set your `fusionauth-app.runtime-mode` to `production` unless documenting a feature only available in `development` mode.
- Use `CMD`+`shift`+`4`+`space` to get the drop-shadow style screenshots
- After sizing the window using the AppleScript, do not make the windows smaller in the Y axis.
   - If you only want a portion of the screen, crop it. See Application Core Concepts for an example.
- Crop top/bottom if necessary (don't crop sides).
   - If you crop the bottom or top, use the `bottom-cropped` or `top-cropped` class on the image. In some cases the 
     class may not be necessary if there is adequate spacing below. When text continues below or right above you will need 
     the class.
- If you crop the image, don't use the `box-shadow` role. And vice versa.
- Highlight sections using image preview editor
	- Highlights should be red rectangle with line weight 5
- To size and compress images without losing too much quality, follow these steps:
	1. Resize to width of 1600 in Preview.app ( or you can use `sips --resampleWidth 1600 *.png` from the command line)
	2. Use https://tinypng.com/ to compress the image
- Use https://local.fusionauth.io and use the correct kickstart to add the Silicon Valley characters ( https://github.com/FusionAuth/fusionauth-example-kickstart/blob/master/fusionauth/kickstart-development.json )
- Make sure that the same character is used for every screenshot on a page (unless you are demonstrating a view from the admin and also user perspective)

## Shell script for capturing sceenshots 
fa-screenshot.sh is located under `fusionauth-site/src/`. With this script you can automate following tasks:
- Sizing and moving the Safari window
- Capturing the screenshot 
- Resizing the screenshot image
- Compressing the image using either pngquant or Tiny PNG
- Moving the image to an appropriate folder
 
```bash
./fa-screenshot.sh -h # for usage info
```



Converting terminalizer gifs to videos
----

Gifs take up quite a lot of space: The brew gif was about 5mb, after some custom optimization it was only 2mb

To reduce the space requirements further, a video format is highly recommended and the dominant video format is
webm. Converting a gif to webm is cake: `ffmpeg -i terminalizer.gif terminalizer.webm`. ffmpeg will choose all
of the best default settings for you because the format is already specifically for browsers.

The problem is webm is not supported by safari (yet). You will also want to create an mp4 (which isn't always supported
by some of the lesser browsers because it uses codecs that require paid licenses inside). You also will have to
do some eyeballing on your video because safari is really picky about what it permits.

Example of my brew convert command:
```bash
ffmpeg -i render1555538879075.gif -vf scale=744x478 -vsync 2 -pix_fmt yuv420p brew.mp4
```

`-vf scale=` adjusts the scale of the output. The height and width must be divisible by 2!

`-vsync 2` makes the framerate variable and is great for terminalizer gifs because there are MANY duplicated frames
that this parameter will drop and significantly reduce your file size (by about half for my brew example)

`-pix_fmt yuv420p` changes the pixel format to yuv420p which is the magic sauce that safari wants (this is
also the part that needs a size that is divisible by 2)

## Adding a 'Related Posts' section

You can add a related posts section to any of the AsciiDocs pages.

First add tags to the relevant blog posts. If it is a client library post, use the form `client-<language>`. If it is an API related post, use `api-<section name>`.

Then, add the following directive to the top of the file:

```
:page-liquid:
```

Then, wherever you want the related posts to show up, add this text:

```
++++
{% capture relatedTag %}api-tenants{% endcapture %}
{% include _doc-related-posts.liquid %}
++++
```

Update the `relatedTag` value to match the tag added to the blog post.


## Search

We use algolia to search. This only searches content on the public site, so if you are running locally, it won't fully work. (It'll find local versions of public content, but not unpublished content.)

To do a dry run of the search indexing to see what will content be indexed on the next push:

```
bundle exec jekyll algolia --dry-run 
```

or, if you want to see everything:

```
bundle exec jekyll algolia --dry-run --verbose
```

## Data Driven Pages

Some sections are better suited to being driven by data. Jekyll makes this easy with lightweight YAML files in the `site/_data` directory. You can then iterate and filter the data there in various ways in a .liquid file. 

Examples of that are the customers page and the quotes widget.

You can also go from asciidoc to liquid syntax. Examples of that are the 'related posts' section mentioned above, the themes form/api template docs, and the example apps. Note that you can't use liquid syntax in any include files. See https://github.com/asciidoctor/jekyll-asciidoc/issues/166 for more details about this issue.

The theme pages are kinda complex because they a data file which is iterated over and conditionally generates asciidoc. This ascii doc is then included. Because you can't do includes of includes (that I could figure out), the liquid file has to be included in the top level file.
