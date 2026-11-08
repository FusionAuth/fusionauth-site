const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:4200';

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
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  // the SDK returns to the app root, and the route guard sends signed-in users on to /account
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

test('Angular app OIDC login and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto(APP_URL);
    await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

    await logIn(page);
    await expect(page.getByText('richard@example.com')).toBeVisible();

    // the header's Logout is an <a> without an href, so it has no link role
    await page.getByText('Logout', { exact: true }).click();
    await page.waitForURL(`${APP_URL}/logged-out`);
    await expect(page.getByText('Logout', { exact: true })).toBeHidden();
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

    // 0.15 and 0.35 came out wrong when the app did floating-point math
    const cases = [
      { amount: '0.15', nickels: '3', pennies: '0' },
      { amount: '0.35', nickels: '7', pennies: '0' },
      { amount: '0.29', nickels: '5', pennies: '4' },
      { amount: '1.00', nickels: '20', pennies: '0' },
    ];

    for (const { amount, nickels, pennies } of cases) {
      await page.locator('input.change-input').fill(amount);
      await page.locator('input.change-submit').click();
      await expect(page.locator('.change-message')).toHaveText(
        `We can make change for $${amount} with ${nickels} nickels and ${pennies} pennies!`
      );
    }
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
