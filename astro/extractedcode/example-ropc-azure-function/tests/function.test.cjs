// runs the function with b2c and graph mocked, since both need a real azure tenant
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

process.env.TENANT_NAME = 'exampletenant';
process.env.TENANT_ID = '00000000-0000-0000-0000-000000000000';
process.env.ROPC_FLOW_NAME = 'B2C_1_ropc';
process.env.ROPC_CLIENT_ID = 'ropc-client-id';

const AZURE_USER = {
  id: 'azure-user-id',
  accountEnabled: true,
  givenName: 'Richard',
  surname: 'Hendricks',
  displayName: 'Richard Hendricks',
  userPrincipalName: 'richard@exampletenant.onmicrosoft.com',
  createdDateTime: '2024-01-02T03:04:05Z',
  identities: [
    { signInType: 'userPrincipalName', issuerAssignedId: 'richard@exampletenant.onmicrosoft.com' },
    { signInType: 'emailAddress', issuerAssignedId: 'richard@example.com' },
  ],
};

// the function looks the user up in Microsoft Graph by the token's oid claim
const graphPath = require.resolve(path.join(__dirname, '../RopcProxyFunction/graph'));
let graphLookups = [];
require.cache[graphPath] = { id: graphPath, filename: graphPath, loaded: true,
  exports: { getUser: async (oid) => { graphLookups.push(oid); return AZURE_USER; } } };

let tokenRequests = [];
let tokenResponse;
global.fetch = async (url, options) => {
  tokenRequests.push({ url, options });
  return tokenResponse;
};

const jwt = require('jsonwebtoken');
const ropcProxy = require('../RopcProxyFunction');

async function run(body) {
  const context = { log() {} };
  await ropcProxy(context, { body });
  return context.res;
}

test.beforeEach(() => {
  tokenRequests = [];
  graphLookups = [];
});

test('a valid Azure AD B2C login returns the user in FusionAuth connector format', async () => {
  const accessToken = jwt.sign({ oid: 'azure-object-id' }, 'not-checked');
  tokenResponse = { ok: true, json: async () => ({ access_token: accessToken }) };

  const res = await run({ loginId: 'richard@example.com', password: 'password' });

  assert.equal(tokenRequests.length, 1);
  assert.equal(tokenRequests[0].url,
    'https://exampletenant.b2clogin.com/exampletenant.onmicrosoft.com/B2C_1_ropc/oauth2/v2.0/token');
  const sent = new URLSearchParams(tokenRequests[0].options.body);
  assert.equal(sent.get('grant_type'), 'password');
  assert.equal(sent.get('username'), 'richard@example.com');
  assert.equal(sent.get('password'), 'password');
  assert.equal(sent.get('client_id'), 'ropc-client-id');
  assert.equal(sent.get('scope'), 'openid ropc-client-id');
  assert.deepEqual(graphLookups, ['azure-object-id']);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.user, {
    id: 'azure-user-id',
    active: true,
    firstName: 'Richard',
    fullName: 'Richard Hendricks',
    lastName: 'Hendricks',
    username: 'richard@exampletenant.onmicrosoft.com',
    email: 'richard@example.com',
    verified: true,
    insertInstant: Date.parse('2024-01-02T03:04:05Z') / 1000,
    data: { azure: { identities: AZURE_USER.identities } },
  });
});

test('a refused Azure AD B2C login returns 404 with the B2C response', async () => {
  tokenResponse = { ok: false, text: async () => '{"error":"invalid_grant"}' };

  const res = await run({ loginId: 'richard@example.com', password: 'wrong' });

  assert.equal(res.status, 404);
  assert.equal(res.body, '{"error":"invalid_grant"}');
  assert.deepEqual(graphLookups, []);
});
