const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:8080';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log('\n=== DEBUG INFO ===\nPage URL:', page.url());
    console.log('Page text:', await page.locator('body').innerText().catch(() => '<unavailable>'));
    console.log('=== END DEBUG ===\n');
  }
});

// the app passes the hour in America/Denver to Permify, and permify-setup opens the bank from 7 to 17
function bankIsOpen() {
  const hour = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })).getHours();
  return hour >= 7 && hour <= 17;
}

async function logIn(page, email) {
  // the home page sets the PKCE and state cookie that /login needs
  await page.goto(APP_URL);
  await page.getByRole('link', { name: 'log in or create a new account' }).click();
  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill(email);
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForURL(new RegExp(`^${APP_URL}/`));
}

async function expectAccess(page, path, heading, allowed) {
  await page.goto(`${APP_URL}${path}`);
  if (allowed) {
    await expect(page).toHaveURL(`${APP_URL}${path}`);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  } else {
    await expect(page).toHaveURL(`${APP_URL}/error`);
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  }
}

const USERS = [
  { email: 'admin@example.com', relation: 'vp', admin: true, makeChange: () => false },
  { email: 'richard@example.com', relation: 'member', admin: false, makeChange: () => false },
  { email: 'teller@example.com', relation: 'teller', admin: true, makeChange: bankIsOpen },
];

for (const user of USERS) {
  test(`Permify decides what a ${user.relation} can open`, async ({ page }) => {
    await logIn(page, user.email);
    await expectAccess(page, '/account', 'Your balance', true);
    await expectAccess(page, '/admin', 'Admin things', user.admin);
    await expectAccess(page, '/make-change', 'We Make Change', user.makeChange());
  });
}
