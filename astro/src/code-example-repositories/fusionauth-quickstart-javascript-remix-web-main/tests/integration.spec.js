const { test, expect } = require('@playwright/test');

test('FusionAuth admin login', async ({ page }) => {
  await page.goto('http://localhost:9011/admin/');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('Login').fill('admin@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(/\/admin\//);
  await expect(page.getByRole('button', { name: 'admin@example.com' })).toBeVisible();
});

test('Remix app OAuth login via FusionAuth', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

  await page.getByRole('link', { name: /Login/i }).click();

  await page.waitForURL(/localhost:9011/);

  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL(/localhost:3000\/account/);

  await expect(page.getByText('richard@example.com')).toBeVisible();
  await expect(page.getByRole('link', { name: /Logout/i })).toBeVisible();

  await page.getByRole('link', { name: /Logout/i }).click();

  await page.waitForURL('http://localhost:3000/');
  await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
});
