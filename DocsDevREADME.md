# Running builds
Almost all of the content for site now lives under the [astro](./astro) directory and is built by astro. You can run the site by cd-ing into the astro directory and running npm scripts from there or by running savant targets from the top level.

The build targets are
- `npm run dev` or `sb watch`: starts the astro dev server. Will render each page on demand and watch for file changes. Does not run the full build
- `npm run start` or `sb server`: runs a full build except for the compression step and will serve the whole site. Useful if you need test search or the build process.
- `npm run dev-build` or `sb compile`: runs the build step minus the compression but does not serve the file

## Content Style Guidelines

Here are some guidelines to follow when writing documentation (everything under [docs](astro/src/content/docs)), articles (everything under [articles](astro/src/content/articles)), and blogs [blog](astro/src/content/blog).
- Capitalize all domain objects, especially when working the object's API in which it is created and updated in FusionAuth. 
  For example, see the API Key APIs description for `apiKeyId`, where API Key is capitalized: `The unique Id of the API Key to create. If not specified a secure random UUID will be generated.`
- If referring to something that exists as a domain object in FusionAuth, but you are not explicitly referring to an object being created/updated in FusionAuth, use lowercase. Here are some examples:
 `To allow users to log into and use your application, you’ll need to create an Application in FusionAuth.`
