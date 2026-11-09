import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const chatgpt = { clientId: 'https://chatgpt.com/oauth/client.json', clientIdHost: 'chatgpt.com', clientName: 'ChatGPT' };

function run(clientMetadata, context = {}) {
  const lambda = loadLambdaFile(new URL('./narrow-scopes.js', import.meta.url), 'CimdClientRegistration');
  return lambda.invoke(
    { result: fixture('cimd-client-registration/result'), clientMetadata: fixture('cimd-client-registration/client-metadata', clientMetadata) },
    { context: fixture('cimd-client-registration/context', context) },
  ).result;
}

const scopeNames = (result) => result.scopes.map((scope) => scope.name);

test('keeps the domain defaults for a trusted client', () => {
  assert.deepEqual(run({}), fixture('cimd-client-registration/result'));
});

test('removes write scopes and contact scopes for a read-only client', () => {
  const result = run(chatgpt);
  assert.deepEqual(scopeNames(result), ['reports:read']);
  assert.equal(result.providedScopePolicy.phone.enabled, false);
  assert.equal(result.providedScopePolicy.address.enabled, false);
  assert.deepEqual(result.providedScopePolicy.email, { enabled: true, required: false });
  assert.equal(result.ttlInSeconds, 900);
  assert.equal(result.decision, 'ALLOW');
});

test('leaves the admin resource to other lambdas', () => {
  assert.deepEqual(run({}, { resource: 'https://mcp.piedpiper.com/admin' }), fixture('cimd-client-registration/result'));
});
