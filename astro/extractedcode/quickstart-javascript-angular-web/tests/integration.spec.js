const { test, expect } = require('@playwright/test');

function trackPageDiagnostics(page) {
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  return async () => {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    try {
      console.log('Page HTML:', await page.content());
    } catch (contentError) {
      console.log('Page HTML: <unavailable, page/context already closed>', contentError.message);
    }
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
  };
}

async function loginAsRichard(page) {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/localhost:9011/, { timeout: 15000 });
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL('http://localhost:3000/account', { timeout: 15000 });
  await expect(page.getByText('richard@example.com')).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Recent logins' })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('redirects logged-out users from /account to /', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/account');
    await page.waitForURL('http://localhost:3000/', { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('logs in via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await loginAsRichard(page);
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('redirects logged-in users from / to /account', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await loginAsRichard(page);
    await page.goto('http://localhost:3000/');
    await page.waitForURL('http://localhost:3000/account', { timeout: 15000 });
    await expect(page.getByText('richard@example.com')).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('fetches user info from the account page', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);
  try {
    await loginAsRichard(page);
    await page.getByRole('button', { name: 'Show your info' }).click();
    await expect(page.getByText('Richard Hendricks')).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
