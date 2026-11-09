import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile, networkError } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const orgsApi = {
  url: 'https://api.github.com/user/orgs',
  response: { body: [{ id: 1, login: 'piedpiper' }, { id: 2, login: 'hooli-alumni' }] },
};

function run(jwt, fetch = [orgsApi]) {
  const lambda = loadLambdaFile(new URL('./github-profile-and-org-roles.js', import.meta.url), 'OpenIDReconcile', { fetch });
  return lambda.invoke({ user: fixture('user'), registration: fixture('registration'), jwt, id_token: null, tokens: { access_token: 'gho_test' } });
}

test('fills in the profile from GitHub', () => {
  const { user, registration } = run(fixture('openid-reconcile/github-user'));
  assert.equal(user.imageUrl, 'https://avatars.githubusercontent.com/u/5843210?v=4');
  assert.equal(registration.username, 'rhendricks');
  assert.equal(user.data.company, 'piedpiper');
  assert.equal(user.data.location, 'Palo Alto, CA');
});

test('handles a profile with no name, company, or location', () => {
  const { user } = run(fixture('openid-reconcile/github-user', { name: null, company: null, location: null }));
  assert.equal(user.fullName, undefined);
  assert.deepEqual(user.data, { plan: 'pro', department: 'Engineering' });
});

test('assigns roles from GitHub organizations with the access token', () => {
  const { registration, requests } = run(fixture('openid-reconcile/github-user'));
  assert.deepEqual(registration.roles, ['employee']);
  assert.equal(requests[0].headers.Authorization[0], 'Bearer gho_test');
});

test('keeps the current roles when the GitHub call fails', () => {
  const { registration, logs } = run(fixture('openid-reconcile/github-user'), [{ url: orgsApi.url, response: { status: 403 } }]);
  assert.deepEqual(registration.roles, ['user']);
  assert.match(logs.error, /status 403/);
});

test('keeps the current roles when GitHub is unreachable', () => {
  const { registration, logs } = run(fixture('openid-reconcile/github-user'), [{ url: orgsApi.url, respond: networkError }]);
  assert.deepEqual(registration.roles, ['user']);
  assert.match(logs.error, /status -1/);
});
