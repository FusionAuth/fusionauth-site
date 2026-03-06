# FusionAuth Documentation (and Blog)

> NOTE: For the content style guide, see [CONTRIBUTING.md](/CONTRIBUTING.md).

To build the site:

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

This may take a minute or two. Output can be noisy, but do pay attention to the output from `astro-link-validator` (runs at the very end of the `build` step), which ensures that all internal links on the site point to valid URLs. For development convenience, this check doesn't fail the build, but you should always keep the broken link count at zero before merging into `main`.

## Linting

To lint syntax across the entire site:

```sh
npm run lint
```

> NOTE: Most of the site doesn't currently pass lint checks.

To lint syntax in a specific file:

```sh
 npm run lint -- src/components/BlogButton.astro
```

To skip linting when you inevitably include HTML somewhere in an MDX file, use the `eslint-disable-next-line` or `eslint-disable-line`:

```mdx
{/* eslint-disable-next-line */}
<a href="https://www.fusionauth.io">FusionAuth</a>
```
