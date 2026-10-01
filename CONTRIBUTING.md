## Content Style Guide

Follow these guidelines when writing documentation (everything under [docs](astro/src/content/docs)) and articles (everything under [articles](astro/src/content/articles)):

- Capitalize all domain objects, especially when working the object's API in which it is created and updated in FusionAuth.
  For example, see the API Key APIs description for `apiKeyId`, where API Key is capitalized: `The unique Id of the API Key to create. If not specified a secure random UUID will be generated.`
  - EXCEPT WHEN referring to an object being created/updated in FusionAuth (e.g. `To allow users to log into and use your application, you'll need to create an Application in FusionAuth.`; `This API is used to create a link between a FusionAuth User and a user in a 3rd party identity provider. This API may be useful when you already know the unique Id of a user in a 3rd party identity provider and the corresponding FusionAuth User.`)
- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing
- Do not use smart quotes or smart apostrophes; stick to ASCII when possible
- Use `Id` instead of `ID` or `id` when describing a unique identifier
- Use `Admin UI` (note the capital A) when writing about the admin user interface
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
- Most common components are auto-imported into every MDX file and do not need an explicit import statement. This includes `APIField`, `APIBlock`, `API`, `AvailableSince`, `DeprecatedSince`, `RemovedSince`, `JSON`, `Breadcrumb`, `Aside`, `RemoteCode`, `PlanBlurb`, `PlanBlurbApi`, `If`, `Icon`, `IconButton`, `ChildCards`, `Card`, `ExtractedCode`, `Tabs`, `TabItem`, `Details`, `Steps`, `Table`, and `MarkdownOnly`. The full list and their source paths are declared in `mdxComponentImports` near the top of `astro/astro.config.ts`.

- If you add an explicit import for one of the auto-imported components, the build will fail with an error like:

  ```
  [mdx-component-importer] Redundant import in /path/to/file.mdx
    `Aside` is auto-imported — remove the explicit import.
  ```

  Remove the import line and it will work.

- For everything else, always use the full path, not a relative path:

  ```jsx
  import MyComponent from 'src/components/MyComponent.astro';
  ```

## LLM Cliches

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

### List Examples


```plaintext
Smoothie-compatible fruits include the following:

* apples
* bananas
* blueberries
```

Smoothie-compatible fruits include the following:

* apples
* bananas
* blueberries

```plaintext
To make a smoothie:

1. Put milk in a blender.
1. Put a banana in a blender.
1. Put an apple in a blender.
1. Put blueberries in a blender.
1. Run the blender for 30 seconds.
```

To make a smoothie:

1. Put milk in a blender.
1. Put a banana in a blender.
1. Put an apple in a blender.
1. Put blueberries in a blender.
1. Run the blender for 30 seconds.

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

## Version Signposting

- When adding a feature, mark the top of the page or top of the section (if added to an existing page) with the [`AvailableSince` component](astro/src/components/api/AvailableSince.astro):

  ```jsx
  <AvailableSince since="1.43.0" />
  ```

  This will render as a badge showing the text "Available since `<version>`".

  You can also include render this as an admonition by including text between the open and closing tags:

  ```jsx
  <AvailableSince since="1.43.0">

  The foo cannot be used with the baz.
  </AvailableSince>
   ```

- When deprecating a feature, use [DeprecatedSince](astro/src/components/api/DeprecatedSince.astro):

  ```jsx
  <DeprecatedSince since="1.5.0">
  ```

  You can also render this as an admonition by including text between the open and closing tags.
  
- When removing a feature, use [RemovedSince](astro/src/components/api/RemovedSince.astro):

  ```jsx
  <RemovedSince since="1.5.0">
  ```

  You can also render this as an admonition by including text between the open and closing tags.

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

### Front matter fields

Every docs page uses YAML front matter. The schema is defined in `astro/src/content.config.js`.

Required fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Shown as the page heading and in the sidebar. Cannot end with punctuation. |
| `description` | string | One sentence summary shown in search and card overviews. Must end with a period. |

