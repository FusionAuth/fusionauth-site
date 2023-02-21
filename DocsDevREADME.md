## Documentation Style Guidelines

Here are some guidelines to follow when writing documentation (everything under `/site/docs`) as well as the blog (`_posts`).

- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing.
- Use `Id` instead of `ID` when describing a unique identifier
- Use `logged in` instead of `logged-in`
- `log in` is the verb, `login` is the noun
- Don't use complex breadcrumbs styling. Use `->` because Asciidoc converts this to a nice Unicode arrow. Breadcrumbs should look like this `[breadcrumb]#foo -> bar -> baz#`
- If you are referencing a URL as a setting and don't want it to be hyperlinked, preface it with a `\`. For example: `\https://fusionauth-example.zendesk.com`
- If you are referencing a field in a form or JSON API doc, use the `[field]` class (rather than backticks): `[field]#Issuer#`
- If you are referencing a UI element or button, use the `[uielement]` class: `Click the `[uielement]#Ok# button` in docs.
- Don't abbreviate FusionAuth, use the full name.
- When you have a list of values, use this phrase to prefix it: "The possible values are:"
- When using images that are cropped, add `top-cropped` and/or `bottom-cropped` roles as appropriate. Use `box-shadow` only when an image isn't captured in the manner documented below. It's used only when we have screenshots of things that do not have a box shadow and are all white and blend in too much with our white background. No other image classes are needed when creating documentation.
- In general, put screenshot images after the text describing the image. That is "This functionality....\n\n<screenshot of functionality>". However, when describing fields for screens, as in the core concepts section, put the screenshot first.
- References to `http://127.0.0.1` should be updated to `[http://localhost` and remove hyperlinks to `localhost`
- Always provide an alt text for images. It should always be a full sentence describing the content of the image.
- If possible use an SVG for images. Otherwise a PNG that has been properly minified is acceptable.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- Include fragments that are shared between different sections of the doc should be stored in the `shared` directory.
- All `link`s should be fully-qualified and never include a slash at the end (i.e. `link:/docs/v1/tech/apis/users` not `link:users`)
- All code snippets within any documents should have indenting formatted to 2 spaces.
- When introducing a code snippet, don't use a : (colon). Instead, just use verbiage before it. "The code to exchange the token is similar to below."
- Prefer 'You' to 'We'. 'Let's' is acceptable.
- Headers should be title-case.  (see https://titlecase.com/ to check if you would like. No caps on articles 👍)
- Code captions should be title cased, where the first letter of every word should be capitalized, except for a, an and the: This Code Is the Best
- Use the oxford comma. Apples, bananas, and oranges are my favorite fruits.
- If something is new in a version, mark it with something like this:

  [NOTE.since]
  ====
  Available Since Version 1.5.0
  ====

- If updating an article, please add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)

- If a doc gets long consider adding a table of contents in the top section or breaking it into multiple documents. To generate a table of contents from section headers, run this script:
```
egrep '^[=]+ ' site/docs/v1/tech/doc.adoc |sed 's/=//' |sed 's/=/*/g'|sed 's/* /* <</'|sed 's/$/>>/'
```

### Including files

- If you are building a file to include across multiple sections of documentation, make sure you preface the filename with `_` and use dashes to separate words: `_login-api-integration` not `_login_api_integration`.
- If you are including a file in the docs which uses asciidoctor, do not prepend the include file path with `/`. 
  - If it is a top level doc, use the full path: `include::docs/v1/tech/samlv2/_saml_limitations.adoc[]`. Otherwise you will get `WARNING: include file is outside of jail; recovering automatically` messages.
  - If it is an included doc (that is, one that starts with `_`), use the relative path: `include::../../../../src/json/scim/enterpriseuser-create-request.json[]` or `include::_scim-customizable-schema-shared.adoc[]`. Otherwise you will get `WARNING: include file is outside of jail; recovering automatically` messages.
- If a doc pulls code from an example application, use the include directive against the raw github repo. You can also pull sections with tags or line numbers: `include::https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/package.json[]` or `include::https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/routes/index.js[tags=clientIdSecret]`

### For API docs
- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when [field]#theOtherField.enabled# is set to true.
  ```
- If a feature is only available when using a paid edition, use the `shared/_premium-edition-blurb-api.adoc` fragment for API fields, and `shared/_premium-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields.
- If a feature is only available when using a enterprise edition, use the `shared/_enterprise-edition-blurb-api.adoc` fragment for API fields, and `shared/_enterprise-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If you are working in the `/api/identity-providers` folder there is a `README` there to help you understand the structure and layout of the documentation for the Identity Providers API.
- If a field was deprecated in a version 30 versions ago (deprecated in 1.15, you are now at 1.45), you can remove it from the docs.

#### Request section layout
This is general layout guidance for APIs that have `GET` and `POST` options:
```
== Request section header
GET URLs (could have 1-3 of these, show the most common)
=== GET request parameters (path segment)
=== GET request parameters (query string)
=== GET request headers

POST URLs (only will be one, typically)
=== POST request headers
=== POST request parameters (path segment)
=== POST request body
Example POST request(s)

