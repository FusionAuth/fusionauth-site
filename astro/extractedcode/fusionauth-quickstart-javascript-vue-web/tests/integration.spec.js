const { test, expect } = require('@playwright/test');


test('App OAuth login via FusionAuth', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

  await page.getByRole('button', { name: /Login/i }).click();

  await page.waitForURL(/localhost:9011/);

  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL(/localhost:5173/);

  await expect(page.getByRole('heading', { name: /Your Balance/i })).toBeVisible();
  await expect(page.getByText('richard@example.com')).toBeVisible();
  await expect(page.getByText(/Logout/i)).toBeVisible();
});
