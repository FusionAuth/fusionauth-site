import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./fallback-email.js', import.meta.url), 'OpenIDReconcile');

function run(jwt, id_token = null) {
  const user = fixture('user', { email: undefined });
  return lambda.invoke({ user, registration: fixture('registration'), jwt, id_token, tokens: { access_token: 'token' } });
}

test('creates an email address from the sub claim', () => {
  assert.equal(run({ sub: '248289761001' }).user.email, '248289761001@no-email-present.example.com');
});

test('leaves the email alone when the UserInfo response has one', () => {
  assert.equal(run({ sub: '248289761001', email: 'richard@example.com' }).user.email, undefined);
});

test('leaves the email alone when the id token has one', () => {
  assert.equal(run({ sub: '248289761001' }, { email: 'richard@example.com' }).user.email, undefined);
});
