import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function xsts(agg) {
  const info = fixture('xbox-reconcile/xsts');
  info.DisplayClaims.xui[0].agg = agg;
  return info;
}

function run(registration, userInfo = xsts('Adult')) {
  const lambda = loadLambdaFile(new URL('./age-group.js', import.meta.url), 'XboxReconcile');
  return lambda.invoke({ user: fixture('user'), registration, userInfo });
}

test('stores the gamertag and leaves adult roles alone', () => {
  const { user, registration } = run(fixture('registration'));
  assert.deepEqual(user.data.xbox, { gamertag: 'PiedPiper', xuid: '2535405290012345', ageGroup: 'Adult' });
  assert.deepEqual(registration.roles, ['user']);
});

test('adds the restricted role for teens and children once', () => {
  for (const agg of ['Teen', 'Child']) {
    const { registration } = run(fixture('registration', { roles: ['user', 'restricted'] }), xsts(agg));
    assert.deepEqual(registration.roles, ['user', 'restricted']);
  }
});

test('removes the restricted role when the player becomes an adult', () => {
  const { registration } = run(fixture('registration', { roles: ['restricted'] }));
  assert.deepEqual(registration.roles, []);
});

test('updates the user when there is no registration', () => {
  const { user, registration } = run(null, xsts('Child'));
  assert.equal(user.data.xbox.ageGroup, 'Child');
  assert.equal(registration, null);
});