Common optional fields:

| Field | Type | Notes |
|---|---|---|
| `htmlTitle` | string | Overrides the `<title>` tag on the rendered page. The navigation sidebar continues to use the `title`, but `llms.txt` will prefer this title. |
| `markdownTitle` | string | Overrides the `h1` in the markdown version of the page. Use to serve an LLM-optimized title only to agents when humans would prefer a different title. `llms.txt` will prefer this title over `htmlTitle` or `title`. |
| `sidenavTitle` | string | Overrides how the page appears in the sidebar when the full title is too long. |
| `order` | number | Controls sort position within the parent section. Lower numbers sort first. Default is 1000 (alphabetical fallback). |
| `route` | boolean | Set to `false` to prevent the page from being built as a URL while keeping it in the content collection for nav ordering. Use this for folder index pages that are pure navigation (no real content) -- pair with a redirect in `astro.config.ts`. |
| `icon` | string | Path to an icon image shown in card grids (e.g. `/img/icons/my-icon.svg`). Used by `ChildCards` and `DocCard`. |
| `darkIcon` | string | Alternate icon shown in dark mode. If omitted, `icon` is used for both modes. |
| `cardImage` | string | Path to a header image shown at the top of a card in the `full` variant. Useful for visually distinguishing sections in card grids. |
| `excludeFromNav` | boolean | Set to `true` to hide this page from `ChildCards` auto-discovery. The page still builds and is accessible by URL. |
| `sectionIndex` | boolean | Set to `true` on an index page to automatically render a `ChildCards` grid after the page content. Replaces manually written `<ChildCards>` in MDX. |
| `disableTOC` | boolean | Hides the table of contents for this page. |
| `canonicalUrl` | string | Full canonical URL override, used when a page is a redirect target or duplicate of another page. |

### Cards

