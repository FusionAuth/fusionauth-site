import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, registration) {
  const lambda = loadLambdaFile(new URL('./role-permissions.js', import.meta.url), 'JWTPopulate');
  return lambda.invoke({ jwt: fixture('jwt'), user, registration }, { context: { scopes: [] } });
}

test('maps roles to permissions without duplicates', () => {
  const { jwt } = run(fixture('user'), fixture('registration', { roles: ['editor', 'user'] }));
  assert.deepEqual(jwt.permissions, ['reports:read', 'reports:write']);
  assert.equal(jwt['https://example.com/plan'], 'pro');
});

test('ignores roles with no mapped permissions', () => {
  const { jwt } = run(fixture('user'), fixture('registration', { roles: ['auditor'] }));
  assert.deepEqual(jwt.permissions, []);
});

test('handles a user with no registration or plan', () => {
  const { jwt } = run(fixture('user', { data: {} }), null);
  assert.deepEqual(jwt.permissions, []);
  assert.equal(jwt['https://example.com/plan'], 'free');
  assert.deepEqual(jwt.roles, ['user']);
});
