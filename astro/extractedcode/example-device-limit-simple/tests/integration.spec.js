const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:8080';

async function logIn(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  // the home page sets the PKCE and state cookie that /login needs
  await page.goto(APP_URL);
  await page.getByRole('link', { name: 'log in or create a new account' }).click();
  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  return page;
}

test('the login webhook refuses a third device until one logs out', async ({ browser }) => {
  // each context is a separate device with its own refresh token
  const devices = [];
  for (let device = 1; device <= 2; device++) {
    const page = await logIn(browser);
    await page.waitForURL(`${APP_URL}/account`);
    await expect(page.getByText('Your balance')).toBeVisible();
    devices.push(page);
  }

  // the transactional user.login.success webhook answers 403, so FusionAuth stops the login
  const third = await logIn(browser);
  await third.waitForLoadState('networkidle');
  await expect(third).toHaveURL(/localhost:9011/);
  await expect(third.getByPlaceholder('Password')).toBeVisible();
  await expect(third).not.toHaveURL(`${APP_URL}/account`);

  // logging out revokes that device's refresh token, which frees a slot
  await devices[0].goto(`${APP_URL}/logout`);
  await devices[0].waitForURL(`${APP_URL}/`);

  const retry = await logIn(browser);
  await retry.waitForURL(`${APP_URL}/account`);
  await expect(retry.getByText('Your balance')).toBeVisible();
});
