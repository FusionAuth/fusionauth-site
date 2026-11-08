const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:9012';
const FUSIONAUTH_URL = 'http://localhost:9011';
const MAILCATCHER_URL = 'http://localhost:1080';
const API_KEY = 'this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works';
const NEW_PASSWORD = 'converted-password-1';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log('\n=== DEBUG INFO ===\nPage URL:', page.url());
    console.log('Page text:', await page.locator('body').innerText().catch(() => '<unavailable>'));
    console.log('=== END DEBUG ===\n');
  }
});

async function anonymousUserId(page) {
  const cookie = (await page.context().cookies()).find(c => c.name === 'cb_anon_user');
  expect(cookie, 'the video page sets the anonymous user cookie').toBeTruthy();
  return JSON.parse(Buffer.from(cookie.value.split('.')[1], 'base64url').toString()).userId;
}

async function fetchUser(request, userId) {
  const response = await request.get(`${FUSIONAUTH_URL}/api/user/${userId}`, { headers: { Authorization: API_KEY } });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).user;
}

test('an anonymous viewer converts to a full account and keeps their data', async ({ page, request }) => {
  const email = `anonymous-${Date.now()}@example.com`;

  // watching the video creates a shadow user that counts views
  await page.goto(`${APP_URL}/video`);
  const userId = await anonymousUserId(page);
  let user = await fetchUser(request, userId);
  expect(user.data).toMatchObject({ anonymousUser: true, watchCount: 1 });
  await page.goto(`${APP_URL}/video`);
  expect(await anonymousUserId(page)).toBe(userId);
  user = await fetchUser(request, userId);
  expect(user.data.watchCount).toBe(2);

  // signing up adds the email to the same user and sends the set password email
  await page.goto(`${APP_URL}/register`);
  await page.locator('input[name="email"]').fill(email);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Please check your email to set your password.')).toBeVisible();
  user = await fetchUser(request, userId);
  expect(user.email).toBe(email);

  let message;
  await expect(async () => {
    const messages = await (await request.get(`${MAILCATCHER_URL}/messages`)).json();
    message = messages.find(m => m.recipients.some(r => r.includes(email)));
    expect(message).toBeTruthy();
  }).toPass({ timeout: 30000 });
  const body = await (await request.get(`${MAILCATCHER_URL}/messages/${message.id}.plain`)).text();
  expect(body).toContain('To set your password click on the following link.');
  const link = body.match(/http:\/\/localhost:9011\/password\/change\/\S+/)[0];

  await page.goto(link);
  await page.getByPlaceholder('Password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByPlaceholder('Confirm password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: 'Login here' }).click();

  // the first full login fires the user.login.success webhook, which clears the anonymous flag
  await page.waitForURL(/localhost:9011/);
  await page.getByPlaceholder('Login').fill(email);
  await page.getByPlaceholder('Password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForURL(new RegExp(`^${APP_URL}/`));

  await expect(async () => {
    user = await fetchUser(request, userId);
    expect(user.data.anonymousUser).toBe(false);
  }).toPass({ timeout: 30000 });
  expect(user.data.watchCount).toBe(2);
});
