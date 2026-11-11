import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const newUser = { username: 'piedpiper', data: {} };

function run(user, userInfo = fixture('steam-reconcile/player-summaries')) {
  const lambda = loadLambdaFile(new URL('./profile.js', import.meta.url), 'SteamReconcile');
  return lambda.invoke({ user, registration: fixture('registration'), userInfo });
}

test('stores the Steam profile and avatar on a new user', () => {
  const { user } = run(newUser);
  assert.deepEqual(user.data.steam, { steamId: '76561197960435530', profileUrl: 'https://steamcommunity.com/id/piedpiper/', countryCode: 'US' });
  assert.match(user.imageUrl, /_full\.jpg$/);
  assert.equal(user.fullName, 'Richard Hendricks');
});

test('keeps existing user data and name', () => {
  const { user } = run(fixture('user', { fullName: 'Richard H.' }));
  assert.equal(user.data.plan, 'pro');
  assert.equal(user.data.steam.steamId, '76561197960435530');
  assert.equal(user.fullName, 'Richard H.');
});

test('handles a private profile without a real name or country', () => {
  const info = fixture('steam-reconcile/player-summaries');
  const { realname, loccountrycode, ...player } = info.response.players[0];
  const { user } = run(newUser, { response: { players: [{ ...player, communityvisibilitystate: 1 }] } });
  assert.equal(user.fullName, undefined);
  assert.equal('countryCode' in user.data.steam, false);
});
