const { test, expect } = require('@playwright/test');

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