Docs cards are rendered using [astro-better-cards](https://better-static-sites.github.io/content/cards/). You can use [`ChildCards`](https://better-static-sites.github.io/content/cards/#childcards) to automatically render a collection of links to sub-pages within a folder (with configurable depth). Or you can use [`PageNav`](https://better-static-sites.github.io/content/cards/#pagenav) to display next and last links using `nextPage` and `lastPage` in page front matter.

### API docs

- We have many APIs which return the same objects either singly (if called with an Id) or in an array (if called without an Id). If you are creating or modifying an API with this, see if you can use the -base pattern that the tenants and applications do to reduce duplicates.
- `Defaults` is always capitalized.
- If a field is required, but only when another feature is enabled, mark it optional rather than required in the API. Then, add a note in the description saying when it is required, like so:
  ```
  This field is required when **`theOtherField.enabled`** is set to true.
  ```
- If a feature is only available when using a Licensed Community plan (or above), use `PlanBlurb`:
  ```jsx
  <PlanBlurb plan="licensed" version="1.52.0" />
  ```
  In the API reference, use `PlanBlurbApi`:
  ```jsx
  <PlanBlurbApi plan="licensed" feature="this feature" />
  ```
- If a feature is only available when using a Starter plan (or above), use `PlanBlurb`:
  ```jsx
  <PlanBlurb plan="starter" version="1.52.0" />
  ```
  In the API reference, use `PlanBlurbApi`:
  ```jsx
  <PlanBlurbApi plan="starter" feature="this feature" />
  ```
- If a feature is only available when using an Essentials plan (or above), use `PlanBlurb`:
  ```jsx
  <PlanBlurb plan="essentials" version="1.52.0" />
  ```
  In the API reference, use `PlanBlurbApi`:
  ```jsx
  <PlanBlurbApi essentials="essentials" feature="this feature" />
  ```
- If a feature is only available when using an Enterprise plan, use `PlanBlurb`:
  ```jsx
  <PlanBlurb plan="enterprise" version="1.52.0" />
  ```
  In the API reference, use `PlanBlurbApi`:
  ```jsx
  <PlanBlurbApi plan="enterprise" feature="this feature" />
  ```

### Generative Screenshots

> [!NOTE]
> Migration still in progress.

Screenshots in the docs are generated automatically from a headless browser pointed at a local FusionAuth instance using [astro-better-declarative-screenshots](https://better-static-sites.github.io/content/declarative-screenshots/). Docker, the FusionAuth container, and a PostgreSQL database all start automatically when you run the screenshot command.

#### Setup

Install the screenshot dependencies once (separate from the main `astro/` dependencies):

```shell-session
cd astro/screenshots
npm install
```

#### Generate Screenshots

From the `astro/` directory:

```shell-session
npm run screenshots
```

This starts Docker (if not already running), waits for FusionAuth to become healthy, logs in with the kickstart credentials, captures every `<Screenshot>` component found in the source, and writes PNGs to `public/img/docs/screenshots/`. Existing files are overwritten.

To regenerate a single screenshot, pass a filter matching the filename or URL:

```shell-session
npm run screenshots -- --filter groups
```

#### Add a Screenshot to a Page

Place the component where you want the screenshot to appear:

```jsx
<Screenshot url="/admin/group/" alt="The FusionAuth groups list." />
```

The `url` is the path on the local FusionAuth instance (`http://localhost:9011`). The filename is derived automatically from the URL and any highlights; pass `id="my-name"` to override it.

To highlight a specific element, nest a `<Highlight>` inside the `<Screenshot>`:

```jsx
<Screenshot url="/admin/user/manage/00000000-0000-0000-0000-100000000003" alt="The user registration form." fullPage={true}>
  <Highlight selector="[name*='preferredLanguages']" label="Languages" />
</Screenshot>
```

`selector` is a CSS selector for the element to outline. `label` adds a small badge above the highlight. The default highlight color is `#f60`; pass `color="#f26522"` to override (but override sparingly, only when truly necessary, to keep things consistent).

Available `<Screenshot>` props:

| Prop | Default | Description |
|---|---|---|
| `url` | required | Path on the FusionAuth instance |
| `id` | auto-derived | Override the output filename (without `.png`) |
| `alt` | filename | Alt text for the image |
| `width` | 1100 | Viewport width in px |
| `height` | 800 | Viewport height in px |
| `fullPage` | false | Capture full scrollable height |

### Moving Pictures

GIFs take up quite a lot of space. Use WEBMs instead:

```shell-session
ffmpeg -i terminalizer.gif terminalizer.webm
```

## Blog

Follow everything in the `Content Style Guidelines` section.

- If updating an blog post, please update the add a meta tag of updated_date: `YYYY-MM-DD` (as opposed to updating the date on the markdown file)
- You can use docs components in blog posts, but please don't create new components for individual blog posts. File a request with `#devsuccess` on Slack if you have a need that isn't satisfied by our current suite of components and Docs will consider creating it with or for you.
- Use markdown image syntax: `![alt text](/path/to/images)`
- Locate blog post images in `/astro/public/img/blogs/` in a directory related to the blog title.
- We use Prism for code formatting; see [this list](https://prismjs.com/docs/prism.languages) for supported language names.
- For site navigation and sequential UI operations (tabs, pages, sidebar entries, links), use Breadcrumb: `Navigate to <Breadcrumb>Tenants -> Password</Breadcrumb>` with arrows.
- For field names and labels (keys), use **bold**: `**Login Identifier Attribute**`.
- For field values (values), use `monospace`: ``userPrincipalName``. Use quotes only when presenting a literal text value for an editable field.
- In summary, **bold** is for attributes (keys), `monospace` is for values, and **`bold monospace`** is for literal attribute names in files, requests, and code. Filenames, directories, paths, and commands are always `monospace`.
- Every blog post needs at least one category.
- Use tags. They are separated with commas. These are freeform, so feel free to add multiple and choose what works. The first one is what is used to show related posts, unless there's a `featuredTag` value in the front matter.
- Descriptions must be full sentences ending with a period.
- Titles should not end in a period. They can end in a ? or ! if absolutely necessary.
