import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function role(registration) {
  const lambda = loadLambdaFile(new URL('./zendesk-role.js', import.meta.url), 'SAMLv2Populate');
  const { samlResponse } = lambda.invoke({ samlResponse: fixture('samlv2-populate/saml-response'), user: fixture('user'), registration });
  return samlResponse.assertion.attributes.role;
}

test('sends admin when the user has both roles', () => {
  assert.deepEqual(role(fixture('registration', { roles: ['agent', 'admin'] })), ['admin']);
});

test('sends agent', () => {
  assert.deepEqual(role(fixture('registration', { roles: ['agent'] })), ['agent']);
});

test('sends no role for end users', () => {
  assert.equal(role(fixture('registration')), undefined);
  assert.equal(role(null), undefined);
});
