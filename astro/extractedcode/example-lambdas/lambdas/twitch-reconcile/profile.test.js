import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, userInfo = fixture('twitch-reconcile/userinfo')) {
  const lambda = loadLambdaFile(new URL('./profile.js', import.meta.url), 'TwitchReconcile');
  return lambda.invoke({ user, registration: fixture('registration'), userInfo });
}

test('stores the Twitch account and avatar', () => {
  const { user } = run(fixture('user'));
  assert.deepEqual(user.data.twitch, { id: '713936733', login: 'piedpiper', emailVerified: true });
  assert.equal(user.data.department, 'Engineering');
  assert.match(user.imageUrl, /profile_image/);
});

test('records an unverified email and leaves the image alone without a picture', () => {
  const { picture, ...info } = fixture('twitch-reconcile/userinfo', { email_verified: false });
  const { user } = run({ data: {}, imageUrl: 'https://example.com/me.png' }, info);
  assert.equal(user.data.twitch.emailVerified, false);
  assert.equal(user.imageUrl, 'https://example.com/me.png');
});
