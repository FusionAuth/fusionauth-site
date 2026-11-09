import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, registration) {
  const lambda = loadLambdaFile(new URL('./locale.js', import.meta.url), 'JWTPopulate');
  return lambda.invoke({ jwt: fixture('jwt'), user, registration }, { context: { scopes: [] } }).jwt.locale;
}

test('prefers the registration language', () => {
  const user = fixture('user', { preferredLanguages: ['de'] });
  assert.equal(run(user, fixture('registration', { preferredLanguages: ['fr_CA', 'en'] })), 'fr-CA');
});

test('falls back to the user language', () => {
  assert.equal(run(fixture('user', { preferredLanguages: ['pt_BR'] }), fixture('registration')), 'pt-BR');
  assert.equal(run(fixture('user', { preferredLanguages: ['de'] }), null), 'de');
});

test('defaults to en-US when no language is set', () => {
  assert.equal(run(fixture('user'), fixture('registration')), 'en-US');
});
