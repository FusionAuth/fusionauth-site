# FusionAuth Documentation

[![Check external links](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-external-links.yml/badge.svg)](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-external-links.yml)
[![Check for closed GitHub issues in docs](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-closed-github-issues.yml/badge.svg)](https://github.com/FusionAuth/fusionauth-site/actions/workflows/check-closed-github-issues.yml)
[![Update FusionAuth version](https://github.com/FusionAuth/fusionauth-site/actions/workflows/update-fusionauth-version.yml/badge.svg)](https://github.com/FusionAuth/fusionauth-site/actions/workflows/update-fusionauth-version.yml)

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

This may take a minute or two. Output can be noisy, but do pay attention to the output from [`astro-link-checker`](https://better-static-sites.github.io/build-tools/link-checker/), which runs at the very end of the `build`. This check ensures that all internal links on the site point to valid URLs. For development convenience, this check only fails development builds (so it can never break a deploy), but _please_ keep the broken link count at zero before merging into `main`.

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

Many code blocks, especially those found in guides and tutorials, do not exist in the source markdown files. Instead, we use the `ExtractedCode` component (from `astro-better-code-snippet-extractor`) to source them from snippets generated from tested complete projects with [Bluehawk](https://github.com/mongodb-university/Bluehawk). Existing files import it under the alias `LocalCode`; new files should use `ExtractedCode` directly.

For projects that benefit from a cloneable repository, the `/astro/extractedcode` folder acts as the source of truth; changes to files automatically push to the downstream artifact repository when you merge to the `main` branch of this repo. To configure the artifact repo, use the (optional) `repositoryUrl.txt`.

Astro builds automatically generate code snippets before rendering pages.

## Refresh external content

Docker, Kubernetes, and Kafka configuration examples remain owned by their external repositories. To refresh only the files displayed in the docs, run this from the repository root (requires Bash, Git, and curl):

```console
bash scripts/fetch_external_content.sh
```

Review the diff and affected guides before committing. Add `--check` to show upstream changes without modifying local files; the weekly **Check external content** workflow runs this check and fails with a diff when the snapshots are stale. It does not commit or push changes.

Run the offline refresh regression tests with `bash astro/extractedcode/configuration-snippets/tests/test.sh` (requires Python 3.9 or newer). The extractedcode CI workflow also runs them when the snapshots, refresh tooling, or related workflows change.

## Update the docs for a new FusionAuth release

The [`fusionauth-version`](fusionauth-version) file at the repository root names the FusionAuth release the docs currently document. Builds and checks only move to a new release when that file changes, so a release can ship before its docs without breaking anyone's PR.

These scripts read the pin, and `FUSIONAUTH_VERSION` overrides it for a single run:

- `scripts/check-apis.sh` compares the API docs against the client builder for the pinned release. The Shakedown build runs it on every PR, and the weekly **Check API docs against client libraries** workflow runs it against production.
- `scripts/fetch_external_content.sh` and `scripts/update-templates.sh` generate JSON and templates from the pinned release. The weekly **Check external content** workflow runs both.

Four files need a literal version, so they hold copies of the pin: the Docker install compose file at `astro/public/docs/docker-compose.yml`, which readers download as-is and the `example-testing-lambdas` tests run, the screenshot tooling at `astro/screenshots/docker-compose.yml`, the production Docker examples in `astro/src/content/docs/deploy/production/install/fusionauth-app.mdx`, and the lambda conformance check at `astro/extractedcode/example-lambdas/docker-compose.yml`. Don't edit those versions by hand. The Shakedown build runs `bash scripts/update_fusionauth_version.sh --check` and fails when a copy differs from the pin, or when the pinned image isn't on Docker Hub yet. The download page doesn't use the pin, because it has to list a new release right away.

The daily **Update FusionAuth version** workflow also runs `bash scripts/update_fusionauth_version.sh --check-latest`, and fails while the pin trails the latest release. It keeps one issue open that names both versions, and the first run after the pin catches up closes that issue. If the pin PR has to wait on something other than docs, say so in a comment on that issue.

When a release ships:

1. Merge the docs for the release into `main`. To find undocumented API fields before then, build the site from your branch with `npm run start` in `astro`, then run this from the repository root:

   ```console
   FUSIONAUTH_VERSION=<new version> bash scripts/check-apis.sh --pr
   ```

1. Bump the pin. Every day, the **Update FusionAuth version** workflow checks for a release whose Docker image is public, opens a "chore: pin FusionAuth <version>" PR that updates the pin and its copies, and starts the Shakedown build on it. To bump the pin by hand instead, run this from the repository root and commit the result:

   ```console
   bash scripts/update_fusionauth_version.sh
   ```

   To queue up docs on a release branch before the release is public, pin the upcoming version with `--unreleased`. This skips the check that the Docker image is on Docker Hub:

   ```console
   FUSIONAUTH_VERSION=<upcoming version> bash scripts/update_fusionauth_version.sh --unreleased
   ```

   Merge the branch only after the image is published. Readers download `astro/public/docs/docker-compose.yml` as-is, and CI jobs that pull the pinned image fail until it exists.

1. Wait for the Shakedown build on the pin PR to pass before you merge it. That build checks the API docs against the new release, so a failure lists the fields the docs still need. Merging the pin before the docs moves the weekly checks onto the new release and fails them until the docs land.

1. After the pin merges, refresh the content generated from the release. Run each of these from the repository root, review the diff, and open a PR:

   ```console
   bash scripts/fetch_external_content.sh
   scripts/update-templates.sh all
   bash scripts/update_openapi_spec.sh
   ```

   When the lambda types in the release change, the `example-lambdas` tests fail until the harness and the lambda docs match. See the [release check](astro/extractedcode/example-lambdas/README.md#release-check).

1. Retake the screenshots against the new release. The weekly **Update screenshots** workflow does this on its own, or you can start it by hand from the Actions tab. See [`astro/screenshots/README.md`](astro/screenshots/README.md) for details.

## Scheduled jobs

Every scheduled docs workflow follows the same rules:

1. A run ends in exactly one of: a PR (it found changes it can make), an issue (it failed or found problems a person has to fix, filed by `report-scheduled-run.yml`), or nothing. A PR job that can't open its PR deletes the branch it pushed before it fails, so a run never leaves a branch and an issue behind.
1. The job log shows the full set of changes the run proposes, such as a diff or a list of broken links, not only a count or a "differs" message.
1. All the work happens in a script under `scripts/` that runs locally, and the script ends by printing the exact command that reproduces the run, pinned to the versions and upstream commits it used. `scripts/lib/run-locally.sh` prints that command to the log and the run summary. PR jobs also put the command in the PR body.

## Sitemap

We automatically generate a single `sitemap.xml` file that we use for the entire `fusionauth.io` domain. All of the docs, blog, dev-tools, articles, and isolated pages involved in the Astro build get automatically included during the build itself. For `fusionauth.io` content managed externally, we manually add entries to [`astro/public/sitemap-io.xml`](astro/public/sitemap-io.xml).

## LLMs.txt

The root `fusionauth.io` LLMs.txt file lives in [`astro/public/llms.txt`](astro/public/llms.txt). We manually add entries to it to keep it up-to-date with changes to the io site. Documentation `llms.txt` files (we produce a tree structure due to site size) are automatically generated. But do note that the root LLMs.txt needs to be updated to point to them properly.

## Redirects

[redirects.json](redirects.json) specifies our redirect rules. This file is published to s3 and read by a Lambda function that processes redirects for the site. When modifying the file:

* Keep items in alphabetical order!
* Move a page? Update `/redirects.json`.
* Write each `redirects` key without a trailing slash (`/docs/foo`, not `/docs/foo/`), even for a former folder index page. One entry covers both forms: the Lambda 301s `/docs/foo/` to `/docs/foo` before it looks up a redirect. The exceptions are URLs the Lambda never strips: paths in `indexPaths`, paths under a `redirectsByPrefix` rule, and blog paths deeper than `/blog/<slug>/`.
* Add a new index page? Update `indexPaths` in `/redirects.json`. Every routable `<folder>/index.mdx` needs exactly one entry, written with a trailing slash, because [astro-index-pages](astro/src/integrations/astro-index-pages/index.js) deploys all of them as `<folder>/index.html`.
* Add a new top-level file or folder adjacent to `/docs/` (e.g. `fusionauth.io/mycoolpagethatisntinthedocsfolder`)?
  * For a new file, update `s3Paths` in `/redirects.json`.
  * For a new top-level folder, update `s3Prefixes` in `/redirects.json`.
  * Add a behavior in CloudFront. You'll need to submit a PR in [fusionauth-site-infra](https://github.com/FusionAuth/fusionauth-site-infra/).

For the first two, `scripts/check-redirects.mjs` works out what a diff needs and prints the exact entries. It also flags trailing-slash keys, redirects whose target no page serves, and missing or stale `indexPaths` entries anywhere in the tree, not only in the diff. It defaults to your working tree; pass `--base origin/main` to check a whole branch, and `--write` to apply what it found. The `Check redirects` GitHub action runs it on every PR that touches content, and fails with the same output.
