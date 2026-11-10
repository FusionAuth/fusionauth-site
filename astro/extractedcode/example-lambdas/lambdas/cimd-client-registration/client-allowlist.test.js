import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(clientMetadata, context = {}) {
  const lambda = loadLambdaFile(new URL('./client-allowlist.js', import.meta.url), 'CimdClientRegistration');
  return lambda.invoke(
    { result: fixture('cimd-client-registration/result'), clientMetadata: fixture('cimd-client-registration/client-metadata', clientMetadata) },
    { context: fixture('cimd-client-registration/context', context) },
  );
}

test('allows a client from an allowed host', () => {
  assert.equal(run({}).result.decision, 'ALLOW');
});

test('denies a client from any other host', () => {
  const { result, logs } = run({ clientId: 'https://tools.example.com/client.json', clientIdHost: 'tools.example.com' });
  assert.equal(result.decision, 'DENY');
  assert.match(logs.info, /tools\.example\.com.*unknown host/);
});

test('revokes a retired client', () => {
  const clientId = 'https://app.piedpiper.com/oauth/legacy-client.json';
  assert.equal(run({ clientId, clientIdHost: 'app.piedpiper.com' }).result.decision, 'REVOKE');
});
