import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./map-roles.js', import.meta.url), 'OpenIDReconcile');

function run(jwt) {
  return lambda.invoke({ user: fixture('user'), registration: fixture('registration'), jwt, id_token: null, tokens: { access_token: 'token' } });
}

test('maps customer roles to application roles', () => {
  assert.deepEqual(run(fixture('openid-reconcile/customer-user-info')).registration.roles, ['developer', 'business_analyst']);
});

test('maps a single role sent as a string', () => {
  assert.deepEqual(run(fixture('openid-reconcile/customer-user-info', { roles: 'administrator' })).registration.roles, ['admin']);
});

test('drops roles with no mapping', () => {
  assert.deepEqual(run(fixture('openid-reconcile/customer-user-info', { roles: ['dev', 'intern'] })).registration.roles, ['developer']);
});

test('leaves the roles unchanged when the roles claim is missing', () => {
  assert.deepEqual(run(fixture('openid-reconcile/customer-user-info', { roles: undefined })).registration.roles, ['user']);
});
