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

test('Vue app login, save a note, and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/');

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/localhost:9011/, { timeout: 15000 });
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:3000\/account/, { timeout: 15000 });
    await expect(page.getByText('richard@example.com')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Your note' })).toBeVisible();
    await expect(page.locator('textarea')).toHaveValue('Hello Richard! This note is yours alone.');
    await page.locator('textarea').fill('Pied Piper ideas');
    await page.getByRole('button', { name: 'Save note' }).click();
    await expect(page.getByText('Saved')).toBeVisible();
    await page.reload();
    await expect(page.locator('textarea')).toHaveValue('Pied Piper ideas');

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('http://localhost:3000/', { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
