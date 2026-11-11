import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

// the Epic accounts API returns an array with one account
function run(user, account = fixture('epic-games-reconcile/account')) {
  const lambda = loadLambdaFile(new URL('./account.js', import.meta.url), 'EpicGamesReconcile');
  return lambda.invoke({ user, registration: fixture('registration'), userInfo: [account] });
}

test('stores the Epic account and linked platforms', () => {
  const { user } = run({ data: {}, preferredLanguages: [] });
  assert.deepEqual(user.data.epic, { accountId: '8645b7c3a2b14d6c9a3a3a4f52a7c0de', displayName: 'PiedPiper', linkedPlatforms: ['steam', 'psn'] });
  assert.deepEqual(user.preferredLanguages, ['en']);
});

test('keeps a language the user already chose', () => {
  const { user } = run(fixture('user', { preferredLanguages: ['fr'] }));
  assert.deepEqual(user.preferredLanguages, ['fr']);
  assert.equal(user.data.plan, 'pro');
});

test('handles an account with no linked accounts', () => {
  const { linkedAccounts, ...account } = fixture('epic-games-reconcile/account');
  const { user } = run({ data: {} }, account);
  assert.deepEqual(user.data.epic.linkedPlatforms, []);
});
