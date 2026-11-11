import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(registration, userInfo = fixture('sony-psn-reconcile/token-info')) {
  const lambda = loadLambdaFile(new URL('./account.js', import.meta.url), 'SonyPSNReconcile');
  return lambda.invoke({ user: fixture('user', { preferredLanguages: [] }), registration, userInfo });
}

test('stores the PSN account and language', () => {
  const { user, registration } = run(fixture('registration'));
  assert.deepEqual(user.data.psn, { onlineId: 'PiedPiper_PSN', accountUuid: '1e4b7f2a-9c3d-4e5f-8a6b-7c8d9e0f1a2b', country: 'US', subAccount: false });
  assert.deepEqual(user.preferredLanguages, ['en']);
  assert.deepEqual(registration.roles, ['user']);
});

test('restricts a sub account', () => {
  const { registration } = run(fixture('registration'), fixture('sony-psn-reconcile/token-info', { is_sub_account: true }));
  assert.deepEqual(registration.roles, ['user', 'restricted']);
});

test('lifts the restriction once a parent upgrades the account', () => {
  const { registration } = run(fixture('registration', { roles: ['user', 'restricted'] }));
  assert.deepEqual(registration.roles, ['user']);
});

test('updates the user when there is no registration', () => {
  const { user, registration } = run(null);
  assert.equal(user.data.psn.onlineId, 'PiedPiper_PSN');
  assert.equal(registration, null);
});
