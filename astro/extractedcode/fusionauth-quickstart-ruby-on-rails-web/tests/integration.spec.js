const { test, expect } = require('@playwright/test');

test('FusionAuth admin login', async ({ page }) => {
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.locator('body')).toContainText('admin@example.com');
  } catch (error) {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    console.log('Page HTML:', await page.content());
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
    throw error;
  }
});

test('App OAuth login via FusionAuth', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: /Login to manage your account/i })).toBeVisible();

  await page.getByRole('button', { name: /Login/i }).click();

  await page.waitForURL(/localhost:9011/);

  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL(/localhost:3000/);

  await expect(page.getByRole('heading', { name: /Welcome Richard/i })).toBeVisible();
  await expect(page.getByText('richard@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: /Logout/i })).toBeVisible();
});
