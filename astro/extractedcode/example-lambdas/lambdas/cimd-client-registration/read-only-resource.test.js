import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(clientMetadata, context = {}) {
  const lambda = loadLambdaFile(new URL('./read-only-resource.js', import.meta.url), 'CimdClientRegistration');
  return lambda.invoke(
    { result: fixture('cimd-client-registration/result'), clientMetadata: fixture('cimd-client-registration/client-metadata', clientMetadata) },
    { context: fixture('cimd-client-registration/context', context) },
  ).result;
}

const scopeNames = (result) => result.scopes.map((scope) => scope.name);

test('removes write scopes from every client on the admin resource', () => {
  const result = run({}, { resource: 'https://mcp.piedpiper.com/admin' });
  assert.deepEqual(scopeNames(result), ['reports:read']);
  assert.equal(result.ttlInSeconds, 86400);
  assert.equal(result.providedScopePolicy.phone.enabled, true);
});

test('keeps every scope on other resources', () => {
  assert.deepEqual(run({}), fixture('cimd-client-registration/result'));
});
