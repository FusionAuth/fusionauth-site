import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, registration) {
  const lambda = loadLambdaFile(new URL('./passwordless.js', import.meta.url), 'HYPRReconcile');
  return lambda.invoke({ user, registration });
}

test('records the first HYPR login and adds the role', () => {
  const before = Date.now();
  const { user, registration } = run(fixture('user'), fixture('registration'));
  assert.equal(user.data.hypr.loginCount, 1);
  assert.ok(user.data.hypr.lastLoginInstant >= before);
  assert.equal(user.data.plan, 'pro');
  assert.deepEqual(registration.roles, ['user', 'passwordless']);
});

test('counts later logins without adding the role twice', () => {
  const user = fixture('user', { data: { hypr: { loginCount: 4, lastLoginInstant: 0 } } });
  const { user: out, registration } = run(user, fixture('registration', { roles: ['passwordless'] }));
  assert.equal(out.data.hypr.loginCount, 5);
  assert.deepEqual(registration.roles, ['passwordless']);
});

test('updates the user when there is no registration', () => {
  const { user, registration } = run(fixture('user'), null);
  assert.equal(user.data.hypr.loginCount, 1);
  assert.equal(registration, null);
});
