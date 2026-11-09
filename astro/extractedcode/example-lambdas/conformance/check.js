// runs the conformance lambdas in a real FusionAuth and in the harness, then fails on any difference
// usage: node conformance/check.js   (FusionAuth from docker-compose.yml must be running with the kickstart)
// client credentials needs a license, and token exchange needs an Enterprise license
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { runLambda, networkError, lambdaTypes } from '../harness/index.js';

const baseUrl = process.env.FUSIONAUTH_URL ?? 'http://localhost:9011';
const kickstart = JSON.parse(readFileSync(new URL('../kickstart/kickstart.json', import.meta.url), 'utf8')).variables;
const source = readFileSync(new URL('./conformance-lambda.js', import.meta.url), 'utf8');
const secretValue = 'conformance-secret-value';
const lambdaId = '3a9b8c27-7b5e-4a0f-9a59-6d0c1c6a1f10';
const probeSource = readFileSync(new URL('./probe-lambda.js', import.meta.url), 'utf8');
const contextProbeSource = readFileSync(new URL('./context-probe.js', import.meta.url), 'utf8');
const clientSecret = 'conformance-client-secret';
const ids = {
  idTokenLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e51',
  userInfoLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e52',
  clientCredentialsLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e53',
  tokenExchangeLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e54',
  loginValidationLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e55',
  mfaRequirementLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e56',
  tokenExchangePolicyLambda: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e57',
  entityType: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e61',
  targetEntity: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e62',
  recipientEntity: '5d0c2f4e-1a3b-4c5d-8e9f-0a1b2c3d4e63',
};

async function api(method, path, body) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: { Authorization: kickstart.apiKey, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} returned ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function form(path, params, headers = {}) {
  const response = await fetch(baseUrl + path, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers }, body: new URLSearchParams(params) });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`POST ${path} returned ${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const basic = (id, secret) => ({ Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}` });
const claimsOf = (token) => JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());

async function exists(path) {
  const response = await fetch(baseUrl + path, { headers: { Authorization: kickstart.apiKey } });
  return response.ok;
}

