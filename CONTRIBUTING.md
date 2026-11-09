# Contributing to the FusionAuth Docs

This guide applies to everyone who writes docs, articles, dev tools, or blog posts for FusionAuth (agents too). For building, linting, and deploying, see the [README](README.md).

## Write for the Reader

Readers come to the docs to finish a task. Every rule below serves that goal.

* Address the reader as "you". Write steps in the imperative: "Click **Save**," not "The user should click **Save**."
* Keep sentences short, with one idea per sentence. Split a sentence that chains clauses with "and", "which", or a semicolon.
* Use active voice. Write "FusionAuth sends an email," not "An email is sent."
* Repeat the noun instead of using a pronoun. Write "The lambda runs after login," not "It runs after login." Avoid "it", "they", "this", and "these" as subjects, even when the noun is long.
* Say what happens. Skip filler such as "simply", "just", "easily", "basically", and "note that".
* State limits and requirements plainly, including the required plan or version.
* Use plain ASCII: straight quotes, straight apostrophes, and no smart punctuation.
* Use the Oxford comma: "apples, bananas, and oranges".

### Avoid AI Writing Patterns

Readers notice these patterns, and the patterns make a page read as generated. _Do not_ use the following:

* Em dashes or en dashes. Use a comma, a period, a colon, or parentheses, or (preferred) restructure the sentence for simplicity and readability.
* "It's not X, it's Y", "not just X, but Y", and other contrast setups.
* Lists of three when one example makes the point.
* Hype words: "seamless", "robust", "powerful", "leverage", "unlock", "empower", "game-changing", "cutting-edge" (like Hemingway, it's best to avoid adjectives altogether unless they _significantly_ alter the meaning of your phrase).
* Stock phrases: "dive into", "delve", "at its core", "let's unpack", "in today's world", "whether you're X or Y", "it's worth noting", "load-bearing".
* Openings that restate the title, and closings that summarize the page or say "Congratulations" or "Happy coding".
* Bold or italics for emphasis. Bold marks field names only (see [UI Elements and Code](#ui-elements-and-code)).
* Emoji.

## Structure Pages

### Give Each Page One Job

Decide what kind of page you're writing, and keep the page to that job. Link to other pages instead of mixing types.

* A tutorial teaches by building something end to end. Tutorials live in Get Started and QuickStarts.
* A how-to guide gets the reader through one task. Start with the goal and the prerequisites, then give the steps, then show how to confirm the result.
* A concept page explains what a feature is and how the feature behaves. Concept pages don't contain step lists.
* A reference page lists facts to look up, such as fields, options, or limits. Keep reference terse and complete.
* A section overview orients the reader and links to the pages in the section. Set `sectionIndex: true` in the overview's front matter to list the section's pages after the content. `sectionIndex` only lists pages directly in the folder, so a section whose pages all live in subfolders needs `<ChildCards depth={2} />` at the end of the body instead. Otherwise, use a `<ChildCards />` component in the body only when the list belongs mid-page.

### Put the Page Where Readers Look

The sidebar is organized by task. Put each page in the section a reader would open for that task:

* Get Started, QuickStarts, and How FusionAuth Works (`concepts`) cover learning the product.
* Authentication, Users, and Authorization cover building an integration.
* Theme, Email, and Messengers cover customizing the user experience.
* Lambdas and Events cover extending FusionAuth with code.
* Security covers protecting accounts, tokens, and clients.
* Deploy, Update, and Cloud cover running FusionAuth.
* Migrate covers moving users and data into, between, or out of FusionAuth.
* Client Libraries and SDKs, APIs, and Developer Tools hold reference material.

Give every page one home. When a page serves two sections, link to the page from the other section. To reuse a block of content on several pages, put the block in a [shared partial](#shared-content).

When you move or rename a page, run `scripts/check-redirects.mjs` and add the redirects the script reports. See [Redirects](README.md#redirects) in the README.

## Formatting

### Titles

Each page has up to three titles, and each title serves a different reader:

* `title` appears in the sidebar, breadcrumbs, and cards. The reader already sees the enclosing folders there, so keep `title` short: `Docker` inside Deploy > Production > Install, not `Install FusionAuth with Docker`.
* `htmlTitle` is the `h1` on the page and the browser tab title. The reader may arrive from search with no sidebar context, so include the full context: `Install FusionAuth App with Docker`. The tab title adds ` | FusionAuth Docs` automatically. When you leave out `htmlTitle`, the page uses `title`.
* `markdownTitle` is the title in the markdown version of the page and in the `llms.txt` indexes that agents read. Set `markdownTitle` only when agents need a different title than people. Otherwise `llms.txt` uses `htmlTitle`, then `title`.

Write every title in title case, with no ending punctuation.

### Descriptions

The `description` appears in search results, card grids, and the page's meta description, so the description often decides whether a reader opens the page. Write one full sentence that ends with a period and names the task or topic in the reader's words. Start the sentence by page type:

* How-to guides and tutorials: "Learn how to rotate signing keys without logging users out."
* Concept pages and section overviews: "Learn about the login methods FusionAuth supports."
* API reference: "API documentation for the Users API."

Don't start with "An overview of" or "This page". Don't repeat the title word for word.

### Tags and Related Pages

The Related section at the bottom of every page comes from front matter `tags`. The section lists the four pages that share the most tags with the current page.

* Write `tags` as a comma-separated list of the words a reader would search for: `tags: passkeys, webauthn, passwordless, login, mfa`. Look at the tags on similar pages and reuse their terms, so related pages find each other.
* Never write a Related, See Also, or Further Reading section by hand. Link to a page in the text where the reader needs the page instead.
* To make sure a page always appears in the Related section, list the page ids in `relatedPinFirst`, separated by commas: `relatedPinFirst: get-started/install`. Pinned pages show first, ahead of the tag matches.

### Headings

* Write headings in title case: `Configure the Issuer`.
* Start sections at `##`, because `htmlTitle` renders as the only `h1`.
* Don't wrap long lines by hand. Use your editor's soft wrap.

### Lists

* Use an ordered list only when order matters, such as steps. Use an unordered list for options, prerequisites, and features.
* Number every ordered item `1.`, and Astro renders the real numbers. Start unordered items with `*`.
* Introduce a list with a sentence that ends in a colon.
* Keep items parallel: all full sentences or all fragments, starting the same way.
* End an item with a period when the item is a sentence.

```plaintext
To make a smoothie:

1. Put milk and a banana in a blender.
1. Run the blender for 30 seconds.
```

### UI Elements and Code

* Field names and labels use **bold**: `Set **Issuer** to your domain.`
* Values entered into or returned from a field use `monospace`: ``Set **Relationship** to `Third-party`.``
* Navigation paths, tabs, buttons, menu items, and other non-field UI elements use the [Breadcrumb](astro/src/components/Breadcrumb.astro) component: `<Breadcrumb>Settings -> API Keys</Breadcrumb>`, `Click <Breadcrumb>Submit</Breadcrumb>.`
* Literal keys in code, files, and requests use **`bold monospace`**: ``Set **`baseUrl`** to `localhost:9011`.``
* Filenames, paths, commands, and code values use `monospace`.
* FusionAuth version numbers use `monospace`: ``Available in FusionAuth `1.63.0` and later.``
* Introduce a code block with a sentence that ends in a colon or a period.

### Links

* Link to other pages on `fusionauth.io` with a root-relative path and no trailing slash: `[Users API](/docs/apis/users)`. Don't use the domain or a relative path such as `./users`.
* Make link text describe the destination. Write "see [Account Lockout](/docs/security/account-protection/account-lockout)", not "click [here](...)".

### Asides

Use asides sparingly, for information that doesn't fit the flow of the page. Choose the type by the cost of missing the information:

* `note` for useful context.
* `tip` for a shortcut or a better way to do something.
* `caution` for something that can stop a task from working.
* `danger` for something that can lose data or weaken security.
* `version` for version-specific behavior.

An aside `title` can use inline markdown, such as `` title="The Docker `latest` tag is not dynamic" ``.

### Diagrams

Add a diagram whenever a subject takes more than a short paragraph to explain: a request flow between systems, a decision with several branches, or how objects relate to each other. Spatial ideas such as architecture and hierarchy deserve a diagram even when the prose is short. Write diagrams as [Mermaid](https://mermaid.js.org/) code blocks, not as images, so anyone can edit them:

````plaintext
```mermaid title="Request flow during login with FusionAuth."
sequenceDiagram
    participant App as Application
    participant FusionAuth
    App ->> FusionAuth : Redirect to the login page
    FusionAuth ->> App : Redirect back with an authorization code
```
````

* Use `sequenceDiagram` for requests and redirects between systems, and `graph` or `flowchart` for decisions, relationships, and architecture.
* Give every diagram a `title` that describes the diagram in a full sentence.
* Keep each diagram to one idea. Split a diagram that needs a legend to read.
* Explain the diagram in the surrounding text, because some readers can't see the diagram.

### Images

* Prefer generated screenshots. See [Screenshots](#screenshots).
* Add a screenshot only when the screenshot shows something the text can't. Don't repeat a screenshot of the same screen on a page, even when the pipeline generates the screenshot for free. Every image adds to the page size. Describe a later state of a screen in text, or crop to the part that changed.
* Give every image alt text that describes the content in a full sentence.
* Place an image after the text that describes the image. On field reference pages, place the screenshot before the field list.
* Use SVG when possible, or a minified PNG. Use WEBM instead of GIF: `ffmpeg -i demo.gif demo.webm`.

## Terminology

* Write "FusionAuth" in full, never abbreviated.
* Write "Admin UI" for the FusionAuth admin interface.
* Capitalize FusionAuth domain objects when you mean the FusionAuth object, especially in API docs: "The unique Id of the API Key." Use lowercase for the general idea: "the application your users log into".
* Write `Id`, not `ID` or `id`. Write UUIDs, never GUIDs, in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`.
* "Log in" is the verb, "login" is the noun, and "logged in" has no hyphen.
* "Self-hosted" is the adjective and "self-hosting" is the noun. When unsure, use "self-hosted".
* Write "update" for moving to a newer FusionAuth version. Reserve "migration" for moving users or data, and for database migrations.
* Spell these names exactly as shown: .NET Core, air-gapped, Azure AD, CAPTCHA, client-side, Connector, curl, Defaults, Docker, Docker Compose, e-commerce, ECMAScript, Elasticsearch, esport, first-party, fine-grained authorization, FusionAuth Cloud, Google reCAPTCHA, Identity Provider, IdP, Kickstart, macOS, multi-factor authentication, multi-tenancy, multi-tenant, Node.js, OAuth, OAuth2, one-time password, private-labeled, re-authentication, self-service, server-side, Spring Boot, third-party, two-factor, UserInfo, WebAuthn, webview, X.509.

## Authoring Reference

### Front Matter

The schema lives in `astro/src/content.config.js`. `title` and `description` are required. Common optional fields:

| Field | Notes |
|---|---|
| `htmlTitle`, `markdownTitle` | Longer titles for the page and for agents. See [Titles](#titles). |
| `tags`, `relatedPinFirst` | Drive the Related section. See [Tags and Related Pages](#tags-and-related-pages). |
| `order` | Sort position in the sidebar. Lower numbers sort first. The default is `1000`, and ties sort alphabetically. |
| `route` | Set to `false` on a folder `index.mdx` that only names and orders a sidebar group. FusionAuth then builds no page for the folder, the sidebar shows the group as a plain label, and card grids and the Related section skip the page. |
| `sectionIndex` | Set to `true` on a section overview to list the section's pages after the content. See [Give Each Page One Job](#give-each-page-one-job). |
| `excludeFromNav` | Set to `true` to hide the page from `ChildCards` and `PageNav`. The page still builds. |
| `icon`, `darkIcon`, `cardImage` | Images for card grids. |
| `disableTOC` | Hides the table of contents. |
| `canonicalUrl` | Overrides the canonical URL. |

The sidebar builds itself from the folder structure. A folder's title and order come from the folder's `index.mdx`.

### Components

Common components are auto-imported into every MDX file, so don't import them. The list includes `Aside`, `APIField`, `Breadcrumb`, `Card`, `ChildCards`, `Details`, `ExtractedCode`, `PlanBlurb`, `Screenshot`, `Steps`, `Table`, `Tabs`, and `TabItem`. The full list is `mdxComponentImports` in `astro/astro.config.ts`. A small Vite plugin, `mdxComponentImporter`, inserts those imports after the front matter.

* An explicit import of an auto-imported component fails the build. Remove the import.
* If a file imports a different component under the same name, the file's import wins.
* To auto-import another component, add the component's import line to `mdxComponentImports`.

Everything else needs an explicit import after the front matter, including every [shared partial](#shared-content). Import by the full path from `src`, never a relative path:

```jsx
import MyComponent from 'src/components/MyComponent.astro';
import ReleaseNotification from 'src/content/docs/_shared/_release-notification.mdx';
```

### Shared Content

* Name shared files with a leading underscore and dashes: `_login-api-integration.mdx`. Put content shared across sections in `astro/src/content/docs/_shared`.
* Import each partial explicitly, because partials aren't auto-imported. Then use the partial like a component, and pass values as props: `<ReleaseNotification topic="passkeys" />`. In an MDX partial, read props as `{props.topic}`.
* Inside a JavaScript expression, use HTML instead of markdown: `{props.show && <>See <a href="/docs/apis">the APIs</a>.</>}`. Coerce values to booleans for conditions: `{!!props.message && <span>{props.message}</span>}`.
* Reference JSON examples with the [JSON component](astro/src/components/JSON.astro).

### Versions and Plans

* Mark a new feature with `<AvailableSince since="1.43.0" />` at the top of the page or section. Mark deprecated and removed features with `DeprecatedSince` and `RemovedSince`. Put text between the tags to render the badge as an aside.
* Mark a paid feature with `<PlanBlurb plan="enterprise" version="1.52.0" />`, or with `<PlanBlurbApi plan="enterprise" feature="this feature" />` in the API reference. The plans are `licensed`, `starter`, `essentials`, and `enterprise`.
* Refer to UI icons with `<IconButton icon="edit" />`.

### API Docs

* The OpenAPI spec at `astro/public/docs/openapi.yaml` is a copy of [fusionauth-openapi](https://github.com/FusionAuth/fusionauth-openapi) at the newest tag at or before `fusionauth-version`. After each release, refresh the copy with `bash scripts/update_openapi_spec.sh` and review the diff. The weekly external content check fails when the copy drifts from that tag.
* Version pins in the Docker Compose files and the production Docker examples follow `fusionauth-version`. Don't edit the pins by hand. See "Update the docs for a new FusionAuth release" in the [README](README.md).
* When an API returns the same object singly and in arrays, reuse the `-base` partial pattern from the tenant and application APIs.
* When a field is only required while another feature is enabled, mark the field optional and explain in the description: ``This field is required when **`theOtherField.enabled`** is set to true.``

### Code Examples

Code examples in guides come from tested projects in `astro/extractedcode`, shown with the `ExtractedCode` component. See [Tested code examples](README.md#tested-code-examples) in the README.

### Screenshots

Screenshots come from a headless browser pointed at a local FusionAuth instance. Declare each screenshot where the image belongs:

```jsx
<Screenshot url="/admin/group/" alt="The FusionAuth groups list." />
```

Add `<Highlight selector="..." />` inside the component to outline an element. Use `id`, `height`, `fullPage`, or `crop` to control the capture. To capture, run `npm run screenshots` from `astro/`, or `npm run screenshots -- --filter <name>` for one screenshot. For setup, licenses, fresh-instance screenshots, and the full prop list, see the [screenshots README](astro/screenshots/README.md).

## Blog

Blog posts follow the rest of this guide, plus the following:

* When you update a post, add `updated_date: YYYY-MM-DD` to the front matter instead of changing the date.
* Give every post at least one category. Add comma-separated tags. The first tag drives related posts unless the post sets `featuredTag`.
* Put images in `/astro/public/img/blogs/<post-name>/` and use markdown image syntax.
* Reuse docs components instead of building components for one post. To request a new component, ask in `#devsuccess` on Slack.
* Code blocks use Prism language names. See the [Prism language list](https://prismjs.com/docs/prism.languages).
