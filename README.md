# FusionAuth Documentation

[![Check external links](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-external-links.yml/badge.svg)](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-external-links.yml)
[![check-closed-github-issues](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-closed-github-issues.yml/badge.svg)](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-closed-github-issues.yml)

Despite the name, this repo only contains the FusionAuth documentation, articles, developer tools, and blog. We manage the root `fusionauth.io` site via Webflow CRM.

This content is hosted in the following sub-directories of `fusionauth.io`:

- [https://fusionauth.io/docs](https://fusionauth.io/docs)
- [https://fusionauth.io/blog](https://fusionauth.io/blog)
- [https://fusionauth.io/articles](https://fusionauth.io/articles)

The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? File an issue or submit a pull request.

## Build

To preview the site locally:

1. Navigate into the `astro` directory, where the docs site lives:

   ```console
   cd astro
   ```

1. Install dependencies:

   ```console
   npm ci
   ```

1. Run a local development instance of the site in just a few seconds:

   ```console
   npm run dev
   ```

   To view the site, use the link displayed at the end of build output.
   This development instance automatically rebuilds as you modify local files.
   Some parts of the site, including site search, won't run on the development instance. To preview those, try a full site build.

To run a full site build:

```console
npm run start
```

This may take a minute or two. Output can be noisy, but do pay attention to the output from [`astro-link-checker`](https://github.com/nathan-contino/astro-link-checker), which runs at the very end of the `build`. This check ensures that all internal links on the site point to valid URLs. For development convenience, this check only fails development builds (so it can never break a deploy), but _please_ keep the broken link count at zero before merging into `main`.

## Write Content

Always follow the content style guide found in [CONTRIBUTING.md](/CONTRIBUTING.md).

## Lint

To check syntax across the entire site:

```console
npm run lint
```

To check syntax in a specific file:

```console
npm run lint -- src/components/BlogButton.astro
```

To skip linting when you inevitably include HTML somewhere in an MDX file, use the `eslint-disable-next-line` or `eslint-disable-line`:

```mdx
{/* eslint-disable-next-line */}
<a href="https://www.fusionauth.io">FusionAuth</a>
```

## Deploy

Deploying happens automatically via GitHub action (one for content, another for redirects) whenever content merges into `main`. Dev server deployments have separate corresponding actions that you can activate manually for a specific branch.

## Tested code examples

Many code blocks, especially those found in guides and tutorials, do not exist in the source markdown files. Instead, we use the `LocalCode` component to source them from snippets generated from tested complete projects with [Bluehawk](https://github.com/mongodb-university/Bluehawk).

For projects that benefit from a cloneable repository, the `/astro/localcode` folder acts as the source of truth; changes to files automatically push to the downstream artifact repository when you merge to the `main` branch of this repo. To configure the artifact repo, use the (optional) `repositoryUrl.txt`.

Astro builds automatically generate code snippets before rendering pages.

## Sitemap

We automatically generate a single `sitemap.xml` file that we use for the entire `fusionauth.io` domain. All of the docs, blog, dev-tools, articles, and isolated pages involved in the Astro build get automatically included during the build itself. For `fusionauth.io` content managed externally, we manually add entries to [`astro/public/sitemap-io.xml`](astro/public/sitemap-io.xml).

## LLMs.txt

The root `fusionauth.io` LLMs.txt file lives in [`astro/public/llms.txt`](astro/public/llms.txt). We manually add entries to it to keep it up-to-date with changes to the io site. Documentation `llms.txt` files (we produce a tree structure due to site size) are automatically generated. But do note that the root LLMs.txt needs to be updated to point to them properly.

## Redirects

[src/redirects.json](src/redirects.json) specifies our redirect rules. This file is published to s3 and read by a Lambda function that processes redirects for the site. When modifying the file:

* Keep items in alphabetical order!
* Move a page? Update `/src/redirects.json`.
* Add a new index page? Update `indexPages` in `/src/redirects.json`.
* Add a new top-level file or folder adjacent to `/docs/` (e.g. `fusionauth.io/mycoolpagethatisntinthedocsfolder`)?
  * For a new file, update `s3Paths` in `/src/redirects.json`.
  * For a new top-level folder, update `s3Prefixes` in `/src/redirects.json`.
  * Add a behavior in CloudFront. You'll need to submit a PR in [fusionauth-site-infra](https://github.com/FusionAuth/fusionauth-site-infra/).
