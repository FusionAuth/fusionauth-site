// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/FusionAuth Start Here Application | Home/);
});

// :snippet-start: fa-has-title
test('FA has title', async ({ page }) => {
  await page.goto('http://localhost:9011/admin');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Login | FusionAuth/);
});
// :snippet-end:

test('FA has title with redirect', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  const login = page.getByRole('link', { name: 'Login' });
  await login.click();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Login | FusionAuth/);
});

// :snippet-start: log-in
test('log in', async ({ page }) => {
  // #1
  await page.goto('http://localhost:8080/');

  // #2
  const login = page.getByRole('link', { name: 'Login' });
  await login.click();

  // #3
  await expect(page).toHaveTitle(/Login | FusionAuth/);
  await expect(page.locator('#loginId')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();

  // #4
  const loginId = await page.locator('#loginId');
  await loginId.fill("richard@example.com");
  const pw = await page.locator('#password');
  await pw.fill("password");

  // #5
  const button = await page.locator('.button.blue');
  await button.click();

  // #6
  await expect(page).toHaveTitle(/FusionAuth Start Here Application | Home/);

  // #7
  await expect(page.getByText('richard@example.com')).toBeVisible();
});
// :snippet-end:

test('log in failure', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Create a locator.
  const login = page.getByRole('link', { name: 'Login' });
  await login.click();
  await page.locator('input[name="loginId"]').fill("richard@example.com");
  await page.locator('input[name="password"]').fill("notTHEpassword");

  //only button
  await page.getByRole('button').click();

  // Expect to see the user's email on the page
  await expect(page.getByText('Invalid login credentials.')).toBeVisible();
});
