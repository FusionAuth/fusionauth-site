## Content Style Guide

Follow these guidelines when writing documentation (everything under [docs](astro/src/content/docs)) and articles (everything under [articles](astro/src/content/articles)):

- Capitalize all domain objects, especially when working the object's API in which it is created and updated in FusionAuth.
  For example, see the API Key APIs description for `apiKeyId`, where API Key is capitalized: `The unique Id of the API Key to create. If not specified a secure random UUID will be generated.`
  - EXCEPT WHEN referring to an object being created/updated in FusionAuth (e.g. `To allow users to log into and use your application, you'll need to create an Application in FusionAuth.`; `This API is used to create a link between a FusionAuth User and a user in a 3rd party identity provider. This API may be useful when you already know the unique Id of a user in a 3rd party identity provider and the corresponding FusionAuth User.`)
- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing
- Do not use smart quotes or smart apostrophes; stick to ASCII when possible
- Use `Id` instead of `ID` or `id` when describing a unique identifier
- Use `Admin UI` instead of `admin UI` when writing about the admin user interface
- Use `logged in` instead of `logged-in`
- `log in` is the verb, `login` is the noun
- Use `UserInfo` instead of `Userinfo`
- Use "self-hosted" as an adjective, e.g. "Self-hosted instances are the best way to try FusionAuth!"
- Use "self-hosting" as a noun, e.g. "FusionAuth supports self-hosting". If you aren't sure whether to use "self-hosting" or "self-hosted", try "self-hosted"
- Don't abbreviate FusionAuth, use the full name.
- Always provide an alt text for images. It should always be a full sentence describing the content of the image.
- In general, put screenshot images after the text describing the image. That is "This functionality....\n\n<screenshot of functionality>". However, when describing fields for screens, as in the core concepts section, put the screenshot first.
- If possible use an SVG for images. Otherwise, a PNG that has been properly minified is acceptable.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- When introducing a code snippet, always use a colon or a period. For example: "The code to exchange the token is:" or "The code to exchange the token is similar to below."
- Avoid personal pronouns when possible; exceptions can be made in tutorials and quickstarts, but never in reference or concept docs.
- When writing a bulleted list, format each bullet items similarly (e.g. all should be complete sentences, or not complete sentences; if one starts with a verb, they should probably all start with a verb and share the same subject)
- All image captions should be one or more complete sentences.
- Use the oxford comma. Apples, bananas, and oranges are my favorite fruits.
- Headers should use title case, not start case: `This Is the Header Text`.
- Use `Asides` sparingly to call out important information that doesn't otherwise fit into the flow of prose on the page:
  - `tip` for fun facts
  - `note` for low-priority knowledge (e.g. a summary of some kickstart variables)
  - `important` for medium-priority knowledge that could impede the user's ability to complete a task (e.g. the server won't start unless you set the `BAZ` environment variable)
  - `warn` for high-priority knowledge that could lead to data loss (e.g. back up your data before a version upgrade)
