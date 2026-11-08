const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost';

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
  await page.getByRole('link', { name: 'Log in', exact: true }).first().click();
  await page.waitForURL(`${APP_URL}/user/login`);

  await page.getByRole('button', { name: 'Log in with FusionAuth' }).click();
  await page.waitForURL(/host\.docker\.internal:9011/);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  // the OpenID Connect module's redirect_login setting sends users to /account; Drupal appends ?check_logged_in=1
  await page.waitForURL(/localhost\/account/);
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

test('Drupal OIDC login and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto(APP_URL);
    await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

    await logIn(page);
    await expect(page.getByText('richard@example.com')).toBeVisible();

    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForURL(`${APP_URL}/`);
    await expect(page.getByRole('link', { name: 'Log in', exact: true }).first()).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Make Change calculates change', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await logIn(page);
    await page.goto(`${APP_URL}/makechange`);

    const cases = [
      { amount: '0.41', message: 'We can make change for $0.41 with 1 quarters, 1 dimes, 1 nickels, 1 pennies!' },
      { amount: '1.15', message: 'We can make change for $1.15 with 4 quarters, 1 dimes, 1 nickels!' },
    ];

    for (const { amount, message } of cases) {
      await page.getByLabel('Amount in USD: $').fill(amount);
      await page.getByRole('button', { name: /Make Change/i }).click();
      await expect(page.getByText(message)).toBeVisible();
    }
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
