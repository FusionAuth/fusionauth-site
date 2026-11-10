import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile, networkError } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const billingUrl = 'https://billing.example.com/api/customers/00000000-0000-0000-0000-000000000002';
const secrets = { 'billing-api-key': 'test-billing-key' };

function run(fetch) {
  const lambda = loadLambdaFile(new URL('./billing-tier.js', import.meta.url), 'JWTPopulate', { fetch, secrets });
  return lambda.invoke({ jwt: fixture('jwt'), user: fixture('user'), registration: fixture('registration') }, { context: { scopes: [] } });
}

test('adds the tier from the billing API', () => {
  const { jwt, requests } = run([{ url: billingUrl, response: { body: { tier: 'enterprise' } } }]);
  assert.equal(jwt['https://example.com/tier'], 'enterprise');
  assert.equal(requests[0].headers.Authorization[0], 'Bearer test-billing-key');
  assert.equal(requests[0].connectTimeout, 1000);
  assert.equal(requests[0].readTimeout, 1500);
});

test('falls back to basic on an error status', () => {
  const { jwt, logs } = run([{ url: billingUrl, response: { status: 503 } }]);
  assert.equal(jwt['https://example.com/tier'], 'basic');
  assert.match(logs.error, /status 503/);
});

test('falls back to basic when the API is unreachable', () => {
  const { jwt, logs } = run(() => networkError());
  assert.equal(jwt['https://example.com/tier'], 'basic');
  assert.match(logs.error, /status -1/);
});
