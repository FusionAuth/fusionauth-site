const { test, expect } = require('@playwright/test');

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

test('FusionAuth admin login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.getByRole('button', { name: 'admin@example.com' })).toBeVisible();
  }
  catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('WordPress OIDC login via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000');

    await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

    await page.getByRole('link', { name: /Login/i }).first().click();

    await page.waitForURL(/localhost:3000\/wp-login\.php/);
    await page.getByRole('link', { name: /Login with OpenID Connect/i }).click();

    await page.waitForURL(/localhost:9011/);

    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:3000\/account/);

    await expect(page.getByText('richard@example.com')).toBeVisible();
    await expect(page.getByRole('link', { name: /Logout/i })).toBeVisible();

    await page.getByRole('link', { name: /Logout/i }).click();

    await page.goto('http://localhost:3000');
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Make Change calculates change correctly', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000');
    await page.getByRole('link', { name: /Login/i }).first().click();

    await page.waitForURL(/localhost:3000\/wp-login\.php/);
    await page.getByRole('link', { name: /Login with OpenID Connect/i }).click();

    await page.waitForURL(/localhost:9011/);
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:3000\/account/);
    await page.goto('http://localhost:3000/change');

    const cases = [
      { amount: '0.29', total: '0.29', nickels: '5', pennies: '4' },
      { amount: '0.58', total: '0.58', nickels: '11', pennies: '3' },
      { amount: '1.02', total: '1.02', nickels: '20', pennies: '2' },
      { amount: '0.15', total: '0.15', nickels: '3', pennies: '0' },
    ];

    for (const { amount, total, nickels, pennies } of cases) {
      await page.locator('input[name="amount"]').fill(amount);
      await page.locator('input.change-submit').click();

      await expect(page.locator('.change-message')).toHaveText(
        `We can make change for ${total} with ${nickels} nickels and ${pennies} pennies!`
      );
    }
  }
  catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('SVG logo image loads correctly', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000');

    const logo = page.locator('img[src*="changebank.svg"]');
    await expect(logo).toBeVisible();

    const response = await page.request.get('https://fusionauth.io/cdn/samplethemes/changebank/changebank.svg');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('JPG money image loads correctly', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000');

    const moneyImg = page.locator('img[src*="money"]');
    await expect(moneyImg).toBeVisible();

    const imgSrc = await moneyImg.getAttribute('src');
    expect(imgSrc).toBeTruthy();

    const response = await page.request.get(imgSrc);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/image\/jpeg|image\/jpg/);
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Unauthenticated access to /account redirects to login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/account');

    await page.waitForURL(/localhost:3000\/wp-login\.php/);
    await page.getByRole('link', { name: /Login with OpenID Connect/i }).click();

    await page.waitForURL(/localhost:9011/);

    await expect(page.getByPlaceholder('Login')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Unauthenticated access to /change redirects to login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/change');

    await page.waitForURL(/localhost:3000\/wp-login\.php/);
    await page.getByRole('link', { name: /Login with OpenID Connect/i }).click();

    await page.waitForURL(/localhost:9011/);

    await expect(page.getByPlaceholder('Login')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('After login, user is redirected to /account', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/account');

    await page.waitForURL(/localhost:3000\/wp-login\.php/);
    await page.getByRole('link', { name: /Login with OpenID Connect/i }).click();

    await page.waitForURL(/localhost:9011/);

    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:3000\/account/);

    await expect(page.getByText('richard@example.com')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your balance/i })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
