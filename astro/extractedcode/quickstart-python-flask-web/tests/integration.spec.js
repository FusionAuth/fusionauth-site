const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:9012';

function trackPageDiagnostics(page) {
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  return async () => {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    try {
      console.log('Page HTML:', await page.content());
    } catch (contentError) {
      console.log('Page HTML: <unavailable, page/context already closed>', contentError.message);
    }
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
  };
}

async function logIn(page) {
  await page.goto(APP_URL);
  await page.getByRole('link', { name: 'Login', exact: true }).click();

  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL(`${APP_URL}/account`);
}

test('FusionAuth admin login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/admin\//);
    // the admin's account menu shows their display name when the kickstart sets one, so check the page instead
    await expect(page).toHaveTitle(/Dashboard \| FusionAuth/);
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Flask app OIDC login and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto(APP_URL);
    await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

    await logIn(page);
    await expect(page.getByText('richard@example.com')).toBeVisible();

    // logout goes through FusionAuth, which then calls the app's /logout to clear its cookies
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForURL(`${APP_URL}/`);
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Make Change calculates change', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await logIn(page);
    await page.getByRole('link', { name: 'Make Change' }).click();
    await page.waitForURL(`${APP_URL}/make-change`);

    // 0.07, 0.15 and 0.28 came out wrong when the app did floating-point math
    const cases = [
      { amount: '0.07', total: '0.07', nickels: '1', pennies: '2' },
      { amount: '0.15', total: '0.15', nickels: '3', pennies: '0' },
      { amount: '0.28', total: '0.28', nickels: '5', pennies: '3' },
      { amount: '1.00', total: '1.00', nickels: '20', pennies: '0' },
    ];

    for (const { amount, total, nickels, pennies } of cases) {
      await page.locator('input[name="amount"]').fill(amount);
      await page.locator('input[name="amount"]').press('Enter');

      await expect(page.locator('.change-message')).toHaveText(
        `We can make change for $${total} with ${nickels} nickels and ${pennies} pennies!`
      );
    }
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
