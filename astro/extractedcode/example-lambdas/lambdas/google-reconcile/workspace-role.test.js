import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./workspace-role.js', import.meta.url), 'GoogleReconcile');

function run(idToken, registration = fixture('registration')) {
  return lambda.invoke({ user: fixture('user'), registration, idToken });
}

test('fills in the profile from the id token', () => {
  const { user } = run(fixture('google-reconcile/id-token'));
  assert.equal(user.fullName, 'Richard Hendricks');
  assert.equal(user.imageUrl, 'https://lh3.googleusercontent.com/a/richard-hendricks');
});

test('gives users from the workspace domain the employee role', () => {
  const { registration } = run(fixture('google-reconcile/id-token'));
  assert.deepEqual(registration.roles, ['user', 'employee']);
});

test('adds the employee role only once', () => {
  const { registration } = run(fixture('google-reconcile/id-token'), fixture('registration', { roles: ['employee'] }));
  assert.deepEqual(registration.roles, ['employee']);
});

test('gives personal Google accounts no extra role', () => {
  const { registration } = run(fixture('google-reconcile/id-token', { hd: undefined }));
  assert.deepEqual(registration.roles, ['user']);
});

test('handles a registration with no roles', () => {
  const { registration } = run(fixture('google-reconcile/id-token'), fixture('registration', { roles: undefined }));
  assert.deepEqual(registration.roles, ['employee']);
});

test('keeps the saved name when Google leaves the name claims out', () => {
  const { user } = run(fixture('google-reconcile/id-token', { given_name: undefined, family_name: undefined }));
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
});
