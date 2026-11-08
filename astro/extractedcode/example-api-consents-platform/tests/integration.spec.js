const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:8080';

test('MoneyScope reads the Changebank balance after the user consents to its scopes', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.getByRole('heading', { name: 'Welcome to MoneyScope' })).toBeVisible();
  await page.getByRole('link', { name: 'Login', exact: true }).click();

  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  // MoneyScope is a third-party app, so FusionAuth asks the user to approve each scope
  await expect(page.getByText('Read basic account and balance information')).toBeVisible();
  await page.getByRole('button', { name: /allow|approve|accept/i }).click();

  await page.waitForURL(`${APP_URL}/account`);
  await expect(page.getByText('Your balance')).toBeVisible();
  await expect(page.locator('.balance')).toHaveText('$42');
  await expect(page.locator('.header-email')).toHaveText('richard@example.com');
});
