const { test, expect } = require('@playwright/test');


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

test('Protected page redirects signed-out users home', async ({ page }) => {
  await page.goto('http://localhost:3000/make_change');

  await expect(page).toHaveURL('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /Login to manage your account/i })).toBeVisible();
});
