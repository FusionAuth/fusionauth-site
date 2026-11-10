// compares lambda-types.js and the docs with the lambda types in the pinned FusionAuth release
// scripts/fetch_external_content.sh writes lambda-types.json from the release
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { lambdaTypes } from './lambda-types.js';

const astro = new URL('../../../', import.meta.url);
const releaseFile = new URL('src/content/json/generated/lambda-types.json', astro);
const docsFile = new URL('src/content/json/lambdas.json', astro);
// outside the fusionauth-site repository there is no release snapshot to compare with
const skip = !existsSync(releaseFile) && 'needs the fusionauth-site repository';
const read = (url) => JSON.parse(readFileSync(url, 'utf8'));

const pageOf = (doc) => new URL(`src/content/docs${doc.docLink.replace(/^\/docs/, '')}.mdx`, astro);

function sameNames(actual, expected, message) {
  const missing = expected.filter((name) => !actual.includes(name));
  const extra = actual.filter((name) => !expected.includes(name));
  assert.deepEqual({ missing, extra }, { missing: [], extra: [] }, message);
}

test('lambda-types.js has every lambda type in the release', { skip }, () => {
  sameNames(Object.keys(lambdaTypes), read(releaseFile).map((t) => t.type), 'Add the missing types to lambda-types.js, and remove the extra ones.');
});

test('lambdas.json has every lambda type in the release', { skip }, () => {
  sameNames(read(docsFile).map((d) => d.typeText), read(releaseFile).map((t) => t.type), 'Add the missing types to astro/src/content/json/lambdas.json, and remove the extra ones.');
});

test('lambda-types.js uses the function name and arguments from the release', { skip }, () => {
  for (const release of read(releaseFile).filter((t) => lambdaTypes[t.type])) {
    const definition = lambdaTypes[release.type];
    // lambda-types.js leaves out the context argument, which every type receives last
    assert.equal(release.parameters.at(-1), 'context', `${release.type}: the release no longer ends the arguments with context.`);
    assert.deepEqual(
      [definition.fn, ...definition.args.map((arg) => arg.name)],
      [release.function, ...release.parameters.slice(0, -1)],
      `${release.type}: lambda-types.js and the release disagree on the function name or arguments.`,
    );
  }
});

test('each lambda type page shows the signature from the release', { skip }, () => {
  const docs = read(docsFile);
  for (const release of read(releaseFile)) {
    const doc = docs.find((d) => d.typeText === release.type);
    if (!doc) continue;
    const page = pageOf(doc);
    assert.ok(existsSync(page), `${release.type}: lambdas.json links to ${doc.docLink}, which has no page.`);
    const signature = `function ${release.function}(${release.parameters.join(', ')})`;
    assert.ok(readFileSync(page, 'utf8').includes(signature), `${release.type}: ${doc.docLink} doesn't show ${signature}.`);
  }
});

// each page renders _<page>-context.mdx, which holds one top-level bullet per context field, with freeform markdown after the name
test('each context partial lists the context fields in lambda-types.js', { skip }, () => {
  for (const doc of read(docsFile)) {
    const definition = lambdaTypes[doc.typeText];
    const partialPath = doc.docLink.replace(/^\/docs\/(.*\/)?([^/]+)$/, 'src/content/docs/$1_$2-context.mdx');
    const partial = new URL(partialPath, astro);
    if (!existsSync(partial)) {
      assert.ok(!definition?.context, `${doc.typeText}: add ${partialPath} with a bullet for each context field.`);
      continue;
    }
    const topLevel = readFileSync(partial, 'utf8').split('\n').filter((line) => line && !line.startsWith(' '));
    const fields = topLevel.map((line) => line.match(/^\* `(\w+)`: /)?.[1]);
    assert.ok(fields.every(Boolean), `${partialPath}: start every unindented line with * \`field\`: and indent nested bullets.`);
    sameNames(fields, [...(definition?.context ?? []), 'services'], `${doc.typeText}: ${partialPath} and lambda-types.js disagree on the context fields.`);
    const page = readFileSync(pageOf(doc), 'utf8');
    assert.ok(page.includes(`from '${partialPath}';`) && page.includes('<LambdaContext />'), `${doc.typeText}: ${doc.docLink} doesn't render ${partialPath}.`);
  }
});
