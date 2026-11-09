import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./attributes-and-group-roles.js', import.meta.url), 'SAMLv2Reconcile');

function withAttributes(attributes) {
  const samlResponse = fixture('samlv2-reconcile/saml-response');
  samlResponse.assertion.attributes = attributes;
  return samlResponse;
}

function run(samlResponse, user = fixture('user', { firstName: undefined, lastName: undefined })) {
  return lambda.invoke({ user, registration: fixture('registration'), samlResponse });
}

test('fills in the profile from single-valued attributes', () => {
  const { user, registration } = run(fixture('samlv2-reconcile/saml-response'));
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
  assert.equal(registration.data.department, 'Engineering');
  assert.equal(registration.data.favoriteColor, 'blue');
});

test('assigns roles from mapped groups and drops the rest', () => {
  assert.deepEqual(run(fixture('samlv2-reconcile/saml-response')).registration.roles, ['admin']);
});

test('leaves the roles and saved values unchanged when attributes are missing', () => {
  const { user, registration } = run(withAttributes({}), fixture('user'));
  assert.deepEqual(registration.roles, ['user']);
  assert.equal(user.firstName, 'Richard');
  assert.equal(registration.data.department, undefined);
});

test('handles a response with no attributes', () => {
  const { registration } = run(withAttributes(undefined));
  assert.deepEqual(registration.roles, ['user']);
});

test('removes all roles when the user belongs to no mapped group', () => {
  assert.deepEqual(run(withAttributes({ groups: ['All Staff'] })).registration.roles, []);
});
