import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./name-and-private-email.js', import.meta.url), 'AppleReconcile');

function run(idToken, user = fixture('user', { firstName: undefined, lastName: undefined })) {
  return lambda.invoke({ user, registration: fixture('registration'), idToken });
}

test('saves the name Apple sends on the first login', () => {
  const { user } = run(fixture('apple-reconcile/id-token'));
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
  assert.equal(user.fullName, 'Richard Hendricks');
});

test('keeps the saved name on later logins', () => {
  const { user } = run(fixture('apple-reconcile/id-token', { user: undefined }), fixture('user'));
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.fullName, undefined);
});

test('flags private relay addresses sent as a string or a boolean', () => {
  assert.equal(run(fixture('apple-reconcile/id-token')).user.data.applePrivateEmail, true);
  assert.equal(run(fixture('apple-reconcile/id-token', { is_private_email: true })).user.data.applePrivateEmail, true);
  assert.equal(run(fixture('apple-reconcile/id-token', { is_private_email: undefined })).user.data.applePrivateEmail, false);
});

test('keeps existing user data', () => {
  assert.equal(run(fixture('apple-reconcile/id-token')).user.data.plan, 'pro');
});