- From the Link API, note the difference between a FusionAuth User and a 3rd party user: `This API is used to create a link between a FusionAuth User and a user in a 3rd party identity provider. This API may be useful when you already know the unique Id of a user in a 3rd party identity provider and the corresponding FusionAuth User.`
- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing.
- Use `Id` instead of `ID` or `id` when describing a unique identifier
- Use `admin UI` instead of `Admin UI` when writing about the admin user interface.
- Use `logged in` instead of `logged-in`
- `log in` is the verb, `login` is the noun
- Use `UserInfo` instead of `Userinfo`
- Don't abbreviate FusionAuth, use the full name.
- References to `http://127.0.0.1` should be updated to `http://localhost`. Remove hyperlinks to `localhost`.
- Always provide an alt text for images. It should always be a full sentence describing the content of the image.
- In general, put screenshot images after the text describing the image. That is "This functionality....\n\n<screenshot of functionality>". However, when describing fields for screens, as in the core concepts section, put the screenshot first.
- If possible use an SVG for images. Otherwise, a PNG that has been properly minified is acceptable.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- When introducing a code snippet, don't use a : (colon). Instead, just use verbiage before it. "The code to exchange the token is similar to below."
- Prefer 'You' to 'We'. 'Let's' is acceptable.
- All code snippets within any documents should have indenting formatted to 2 spaces.
- Code captions should have the first letter of every word capitalized: This Code Is The Best.
- All image captions should be one or more complete sentences.
- Use the oxford comma. Apples, bananas, and oranges are my favorite fruits.
- Single spaces should be used instead of double spaces after a period.
- Headers should have the first letter of every word capitalized: `This Is The Header Text`. This is true for all headers (h1, h2, h3, h4). This is also known as [Start Case](https://en.wikipedia.org/wiki/Letter_case).
- When writing, you have access to Asides. Here's an [example blog post using an Aside](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/content/blog/log4j-fusionauth.mdx). You can assign the following values to the type: `tip` for tips. `note` for things for the user to be aware of. `important` for things the user should pay attention to. `warn` for dangerous actions like deleting a tenant.
- For links, don't use the absolute URL for the FusionAuth website (https://fusionauth.io), only relative URLs. This allows us to deploy to our local and staging environments and not get sent over to prod.
- If you have a list element containing more than one paragraph, indent the second paragraph by the same amount as the start of the text in the first paragraph to make sure that it renders correctly.

## Docs 
- Don't use complex breadcrumbs styling in docs. Use `->`. Use the [Breadcrumb](astro/src/components/Breadcrumb.astro) component. Breadcrumbs should look like this `<Breadcrumb>foo -> bar -> baz</Breadcrumb>`.
- If you are referencing a field in a form or JSON API doc, use the [InlineField](astro/src/components/InlineField.astro) component: `<InlineField>Issuer</InlineField>`.
- If you are referencing a UI element or button, use the [InlineUIElement](astro/src/components/InlineUIElement.astro) component: `Click the <UIelement>Ok</UIelement> button`.
- If you are referencing a tab in the UI, use the [Breadcrumb](astro/src/components/Breadcrumb.astro) component: `On the <Breadcrumb>OAuth</Breadcrumb> tab`.
- When you have a list of values, use this phrase to prefix it: "The possible values are:"
- When using images that are cropped, add `top-cropped` and/or `bottom-cropped` roles as appropriate. Use `box-shadow` only when an image isn't captured in the manner documented below. It's used only when we have screenshots of things that do not have a box shadow and are all white and blend in too much with our white background. No other image classes are needed when creating documentation.
- Include fragments that are shared between different sections of the doc should be stored in the [shared](astro/src/content/docs/_shared) directory.
- All links elements should be fully-qualified and never include a slash at the end (i.e. `[users](/docs/apis/users)` not `[users](./users)`)
- If something is new in a version, mark it with something like this:

  <Aside type="version">
    Available Since Version 1.5.0
  </Aside>

If it is inline (for a field), use <AvailableSince since="1.5.0"> - [AvailableSince](astro/src/components/api/AvailableSince.astro)
- If you are deprecating a field, use <DeprecatedSince since="1.5.0"> - [DeprecatedSince](astro/src/components/api/DeprecatedSince.astro)
- If you are removing a field, use <RemovedSince since="1.5.0"> - [RemovedSince](astro/src/components/api/RemovedSince.astro)

- The table of contents along the right side is populated by a list of headings extracted from the top level markdown. If you are using nested markdown files with your headings you need to export them into the parent MDX file.
  - See [Account Portal](astro/src/content/docs/get-started/download-and-install/account-portal.mdx) for an example. See the Astro docs for [exported variables](https://docs.astro.build/en/guides/markdown-content/#using-exported-variables-in-mdx) and [exported properties](https://docs.astro.build/en/guides/markdown-content/#exported-properties) to see what that is doing.
- We currently use [FontAwesome v6](https://fontawesome.com/) to render icons, so you can use them to refer to UI buttons, like this:
    ```jsx
    <IconButton icon="edit" />
    <IconButton icon="copy" />
    <IconButton icon="fa-search" />
    ```

    ![icons](https://github.com/FusionAuth/fusionauth-site/assets/1877191/719bffe8-2a54-41a2-a339-b3afeda8d499)

Import the component:

```
import Icon from 'src/components/icon/Icon.astro';

...
    <IconButton name="plus" />
```

Review [the component for all options and icons](astro/src/components/icon/Icon.astro).

### Docs Navigation

If you want a page to float to the top of the navigation, because it is an overview page, use this attribute:

```
topOfNav: true
```

Make descriptions full sentences.


### Including files
- If you are building a file to include across multiple sections of documentation, make sure you preface the filename with `_` and use dashes to separate words: `_login-api-integration` not `_login_api_integration`.
- You may include both markdown files and astro components as imports in MDX. These are treated as components.
```mdxjs
import AccountPortalCore from 'src/content/docs/_shared/_account-portal.mdx';
...
<AccountPortalCore/>
```
- You can pass `props` to both astro components and mdx components.
  - For astro components this looks like:
```typescript jsx
---
const { feature } = Astro.props;
---
{ feature && <><strong>Note:</strong> An Enterprise plan is required to utilize {feature}. </>}
```
  - For mdx it looks like:
```mdxjs
---
---
# Getting Help
You can find help for {props.topic} at [help](/help)
```
- In MDX files you can put some content behind a javascript expression
```mdxjs
---
---
{props.showStuff && <>
  This is some more content <a href="/home">Home</a>
</>}
```
  - You may need to add a empty tag multi-line content after the expression to indicate that this is a block
  - Markdown syntax will not render inside of a block inside of an expression. You must use html there.
  - Content passed in the `<slot></slot>` of a component will be passed as rendered markdown.
  - you may need to coerce a prop into a boolean to use as a conditional for an expression. Such as `{!!props.message && <span>{props.message}</span>}`;
- JSON files are their own content collection in astro. You can reference these using the [JSON component](astro/src/components/JSON.astro)
- We have an alias mapped in [tsconfig](astro/tsconfig.json) that allows you to use absolute references from 'src'. Otherwise, imports must use relative paths.
- If a doc pulls code from an example application, use the [RemoteContent](astro/src/components/RemoteContent.astro). You can also pull sections with tags: `<RemoteContent url="https://raw.githubusercontent.com/FusionAuth/fusionauth-javascript-sdk/main/packages/sdk-react/README.md" tags="forDocSite" />`

### For API docs
- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when <InlineField>theOtherField.enabled</InlineField> is set to true.
  ```
- If a feature is only available when using a paid plan, use the [PremiumEditionBlurbApi](astro/src/content/docs/_shared/_premium-edition-blurb-api.astro) component `<PremiumEditionBlurbApi feature="custom forms" />` fragment for API fields, and [PremiumEditionBlurb](astro/src/content/docs/_shared/_premium-edition-blurb.astro) component for any other location where the feature is mentioned in docs. Only mark the request API fields.
- If a feature is only available when using essentials, use the [AdvancedEditionBlurbApi](astro/src/content/docs/_shared/_advanced-edition-blurb-api.astro) component for API fields, and [AdvancedEditionBlurb](astro/src/content/docs/_shared/_advanced-edition-blurb.astro) for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If a feature is only available when using enterprise, use the [EnterpriseEditionBlurbApi](astro/src/content/docs/_shared/_enterprise-edition-blurb-api.astro) component for API fields, and [EnterpriseEditionBlurb](astro/src/content/docs/_shared/_enterprise-edition-blurb.astro) for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If you are working in the `/api/identity-providers` folder there is a `README` there to help you understand the structure and layout of the documentation for the Identity Providers API.
- If a field was deprecated in a version 30 versions ago (deprecated in 1.15, you are now at 1.45), you can remove it from the docs.


#### Request section layout
This is general layout guidance for APIs that have `GET` and `POST` options:
```
## Request section header
GET URLs (could have 1-3 of these, show the most common)
### GET request parameters (path segment)
### GET request parameters (query string)
### GET request headers

POST URLs (only will be one, typically)
### POST request headers
### POST request parameters (path segment)
### POST request body
Example POST request(s)

### Response section header
Response codes
#### Response body
Example response(s)
```

## Blog posts

Follow everything in the `Content Style Guidelines` section.

- If updating an blog post, please update the add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)
- If you have a common component that you want to include, make sure the blog is a `.mdx` file and create a component. [Example components](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/src/components/blog) - [Example blog post using a component](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/content/blog/amazon-cognito-and-fusionauth-comparison.mdx)
- Images should be pulled in using markdown: `![alt text](/path/to/images)`
- Images for a blog post should go under /astro/public/img/blogs/` in a directory related to the blog title.
- We use rouge for code formatting. Supported languages are listed here: https://github.com/rouge-ruby/rouge/tree/master/lib/rouge/lexers
- For site navigation, use double quotes: Navigate to "Tenants" and then to the "Password" tab.
- For field names, use double quotes: "Login Identifier Attribute".
- For values, use back ticks: `userPrincipalName`.
- Put each blog post into one or more of the known categories. [Here's the list](https://github.com/FusionAuth/fusionauth-site/blob/main/config/contentcheck/known-blog-categories.txt). You can separate categories with commas.
- Use tags. They are separated with commas. These are freeform, so feel free to add multiple and choose what works. The first one is what is used to show related posts, unless there's a `featuredTag` value in the front matter. You can [learn more about the logic by reviewing the layout](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/layouts/Blog.astro).
- You can use the `get-images-from-markdown.rb` script to extract images from markdown and store them in a directory.
- All references to `stackoverflow.com` should be updated and direct to the community forum at `https://fusionauth.io/community/forum/`
- When using an aside in the blog, please use the `nodark="true"` attribute.

## Lists

- Capitalize the first word.
- Have a period on the end if the list item is a sentence, otherwise don't.

Examples.

I like:

- apples
- bananas
- blueberries

Fruits were domesticated at different times.

- Apples were domesticated 4000 years ago.
- Bananas were domesticated 3000 years before apples.
- Blueberries were not domesticated until around 1900.

## Proper names and other verbiage
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
- first-party
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
- third-party
- two-factor
- WebAuthn
- webview
- X.509


## Words to avoid

- etc

## Article workflow

Varies, but you'll always want to 

* Open a PR with changes. Tag someone to review it.
* Merge using the GitHub interface or using a squash commit.

Don't `push -f` in general. Unless you know what you are doing.

Publishing happens whenever a commit or PR is merged to `main`.

## Sizing Window for Screenshots

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

## Screenshot Standards

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
	2. Crop the image vertically to only display the necessary content.
- Use https://local.fusionauth.io and use the correct kickstart to add the Silicon Valley characters ( https://github.com/FusionAuth/fusionauth-example-kickstart/blob/main/fusionauth/kickstart-development.json )
- Make sure that the same character is used for every screenshot on a page (unless you are demonstrating a view from the admin and also user perspective)
- The shrink-images GitHub Action will call https://tinypng.com/ to compress the images that you commit.

### Shell script for capturing sceenshots
fa-screenshot.sh is located under `fusionauth-site/src/`. With this script you can automate following tasks:
- Sizing and moving the Safari window
- Capturing the screenshot
- Resizing the screenshot image
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

## Search

We use pagefind to search astro content. 

### Pagefind

This runs on the astro build. https://pagefind.app/ has more details

In order for it to work you locally you will need to fully run the astro build, it will not work in regular dev mode

```sh
npm run start
```

alternatively if you like savant you can do

```sh
sb watch
```

we build the full site with search for development

## Docs navigation

We use a combination of URL and frontmatter metadata to determine what documentation section to hold open when you are visiting a doc page. The front matter attributes `section`, `subcategory`, `tertcategory`, and `quatercategory` should generally correspond to the url path segments of the page.

In general, set the frontmatter attributes to the correct value when adding a new documentation page.

There are currently nine sections:

* get started: aimed at first time users
* lifecycle: for everyday fusionauth stuff
* customize: making fusionauth your own
* extend: making fusionauth do even MORE stuff
* operate: making fusionauth do the stuff it is supposed to do
* sdks: code we ship that can help you do things with fusionauth
* apis: application programming interfaces
* release notes: see what's new
* reference: general info that the other pages might link to

Please don't add a top level section.

## Data Driven Pages

Some sections are better suited to being driven by data. Jekyll makes this easy with lightweight json files in the `astro/src/content/json` directory. You can then iterate and filter the data there in various ways in a `.astro` file.

### Adding an example app

* Create a repo. It should have the prefix `fusionauth-example-` and you should add both the owner and devrel teams (as admins) and developer team (as maintainers).
* Add a readme and a license (apache2). It's great for the readme to point at the blog post, but you can also update the readme after your post is live.
* Add an entry in https://github.com/FusionAuth/fusionauth-site/blob/main/site/_data/exampleapps.yaml (you can do it on your blog post branch). Note that you can only put an app in one tech group, and that if it is a JavaScript app, use JavaScript, not typescript, as the group name.

This will add the example app to the example apps section in the docs.

## Documentation self-review checklist

Prior to requesting review on a PR, please complete the following checklist.

### API documentation

1. If you added or changed an API parameter, ensure you added a version flag.
2. When APIs have default values, this is only documented on the request. Do not add it to the response.
3. When adding or modifying request or response JSON examples, try to maintain themes and consistently.
   - If the create request has a property of `"name": "My application"`, the response should contain this same value.
   - Try and use real world names and values in example requests/responses. Using name such as `Payroll` for an Application name is more descriptive than `app 1` and allows the reader to more understand the example.
4. When referencing a field in the description of another field use this syntax: `<InlineField>name</InlineField>`.
5. Always try and provide a complete description of an API parameter. Brief descriptions that only re-state the obvious are not adeqaute.  
6. There are times when two fields are optional, because only one of the two are required. In these cases, ensure we explain when the field is required, and when it is optional. There are many examples of this in the doc already for reference.  

#### Non API documentation
1. Screenshots. Review color, dimensions and clarity. Review A/B to ensure layout has not changed, and the new screenshot is consistent with the previous one.
   - In the PR diff, generally speaking the dimensions and file size will be similar, if they are not, something may have changed. 
   - The screenshot should not look fuzzy. If it does, the compression may be incorrect. 
2. If you are referring to a navigatable element, use `<Breadcrumb>Tenants</Breadcrumb>` or `<Breadcrumb>Tenants -> Your Tenant</Breadcrumb>`. In other words, use it even for singular elements.
3. If you are referring to a field the user can fill out, use `<InlineField>Authorized Redirect URLs</InlineField>`.
4. If you are referring to any other UI element, such as a submit button or read-only name, use `<UIelement>Submit</UIelement>` or (on the application view screen) `<UIelement>Introspect endpoint</UIelement>`.


## Content checklist

TBD

## Quickstarts

Quickstarts are any pages that are going under /docs/quickstarts that are not on the blog.

See https://github.com/FusionAuth/fusionauth-example-template/blob/main/QUICKSTART-INSTRUCTIONS.md for instructions on building out a quickstart.


## Linting

We're using [Vale](https://vale.sh/) to find misspellings and to standardize terms.

The main configuration file is located at [`.vale.ini`](./.vale.ini), where we specify file extensions to parse (besides the default `.md` one), some custom filters to ignore Astro components and which rules we'll use.

### Rules

- The rules _(or, as Vale calls them, "styles")_ are located at [`config/vale/styles`](./config/vale/styles).
- Right now, we're using [`write-good`](./config/vale/styles/write-good), a collection of simple rules to avoid common mistakes and awkward sentences.
- We also have a custom vocabulary at [`config/vale/styles/config/vocabularies/FusionAuth/accept.txt`](./config/vale/styles/config/vocabularies/FusionAuth/accept.txt) with known words.
  - Note that this file can use regular expressions to match words in a case-insensitive manner, as described [in their docs](https://vale.sh/docs/topics/vocab/).
- Anything marked as code (with backticks) is ignored, so if you have a UUID or config string, surrounding it with backticks is a good way to satisfy vale.

### GitHub Actions

There's [a GitHub Action](./.github/workflows/vale.yml) that runs Vale on added/modified files when opening a pull request. It'll only cover files located at `astro/src/content` and `astro/src/components`. It will block merging the PR.

### Running locally

If you have Docker installed, you can lint files by running the command below.

```shell
$ cd fusionauth-site
$ docker run --rm -v "$(pwd)/.vale.ini:/etc/.vale.ini" -v "$(pwd)/.github:/etc/.github" -v "$(pwd)/astro:/docs" -w /docs jdkato/vale --config /etc/.vale.ini src/content/path/to/folder/or/file
```

If you whether choose to [install Vale locally](https://vale.sh/docs/vale-cli/installation/), make sure you're at the root folder for this repository and run:

```shell
$ cd fusionauth-site
$ vale astro/path/to/folder/or/file
```

If you want to filter by specific rules, you can also pass a `--filter` argument:

```shell
$ vale --filter=".Name == 'Vale.Spelling'" astro/path/to/file
```

### What to do with linting errors

Whenever you receive an error, you need to determine if you should:

- Actually fix the word (e.g. if you received an error like _"Use 'Id' instead of 'ID'."_); or
- Add a known word to [`the vocabulary`](./config/vale/styles/config/vocabularies/FusionAuth/accept.txt) if it's a language, library, company name, etc. But make sure you have the correct capitalization to avoid having duplicates there; or
- In case of custom Astro components, you'd probably need to add a new `TokenIgnores` item in [`.vale.ini`](./.vale.ini).

## Pull request review process

* If a piece of content is technical, it needs a technical review by engineering or devrel.
* Typo fixes don't need review.
* If a piece of content is significant (blog post, guide, article) give it the label `content` and it will be published to a slack channel for marketing awareness.