=== Response section header
Response codes
==== Response body
Example response(s)
```

## Blog posts

For blog posts:
- Indent all code with two spaces per level.
- The class used for images should be updated to `class="img-fluid"`.
- If applicable, use _includes/_what-is-fusionauth.liquid to introduce FusionAuth in a standard way.
- Single spaces should be used instead of double spaces after a period.
- We use rouge for code formatting. Supported languages are listed here: https://github.com/rouge-ruby/rouge/tree/master/lib/rouge/lexers
- Blog post headers should have only the first word and any proper nouns are capitalized.
  (quick check is: `grep '^## \([^ ].*\)\{0,1\}' site/_posts/<post>.md`)
- For site navigation, use double quotes: Navigate to "Tenants" and then to the "Password" tab.
- For field names, use double quotes: "Login Identifier Attribute".
- For values, use back ticks: `userPrincipalName`.
- If appropriate, use tags. Here are the following tag types. They are separated with spaces. These are freeform, so feel free to add multiple and choose what works.
-- `client-<langname>` if the post refers to a specific language we have a client library for (use `client-javascript` for JS even though our client lib is typescript). These show up on the client libraries page.
-- `tutorial` for tutorials. These show up on the tutorial page.
-- `tutorial-<langname>`, `tutorial-<framework>` for a tutorial in a specific language or framework.
-- `tutorial-feature` for a tutorial for a given feature (how to use a lambda, for example)
-- `tutorial-integration` for a tutorial doing an integration with another software package (nodebb, for example)
-- `topic-<topic>` for general topics.
-- `topic-community-story` for any community stories you do.
-- `feature-<topic>` for specific features. These will show up on the feature page.
- You can use the `get-images-from-markdown.rb` script to extract images from markdown and store them in a directory.
- You can add a `related_resources` array of hashes to the front matter if you would like to customize the `additional resources` sidebar. See site/_posts/2022-10-27-introducing-biometric-authentication.md for format and example.
- All references to `stackoverflow.com` should be updated and direct to the community forum at `https://fusionauth.io/community/forum/`
- When writing blog posts, you have access to callouts.

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
- Add each blog post to one of 6 categories:
-- article: generic catch all type
-- community story: community and customer stories
-- comparison: an explicit comparison with another auth provider
-- tutorial: a tutorial on how to do something
-- announcement: a press release or release announcement
-- feature: a post about a particular feature


## Lists

- Capitalize the first word.
- Have a period on the end if it is a sentence, otherwise don't.

## Proper names and other verbiage
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
- ECMAScript
- esport
- Docker
- Docker Compose
- WebAuthn
- IdP
- Azure AD
- X.509
- Node.js
- re-authentication
- server-side
- client-side
- curl
- self-service

## Words to avoid

- etc


## Git

* Open a PR with changes. Tag someone to review it.
* Merge using the GitHub interface or using a merge commit.
* Don't `push -f` in general. Unless you know what you are doing.

## Tagging blog posts

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

You can add free form tags without the topic, tutorial, or feature prefix. Those will be collated and a tag cloud will be created on each blog post.

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
- If you crop the image, don't use the `shadowed` role. And vice versa.
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

You can add related blog posts to any of the docs pages.

First add tags to the relevant blog posts. If it is a client library post, use the form `client-<language>`. If it is an API related post, use `api-<section name>`. If it is a feature, use `feature-<name>`.

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

## Docs navigation

We use a combination of URL and frontmatter metadata to determine what documentation section to hold open when you are visiting a doc page.

In general, set the `navcategory` frontmatter attribute to the correct value when adding a new documentation page. The only exception is the API docs, which all live under `/apis/` so we can use that path and don't have to set the `navcategory` value.

There are currently nine sections:

* getting started: aimed at first time users
* installation guide: installing
* migration guide: migrating
* admin guide: for operating FusionAuth, includes roadmap and release notes
* login methods: the methods someone might use to log a user in
* developer guide: developer facing doc for integrating with FusionAuth
* customization: how to customize FusionAuth 
* premium features: any paid features should go here
* APIs: all api docs
* Release notes: our release notes.

Please don't add a top level section.

If you need third level indentation, add the "tertiary" class to the list element.

```
<li class="tertiary {% if page.url == "/docs/v1/tech/identity-providers/external-jwt/" %}active{% endif %}"><a href="/docs/v1/tech/identity-providers/external-jwt/">Overview</a></li>
```

## Data Driven Pages

Some sections are better suited to being driven by data. Jekyll makes this easy with lightweight YAML files in the `site/_data` directory. You can then iterate and filter the data there in various ways in a .liquid file.

You can also go from asciidoc to liquid syntax. Examples of that are the 'related posts' section mentioned above, the themes form/api template docs, and the example apps. Note that you can't use liquid syntax in any include files. See https://github.com/asciidoctor/jekyll-asciidoc/issues/166 for more details about this issue.

The theme pages are kinda complex because they a data file which is iterated over and conditionally generates asciidoc. This ascii doc is then included. Because you can't do includes of includes (that I could figure out), the liquid file has to be included in the top level file.


### Adding an example app

* Create a repo. It should have the prefix `fusionauth-example-` and you should add both the owners (as admins) and developer team (as maintainers).
* Add a readme and a license (apache2). It's great for the readme to point at the blog post, but you can also update the readme after your post is live.
* Add an entry in https://github.com/FusionAuth/fusionauth-site/blob/master/site/_data/exampleapps.yaml (you can do it on your blog post branch). Note that you can only put an app in one tech group, and that if it is a JavaScript app, use JavaScript, not typescript, as the group name.

This will add the example app to the example apps section in the docs.

## Expert Advice

The places to put files for the Expert Advice sections differ from the regular blog.
Content:	`site/learn/expert-advice/security` # or other top level category 
Images: `site/assets/img/advice/<subdir>`
Stamps: `site/assets/img/stamps`
Diagrams: `site/_diagrams/learn/expert-advice/<subdir>`
