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

### Publish the FusionAuth plugin

The [`fusionauth-skills`](astro/extractedcode/fusionauth-skills) folder is the FusionAuth plugin for the Claude and OpenAI plugin directories. The plugin bundles the agent skills and the [Docs MCP server](https://fusionauth.io/docs/get-started/develop/docs-mcp-server). Each directory reads a different manifest:

* Claude reads `.claude-plugin/plugin.json` and `.mcp.json`.
* OpenAI reads `plugin.json` and `mcp.json`.

Both MCP manifests use `https://ai.fusionauth.io/mcp/docs?client=plugin`, and the server ignores the query string. Keep the query string. Every FusionAuth claude.ai account has a "Kapa AI - FusionAuth" connector at the plain URL, and Claude Code hides a plugin's MCP server when the server's URL matches a connector, even a disabled connector.

When you change a skill or the shared metadata, change both manifests. `tests/test.sh` fails when the name, description, license, repository, or MCP server URLs drift apart, or when `plugin.json` breaks an OpenAI field limit.

#### Claude

A merge to `main` exports the folder to [FusionAuth/fusionauth-skills](https://github.com/FusionAuth/fusionauth-skills), and the Claude directory scans each new commit on that repository's `main` branch. By default, an Anthropic reviewer approves each scanned version before the directory publishes the version. `.claude-plugin/plugin.json` has no `version`, so the directory tracks commits and nobody has to raise a version number. To check the plugin locally, run `claude plugin validate astro/extractedcode/fusionauth-skills`. To try the plugin in Claude Code, run `claude --plugin-dir astro/extractedcode/fusionauth-skills`.

The scans start after a one-time submission:

1. Give the `EXAMPLE_PUBLISH_TOKEN` personal access token write access to `FusionAuth/fusionauth-skills`, so the export can push.
1. At [claude.ai/directory/manage](https://claude.ai/directory/manage), select **Submit new**, then **Plugin bundle**. On a Team or Enterprise account, only an Owner, or a member with the Directory permission, can submit.
1. Connect a GitHub account with push access to `FusionAuth/fusionauth-skills`, and choose the **GitHub push webhook** update option. The webhook needs admin access to the repository.

#### OpenAI

The OpenAI directory needs a ZIP upload for each change to a skill or to the metadata. Changes to the MCP server's tools need no upload, because OpenAI scans the server daily. The uploader needs the **Apps Management Write** permission in the FusionAuth OpenAI organization, and the organization needs business verification.

1. Raise `version` in `plugin.json`, and merge the change.
1. Run the following commands from the repository root. The ZIP holds only the files OpenAI reads, and lands outside the repository so nobody commits the ZIP by mistake:

   ```console
   cd astro/extractedcode/fusionauth-skills
   rm -f ~/fusionauth-plugin.zip
   zip -r ~/fusionauth-plugin.zip plugin.json mcp.json skills assets README.md LICENSE -x '*.DS_Store'
   ```

1. Open the plugin at [platform.openai.com/plugins](https://platform.openai.com/plugins), select **Upload plugin to make changes**, and upload the ZIP.
1. Resolve the findings in **Metadata & Skills**, submit the version for review, and publish the version after approval.

For the first submission, select **Upload new or existing plugin**, choose the verified FusionAuth developer identity, and choose **With MCP**. OpenAI doesn't support adding an MCP server to a skills-only plugin later. The first submission also asks for the following values. `plugin.json` supplies the starter prompts, the test cases, and the commerce declaration, so the portal only asks for the rest:

* MCP server URL: `https://ai.fusionauth.io/mcp/docs?client=plugin`, with no authentication. Use the same URL as `mcp.json`.
* Domain verification: the portal generates a token. Set `openaiAppsChallenge` in `docs/src/index.ts` of the [fusionauth-mcp](https://github.com/fusionauth-eng/fusionauth-mcp) repository to the token, and deploy. The server then returns the token at `https://ai.fusionauth.io/.well-known/openai-apps-challenge`. Select **Verify Domain**, and leave the token in place after verification.
* Demo recording: `review.demo_recording_url` in `plugin.json` points to [`fusionauth-plugin-demo.webm`](astro/public/img/docs/fusionauth-plugin-demo.webm), a Claude Code session that runs the install skill and a Docs MCP server question. OpenAI requires a recording for MCP review. Record a new demo when a skill changes what the agent does.
* Tool annotation justifications, for both `ask_fusionauth_question` and `search_fusionauth_sources`:
  * Read-only: "The tool searches the FusionAuth docs, GitHub issues, and videos and returns text. The tool creates, changes, and deletes nothing."
  * Not destructive: "The tool performs no writes, so the tool can't destroy data."
  * Not open world: "The tool only queries the kapa.ai index of FusionAuth docs, GitHub issues, and videos. The tool doesn't browse the web or reach arbitrary sites."
* Reviewer credentials: none. The server needs no sign-in.

## Refresh external content

Docker, Kubernetes, and Kafka configuration examples remain owned by their external repositories. To refresh only the files displayed in the docs, run this from the repository root (requires Bash, Git, and curl):

```console
bash scripts/fetch_external_content.sh
```

Review the diff and affected guides before committing. Add `--check` to show upstream changes without modifying local files; the weekly **Check external content** workflow runs this check and fails with a diff when the snapshots are stale. It does not commit or push changes.

Run the offline refresh regression tests with `bash astro/extractedcode/configuration-snippets/tests/test.sh` (requires Python 3.9 or newer). The extractedcode CI workflow also runs them when the snapshots, refresh tooling, or related workflows change.

## Update the docs for a new FusionAuth release

The [`fusionauth-version`](fusionauth-version) file names the FusionAuth release the docs document. Scripts and checks read that file, so the docs move to a new release only when the file changes.

When a release ships, run each command from the repository root:

1. Merge the release notes and reference docs for the release into `main`.
1. Pin the release. The script writes `fusionauth-version` and copies the version into the Docker Compose files and the production Docker examples. Don't edit those copies by hand:

   ```console
   FUSIONAUTH_VERSION=<version> bash scripts/update_fusionauth_version.sh
   ```

1. Check the API docs against the release. The script lists fields that the published docs don't cover. To check unpublished docs instead, run `npm run build` in `astro` first, then add `--pr`:

   ```console
   bash scripts/check-apis.sh
   ```

1. Refresh the content generated from the release:

   ```console
   bash scripts/fetch_external_content.sh
   scripts/update-templates.sh all
   bash scripts/update_openapi_spec.sh
   ```

   When the release changes the lambda types, update the lambda docs to match. See the [release check](astro/extractedcode/example-lambdas/README.md#release-check).

1. Retake the screenshots. The script keeps only the images that changed:

   ```console
   scripts/refresh-screenshots.sh --shards 4
   ```

1. When the release renames a page, field, or button in the Admin UI, update the instructions, `Breadcrumb` paths, and alt text that name the old label. The release notes list most renames.
1. Review the diff and open a PR.

### Prepare docs before a release

To pin a version whose Docker image isn't public yet, add `--unreleased` to the pin command. Merge the branch only after the image is on Docker Hub. To take screenshots from a prerelease image, see [Prerelease images](astro/screenshots/README.md#prerelease-images).

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
