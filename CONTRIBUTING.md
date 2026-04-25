## Content Style Guide

> NOTE: To build the docs site, see the [docs README](/astro/README.md).

Here are some guidelines to follow when writing documentation (everything under [docs](astro/src/content/docs)), articles (everything under [articles](astro/src/content/articles)), and blogs [blog](/astro/src/content/blog):

- Capitalize all domain objects, especially when working the object's API in which it is created and updated in FusionAuth. 
  For example, see the API Key APIs description for `apiKeyId`, where API Key is capitalized: `The unique Id of the API Key to create. If not specified a secure random UUID will be generated.`
- If referring to something that exists as a domain object in FusionAuth, but you are not explicitly referring to an object being created/updated in FusionAuth, use lowercase. Here are some examples:
 `To allow users to log into and use your application, you’ll need to create an Application in FusionAuth.`
- From the Link API, note the difference between a FusionAuth User and a 3rd party user: `This API is used to create a link between a FusionAuth User and a user in a 3rd party identity provider. This allows FusionAuth to reconcile logins across both systems.`
- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing.
- Use `Id` instead of `ID` or `id` when describing a unique identifier
- Use `admin UI` instead of `Admin UI` when writing about the admin user interface.
- Use `logged in` instead of `logged-in`
- `log in` is the verb, `login` is the noun
- Use `UserInfo` instead of `Userinfo`
- Use "self-hosted" as an adjective, e.g. "Self-hosted instances are the best way to try FusionAuth!"
- Use "self-hosting" as a noun, e.g. "FusionAuth supports self-hosting". If you aren't sure whether to use "self-hosting" or "self-hosted", try "self-hosted".
- Don't abbreviate FusionAuth, use the full name.
- Use "a" or "an" before an initialism or acronym based on how the first letter sounds when spoken - for example, "an SSO" because "S" sounds like "ess" (vowel sound), but "a VPN" because "V" sounds like "vee" (consonant sound).
- References to `http://127.0.0.1` should be updated to `http://localhost`. Remove hyperlinks to `localhost`.
- Always provide an alt text for images. It should always be a full sentence describing the content of the image.
- In general, put screenshot images after the text describing the image. That is "This functionality....\n\n<screenshot of functionality>". However, when describing fields for screens, as in the create tenant screen, put screenshots above the list of fields. Images should never precede their reference in text.
- If possible use an SVG for images. Otherwise, a PNG that has been properly minified is acceptable.
- Never use the term GUID, it's always UUID. If you mention any, display them in `8-4-4-4-12` format: `631ecd9d-8d40-4c13-8277-80cedb8236e3`
- When introducing a code snippet, don't use a : (colon). Instead, just use verbiage before it. "The code to exchange the token is similar to below."
- Prefer 'You' to 'We'. 'Let's' is acceptable.
- All code snippets within any documents should have indenting formatted to 2 spaces.
- Code captions should have the first letter of every word capitalized: This Code Is The Best.
- All image captions should be one or more complete sentences.
- Use the oxford comma. Apples, bananas, and oranges are my favorite fruits.
- Single spaces should be used instead of double spaces after a period.
- Headers should have the first letter of every word capitalized: `This Is The Header Text`. This is true for all headers (h1, h2, h3, h4). This is also known as [Start Case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
- When writing, you have access to Asides. Here's an [example blog post using an Aside](https://github.com/FusionAuth/fusionauth-site/blob/main/astro/src/content/blog/log4j-fusionauth.mdx). You can use `<Aside>` in MDX or Astro pages.
- For links, don't use the absolute URL for the FusionAuth website (https://fusionauth.io), only relative URLs. This allows us to deploy to our local and staging environments and not get sent over to production URLs automatically.
- If you have a list element containing more than one paragraph, indent the second paragraph by the same amount as the start of the text in the first paragraph to make sure that it renders correctly.
- The `title` frontmatter element is used in several places: an H1 tag on the page, in any dynamically created menus, and in the HTML title tag. Sometimes, for SEO purposes, we want to add extra structure, so use the `title` frontmatter consistently.

### Glossary Terms

- All documentation should use the shared glossary system for technical and business terms (such as “Default Tenant”, “User”, “Role”, “RS256”, etc.).
- To add or edit a glossary term, update the JSON file at `src/data/glossary.json`. Each entry should include a `"definition"` field and may include an optional `"link"` (internal or external).
- To reference a glossary term inline within documentation, use the `<GlossaryTerm term="…" />` component (available in `.astro` and `.mdx` files):
  ```mdx
  The <GlossaryTerm term="User" /> is an entity that can log in…
  ```
- If the term has a link in the glossary, it will be rendered as a clickable link. If not, only the definition is shown via tooltip on hover.
- The glossary system supports external links (rendered with an external-link icon), internal doc links, or no link.
