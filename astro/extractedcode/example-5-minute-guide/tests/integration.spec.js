const { test, expect } = require('@playwright/test');

test('logging in greets the user by the name from UserInfo', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForURL('http://localhost:3000/');
  await expect(page.getByText('Hello Richard')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});
