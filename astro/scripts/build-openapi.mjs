// Fetch the upstream FusionAuth OpenAPI spec, inject Scalar-friendly tags on
// every operation, append a top-level tags list, and write the result to
// astro/public/openapi.yaml so /docs/apis/api-explorer-beta can serve it.
//
// Runs from npm pre-hooks (predev, prebuild). Skip with SKIP_OPENAPI=1 when
// iterating offline.

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'yaml';

const UPSTREAM_URL =
  process.env.OPENAPI_URL ||
  'https://raw.githubusercontent.com/FusionAuth/fusionauth-openapi/main/openapi.yaml';

const OUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'openapi.yaml',
);

// Ordered prefix rules. First match wins, so longer/more-specific prefixes go
// before their parents (e.g. /api/api-key before /api/key, /api/user-action
// before /api/user, /api/system-configuration before /api/system).
const TAG_RULES = [
  ['/.well-known/', 'OpenID Connect'],
  ['/oauth2/', 'OAuth2'],
  ['/api/api-key', 'API Keys'],
  ['/api/application', 'Applications'],
  ['/api/connector', 'Connectors'],
  ['/api/consent', 'Consents'],
  ['/api/email', 'Email'],
  ['/api/entity', 'Entities'],
  ['/api/form', 'Forms'],
  ['/api/group', 'Groups'],
  ['/api/health', 'Health'],
  ['/api/identity-provider', 'Identity Providers'],
  ['/api/identity/', 'Identity'],
  ['/api/integration', 'Integrations'],
  ['/api/ip-acl', 'IP Access Control Lists'],
  ['/api/jwt/', 'JWT'],
  ['/api/key', 'Keys'],
  ['/api/lambda', 'Lambdas'],
  ['/api/login', 'Login'],
  ['/api/logout', 'Logout'],
  ['/api/message/', 'Messages'],
  ['/api/messenger', 'Messengers'],
  ['/api/passwordless', 'Passwordless'],
  ['/api/reactor', 'Reactor'],
  ['/api/report/', 'Reports'],
  ['/api/status', 'Status'],
  ['/api/system-configuration', 'System Configuration'],
  ['/api/system/', 'System'],
  ['/api/tenant-manager', 'Tenant Manager'],
  ['/api/tenant', 'Tenants'],
  ['/api/theme', 'Themes'],
  ['/api/two-factor', 'Two Factor'],
  ['/api/user-action-reason', 'User Action Reasons'],
  ['/api/user-action', 'User Actions'],
  ['/api/user', 'Users'],
  ['/api/webauthn', 'Webauthn'],
  ['/api/webhook', 'Webhooks'],
];

const HTTP_METHODS = new Set([
  'get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace',
]);

function tagFor(path) {
  for (const [prefix, tag] of TAG_RULES) {
    if (path === prefix || path.startsWith(prefix)) return tag;
  }
  return null;
}

async function fetchSpec() {
  const res = await fetch(UPSTREAM_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${UPSTREAM_URL}: ${res.status}`);
  }
  return res.text();
}

async function isFresh() {
  try {
    const s = await stat(OUT_PATH);
    return Date.now() - s.mtimeMs < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

async function main() {
  if (process.env.SKIP_OPENAPI === '1') {
    console.log('[build-openapi] SKIP_OPENAPI=1, skipping');
    return;
  }

  let rawYaml;
  try {
    rawYaml = await fetchSpec();
  } catch (err) {
    if (await isFresh()) {
      console.warn(`[build-openapi] fetch failed (${err.message}); reusing cached ${OUT_PATH}`);
      return;
    }
    throw err;
  }

  const spec = parse(rawYaml);
  const seenTags = new Set();
  const untagged = [];

  for (const [path, ops] of Object.entries(spec.paths || {})) {
    const tag = tagFor(path);
    if (!tag) {
      untagged.push(path);
      continue;
    }
    for (const [method, op] of Object.entries(ops)) {
      if (!HTTP_METHODS.has(method) || !op || typeof op !== 'object') continue;
      op.tags = [tag];
      seenTags.add(tag);
    }
  }

  if (untagged.length) {
    console.warn(`[build-openapi] no tag rule matched ${untagged.length} path(s):`);
    for (const p of untagged) console.warn(`  ${p}`);
  }

  spec.tags = [...seenTags].sort().map((name) => ({ name }));

  // Replace the upstream `servers` list (which only offers a localhost default
  // and the FusionAuth sandbox) with a templated entry so users can type their
  // own host in Scalar's UI without us having to enumerate every possibility.
  spec.servers = [
    {
      url: '{scheme}://{host}',
      description: 'Your FusionAuth instance',
      variables: {
        scheme: { enum: ['http', 'https'], default: 'http' },
        host: { default: 'localhost:9011' },
      },
    },
    {
      url: 'https://sandbox.fusionauth.io',
      description: 'FusionAuth sandbox',
    },
  ];

  const out = stringify(spec, { lineWidth: 0 });
  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, out);
  console.log(
    `[build-openapi] wrote ${OUT_PATH} (${seenTags.size} tags, ${
      Object.keys(spec.paths || {}).length
    } paths)`,
  );
}

main().catch((err) => {
  console.error('[build-openapi] failed:', err);
  process.exit(1);
});
