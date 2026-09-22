const { test, expect } = require('@playwright/test');

test('FusionAuth admin login', async ({ page }) => {
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.locator('body')).toContainText('admin@example.com');
  } catch (error) {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    console.log('Page HTML:', await page.content());
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
    throw error;
  }
});

const _header = {
  'Authorization': 'this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works',
  'Content-Type': 'application/json'
}

test('Teller can access /make-change endpoint', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'teller@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const token = loginData.token;
  const makeChangeResponse = await request.get('http://localhost:3000/make-change?total=1.02', {
    headers: { 'Authorization': `Bearer ${token}`}
  });
  expect(makeChangeResponse.ok()).toBeTruthy();
  const changeData = await makeChangeResponse.json();
  expect(changeData.total).toBe(1.02);
  expect(changeData.nickels).toBe(20);
  expect(changeData.pennies).toBe(2);
});

test('Basic authorization scheme is rejected', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'teller@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const makeChangeResponse = await request.get('http://localhost:3000/make-change?total=1.02', {
    headers: { 'Authorization': `Basic ${loginData.token}` }
  });
  expect(makeChangeResponse.status()).toBe(401);
});

test('Totals with more than two decimal places are rejected', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'teller@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const makeChangeResponse = await request.get('http://localhost:3000/make-change?total=1.005', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  expect(makeChangeResponse.status()).toBe(400);
  expect(await makeChangeResponse.json()).toEqual({ error: 'Invalid or missing "total" parameter' });
});

test('Teller can access /panic endpoint', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'teller@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const token = loginData.token;
  const panicResponse = await request.post('http://localhost:3000/panic', {
    headers: {'Authorization': `Bearer ${token}`}
  });
  expect(panicResponse.ok()).toBeTruthy();
  const panicData = await panicResponse.json();
  expect(panicData.message).toBe("We've called the police!");
});

test('Customer can access /make-change endpoint', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'customer@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const token = loginData.token;
  const makeChangeResponse = await request.get('http://localhost:3000/make-change?total=3.24', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  expect(makeChangeResponse.ok()).toBeTruthy();
  const changeData = await makeChangeResponse.json();
  expect(changeData.total).toBe(3.24);
  expect(changeData.nickels).toBe(64);
  expect(changeData.pennies).toBe(4);
});

test('Customer cannot access /panic endpoint', async ({ request }) => {
  const loginResponse = await request.post('http://localhost:9011/api/login', {
    headers: _header,
    data: {
      loginId: 'customer@example.com',
      password: 'password',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const token = loginData.token;
  const panicResponse = await request.post('http://localhost:3000/panic', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  expect(panicResponse.status()).toBe(403);
  const panicData = await panicResponse.json();
  expect(panicData.error).toBe('You do not have a role with permissions to do this.');
});
