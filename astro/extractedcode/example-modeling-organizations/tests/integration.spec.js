const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:3000';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log('\n=== DEBUG INFO ===\nPage URL:', page.url());
    console.log('Page text:', await page.locator('body').innerText().catch(() => '<unavailable>'));
    console.log('=== END DEBUG ===\n');
  }
});

async function logIn(page, email) {
  await page.goto(`${APP_URL}/login`);
  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill(email);
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForURL(`${APP_URL}/`);
  await expect(page.getByRole('heading', { name: 'Select company to work on' })).toBeVisible();
}

async function selectCompany(page, name) {
  await page.goto(APP_URL);
  await page.getByRole('button', { name, exact: true }).click();
}

const NO_PERMISSION = 'Permissions needed';

test("each company's grant decides which pages Richard can open", async ({ page }) => {
  await logIn(page, 'richard@example.com');
  for (const company of ['Pied Piper', 'Hooli', 'Aviato']) {
    await expect(page.getByRole('button', { name: company, exact: true })).toBeVisible();
  }

  // Admin at Pied Piper: every page, including the user list built from the entity's grants
  await selectCompany(page, 'Pied Piper');
  await page.goto(`${APP_URL}/admin`);
  await expect(page.getByRole('heading', { name: 'Admin Settings' })).toBeVisible();
  await page.goto(`${APP_URL}/users`);
  await expect(page.getByRole('heading', { name: 'Users for Pied Piper' })).toBeVisible();
  await expect(page.getByText('richard@example.com').first()).toBeVisible();

  // Sales at Hooli: sales only
  await selectCompany(page, 'Hooli');
  await page.goto(`${APP_URL}/sales`);
  await expect(page.getByRole('heading', { name: 'Sales for Hooli' })).toBeVisible();
  await page.goto(`${APP_URL}/billing`);
  await expect(page.getByRole('heading', { name: NO_PERMISSION })).toBeVisible();

  // Billing and Reports at Aviato: billing, but not sales or admin
  await selectCompany(page, 'Aviato');
  await page.goto(`${APP_URL}/billing`);
  await expect(page.getByRole('heading', { name: 'Billing for Aviato' })).toBeVisible();
  await page.goto(`${APP_URL}/sales`);
  await expect(page.getByRole('heading', { name: NO_PERMISSION })).toBeVisible();
  await page.goto(`${APP_URL}/admin`);
  await expect(page.getByRole('heading', { name: NO_PERMISSION })).toBeVisible();
});

test('Jared only sees the company he administers', async ({ page }) => {
  await logIn(page, 'jared@example.com');
  await expect(page.getByRole('button', { name: 'Hooli', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pied Piper', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Aviato', exact: true })).toHaveCount(0);
});
