const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');

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

test('Lambda exists with correct configuration', async ({ request }) => {
  const response = await request.get(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(response.ok()).toBeTruthy();
  const { lambda } = await response.json();
  expect(lambda.name).toBe('[ATest]');
  expect(lambda.type).toBe('JWTPopulate');
  expect(lambda.engineType).toBe('GraalJS');
  expect(lambda.debug).toBe(true);
  expect(lambda.body).toContain('Hello World!');
});

test('Application has lambda configured for access token populate', async ({ request }) => {
  const response = await request.get(`${FA_URL}/api/application/${APP_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(response.ok()).toBeTruthy();
  const { application } = await response.json();
  expect(application.lambdaConfiguration.accessTokenPopulateId).toBe(LAMBDA_ID);
});

test('App OIDC login via FusionAuth triggers lambda', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await page.goto('http://localhost:3000');
    await page.getByRole('link', { name: /Login/i }).click();
    await page.waitForURL(/localhost:9011/);
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/localhost:3000/);
    await expect(page.getByText('Hello Richard')).toBeVisible();
  }
  catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Update lambda via API and verify', async ({ request }) => {
  const getResponse = await request.get(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(getResponse.ok()).toBeTruthy();
  const { lambda } = await getResponse.json();

  const updatedLambda = {
    ...lambda,
    body: lambda.body.replaceAll('Hello World!', 'Goodbye World!')
  };

  const putResponse = await request.put(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY },
    data: { lambda: updatedLambda }
  });
  expect(putResponse.ok()).toBeTruthy();

  const verifyResponse = await request.get(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(verifyResponse.ok()).toBeTruthy();
  const { lambda: verifiedLambda } = await verifyResponse.json();
  expect(verifiedLambda.body).toContain('Goodbye World!');
  expect(verifiedLambda.body).not.toContain('Hello World!');
});

test('App OIDC login still works after lambda update', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await page.goto('http://localhost:3000');
    await page.getByRole('link', { name: /Login/i }).click();
    await page.waitForURL(/localhost:9011/);
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/localhost:3000/);
    await expect(page.getByText('Hello Richard')).toBeVisible();
  }
  catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('test_1.js: login returns JWT with "Goodbye World"', async ({ request }) => {
  // FusionAuth's lambda cache does not always invalidate synchronously after a PUT
  // (confirmed: an immediate login can still run the pre-update lambda body for a few
  // seconds). Poll a real login until it reflects the "Goodbye World" update from the
  // previous test before running test_1.js, so this test isn't racing that cache.
  await expect(async () => {
    const loginResponse = await request.post(`${FA_URL}/api/login`, {
      headers: { 'Authorization': API_KEY },
      data: { applicationId: APP_ID, loginId: 'richard@example.com', password: 'password' }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();
    const [, payload] = token.split('.');
    const { message } = JSON.parse(Buffer.from(payload, 'base64').toString());
    expect(message).toBe('Goodbye World!');
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });

  const output = execSync('node test_1.js', {
    cwd: '/app',
    encoding: 'utf-8',
    timeout: 30000
  });
  console.log(output);

  const expectedPattern = new RegExp([
    '^TAP version 13',
    '# test login returns JWT with "Goodbye World"',
    'User [0-9a-f-]+ created successfully',
    'ok 1 should be truthy',
    'User [0-9a-f-]+ deleted successfully',
    '',
    '1..1',
    '# tests 1',
    '# pass  1',
    '',
    '# ok',
    ''
  ].join('\\n'));
  expect(output).toMatch(expectedPattern);
});

test('test_2.js: unit test mocks external service', async () => {
  const output = execSync('node test_2.js', {
    cwd: '/app',
    encoding: 'utf-8',
    timeout: 30000
  });
  console.log(output);

  const expectedPattern = new RegExp([
    '^TAP version 13',
    '# test lambda rejects sanctioned emails and accepts others',
    'ok 1 Check North Korea email banned',
    'ok 2 Check Canada email allowed',
    '',
    '1..2',
    '# tests 2',
    '# pass  2',
    '',
    '# ok',
    ''
  ].join('\\n'));
  expect(output).toMatch(expectedPattern);
});

test('test_3.js: unit test populates JWT from FusionAuth', async ({ request }) => {
  const getResponse = await request.get(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY }
  });
  expect(getResponse.ok()).toBeTruthy();
  const { lambda } = await getResponse.json();

  const lambdaBody = `function populate(jwt, user, registration) {
  jwt.message = 'Goodbye World!';
  jwt.permissions = [];
  if (user.registrations[0].roles.includes("admin")) {
    jwt.permissions.push("all");
  } else if (user.registrations[0].roles.includes("editor")) {
    jwt.permissions.push("read");
    jwt.permissions.push("write");
  } else if (user.registrations[0].roles.includes("viewer")) {
    jwt.permissions.push("read");
  }
}`;

  const putResponse = await request.put(`${FA_URL}/api/lambda/${LAMBDA_ID}`, {
    headers: { 'Authorization': API_KEY },
    data: { lambda: { ...lambda, body: lambdaBody } }
  });
  expect(putResponse.ok()).toBeTruthy();

  const output = execSync('node test_3.js', {
    cwd: '/app',
    encoding: 'utf-8',
    timeout: 30000
  });
  console.log(output);

  const expectedPattern = new RegExp([
    '^TAP version 13',
    '# test lambda rejects returns permissions based on role',
    'ok 1 Check admin and viewer has all permissions',
    'ok 2 Check editor has write permission',
    'ok 3 Check editor has read permission',
    '',
    '1..3',
    '# tests 3',
    '# pass  3',
    '',
    '# ok',
    ''
  ].join('\\n'));
  expect(output).toMatch(expectedPattern);
});
