- [Article Workflow, Pull Requests, And Reviews](#article-workflow-pull-requests-and-reviews)
  - [Documentation Self-Review Checklist](#documentation-self-review-checklist)
    - [API Documentation](#api-documentation)
    - [Non-API Documentation](#non-api-documentation)
- [Content Style Guidelines](#content-style-guidelines)
  - [General Rules](#general-rules)
  - [Lists](#lists)
  - [Names](#names)
- [Screenshots](#screenshots)
  - [Sizing Window For Screenshots](#sizing-window-for-screenshots)
  - [Screenshot Standards](#screenshot-standards)
  - [Shell Script To Take Screenshots](#shell-script-to-take-screenshots)
  - [Converting Terminalizer Gifs To Videos](#converting-terminalizer-gifs-to-videos)
- [Astro.js / MDX New Documentation](#astrojs--mdx-new-documentation)
  - [Search With Pagefind](#search-with-pagefind)
  - [How To Create A New Article And Their Types](#how-to-create-a-new-article-and-their-types)
    - [Quickstarts](#quickstarts)
    - [Example Apps](#example-apps)
    - [Blog Posts](#blog-posts)
  - [Useful Components](#useful-components)
- [Old Jekyll / Asciidoc Documents](#old-jekyll--asciidoc-documents)
  - [Document Hierarchy And Navigation](#document-hierarchy-and-navigation)
  - [General Rules](#general-rules-1)
  - [Including Files](#including-files)
  - [For API Docs](#for-api-docs)
    - [Request Section Layout](#request-section-layout)
  - [Data Driven Pages](#data-driven-pages)
  - [Search With Algolia](#search-with-algolia)

## Article Workflow, Pull Requests, And Reviews

This varies, but you'll always want to:

* Open a pull request (PR) with changes. Tag someone to review it.
* Merge using the GitHub interface or using a squash commit.
* Don't `push -f` in general. Unless you know what you are doing.
* Publishing happens whenever a commit or PR is merged to `master`.
* If a piece of content is technical, it needs a technical review by engineering or devrel.
* Typo fixes don't need review.
* If a piece of content is significant (blog post, guide, article) give it the label `content` and it will be published to a slack channel for marketing awareness.

### Documentation Self-Review Checklist

Prior to requesting review on a PR, please complete the following checklist.

#### API Documentation

1. If you added or changed an API parameter, ensure you added a version flag.
2. When APIs have default values, this is only documented on the request. Do not add it to the response.
3. When adding or modifying request or response JSON examples, try to maintain themes and consistently.
   - If the create request has a property of `"name": "My application"`, the response should contain this same value.
   - Try to use real world names and values in example requests/responses. Using name such as `Payroll` for an Application name is more descriptive than `app 1` and allows the reader to more understand the example.
4. When referencing a field in the description of another field use this syntax: `[field]#name#`.
5. Always try to provide a complete description of an API parameter. Brief descriptions that only re-state the obvious are not adeqaute.
6. There are times when two fields are optional, because only one of the two are required. In these cases, ensure we explain when the field is required, and when it is optional. There are many examples of this in the doc already for reference.

#### Non-API Documentation
1. Screenshots. Review color, dimensions and clarity. Review A/B to ensure layout has not changed, and the new screenshot is consistent with the previous one.
   - In the PR diff, generally speaking the dimensions and file size will be similar, if they are not, something may have changed.
   - The screenshot should not look fuzzy. If it does, the compression may be incorrect.
2. If you are referring to a navigatable element, use `[breadcrumb]#Tenants#` or `[breadcrumb]#Tenants -> Your Tenant#`. In other words, use it even for singular elements.
3. If you are referring to a field the user can fill out, use `[field]#Authorized Redirect URLs#`.
4. If you are referring to any other UI element, such as a submit button or read-only name, use `[uielement]#Submit#` or (on the application view screen) `[uielement]#Introspect endpoint#`.


## Content Style Guidelines

Below are guidelines for our documentation (everything under `/site/docs`), articles, and blogs (`astro/src/content/blog`).

### General Rules

- Capitalize all domain objects, especially when working with the object's API, in which it is created and updated in FusionAuth. For example, `apiKeyId` is capitalized: `The unique Id of the API Key to create. If not specified a secure random UUID will be generated.`
- If referring to something that exists as a domain object in FusionAuth, but you are not explicitly referring to an object being created/updated in FusionAuth, use lowercase. Here are some examples:
  - Application: `To allow users to log into and use your application, you’ll need to create an Application in FusionAuth.`
  - User: `This API is used to create a link between a FusionAuth User and a user in a 3rd party identity provider.`
- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing.
- Use `Id` instead of `ID` or `id` when describing a unique identifier
- Use `logged in` instead of `logged-in`
- `log in` is the verb, `login` is the noun
- Don't abbreviate FusionAuth, use the full name.
- References to `http://127.0.0.1` should be updated to `http://localhost`. Remove hyperlinks to `localhost`.
- Internal documentation links should always be relative, to `/docs`, not `https://fusionauth.io/docs`.
- Always provide an alt text for images. It should always be a full sentence describing the content of the image.
- In general, put screenshot images after the text describing the image. That is,
  ```
  This functionality blah blah.
  <screenshot of functionality>
  ```
  However, when describing fields for screens, as in the core concepts section, put the screenshot first.
- If possible use an SVG for images. Otherwise a PNG that has been properly minified is acceptable.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- When introducing a code snippet, don't use a : (colon). Instead, just use verbiage before it. "The code to exchange the token is similar to below."
- Prefer 'You' to 'We'. 'Let's' is acceptable.
- All code snippets within any documents should have indenting formatted to 2 spaces. Prettier's default formatting should be fine.
- Code captions should have the the first letter of every word capitalized: This Code Is The Best.
- All image captions should be one or more complete sentences.
- Use the Oxford comma. Apples, bananas, and oranges are my favorite fruits.
- Single spaces should be used instead of double spaces after a period.
- Headers should have the first letter of every word capitalized: `This Is The Header Text`. This is true for all headers (h1, h2, h3, h4). This is also known as [Start Case](https://en.wikipedia.org/wiki/Letter_case).
  (quick check is: `grep '^## \([^ ].*\)\{0,1\}' site/_posts/<post>.md`)
- When writing, you have access to Asides. Here's an [example blog post using an Aside](https://github.com/FusionAuth/fusionauth-site/blob/master/astro/src/content/blog/log4j-fusionauth.mdx). You can assign the following values to the type: `tip` for tips. `note` for things for the user to be aware of. `important` for things the user should pay attention to. `warn` for dangerous actions like deleting a tenant.
- For links, don't use the absolute URL for the FusionAuth website (https://fusionauth.io), only relative URLs. This allows us to deploy to our local and staging environments and not get sent over to prod.
- Avoid using `etc`.

### Lists

- Capitalize the first word.
- Have a period on the end if the list item is a sentence, otherwise don't.

Examples:

I like:

- apples
- bananas
- blueberries

Fruits were domesticated at different times.

- Apples were domesticated 4000 years ago.
- Bananas were domesticated 3000 years before apples.
- Blueberries were not domesticated until around 1900.

### Names
- .NET Core
- Azure AD
- CAPTCHA
- client-side
- Connector
- curl
- Docker
- Docker Compose
- ECMAScript
- Elasticsearch
- esport
- FusionAuth Cloud
- Google reCAPTCHA
- Identity Provider
- IdP
- Kickstart
- macOS
- multi-factor authentication
- multi-tenancy/multi-tenant
- Node.js
- OAuth and OAuth2
- re-authentication
- self-service
- server-side
- Spring Boot
- two-factor
- WebAuthn
- webview
- X.509

## Screenshots

### Sizing Window For Screenshots

When adding screenshots to the documentation, articles or blogs, use a normalized browser window size. The following apple Script should be used to build a consistent Safari browser window.

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

### Screenshot Standards

- Use light mode when capturing screenshots
- In macOS **System Settings > Appearance** make sure _Allow wallpaper tinting in windows_ is turned _off_.
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

### Shell Script To Take Screenshots
fa-screenshot.sh is located under `fusionauth-site/src/`. With this script you can automate following tasks:
- Sizing and moving the Safari window
- Capturing the screenshot
- Resizing the screenshot image
- Compressing the image using either pngquant or Tiny PNG
- Moving the image to an appropriate folder

```bash
./fa-screenshot.sh -h # for usage info
```

### Converting Terminalizer Gifs To Videos

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

## Astro.js / MDX New Documentation

Write new FusionAuth documentation in Astro.js in the `astro` folder. The older documentation was writtin in Asciidoc and Jekyll.

### Search With Pagefind

We use Algolia to search Jekyll content and Pagefind to search Astro content. [Pagefind](https://pagefind.app) has more details.

### How To Create A New Article And Their Types

#### Quickstarts

Quickstarts are any pages that under `/docs/quickstarts`. They are replacing quickstarts on the blog.

To build a Quickstart, see https://github.com/FusionAuth/fusionauth-example-template/blob/master/QUICKSTART-INSTRUCTIONS.md.

#### Example Apps

* Create a repo. It should have the prefix `fusionauth-example-` and you should add both the owner and devrel teams (as admins) and developer team (as maintainers).
* Add a readme and a license (apache2). It's great for the readme to point at the blog post, but you can also update the readme after your post is live.
* If you are writing the article in the old Jekyll site, add an entry in https://github.com/FusionAuth/fusionauth-site/blob/master/site/_data/exampleapps.yaml (you can do it on your blog post branch). Note that you can only put an app in one tech group, and that if it is a JavaScript app, use JavaScript, not Typescript, as the group name. This will add the example app to the example apps section in the docs.

#### Blog Posts

Follow everything in [Content Style Guidelines](#content-style-guidelines).

- If updating an blog post, please update the add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)
- If you have a common component that you want to include, make sure the blog is a `.mdx` file and create a component. [Example components](https://github.com/FusionAuth/fusionauth-site/tree/master/astro/src/components/blog) - [Example blog post using a component](https://github.com/FusionAuth/fusionauth-site/blob/master/astro/src/content/blog/amazon-cognito-and-fusionauth-comparison.mdx)
- Images should be pulled in using markdown: `![alt text](/path/to/images)`
- Images for a blog post should go under /astro/public/img/blogs/` in a directory related to the blog title.
- We use rouge for code formatting. Supported languages are listed here: https://github.com/rouge-ruby/rouge/tree/master/lib/rouge/lexers
- For site navigation, use double quotes: Navigate to "Tenants" and then to the "Password" tab.
- For field names, use double quotes: "Login Identifier Attribute".
- For values, use back ticks: `userPrincipalName`.
- Put each blog post into one or more of the known categories. [Here's the list](https://github.com/FusionAuth/fusionauth-site/blob/master/.github/known-blog-categories.txt). You can separate categories with commas.
- Use tags. They are separated with commas. These are freeform, so feel free to add multiple and choose what works. The first one is what is used to show related posts, unless there's a `featuredTag` value in the front matter. You can [learn more about the logic by reviewing the layout](https://github.com/FusionAuth/fusionauth-site/blob/master/astro/src/layouts/Blog.astro).
- You can use the `get-images-from-markdown.rb` script to extract images from markdown and store them in a directory.
- All references to `stackoverflow.com` should be updated and direct to the community forum at `https://fusionauth.io/community/forum/`
- When using an aside in the blog, please use the `nodark="true"` attribute.

### Useful Components

The `astro/src/components` folder has many useful helper classes you can use in your Markdown articles.

- `Under <Breadcrumb label="Settings -> Permalinks"/>`
- `Set <Field label="Site Title"/> to ` &#96; `Change Bank` &#96; `.`
- `Choose "English (United States)" and click <Uielement label="Continue"/>. `



## Old Jekyll / Asciidoc Documents

The old documentation site was built in Asciidoc and Jekyll. Write new articles instead in the `astro` folder.

### Document Hierarchy And Navigation

We use a combination of URL and frontmatter metadata to determine what documentation section to hold open when you are visiting a doc page. This is for the old Jekyll site only.

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

### General Rules
- Don't use complex breadcrumbs styling in docs. Use `->` because Asciidoc converts this to a nice Unicode arrow. Breadcrumbs should look like this `[breadcrumb]#foo -> bar -> baz#`. When using markdown, use `<span>foo -> bar -> baz</span>{:breadcrumb}`
- If you are referencing a URL as a setting and don't want it to be hyperlinked, preface it with a `\`. For example: `\https://fusionauth-example.zendesk.com`
- If you are referencing a field in a form or JSON API doc, use the `[field]` class (rather than backticks): `[field]#Issuer#` in asciidoc or `<span class="field">Issuer</span> in markdown.
- If you are referencing a UI element or button, use the `[uielement]` class: `Click the `[uielement]#Ok# button` in asciidoc or `<span class="uielement">Issuer</span> in markdown.
- When you have a list of values, use this phrase to prefix it: "The possible values are:"
- When using images that are cropped, add `top-cropped` and/or `bottom-cropped` roles as appropriate. Use `box-shadow` only when an image isn't captured in the manner documented below. It's used only when we have screenshots of things that do not have a box shadow and are all white and blend in too much with our white background. No other image classes are needed when creating documentation.
- Include fragments that are shared between different sections of the doc should be stored in the `shared` directory.
- All `link` elements should be fully-qualified and never include a slash at the end (i.e. `link:/docs/v1/tech/apis/users` not `link:users`)
- If something is new in a version, mark it with something like this:

```
  [NOTE.since]
  ====
  Available Since Version 1.5.0
  ====
```

- If a doc gets long add a table of contents in the top section or break it into multiple documents. To generate a table of contents from section headers, run this script (replacing the `doc.adoc` value). Don't include the link to the section containing the TOC.
```
egrep '^[=]+ ' site/docs/v1/tech/doc.adoc |sed 's/=//' |sed 's/=/*/g'|sed 's/* /* <</'|sed 's/$/>>/'
```
- We currently use [FontAwesome v5](https://fontawesome.com/v5/search?m=free) to render icons, so you can use them to refer to UI buttons, like this:
  - In Markdown:
    ```markdown
    <i/>{:.ui-button .green .fa .fa-plus}
    <i/>{:.ui-button .green .fa .fa-search}
    <i/>{:.ui-button .blue .fa .fa-edit}
    <i/>{:.ui-button .blue .fa .fa-save}
    <i/>{:.ui-button .purple .fas .fa-user}
    <i/>{:.ui-button .purple .fa .fa-key}
    <i/>{:.ui-button .gray .fa .fa-minus-circle}
    <i/>{:.ui-button .red .fa .fa-trash-alt}
    ```
  - In AsciiDoc:
    ```asciidoc
    icon:plus[role=ui-button green,type=fas]
    icon:search[role=ui-button green,type=fas]
    icon:edit[role=ui-button blue,type=fas]
    icon:save[role=ui-button blue,type=fas]
    icon:user[role=ui-button purple,type=fas]
    icon:key[role=ui-button purple,type=fa]
    icon:minus-circle[role=ui-button gray,type=fa]
    icon:trash-alt[role=ui-button red,type=fa]
    ```

    ![icons](https://github.com/FusionAuth/fusionauth-site/assets/1877191/9fd29e3d-c81a-498c-9b82-135f44a7c545)


### Including Files
- If you are building a file to include across multiple sections of documentation, make sure you preface the filename with `_` and use dashes to separate words: `_login-api-integration` not `_login_api_integration`.
- If you are including a file in the docs which uses asciidoctor, do not prepend the include file path with `/`.
  - If it is a top level doc, use the full path: `include::docs/v1/tech/samlv2/_saml_limitations.adoc[]`. Otherwise you will get `WARNING: include file is outside of jail; recovering automatically` messages.
  - If it is an included doc (that is, one that starts with `_`), use the relative path: `include::../../../../src/json/scim/enterpriseuser-create-request.json[]` or `include::_scim-customizable-schema-shared.adoc[]`. Otherwise you will get `WARNING: include file is outside of jail; recovering automatically` messages.
  - If you accidentally do this, you can find the files where the issue is by running: `bundle exec jekyll build --verbose > outfile 2>&1` and then looking through `outfile` for the `WARNING`. The file just before the warning line will be the one with an issue.
- If a doc pulls code from an example application, use the include directive against the raw github repo. You can also pull sections with tags or line numbers: `include::https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/package.json[]` or `include::https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/routes/index.js[tags=clientIdSecret]`

This will be revised when docs are migrated.

### For API Docs
- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when [field]#theOtherField.enabled# is set to true.
  ```
- If a feature is only available when using a paid plan, use the `shared/_premium-edition-blurb-api.adoc` fragment for API fields, and `shared/_premium-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields.
- If a feature is only available when using essentials, use the `shared/_advanced-edition-blurb-api.adoc` fragment for API fields, and `shared/_advanced-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If a feature is only available when using enterprise, use the `shared/_enterprise-edition-blurb-api.adoc` fragment for API fields, and `shared/_enterprise-edition-blurb.adoc` for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If you are working in the `/api/identity-providers` folder there is a `README` there to help you understand the structure and layout of the documentation for the Identity Providers API.
- If a field was deprecated in a version 30 versions ago (deprecated in 1.15, you are now at 1.45), you can remove it from the docs.


#### Request Section Layout
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

### Data Driven Pages

Some sections are better suited to being driven by data. Jekyll makes this easy with lightweight YAML files in the `site/_data` directory. You can then iterate and filter the data there in various ways in a .liquid file.

You can also go from asciidoc to liquid syntax. Examples of that are the 'related posts' section mentioned above, the themes form/api template docs, and the example apps. Note that you can't use liquid syntax in any include files. See https://github.com/asciidoctor/jekyll-asciidoc/issues/166 for more details about this issue.

The theme pages are kinda complex because they a data file which is iterated over and conditionally generates asciidoc. This ascii doc is then included. Because you can't do includes of includes (that I could figure out), the liquid file has to be included in the top level file.

### Search With Algolia

We use Algolia to search Jekyll content and Pagefind to search Astro content.

Algolia only searches content on the public site, so if you are running locally, it won't fully work. (It'll find local versions of public content, but not unpublished content.)

To do a dry run of the search indexing to see what will content be indexed on the next push:

```bash
bundle exec jekyll algolia --dry-run
```

or, if you want to see everything:

```bash
bundle exec jekyll algolia --dry-run --verbose
```