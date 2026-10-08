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

  await page.waitForURL(/localhost:9012\/Account/i);
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

test('.NET app OIDC login and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto(APP_URL);
    await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

    await logIn(page);
    await expect(page.getByText('richard@example.com')).toBeVisible();

    // logout clears the app cookie, then FusionAuth ends its session and returns to the home page
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
    await page.waitForURL(/localhost:9012\/makechange/i);

    const cases = [
      { amount: '0.41', message: 'We can make change for 1 quarters 1 dimes 1 nickels 1 pennies!' },
      { amount: '1.00', message: 'We can make change for 4 quarters 0 dimes 0 nickels 0 pennies!' },
    ];

    for (const { amount, message } of cases) {
      await page.locator('input[name="amount"]').fill(amount);
      await page.locator('input.change-submit').click();
      await expect(page.locator('.change-message')).toHaveText(message);
    }
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
