# FusionAuth Site

Despite the name, this repo only contains the FusionAuth documentation, articles, developer tools, and blog.

This content is hosted in the following subdirectories of `fusionauth.io`:

- [https://fusionauth.io/docs](https://fusionauth.io/docs)
- [https://fusionauth.io/blog](https://fusionauth.io/blog)
- [https://fusionauth.io/articles](https://fusionauth.io/articles)

The FusionAuth site is open source. Found a bug, an issue, or a typo in our docs? File an issue or submit a pull request.

# FusionAuth Documentation and Blog

## Build

To build the site:

1. Navigate into the `astro` directory, where the docs site lives:

   ```console
   cd astro
   ```

1. Install dependencies:

   ```console
   npm install
   ```

1. Run a local development instance of the site:

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

This may take a minute or two. Output can be noisy, but do pay attention to the output from `astro-link-validator`, which runs at the very end of the `build` step. This check ensures that all internal links on the site point to valid URLs. For development convenience, this check doesn't fail the build, but you should always keep the broken link count at zero before merging into `main`.

## Write Content

Always follow the content style guide found in [CONTRIBUTING.md](/CONTRIBUTING.md).

## Lint

To check syntax across the entire site:

```sh
npm run lint
```

> NOTE: Most of the site doesn't currently pass lint checks.

To check syntax in a specific file:

```sh
npm run lint -- src/components/BlogButton.astro
```

To skip linting when you inevitably include HTML somewhere in an MDX file, use the `eslint-disable-next-line` or `eslint-disable-line`:

```mdx
{/* eslint-disable-next-line */}
<a href="https://www.fusionauth.io">FusionAuth</a>
```

## Deploy

Deploying happens automatically via a GitHub action (one for content, another for redirects) whenever content merges into `main`. Dev server deployments have separate corresponding actions.

## Redirects

[src/redirects.json](src/redirects.json) specifies our redirect rules. This file is published to s3 and read by a Lambda function that processes redirects for the site. When modifying the file:

* Keep items in alphabetical order!
* If you are moving a page around, update `redirects`.
* If you are adding a page that is an index page, update `indexPages`.
* If you are adding a new top level file or directory that's pulled from the S3 bucket, make sure you:
  * Add a behavior in CloudFront. You'll need to submit a PR in [fusionauth-site-infra](https://github.com/FusionAuth/fusionauth-site-infra/) for this change.
  * If you are adding a top level file, add an entry to the `s3Paths` array.
  * If you are adding a top level directory, add an entry to the `s3Prefixes` array.
