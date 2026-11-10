import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, registration) {
  const lambda = loadLambdaFile(new URL('./attribute-mapping.js', import.meta.url), 'SAMLv2Populate');
  return lambda.invoke({ samlResponse: fixture('samlv2-populate/saml-response'), user, registration }).samlResponse;
}

test('replaces the default attributes with the mapped names', () => {
  const samlResponse = run(fixture('user'), fixture('registration', { roles: ['admin', 'user'] }));
  assert.deepEqual(samlResponse.assertion.attributes, {
    'User.Email': ['richard@example.com'],
    'User.FirstName': ['Richard'],
    'User.LastName': ['Hendricks'],
    'User.Department': ['Engineering'],
    'User.Groups': ['admin', 'user'],
  });
  assert.deepEqual(samlResponse.assertion.subject, fixture('samlv2-populate/saml-response').assertion.subject);
});

test('leaves out attributes with no value', () => {
  const user = fixture('user', { data: {} });
  delete user.lastName;
  const { attributes } = run(user, null).assertion;
  assert.deepEqual(Object.keys(attributes), ['User.Email', 'User.FirstName']);
});
