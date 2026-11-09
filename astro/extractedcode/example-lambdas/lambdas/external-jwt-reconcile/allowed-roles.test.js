import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./allowed-roles.js', import.meta.url), 'ExternalJWTReconcile');

function run(jwt, registration = fixture('registration')) {
  return lambda.invoke({ user: fixture('user'), registration, jwt });
}

test('fills in the profile and stores the issuer', () => {
  const { user, registration } = run(fixture('external-jwt-reconcile/jwt'));
  assert.equal(user.imageUrl, 'https://sso.hooli.example.com/avatars/richard.png');
  assert.equal(registration.data.issuer, 'https://sso.hooli.example.com');
  assert.equal(registration.data.favoriteColor, 'blue');
});

test('accepts only the allowed roles', () => {
  assert.deepEqual(run(fixture('external-jwt-reconcile/jwt')).registration.roles, ['editor']);
});

test('accepts a single role sent as a string', () => {
  assert.deepEqual(run(fixture('external-jwt-reconcile/jwt', { roles: 'viewer' })).registration.roles, ['viewer']);
});

test('leaves the roles unchanged when the roles claim is missing', () => {
  assert.deepEqual(run(fixture('external-jwt-reconcile/jwt', { roles: undefined })).registration.roles, ['user']);
});

test('handles a registration with no data', () => {
  const { registration } = run(fixture('external-jwt-reconcile/jwt'), fixture('registration', { data: undefined }));
  assert.deepEqual(registration.data, { issuer: 'https://sso.hooli.example.com' });
});
