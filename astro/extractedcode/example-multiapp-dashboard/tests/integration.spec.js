const { test, expect } = require('@playwright/test');

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log('\n=== DEBUG INFO ===\nPage URL:', page.url());
    console.log('Page text:', await page.locator('body').innerText().catch(() => '<unavailable>'));
    console.log('=== END DEBUG ===\n');
  }
});

test('the FusionAuth landing page links to both apps, which share one login', async ({ page }) => {
  await page.goto('http://localhost:3000/account');
  await page.waitForURL(/localhost:9011/);
  await page.locator('#loginId').fill('richard@example.com');
  await page.locator('#password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForURL('http://localhost:3000/account');
  await expect(page.getByText('Your balance')).toBeVisible();

  // the dashboard is the Bank theme's index template from theme/index.ftl
  await page.goto('http://localhost:9011/');
  await expect(page.getByRole('link', { name: 'Changebank' })).toHaveAttribute('href', 'http://localhost:3000/account');
  await expect(page.getByRole('link', { name: 'Changeinsurance' })).toHaveAttribute('href', 'http://localhost:3001/account');

  // the FusionAuth session logs the user in to the second app without another password prompt
  await page.getByRole('link', { name: 'Changeinsurance' }).click();
  await page.waitForURL('http://localhost:3001/account');
  await expect(page.getByText('Your balance')).toBeVisible();
});
