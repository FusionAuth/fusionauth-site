import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(recipientEntity = fixture('client-credentials-jwt-populate/recipient-entity'), permissions = fixture('client-credentials-jwt-populate/permissions')) {
  const lambda = loadLambdaFile(new URL('./named-permissions.js', import.meta.url), 'ClientCredentialsJWTPopulate');
  return lambda.invoke({
    jwt: fixture('client-credentials-jwt-populate/jwt'),
    recipientEntity,
    targetEntities: fixture('client-credentials-jwt-populate/target-entities'),
    permissions,
  });
}

test('adds permissions named by target entity', () => {
  const { jwt } = run();
  assert.deepEqual(jwt['https://example.com/permissions'], ['Email API:write', 'Todo API:read']);
  assert.equal(jwt['https://example.com/tier'], 'standard');
});

test('keeps the permissions and scope claims FusionAuth set', () => {
  const original = fixture('client-credentials-jwt-populate/jwt');
  const { jwt } = run();
  assert.deepEqual(jwt.permissions, original.permissions);
  assert.equal(jwt.scope, original.scope);
  assert.equal(JSON.stringify(jwt).includes('LUtIbHgOiCwOjVGDwTcgNaYELJAJJyj'), false);
});

test('reads the tier from entity data', () => {
  const recipient = fixture('client-credentials-jwt-populate/recipient-entity', { data: { tier: 'partner' } });
  assert.equal(run(recipient).jwt['https://example.com/tier'], 'partner');
});

test('handles a grant with no permissions', () => {
  const permissions = { '0b56a9ff-5e5d-4969-9cc2-3f1f49e5c64d': [] };
  assert.deepEqual(run(undefined, permissions).jwt['https://example.com/permissions'], []);
});
