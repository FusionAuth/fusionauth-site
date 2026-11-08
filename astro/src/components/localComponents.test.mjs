import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { after, test } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { isBuiltin } from 'node:module';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

// Compile the real components, rather than duplicating their rendering logic.
async function loadComponent(name, source) {
  const filename = resolve('src/components', name);
  const output = await build({
    stdin: {
      contents: source ?? readFileSync(filename, 'utf8'),
      sourcefile: filename,
      resolveDir: dirname(filename),
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    plugins: [{
      name: 'local-component-test',
      setup(builder) {
        builder.onResolve({ filter: /^src\// }, ({ path }) => ({ path: resolve(path + '.ts') }));
        builder.onResolve({ filter: /^[^./]/ }, ({ path }) => ({
          path: isBuiltin(path) ? path : import.meta.resolve(path),
          external: true,
        }));
      },
    }],
  });
  return (await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'))).default;
}

async function compileComponent(name, source) {
  const filename = resolve('src/components', name);
  const compiled = transform(source ?? readFileSync(filename, 'utf8'), {
    filename,
    internalURL: 'astro/compiler-runtime',
    resultScopedSlot: true,
    resolvePath: path => path,
  });
  assert.deepEqual(compiled.diagnostics.filter(d => d.severity === 'error'), []);
  return loadComponent(name, compiled.code);
}

const markdown = await compileComponent('LocalMarkdown.astro');
const value = await compileComponent('LocalValue/LocalValue.astro');
const container = await AstroContainer.create();
const fixture = mkdtempSync(resolve('extractedcode', '.local-components-test-'));
const relativeFixture = basename(fixture);
after(() => rmSync(fixture, { recursive: true }));

async function renderMarkdown(content, name) {
  writeFileSync(resolve(fixture, name + '.md'), content);
  return container.renderToString(markdown, { props: { src: relativeFixture + '/' + name + '.md' } });
}

test('local Markdown preserves headings, links, and emphasis', async () => {
  const html = await renderMarkdown('# Heading\n\nA **bold** [link](/docs/).', 'prose');
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /href="\/docs\/"/);
});

test('JavaScript code is highlighted and angle brackets are escaped', async () => {
  const html = await renderMarkdown('```javascript\nconst text = "<example>";\n```', 'javascript');
  assert.match(html, /<pre><code class="language-javascript">/);
  assert.match(html, /class="token keyword"/);
  assert.match(html, /&lt;example/);
  assert.doesNotMatch(html, /<example>/);
});

test('Python grammar is loaded and highlighted', async () => {
  const html = await renderMarkdown('```python\nprint("<example>")\n```', 'python');
  assert.match(html, /class="token /);
  assert.match(html, /&lt;example/);
  assert.doesNotMatch(html, /<example>/);
});

test('Prism loads language dependencies and aliases', async () => {
  for (const language of ['tsx', 'py', 'shell']) {
    const html = await renderMarkdown('```' + language + '\nprint("<example>")\n```', language);
    assert.match(html, new RegExp('<pre><code class="language-' + language + '">'));
    assert.doesNotMatch(html, /<example>/);
  }
});

test('unknown, unlabelled, and indented code remain escaped', async () => {
  const content = '<example a="value">& text</example>';
  for (const [name, input] of [
    ['unknown', '```unknown-language\n' + content + '\n```'],
    ['unlabelled', '```\n' + content + '\n```'],
    ['indented', '# Heading\n\n    ' + content],
    ['attribute', '```unknown"onclick="alert(1)\n' + content + '\n```'],
  ]) {
    const html = await renderMarkdown(input, name);
    assert.match(html, /&lt;example/);
    assert.match(html, /&amp; text/);
    assert.doesNotMatch(html, /<example|"onclick="/);
  }
});

test('fence metadata does not become part of the language', async () => {
  const html = await renderMarkdown('```javascript title="example"\nconst value = 1;\n```', 'metadata');
  assert.match(html, /class="language-javascript"/);
  assert.match(html, /class="token keyword"/);
});

const json = resolve(fixture, 'config.json');
writeFileSync(json, JSON.stringify({ variables: { applicationId: 'test-application-id' } }));
const jsonPath = relativeFixture + '/config.json';

test('LocalValue reads extractedcode and applies a JSONPath selector', async () => {
  const html = await container.renderToString(value, { props: { path: jsonPath, selector: '$.variables.applicationId' } });
  assert.equal(html.trim(), 'test-application-id');
});

test('LocalValue supports callback selectors', async () => {
  const html = await container.renderToString(value, {
    props: { path: jsonPath, selector: data => data.variables.applicationId },
  });
  assert.equal(html.trim(), 'test-application-id');
});

test('LocalValue uses its default when a selector has no match', async () => {
  const html = await container.renderToString(value, {
    props: { path: jsonPath, selector: '$.missing', default: 'not configured' },
  });
  assert.equal(html.trim(), 'not configured');
});

test('missing local files fail explicitly', async () => {
  await assert.rejects(container.renderToString(value, {
    props: { path: relativeFixture + '/missing.json', selector: '$.variables.applicationId' },
  }), /Failed to read local value file/);
  await assert.rejects(container.renderToString(markdown, {
    props: { src: relativeFixture + '/missing.md' },
  }), /Failed to read local file/);
});
