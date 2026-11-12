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
  const writeResponse = await request.post(`${apiUrl}/write`, { data: { uuid: 'unauthorized', text: 'No token' },});
  expect(writeResponse.status()).toBe(401);
});

test('Free user can read but cannot write', async ({ request }) => {
  const freeToken = await getToken(request, 'free@example.com');
  const readResponse = await request.get(`${apiUrl}/read`, { headers: bearerHeaders(freeToken), });
  expect(readResponse.ok()).toBeTruthy();
  const writeResponse = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(freeToken),
    data: { uuid: 'free-post', text: 'Freda cannot write' },
  });
  expect(writeResponse.status()).toBe(403);
});

test('Premium users can write and edit only their own posts, and free users can read them', async ({ request }) => {
  const premiumToken = await getToken(request, 'premium@example.com');
  const secondPremiumToken = await getToken(request, 'premium2@example.com');
  const freeToken = await getToken(request, 'free@example.com');
  const uuid = `integration-test-${Date.now()}`;
  const writeResponse = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(premiumToken),
    data: { uuid, text: 'First post' },
  });
  expect(writeResponse.ok()).toBeTruthy();
  const editResponse = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(premiumToken),
    data: { uuid, text: 'Edited post' },
  });
  expect(editResponse.ok()).toBeTruthy();
  const premiumReadResponse = await request.get(`${apiUrl}/read`, { headers: bearerHeaders(premiumToken), });
  expect(premiumReadResponse.ok()).toBeTruthy();
  const otherUsersEdit = await request.post(`${apiUrl}/write`, {
    headers: bearerHeaders(secondPremiumToken),
    data: { uuid, text: 'Paul cannot edit Peter\'s post' },
  });
  expect(otherUsersEdit.status()).toBe(403);
  const readResponse = await request.get(`${apiUrl}/read`, { headers: bearerHeaders(freeToken), });
  expect(await readResponse.json()).toContainEqual({
    uuid,
    userId: '00000000-0000-0000-0000-222222222222',
    text: 'Edited post',
  });
});
