import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';

function run(scimUser) {
  const lambda = loadLambdaFile(new URL('./default.js', import.meta.url), 'SCIMServerUserRequestConverter');
  return lambda.invoke({
    user: fixture('scim-user-request-converter/new-user'),
    options: fixture('scim-user-request-converter/options'),
    scimUser,
  });
}

test('copies the core SCIM attributes to the user', () => {
  const { user } = run(fixture('scim-user-request-converter/scim-user'));
  assert.equal(user.active, true);
  assert.equal(user.username, 'rhendricks');
  assert.equal(user.password, 'supersecret');
  assert.equal(user.email, 'richard@piedpiper.com');
  assert.equal(user.mobilePhone, '303-555-1234');
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.middleName, 'William');
  assert.equal(user.lastName, 'Hendricks');
  assert.equal(user.fullName, 'Mr. Richard Hendricks III');
  assert.equal(user.data.honorificPrefix, 'Mr.');
  assert.equal(user.data.honorificSuffix, 'III');
});

test('stores each extension under user.data.extensions', () => {
  const scimUser = fixture('scim-user-request-converter/scim-user');
  const { user } = run(scimUser);
  assert.deepEqual(user.data.extensions, { [enterpriseSchema]: scimUser[enterpriseSchema] });
});

test('leaves the email unset when no email is primary', () => {
  const { user } = run(fixture('scim-user-request-converter/scim-user', {
    emails: [{ primary: false, type: 'work', value: 'richard@piedpiper.com' }],
  }));
  assert.equal(user.email, undefined);
});

test('leaves the options unchanged', () => {
  const { options } = run(fixture('scim-user-request-converter/scim-user'));
  assert.deepEqual(options, fixture('scim-user-request-converter/options'));
});
