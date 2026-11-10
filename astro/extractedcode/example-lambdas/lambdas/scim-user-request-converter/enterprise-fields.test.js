import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
const scimUser = fixture('scim-user-request-converter/scim-user');

function run(input) {
  const lambda = loadLambdaFile(new URL('./enterprise-fields.js', import.meta.url), 'SCIMServerUserRequestConverter');
  return lambda.invoke({
    user: fixture('scim-user-request-converter/new-user'),
    options: fixture('scim-user-request-converter/options'),
    scimUser: input,
  });
}

test('copies the enterprise attributes to user.data', () => {
  const { user } = run(scimUser);
  assert.deepEqual(user.data, {
    honorificPrefix: 'Mr.',
    honorificSuffix: 'III',
    employeeNumber: '42',
    costCenter: '123',
    organization: 'Pied Piper',
    division: 'R&D',
    department: 'Engineering',
    managerId: '550f49a9-7697-4e73-95e6-08b50a864b03',
    managerName: 'Monica Hall',
  });
});

test('copies the core attributes to the user', () => {
  const { user } = run(scimUser);
  assert.equal(user.active, true);
  assert.equal(user.username, 'rhendricks');
  assert.equal(user.email, 'richard@piedpiper.com');
  assert.equal(user.mobilePhone, '303-555-1234');
  assert.equal(user.fullName, 'Mr. Richard Hendricks III');
});

test('registers the user with the employee portal', () => {
  const { options } = run(scimUser);
  assert.equal(options.applicationId, 'replace-with-your-employee-portal-application-id');
  assert.equal(options.sendSetPasswordEmail, false);
});

test('uses the first email and phone when none is primary', () => {
  const { user } = run(fixture('scim-user-request-converter/scim-user', {
    emails: [{ type: 'home', value: 'richard.personal@example.com' }, { type: 'work', value: 'richard@piedpiper.com' }],
    phoneNumbers: [{ type: 'work', value: '303-555-9876' }],
  }));
  assert.equal(user.email, 'richard.personal@example.com');
  assert.equal(user.mobilePhone, '303-555-9876');
});

test('treats a missing active value as active', () => {
  const input = fixture('scim-user-request-converter/scim-user');
  delete input.active;
  assert.equal(run(input).user.active, true);
  assert.equal(run({ ...input, active: false }).user.active, false);
});

test('skips empty enterprise attributes and a manager without a value', () => {
  const { user } = run(fixture('scim-user-request-converter/scim-user', {
    [enterpriseSchema]: { department: '', employeeNumber: '42', manager: { displayName: 'Monica Hall' } },
  }));
  assert.equal(user.data.employeeNumber, '42');
  assert.equal('department' in user.data, false);
  assert.equal('managerId' in user.data, false);
});

test('handles a core user with no name, email, phone, or extension', () => {
  const { user } = run({ schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'], userName: 'dinesh' });
  assert.equal(user.username, 'dinesh');
  assert.equal(user.email, undefined);
  assert.equal(user.mobilePhone, undefined);
  assert.equal(user.firstName, undefined);
  assert.deepEqual(user.data, {});
});
