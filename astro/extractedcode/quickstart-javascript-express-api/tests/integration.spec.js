const { test, expect } = require('@playwright/test');

const fusionAuthUrl = 'http://localhost:9011';
const apiUrl = 'http://localhost:3000';
const apiKey = 'this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works';
const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';

async function getToken(request, loginId) {
  const loginResponse = await request.post(`${fusionAuthUrl}/api/login`, {
    headers: {Authorization: apiKey, 'Content-Type': 'application/json', },
    data: {loginId, password: 'password', applicationId, },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  expect(loginData.token).toBeTruthy();
  return loginData.token;
}

function bearerHeaders(token) { return { Authorization: `Bearer ${token}` }; }

test('Admin can log in to FusionAuth Admin UI', async ({ page }) => {
  await page.goto(`${fusionAuthUrl}/admin/`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Login').fill('admin@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/\/admin\//);
  await expect(page.getByRole('heading', { name: 'Recent logins' })).toBeVisible();
});

test('Read and write requests without a token are rejected', async ({ request }) => {
  const readResponse = await request.get(`${apiUrl}/read`);
  expect(readResponse.status()).toBe(401);
  const writeResponse = await request.post(`${apiUrl}/write`, { data: { value: 'unauthorized-write' },});
  expect(writeResponse.status()).toBe(401);
});

test('Reader can read but cannot write', async ({ request }) => {
  const readerToken = await getToken(request, 'reader@example.com');
  const readResponse = await request.get(`${apiUrl}/read`, { headers: bearerHeaders(readerToken), });
  expect(readResponse.ok()).toBeTruthy();
  expect(await readResponse.json()).toContain('1');
  const writeResponse = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(readerToken),
    data: { value: 'reader-write-should-be-rejected' },
  });
  expect(writeResponse.status()).toBe(403);
});

test('Writer can write and reader can read the saved value', async ({ request }) => {
  const writerToken = await getToken(request, 'writer@example.com');
  const readerToken = await getToken(request, 'reader@example.com');
  const value = `integration-test-${Date.now()}`;
  const writeResponse = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(writerToken),
    data: { value },
  });
  expect(writeResponse.ok()).toBeTruthy();
  expect(await writeResponse.json()).toBe('Write successful');
  const writerReadResponse = await request.get(`${apiUrl}/read`, {
    headers: bearerHeaders(writerToken),
  });
  expect(writerReadResponse.status()).toBe(403);
  const readResponse = await request.get(`${apiUrl}/read`, {
    headers: bearerHeaders(readerToken),
  });
  expect(readResponse.ok()).toBeTruthy();
  expect(await readResponse.json()).toContain(value);
});
