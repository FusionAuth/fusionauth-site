import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const lambda = loadLambdaFile(new URL('./profile-and-language.js', import.meta.url), 'LinkedInReconcile');

function run(linkedInUser, user = fixture('user', { firstName: undefined, lastName: undefined })) {
  return lambda.invoke({ user, registration: fixture('registration'), linkedInUser });
}

test('fills in the profile from the OpenID Connect format', () => {
  const { user } = run(fixture('linkedin-reconcile/linkedin-user'));
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
  assert.match(user.imageUrl, /profile-displayphoto/);
});

test('fills in the name from the legacy profile format', () => {
  const { user } = run({ id: 'yrZCpj2Z12', localizedFirstName: 'Richard', localizedLastName: 'Hendricks' });
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
});

test('sets the preferred language from a string or object locale', () => {
  assert.deepEqual(run(fixture('linkedin-reconcile/linkedin-user')).user.preferredLanguages, ['en']);
  const objectLocale = fixture('linkedin-reconcile/linkedin-user', { locale: { country: 'FR', language: 'fr' } });
  assert.deepEqual(run(objectLocale).user.preferredLanguages, ['fr']);
});

test('keeps a language the user already chose', () => {
  const { user } = run(fixture('linkedin-reconcile/linkedin-user'), fixture('user', { preferredLanguages: ['de'] }));
  assert.deepEqual(user.preferredLanguages, ['de']);
});

test('handles a missing locale', () => {
  assert.deepEqual(run(fixture('linkedin-reconcile/linkedin-user', { locale: undefined })).user.preferredLanguages, []);
});
