import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./birthday.js', import.meta.url), 'FacebookReconcile');

function run(facebookUser) {
  return lambda.invoke({ user: fixture('user', { birthDate: undefined }), registration: fixture('registration'), facebookUser });
}

test('fills in the profile and picture', () => {
  const { user } = run(fixture('facebook-reconcile/facebook-user'));
  assert.equal(user.middleName, 'Lee');
  assert.equal(user.fullName, 'Richard Lee Hendricks');
  assert.match(user.imageUrl, /profilepic/);
});

test('skips the placeholder picture', () => {
  const picture = { data: { is_silhouette: true, url: 'https://platform-lookaside.fbsbx.com/silhouette' } };
  assert.equal(run(fixture('facebook-reconcile/facebook-user', { picture })).user.imageUrl, undefined);
});

test('converts a full birthday to the birth date', () => {
  assert.equal(run(fixture('facebook-reconcile/facebook-user')).user.birthDate, '1990-05-17');
});

test('stores a birthday without a year in user data', () => {
  const { user } = run(fixture('facebook-reconcile/facebook-user', { birthday: '05/17' }));
  assert.equal(user.birthDate, undefined);
  assert.equal(user.data.birthday, '05-17');
});

test('stores a birth year without a day in user data', () => {
  const { user } = run(fixture('facebook-reconcile/facebook-user', { birthday: '1990' }));
  assert.equal(user.birthDate, undefined);
  assert.equal(user.data.birthYear, 1990);
});

test('handles a missing birthday', () => {
  const { user } = run(fixture('facebook-reconcile/facebook-user', { birthday: undefined }));
  assert.equal(user.birthDate, undefined);
  assert.deepEqual(user.data, { plan: 'pro', department: 'Engineering' });
});
