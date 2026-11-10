import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./profile.js', import.meta.url), 'TwitterReconcile');

function run(twitterUser) {
  return lambda.invoke({ user: fixture('user'), registration: fixture('registration'), twitterUser });
}

test('fills in the profile, screen name, and location', () => {
  const { user, registration } = run(fixture('twitter-reconcile/twitter-user'));
  assert.equal(user.fullName, 'Richard Hendricks');
  assert.equal(registration.username, 'richardhendricks');
  assert.equal(user.data.location, 'Palo Alto, CA');
});

test('uses the original size of a profile image of any type', () => {
  assert.equal(run(fixture('twitter-reconcile/twitter-user')).user.imageUrl, 'https://pbs.twimg.com/profile_images/1450012345/richard.jpg');
  const png = fixture('twitter-reconcile/twitter-user', { profile_image_url_https: 'https://pbs.twimg.com/profile_images/1/a_normal.png' });
  assert.equal(run(png).user.imageUrl, 'https://pbs.twimg.com/profile_images/1/a.png');
});

test('skips the placeholder profile image', () => {
  assert.equal(run(fixture('twitter-reconcile/twitter-user', { default_profile_image: true })).user.imageUrl, undefined);
});

test('keeps the saved location when the user removes the location', () => {
  const { user } = run(fixture('twitter-reconcile/twitter-user', { location: '' }));
  assert.deepEqual(user.data, { plan: 'pro', department: 'Engineering' });
});
