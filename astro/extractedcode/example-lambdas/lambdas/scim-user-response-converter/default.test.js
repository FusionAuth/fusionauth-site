import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
const userId = '2819c223-7f76-453a-919d-413861904600';

function requestConvert(scimUser) {
  const lambda = loadLambdaFile(new URL('../scim-user-request-converter/default.js', import.meta.url), 'SCIMServerUserRequestConverter');
  return lambda.invoke({
    user: fixture('scim-user-request-converter/new-user'),
    options: fixture('scim-user-request-converter/options'),
    scimUser,
  }).user;
}

function responseConvert(user, scimUser = fixture('scim-user-response-converter/scim-user')) {
  const lambda = loadLambdaFile(new URL('./default.js', import.meta.url), 'SCIMServerUserResponseConverter');
  return lambda.invoke({ scimUser, user }).scimUser;
}

test('round trips a user through the request and response converters', () => {
  const original = fixture('scim-user-request-converter/scim-user');
  const scimUser = responseConvert({ ...requestConvert(original), id: userId });
  assert.equal(scimUser.id, userId);
  assert.equal(scimUser.userName, original.userName);
  assert.deepEqual(scimUser.name, original.name);
  assert.deepEqual(scimUser.emails, [{ primary: true, value: 'richard@piedpiper.com', type: 'work' }]);
  assert.deepEqual(scimUser.phoneNumbers, [{ primary: true, value: '303-555-1234', type: 'mobile' }]);
  assert.deepEqual(scimUser[enterpriseSchema], original[enterpriseSchema]);
});

test('keeps the attributes FusionAuth fills in', () => {
  const prefilled = fixture('scim-user-response-converter/scim-user');
  const scimUser = responseConvert({ ...requestConvert(fixture('scim-user-request-converter/scim-user')), id: userId });
  assert.deepEqual(scimUser.meta, prefilled.meta);
  assert.deepEqual(scimUser.schemas, prefilled.schemas);
});

test('returns a phone number entry with no value when the user has no mobile phone', () => {
  const scimUser = responseConvert({ id: userId, active: true, username: 'dinesh', email: 'dinesh@piedpiper.com', data: {} });
  assert.deepEqual(scimUser.phoneNumbers, [{ primary: true, type: 'mobile' }]);
});
