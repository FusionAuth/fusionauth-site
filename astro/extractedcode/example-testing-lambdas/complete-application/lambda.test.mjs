import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadLambda } from './harness/index.js';

// the file that npx fusionauth lambda:retrieve downloaded
const file = new URL('./lambdas/f3b3b547-7754-452d-8729-21b50d111505.json', import.meta.url);
const { body, type } = JSON.parse(readFileSync(file, 'utf8'));
const lambda = loadLambda(body, type);

function populate(registration) {
  return lambda.invoke({ jwt: {}, user: { email: 'richard@example.com' }, registration }).jwt;
}

function registrationWith(roles) {
  return { applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e', roles };
}

test('sets the updated message', () => {
  assert.equal(populate(registrationWith([])).message, 'Goodbye World!');
});

test('admins get all permissions', () => {
  assert.deepEqual(populate(registrationWith(['admin', 'viewer'])).permissions, ['all']);
});

test('editors can read and write', () => {
  assert.deepEqual(populate(registrationWith(['editor'])).permissions, ['read', 'write']);
});

test('users without a registration get no permissions', () => {
  assert.deepEqual(populate(null).permissions, []);
});
