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
  await page.waitForURL(new RegExp(`${APP_URL}/(account|device-limit)`));
  return page;
}

test('a third device has to sign another one out before it can continue', async ({ browser }) => {
  // each context is a separate device with its own refresh token
  for (let device = 1; device <= 2; device++) {
    const page = await logIn(browser);
    await expect(page.getByText('Your balance')).toBeVisible();
  }

  const third = await logIn(browser);
  await expect(third).toHaveURL(`${APP_URL}/device-limit`);
  await expect(third.getByRole('heading', { name: 'Device Limit' })).toBeVisible();
  await expect(third.getByText('You have 2 devices currently logged in.')).toBeVisible();
  await expect(third.getByRole('checkbox')).toHaveCount(2);

  // make change is also behind the device limit
  await third.goto(`${APP_URL}/make-change`);
  await expect(third).toHaveURL(`${APP_URL}/device-limit`);

  await third.getByRole('checkbox').first().check();
  await third.getByRole('button', { name: 'Sign Out Selected Devices' }).click();
  await expect(third).toHaveURL(`${APP_URL}/account`);
  await expect(third.getByText('Your balance')).toBeVisible();
});
