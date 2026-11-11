import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const coreSchema = 'urn:ietf:params:scim:schemas:core:2.0:User';
const enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
const userId = '2819c223-7f76-453a-919d-413861904600';

function requestConvert(scimUser) {
  const lambda = loadLambdaFile(new URL('../scim-user-request-converter/enterprise-fields.js', import.meta.url), 'SCIMServerUserRequestConverter');
  return lambda.invoke({
    user: fixture('scim-user-request-converter/new-user'),
    options: fixture('scim-user-request-converter/options'),
    scimUser,
  }).user;
}

function responseConvert(user, scimUser = fixture('scim-user-response-converter/scim-user')) {
  const lambda = loadLambdaFile(new URL('./enterprise-fields.js', import.meta.url), 'SCIMServerUserResponseConverter');
  return lambda.invoke({ scimUser, user }).scimUser;
}

test('round trips the enterprise attributes through both converters', () => {
  const original = fixture('scim-user-request-converter/scim-user');
  const scimUser = responseConvert({ ...requestConvert(original), id: userId });
  assert.deepEqual(scimUser[enterpriseSchema], original[enterpriseSchema]);
  assert.deepEqual(scimUser.name, original.name);
  assert.equal(scimUser.userName, original.userName);
  assert.equal(scimUser.active, true);
});

test('builds the manager reference from the user location', () => {
  const scimUser = responseConvert({ ...requestConvert(fixture('scim-user-request-converter/scim-user')), id: userId });
  assert.equal(scimUser[enterpriseSchema].manager.$ref,
    'https://login.piedpiper.com/api/scim/resource/v2/EnterpriseUsers/550f49a9-7697-4e73-95e6-08b50a864b03');
});

test('omits emails and phone numbers the user doesn\'t have', () => {
  const scimUser = responseConvert({ id: userId, active: true, username: 'dinesh', data: {} });
  assert.equal('emails' in scimUser, false);
  assert.equal('phoneNumbers' in scimUser, false);
});

test('omits the extension when the user has no enterprise data', () => {
  const prefilled = fixture('scim-user-response-converter/scim-user', { schemas: [coreSchema] });
  const scimUser = responseConvert({ id: userId, active: true, username: 'dinesh', data: {} }, prefilled);
  assert.equal(enterpriseSchema in scimUser, false);
  assert.deepEqual(scimUser.schemas, [coreSchema]);
});

test('adds the enterprise schema when the request came to the core endpoint', () => {
  const prefilled = fixture('scim-user-response-converter/scim-user', { schemas: [coreSchema] });
  const scimUser = responseConvert({ id: userId, active: true, data: { department: 'Engineering' } }, prefilled);
  assert.deepEqual(scimUser.schemas, [coreSchema, enterpriseSchema]);
  assert.deepEqual(scimUser[enterpriseSchema], { department: 'Engineering' });
});

test('keeps the attributes FusionAuth fills in', () => {
  const prefilled = fixture('scim-user-response-converter/scim-user');
  const scimUser = responseConvert({ ...requestConvert(fixture('scim-user-request-converter/scim-user')), id: userId });
  assert.equal(scimUser.id, prefilled.id);
  assert.equal(scimUser.externalId, prefilled.externalId);
  assert.deepEqual(scimUser.meta, prefilled.meta);
});
