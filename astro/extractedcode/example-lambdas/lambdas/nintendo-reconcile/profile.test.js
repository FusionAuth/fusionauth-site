import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, userInfo = fixture('nintendo-reconcile/me')) {
  const lambda = loadLambdaFile(new URL('./profile.js', import.meta.url), 'NintendoReconcile');
  return lambda.invoke({ user, registration: fixture('registration'), userInfo });
}

test('fills in a new user from the Nintendo Account', () => {
  const { user } = run({ data: {}, preferredLanguages: [] });
  assert.deepEqual(user.data.nintendo, { id: 'a1b2c3d4e5f60718', nickname: 'Richard', country: 'US' });
  assert.equal(user.birthDate, '1990-05-17');
  assert.deepEqual(user.preferredLanguages, ['en-US']);
});

test('keeps values the user already set', () => {
  const { user } = run(fixture('user', { birthDate: '1991-01-01', preferredLanguages: ['de'] }));
  assert.equal(user.data.plan, 'pro');
  assert.equal(user.birthDate, '1991-01-01');
  assert.deepEqual(user.preferredLanguages, ['de']);
});

test('handles a response with only an id', () => {
  const { user } = run({ data: {} }, { id: 'a1b2c3d4e5f60718' });
  assert.deepEqual(user.data.nintendo, { id: 'a1b2c3d4e5f60718' });
  assert.equal(user.birthDate, undefined);
});
