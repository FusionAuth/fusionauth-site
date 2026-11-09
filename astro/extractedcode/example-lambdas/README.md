# FusionAuth Lambda Examples

Tested FusionAuth lambda examples, plus a Node.js harness that runs a lambda with the same globals, argument handling, and `fetch` behavior as FusionAuth. Use the harness to unit test your own lambdas without a running FusionAuth instance.

## Prerequisites

* Node.js 20 or later. The harness has no dependencies.
* Docker, only to run the conformance check against a real FusionAuth.

## Run the Tests

```shell
npm test
```

## Test Your Own Lambda

Copy the `harness` folder into your project, then load your lambda by type and call the lambda with arguments:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from './harness/index.js';

test('adds the user plan to the access token', () => {
  const lambda = loadLambdaFile(new URL('./plan-claim.js', import.meta.url), 'JWTPopulate', {
    secrets: { 'billing-api-key': 'test-key' },
    fetch: [{ url: /billing\.example\.com/, response: { body: { plan: 'pro' } } }],
  });

  const { jwt, logs, requests } = lambda.invoke(
    { jwt: { sub: 'user-id' }, user: { id: 'user-id', data: {} }, registration: null },
    { context: { scopes: [] } },
  );

  assert.equal(jwt.plan, 'pro');
});
```

`invoke()` returns the mutable arguments as FusionAuth keeps them, so changes the lambda makes to read-only arguments don't appear in the result. The result also includes `logs` (`info`, `debug`, and `error` text) and `requests`, the `fetch()` calls the lambda made.

The lambda type names match the `type` values in the [Lambda API](https://fusionauth.io/docs/apis/lambdas). See `harness/lambda-types.js` for each type's function name and arguments.

### Options

Pass these options to `loadLambda(source, type, options)` or `loadLambdaFile(url, type, options)`:

| Option | Description |
|---|---|
| `fetch` | Mock responses. Either a function that takes the request and returns a response, or an array of `{ method, url, response }` routes where `url` is a string or a RegExp. A response is `{ status, headers, body }`, and an object `body` becomes JSON. A request with no matching route throws, so a test can't reach the network. Use `networkError()` for a server that can't be reached. |
| `secrets` | Values for `context.services.secrets.get(name)`, keyed by secret name. |
| `licensed` | Set to `false` to make `fetch()` return the `402` response an instance without a license returns. |
| `debug` | Set to `true` to keep `console.debug` output, like the lambda **Enable debug logging** setting. |
| `requestPath` | The API path that triggered the lambda. A `fetch()` to that path returns `400`, as FusionAuth does to stop recursive calls. |

The second argument to `invoke()` takes a `context` fixture. The fixture can only hold the fields that FusionAuth passes the lambda type, which `harness/lambda-types.js` lists for each type. The harness supplies `context.services` itself.

### What the Harness Reproduces

* The lambda runs in an empty JavaScript context. `require`, `setTimeout`, `URL`, `atob`, and other Node.js and browser APIs don't exist, so a lambda that depends on one fails in the harness the same way it fails in FusionAuth.
* Every argument passes through `JSON.parse` on the way in and `JSON.stringify` on the way out. Dates become strings, and functions and `undefined` values disappear.
* FusionAuth applies changes to the top-level fields of each mutable argument. A field the lambda deletes keeps its original value.
* For JWT and UserInfo claims, a claim set to `null` is removed, and changes to reserved claims are discarded. A JWT populate or token exchange populate lambda can lower `exp` but not raise it.
* After a token exchange populate lambda runs, `aud` and `scope` keep only the values in `exchange.audiences` and `exchange.scopes`. When no values match, the claim gets the full granted list.
* When a lambda throws, the error reaches your test, and none of the argument changes apply. FusionAuth discards the changes the same way.
* `fetch()` is synchronous and returns `{ status, headers, body }`, with `body` as a string. Header lookups ignore case. The response has no `json()`, `ok`, or `headers.get()`.
* `console.info`, `console.log`, `console.debug`, and `console.error` format values the way the FusionAuth Event Log shows them.
* Top-level variables keep their values between calls to `invoke()` on the same loaded lambda, as FusionAuth reuses lambda contexts.

The harness runs on V8 instead of the GraalJS engine FusionAuth uses, so engine-level details such as `Intl` locale data can differ.

## Conformance Check

The `conformance` folder holds two kinds of lambdas that `conformance/check.js` runs in a real FusionAuth and in the harness. The check fails on any difference:

* `conformance-lambda.js` records how the runtime behaves, including globals, `fetch()`, `Headers`, secrets, and console output.
* `probe-lambda.js` records its arguments, then changes every claim. The check feeds the recorded arguments to the harness and compares the claims each side keeps. The check runs the probe as a JWT populate lambda for an Id token, a UserInfo populate lambda, a client credentials JWT populate lambda, and a token exchange populate lambda.
* `context-probe.js` logs the names of the context fields for a login validation lambda, an MFA requirement lambda, and a token exchange policy lambda. The check reads the names from the Event Log.

For every lambda the check runs, the check fails when FusionAuth passes a context field that `harness/lambda-types.js` doesn't list for the type. FusionAuth leaves out empty fields, so a listed field can be missing.

The client credentials probe needs a license. The MFA requirement and token exchange probes need an Enterprise license. The check skips each probe that the license doesn't cover. To run the check:

```shell
docker compose up -d
node conformance/check.js
```

Without a license, `fetch()` returns `402`, and the check compares that behavior instead. To check `fetch()` fully, replace the `licenseId` in `kickstart/kickstart.json` with your license key before starting FusionAuth.

## Release Check

`harness/release-types.test.js` compares the harness and the docs with the lambda types in the pinned FusionAuth release. `scripts/fetch_external_content.sh` writes the release types and signatures to `astro/src/content/json/generated/lambda-types.json`. The test fails when the release adds or removes a type, or changes a function name or argument list, until `harness/lambda-types.js`, `astro/src/content/json/lambdas.json`, and the lambda type pages match. The test also checks the context partial next to each type page, such as `lambdas/tokens/_jwt-populate-context.mdx`. Each unindented line in the partial starts with ``* `field`: ``, followed by any markdown. Nested bullets describe subfields. The top-level fields must match the `context` list in `harness/lambda-types.js`, plus `services`, and the page must render the partial as `<LambdaContext />`. Outside the `fusionauth-site` repository, the test skips.
