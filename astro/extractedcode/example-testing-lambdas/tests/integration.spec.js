const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const FA_URL = 'http://localhost:9011';
const API_KEY = 'lambda_testing_key';
const LAMBDA_ID = 'f3b3b547-7754-452d-8729-21b50d111505';
const APP_ID = 'E9FDB985-9173-4E01-9D73-AC2D60D1DC8E';

function trackPageDiagnostics(page) {
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', msg => {consoleMessages.push(`[${msg.type()}] ${msg.text()}`);});
  page.on('pageerror', err => {pageErrors.push(err.message);});
  return async () => {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    try {
      console.log('Page HTML:', await page.content());
    }
    catch (contentError) {
      console.log('Page HTML: <unavailable, page/context already closed>', contentError.message);
    }
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
  };
}

test('FusionAuth admin login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.getByRole('button', { name: 'admin@example.com' })).toBeVisible();
  }
  catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

async function loginClaims(request) {
  const response = await request.post(`${FA_URL}/api/login`, {
    headers: { 'Authorization': API_KEY },
    data: { applicationId: APP_ID, loginId: 'richard@example.com', password: 'password' }
  });
  expect(response.ok()).toBeTruthy();
  const { token } = await response.json();
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

function run(command) {
  const output = execSync(command, { cwd: '/app', encoding: 'utf-8', timeout: 60000 });
  console.log(output);
  return output;
}

test('Lambda exists with correct configuration', async ({ request }) => {
  const response = await request.get(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(response.ok()).toBeTruthy();
  const { lambda } = await response.json();
  expect(lambda.name).toBe('[ATest]');
  expect(lambda.type).toBe('JWTPopulate');
  expect(lambda.engineType).toBe('GraalJS');
  expect(lambda.body).toBe(readFileSync('/app/role-permissions.js', 'utf-8'));
});

test('Application has lambda configured for access token populate', async ({ request }) => {
  const response = await request.get(`${FA_URL}/api/application/${APP_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(response.ok()).toBeTruthy();
  const { application } = await response.json();
  expect(application.lambdaConfiguration.accessTokenPopulateId).toBe(LAMBDA_ID);
});

test('Login API returns a token with the message and permissions', async ({ request }) => {
  // the application settings can take a few seconds to reach the cache after test.sh assigns the lambda
  await expect(async () => {
    const claims = await loginClaims(request);
    expect(claims.message).toBe('Hello World!');
    expect(claims.roles).toEqual(['editor']);
    expect(claims.permissions).toEqual(['read', 'write']);
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
});

test('CLI round trip: retrieve, edit, unit test, and update the lambda', async ({ request }) => {
  run(`npx fusionauth lambda:retrieve ${LAMBDA_ID} --key ${API_KEY}`);
  const file = `/app/lambdas/${LAMBDA_ID}.json`;
  const lambda = JSON.parse(readFileSync(file, 'utf-8'));
  expect(lambda.body).toContain('Hello World!');
  writeFileSync(file, JSON.stringify({ ...lambda, body: lambda.body.replace('Hello World!', 'Goodbye World!') }, null, 2));

  const output = run('node --test --test-reporter=tap lambda.test.mjs');
  expect(output).toMatch(/^# pass 4$/m);
  expect(output).toMatch(/^# fail 0$/m);

  run(`npx fusionauth lambda:update ${LAMBDA_ID} --key ${API_KEY}`);
  // the lambda cache can serve the old body for a few seconds after an update
  await expect(async () => {
    expect((await loginClaims(request)).message).toBe('Goodbye World!');
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
});

test('test_1.js: the access token has the claims from the uploaded lambda', async () => {
  const output = run('node test_1.js');
  expect(output).toMatch(/^# pass {2}2$/m);
  expect(output).toMatch(/^# ok$/m);
});
