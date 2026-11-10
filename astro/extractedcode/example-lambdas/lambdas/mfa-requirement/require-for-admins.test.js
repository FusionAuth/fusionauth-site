import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const mfaRequiredGroup = { groupId: 'replace-with-your-mfa-group-id', id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', data: {} };

function run(user, registration = fixture('registration')) {
  const lambda = loadLambdaFile(new URL('./require-for-admins.js', import.meta.url), 'MFARequirement');
  return lambda.invoke(
    { result: { required: false, sendSuspiciousLoginEvent: false }, user, registration },
    { context: fixture('mfa-requirement/context') },
  ).result.required;
}

test('challenges a member of the mfa_required group', () => {
  assert.equal(run(fixture('user', { memberships: [mfaRequiredGroup] })), true);
});

test('challenges a user with an admin role', () => {
  assert.equal(run(fixture('user'), fixture('registration', { roles: ['user', 'admin'] })), true);
});

test('keeps the default decision for everyone else', () => {
  assert.equal(run(fixture('user')), false);
});

test('handles a request without a registration', () => {
  assert.equal(run(fixture('user'), undefined), false);
  assert.equal(run(fixture('user', { memberships: [mfaRequiredGroup] }), undefined), true);
});