async function realRun() {
  if (!await exists(`/api/lambda/${lambdaId}`)) {
    await api('POST', '/api/key/import', { key: { type: 'Secret', name: 'conformance-secret', secret: secretValue } });
    await api('POST', `/api/lambda/${lambdaId}`, { lambda: { name: 'Conformance', type: 'JWTPopulate', body: source, debug: false } });
    await api('PATCH', `/api/application/${kickstart.applicationId}`, { application: { lambdaConfiguration: { accessTokenPopulateId: lambdaId } } });
  } else {
    await api('PATCH', `/api/lambda/${lambdaId}`, { lambda: { body: source } });
  }

  // the application change can take a moment to reach the login path, and event log writes trail the response
  for (let n = 0; n < 20; n++) {
    const start = Date.now();
    const login = await api('POST', '/api/login', { applicationId: kickstart.applicationId, loginId: kickstart.userEmail, password: kickstart.userPassword });
    const jwt = JSON.parse(Buffer.from(login.token.split('.')[1], 'base64url').toString());
    if (jwt.conformance) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { eventLogs = [] } = await api('POST', '/api/system/event-log/search', { search: { message: `*${lambdaId}*`, type: 'Information', start, numberOfResults: 1 } });
      if (eventLogs.length) {
        return { jwt, info: eventLogs[0].message.split('\n\n').slice(2).join('\n\n'), user: login.user };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('The conformance lambda did not run, or wrote no event log entry.');
}

function harnessRun(realUser, licensed) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = {
    applicationId: kickstart.applicationId, aud: kickstart.applicationId, auth_time: now, authenticationType: 'PASSWORD', exp: now + 3600, iat: now,
    iss: 'https://example.com', jti: '2facf475-9e15-41c4-9c39-02026dc9bd28', roles: [], sub: realUser.id, tid: realUser.tenantId, tty: 'at',
  };
  const result = runLambda(source, 'JWTPopulate', { jwt, user: realUser, registration: realUser.registrations[0] }, {
    licensed,
    // the Login API requests no scopes
    context: { scopes: [], application: {} },
    secrets: { 'conformance-secret': secretValue },
    fetch: [
      { url: 'http://localhost:9011/.well-known/openid-configuration', response: { headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: { issuer: 'acme.com' } } },
      { url: 'http://localhost:1/', respond: networkError },
    ],
  });
  return { jwt: result.jwt, info: result.logs.info, user: realUser };
}

function observed({ jwt, info, user }) {
  return {
    conformance: jwt.conformance,
    dateClaim: jwt.dateClaim,
    undefinedClaim: 'undefinedClaim' in jwt,
    functionClaim: 'functionClaim' in jwt,
    nullClaim: 'nullClaim' in jwt,
    deletedClaimKept: jwt.applicationId === kickstart.applicationId,
    nulledClaimRemoved: !('roles' in jwt),
    reservedClaimKept: jwt.sub === user.id,
    expKept: typeof jwt.exp,
    info,
  };
}

// creates or updates a probe lambda that also changes the claims the harness reserves for the type
async function putProbe(id, type) {
  const body = `${probeSource}\nvar alsoChange = ${JSON.stringify(lambdaTypes[type].reservedClaims)};\n`;
  if (await exists(`/api/lambda/${id}`)) {
    await api('PATCH', `/api/lambda/${id}`, { lambda: { body } });
  } else {
    await api('POST', `/api/lambda/${id}`, { lambda: { name: `Conformance ${type}`, type, body } });
  }
  return body;
}

async function putIfMissing(path, body) {
  if (!await exists(path)) {
    await api('POST', path, body);
  }
}

// FusionAuth caches configuration, so retry until the lambda output shows up
async function untilProbed(read) {
  let lastError;
  for (let n = 0; n < 20; n++) {
    try {
      const claims = await read();
      if (claims.probe) {
        return claims;
      }
    } catch (error) {
      // a request can fail until the new grant or lambda settings reach the cache
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw lastError ?? new Error('A probe lambda did not run.');
}

// FusionAuth leaves out empty fields, so the check only fails on fields that lambda-types.js doesn't list
function assertDocumentedContext(name, type, keys) {
  const undocumented = keys.filter((key) => key !== 'services' && !(lambdaTypes[type].context ?? []).includes(key));
  assert.deepEqual(undocumented, [], `${name}: FusionAuth passed context fields that lambda-types.js doesn't list for ${type}. Document the fields, then add them to lambda-types.js.`);
}

async function putContextProbe(id, type) {
  if (await exists(`/api/lambda/${id}`)) {
    await api('PATCH', `/api/lambda/${id}`, { lambda: { body: contextProbeSource } });
  } else {
    await api('POST', `/api/lambda/${id}`, { lambda: { name: `Conformance ${type} context`, type, body: contextProbeSource } });
  }
}

// repeats the request until the context probe logs, because FusionAuth caches configuration and event log writes trail the response
async function loggedContext(name, type, id, request) {
  for (let n = 0; n < 20; n++) {
    const start = Date.now();
    // the probe makes no decision, so a token exchange fails after the probe logs
    await request().catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { eventLogs = [] } = await api('POST', '/api/system/event-log/search', { search: { message: `*${id}*`, type: 'Information', start, numberOfResults: 1 } });
    const logged = eventLogs.length && eventLogs[0].message.match(/context: (\[.*\])/);
    if (logged) {
      const keys = JSON.parse(logged[1]);
      assertDocumentedContext(name, type, keys);
      console.log(`${name}: FusionAuth passed only context fields in lambda-types.js: ${keys.join(', ')}.`);
      return;
    }
  }
  throw new Error(`${name}: the context probe did not run, or wrote no event log entry.`);
}

// runs the same probe in the harness with the arguments FusionAuth passed, then compares everything the lambda returned
function compareProbe(name, type, body, real, extraArgs = {}) {
  const definition = lambdaTypes[type];
  const args = { [definition.args[0].name]: real.probe.input, ...extraArgs };
  definition.args.slice(1).forEach((arg, n) => { args[arg.name] = real.probe.others[n]; });
  assertDocumentedContext(name, type, Object.keys(real.probe.context));
  const harness = runLambda(body, type, args, { context: real.probe.context })[definition.args[0].name];
  assert.deepEqual(harness, real, `${name}: the harness and FusionAuth disagree. The diff shows the harness first.`);
  console.log(`${name}: the harness matches FusionAuth.`);
}

async function probes(licensed) {
  const idTokenBody = await putProbe(ids.idTokenLambda, 'JWTPopulate');
  const userInfoBody = await putProbe(ids.userInfoLambda, 'UserInfoPopulate');
  const { application } = await api('PATCH', `/api/application/${kickstart.applicationId}`, { application: {
    oauthConfiguration: { enabledGrants: ['password', 'refresh_token'] },
    lambdaConfiguration: { idTokenPopulateId: ids.idTokenLambda, userinfoPopulateId: ids.userInfoLambda },
  } });
  const passwordGrant = () => form('/oauth2/token', {
    grant_type: 'password', client_id: kickstart.applicationId, client_secret: application.oauthConfiguration.clientSecret,
    username: kickstart.userEmail, password: kickstart.userPassword, scope: 'openid email profile',
  });

  compareProbe('JWT populate (id token)', 'JWTPopulate', idTokenBody, await untilProbed(async () => claimsOf((await passwordGrant()).id_token)));

  const userInfo = await untilProbed(async () => {
    const response = await fetch(`${baseUrl}/oauth2/userinfo`, { headers: { Authorization: `Bearer ${(await passwordGrant()).access_token}` } });
    return response.json();
  });
  compareProbe('UserInfo populate', 'UserInfoPopulate', userInfoBody, userInfo);

  const { tenants } = await api('GET', '/api/tenant');
  const tenantId = tenants[0].id;
  const login = () => api('POST', '/api/login', { applicationId: kickstart.applicationId, loginId: kickstart.userEmail, password: kickstart.userPassword });
  await putContextProbe(ids.loginValidationLambda, 'LoginValidation');
  await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { lambdaConfiguration: { loginValidationId: ids.loginValidationLambda } } });
  await loggedContext('Login validation', 'LoginValidation', ids.loginValidationLambda, login);

  if (!licensed) {
    console.log('Skipping the client credentials, MFA requirement, and token exchange probes, which need a license.');
    return;
  }

  await putContextProbe(ids.mfaRequirementLambda, 'MFARequirement');
  const mfaLicensed = await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { lambdaConfiguration: { multiFactorRequirementId: ids.mfaRequirementLambda } } }).then(() => true, (e) => {
    console.log(`Skipping the MFA requirement probe, which needs an Enterprise license: ${e.message}`);
  });
  if (mfaLicensed) {
    await loggedContext('MFA requirement', 'MFARequirement', ids.mfaRequirementLambda, login);
  }

  await putIfMissing(`/api/entity/type/${ids.entityType}`, { entityType: { name: 'Conformance Service', permissions: [{ name: 'read' }] } });
  await putIfMissing(`/api/entity/${ids.targetEntity}`, { entity: { name: 'Conformance Target', clientId: 'conformance-target', clientSecret, type: { id: ids.entityType } } });
  await putIfMissing(`/api/entity/${ids.recipientEntity}`, { entity: {
    name: 'Conformance Recipient', clientId: 'conformance-recipient', clientSecret, actAsTokenExchangeClient: true, type: { id: ids.entityType },
  } });
  await api('POST', `/api/entity/${ids.targetEntity}/grant`, { grant: { recipientEntityId: ids.recipientEntity, permissions: ['read'] } });

  const clientCredentialsBody = await putProbe(ids.clientCredentialsLambda, 'ClientCredentialsJWTPopulate');
  await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { oauthConfiguration: { clientCredentialsAccessTokenPopulateLambdaId: ids.clientCredentialsLambda } } });
  compareProbe('Client credentials JWT populate', 'ClientCredentialsJWTPopulate', clientCredentialsBody, await untilProbed(async () => claimsOf((await form('/oauth2/token', {
    grant_type: 'client_credentials', scope: `target-entity:${ids.targetEntity}:read`,
  }, basic('conformance-recipient', clientSecret))).access_token)));

  const tokenExchangeBody = await putProbe(ids.tokenExchangeLambda, 'TokenExchangePopulate');
  try {
    await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { tokenExchangeConfiguration: { enabled: true, policyEngine: 'ENTITY', populateLambdaId: ids.tokenExchangeLambda } } });
  } catch (e) {
    console.log(`Skipping the token exchange probe, which needs an Enterprise license: ${e.message}`);
    return;
  }
  const exchange = async () => form('/oauth2/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange', audience: 'conformance-target',
    subject_token: (await passwordGrant()).access_token, subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  }, basic('conformance-recipient', clientSecret));
  compareProbe('Token exchange populate', 'TokenExchangePopulate', tokenExchangeBody, await untilProbed(async () => claimsOf((await exchange()).access_token)));

  await putContextProbe(ids.tokenExchangePolicyLambda, 'TokenExchangePolicy');
  await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { tokenExchangeConfiguration: { policyEngine: 'LAMBDA', policyEngineLambdaId: ids.tokenExchangePolicyLambda } } });
  try {
    await loggedContext('Token exchange policy', 'TokenExchangePolicy', ids.tokenExchangePolicyLambda, exchange);
  } finally {
    // the probe denies every exchange, so put the populate probe's engine back for the next run
    await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { tokenExchangeConfiguration: { policyEngine: 'ENTITY' } } });
  }
}

const realResult = await realRun();
const real = observed(realResult);
assertDocumentedContext('JWT populate (access token)', 'JWTPopulate', real.conformance.context.keys);
// an unlicensed instance answers fetch() with 402, so the harness runs in the same mode
const harness = observed(harnessRun(realResult.user, real.conformance.fetch.status !== 402));

console.log(JSON.stringify(real, null, 2));
assert.deepEqual(harness, real, 'The harness and FusionAuth disagree. The diff shows the harness first.');
console.log('JWT populate (runtime): the harness matches FusionAuth.');

await probes(real.conformance.fetch.status !== 402);