- When linking to `fusionauth.io` URLs, omit the domain name (e.g. don't use `https://fusionauth.io/docs/get-started`, use `/docs/get-started`)
- Use the following syntax to reference UI elements:
- **Field names (keys)**: Use **bold** for the name or label of a field, checkbox, toggle, etc. in a form. Use it for writable and read-only fields. Example: `Set the **Issuer** field to...`
- **Field values (values)**: Use `monospace` (backticks) for a **value** entered into or returned from a field. Use it for literal, example, and enumerated values. Example: `Set **Relationship** to `Third-party`.`
- [Breadcrumb](astro/src/components/Breadcrumb.astro): A navigation path, tab, or interactive non-field UI element (button, link, menu item, icon button, etc.) or a display-only UI label that is not a field label, including section labels on a page. Example: `Navigate to <Breadcrumb>Settings -> API Keys</Breadcrumb>`, `On the <Breadcrumb>OAuth</Breadcrumb> tab.`, or `Click <Breadcrumb>Submit</Breadcrumb>.`
- Use `monospace` to describe a literal VALUE defined in code (e.g. set **`baseUrl`** to `localhost:9001`)
- Use **`bold-monospace`** together to describe a literal KEY defined in code (e.g. set **`baseUrl`** to `localhost:9001`)
- All links elements should be fully-qualified and never include a slash at the end (i.e. `[users](/docs/apis/users)` not `[users](./users)`)
- Page titles should be title-case, not sentences
- Page descriptions should be full sentences
- Use `order` (ascending) to change the default (alphabetical) sort of pages in a section
- When importing a component, always use the full path, not a relative path:
  
  ```jsx
  import Icon from 'src/components/icon/Icon.astro';
  ```

## LLM cliches

- Avoid emdashes
- Avoid lists of three items when one example will do
- Avoid "It's not X, it's Y"

## Lists

- When order matters, use a ordered list (e.g. `1. `)
- For ordered lists, always use `1. ` instead of manually ordering; astro automatically handles numbering.
- When order doesn't matter, use an unordered list (e.g. `* `).
- For unordered lists, always use `* `.
- Always introduce lists with a colon. (yes, I know this list violates that rule)
- Capitalize the first word unless the bullet points continue a sentence started in the introduction.
- If the list item is a sentence, include a period at the end.

### List examples

Smoothie-compatible fruits include the following:

- apples
- bananas
- blueberries

To make a smoothie:

1. Put milk in a blender.
2. Put a banana in a blender.
3. Put an apple in a blender.
4. Put blueberries in a blender.
5. Run the blender for 30 seconds.

## Proper names and other verbiage

- .NET Core
- air-gapped (not airgapped or air gapped)
- Azure AD
- CAPTCHA
- client-side
- Connector
- curl
- Docker
- Docker Compose
- e-commerce
- ECMAScript
- Elasticsearch
- esport
- first-party
- fine-grained authorization
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
- one-time password
- private-labeled (an adjective)
- re-authentication
- self-service
- server-side (an adjective)
- Spring Boot
- third-party
- two-factor
- WebAuthn
- webview
- X.509

## Version signposting

- If something is new in a version, mark it with something like this (this is great toward the top of a page documenting a version introduced in a particular version):

  ```jsx
  <Aside type="version">
    Available since 1.5.0
  </Aside>
  ```

- If there is a description of the feature that is part of a set of paragraphs, use the title element and put the description in the slot.
  
  ```jsx
  <Aside title="Available since 1.5.0" type="version">
    You can use the advanced version of the feature with ...
  </Aside>
  ```

- If it is inline (for a field), use <AvailableSince since="1.5.0"> - [AvailableSince](astro/src/components/api/AvailableSince.astro)
- If you are deprecating a field, use <DeprecatedSince since="1.5.0"> - [DeprecatedSince](astro/src/components/api/DeprecatedSince.astro)
- If you are removing a field, use <RemovedSince since="1.5.0"> - [RemovedSince](astro/src/components/api/RemovedSince.astro)

- We currently use [FontAwesome](https://fontawesome.com/) to render icons, so you can use them to refer to UI buttons, like this:
  
  ```jsx
  <IconButton icon="edit" />
  <IconButton icon="add" />
  <IconButton icon="view" />
  ```

  ![icons](https://github.com/FusionAuth/fusionauth-site/assets/1877191/719bffe8-2a54-41a2-a339-b3afeda8d499)

## Shared content

- For content shared across multiple pages, preface the filename with `_` and use dashes to separate words, e.g. `_login-api-integration`.
- You may include both markdown files and astro components as imports in MDX. These are treated as components.
  ```jsx
  import AccountPortalCore from 'src/content/docs/_shared/_account-portal.mdx';
  ...
  <AccountPortalCore/>
  ```
- You can pass `props` to both astro components and mdx components.
  - For astro components this looks like:
    ```typescript
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
  - In MDX files you can put some content behind a javascript expression, but be aware that you can only use HTML markup -- NOT markdown -- inside.
    ```mdxjs
    ---
    ---
    {props.showStuff && <>
      This is some more content <a href="/home">Home</a>
    </>}
    ```
  - You may need to add a empty tag multi-line content after the expression to indicate that this is a block
  - Content passed in the `<slot></slot>` of a component will be passed as rendered markdown.
  - you may need to coerce a prop into a boolean to use as a conditional for an expression. Such as `{!!props.message && <span>{props.message}</span>}`;
- JSON files are their own content collection in astro. You can reference these using the [JSON component](astro/src/components/JSON.astro)
- We have an alias mapped in [tsconfig](astro/tsconfig.json) that allows you to use absolute references from 'src'. Otherwise, imports must use relative paths.

### API docs

- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when **theOtherField.enabled** is set to true.
  ```
- If a feature is only available when using a paid plan, use the [PremiumEditionBlurbApi](astro/src/content/docs/_shared/_premium-edition-blurb-api.astro) component `<PremiumEditionBlurbApi feature="custom forms" />` fragment for API fields, and [PremiumEditionBlurb](astro/src/content/docs/_shared/_premium-edition-blurb.astro) component for any other location where the feature is mentioned in docs. Only mark the request API fields.
- If a feature is only available when using essentials, use the [AdvancedEditionBlurbApi](astro/src/content/docs/_shared/_advanced-edition-blurb-api.astro) component for API fields, and [AdvancedEditionBlurb](astro/src/content/docs/_shared/_advanced-edition-blurb.astro) for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If a feature is only available when using enterprise, use the [EnterpriseEditionBlurbApi](astro/src/content/docs/_shared/_enterprise-edition-blurb-api.astro) component for API fields, and [EnterpriseEditionBlurb](astro/src/content/docs/_shared/_enterprise-edition-blurb.astro) for any other location where the feature is mentioned in docs. Only mark the request API fields with this.
- If you are working in the `/api/identity-providers` folder there is a `README` there to help you understand the structure and layout of the documentation for the Identity Providers API.
- If a field was deprecated in a version 30 versions ago (deprecated in 1.15, you are now at 1.45), you can remove it from the docs.


#### Request section layout

For APIs that have `GET` and `POST` options:

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

## Screenshots

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
- Use https://local.fusionauth.io and use the correct kickstart to add the Silicon Valley characters ( https://github.com/FusionAuth/fusionauth-example-kickstart/blob/main/development/kickstart.json )
- Make sure that the same character is used for every screenshot on a page (unless you are demonstrating a view from the admin and also user perspective)
- The shrink-images GitHub Action will call https://tinypng.com/ to compress the images that you commit.

Use `fa-screenshot.sh`, located under `fusionauth-site/src/`. With this script you can automate following tasks:

- Sizing and moving the Safari window
- Capturing the screenshot
- Resizing the screenshot image
- Moving the image to an appropriate folder

```bash
./fa-screenshot.sh -h # for usage info
```

### Moving pictures

GIFs take up quite a lot of space. Use WEBMs instead:

```console
ffmpeg -i terminalizer.gif terminalizer.webm
```

## Blog

Follow everything in the `Content Style Guidelines` section.

- If updating an blog post, please update the add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)
- If you have a common component that you want to include, make sure the blog is a `.mdx` file and create a component. [Example components](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/src/components/blog) - [Example blog post using a component](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/content/blog/amazon-cognito-and-fusionauth-comparison.mdx)
- Images should be pulled in using markdown: `![alt text](/path/to/images)`
- Images for a blog post should go under /astro/public/img/blogs/` in a directory related to the blog title.
- We use Shiki for code formatting. Supported languages are listed here: https://shiki.style/languages
- For site navigation and sequential UI operations (tabs, pages, sidebar entries, links), use Breadcrumb: `Navigate to <Breadcrumb>Tenants -> Password</Breadcrumb>`.
- For field names and labels (keys), use **bold**: `**Login Identifier Attribute**`.
- For field values (values), use `monospace`: ``userPrincipalName``. Use quotes only when presenting a literal text value for an editable field.
- In summary, **bold** is for attributes (keys), `monospace` is for values, and **`bold monospace`** is for literal attribute names in files, requests, and code. Filenames, directories, paths and command line are always `monospace`. If it is unclear how to format something, ask "is it a key or a value?". If it matches neither, it could be a navigation element which would be handled with a `Breadcrumb`. If none of these fit, check this guideline. If the guideline does not provide results, the guideline needs to be updated.
- Put each blog post into one or more of the known categories. [Here's the list](https://github.com/FusionAuth/fusionauth-site/blob/main/config/contentcheck/known-blog-categories.txt). You can separate categories with commas.
- Use tags. They are separated with commas. These are freeform, so feel free to add multiple and choose what works. The first one is what is used to show related posts, unless there's a `featuredTag` value in the front matter. You can [learn more about the logic by reviewing the layout](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/layouts/Blog.astro).
- You can use the `get-images-from-markdown.rb` script to extract images from markdown and store them in a directory.
- All references to `stackoverflow.com` should be updated and direct to the community forum at `https://fusionauth.io/community/forum/`
- When using an aside in the blog, please use the `nodark="true"` attribute.
- Make descriptions full sentences. They must end in a period or other punctuation.
- Titles should not end in a period. They can end in a ? or ! if needed.
- All blogs that use non-trivial code examples should have a github repo with an example app. See (Adding an example app)[#adding-an-example-app] for more.

