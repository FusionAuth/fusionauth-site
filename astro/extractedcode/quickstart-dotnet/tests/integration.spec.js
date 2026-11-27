const { test, expect } = require('@playwright/test');

const app = 'http://localhost:3000';
const stage = process.env.QUICKSTART_STAGE;

test.use({ actionTimeout: 10000 });

function noteField(page) {
  return page.getByRole('textbox', { name: 'Your note' });
}

async function saveNote(page, text) {
  await noteField(page).fill(text);
  const redirected = page.waitForEvent('framenavigated', frame => frame === page.mainFrame());
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await redirected;
  await expect(noteField(page)).toHaveValue(text);
}

async function startLogin(page) {
  await page.goto(app);
  await expect(page).toHaveURL(/localhost:3000\/login/);
  await expect(noteField(page)).toHaveCount(0);
  await page.getByRole('link', { name: 'Log in with FusionAuth' }).click();
  await expect(page).toHaveURL(/localhost:9011\/oauth2\/authorize/);
  expect(new URL(page.url()).searchParams.get('code_challenge_method')).toBe('S256');
}

async function loginAsRichard(page) {
  await startLogin(page);
  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(url => url.origin === app && url.pathname === '/');
}

test('starter app saves a note', async ({ page }) => {
  test.skip(stage !== '0-start');
  await page.goto(app);
  await saveNote(page, 'Starter note');
});

test('FusionAuth login, note edit, and logout', async ({ page }) => {
  test.skip(stage !== '1-fusionauth-added');
  await loginAsRichard(page);
  await expect(noteField(page)).toHaveValue('Starter note');
  const response = await page.request.post(app + '/', { form: { content: 'Invalid write' } });
  expect(response.status()).toBe(400);
  await saveNote(page, 'Shared note');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(url => url.origin === app && url.pathname === '/login');
  await startLogin(page);
  await expect(page.getByPlaceholder('Login')).toBeVisible();
});

test('a self-registered user cannot see another user’s note', async ({ page, browser }) => {
  test.skip(stage !== '2-multi-user');
  test.setTimeout(60000);
  await loginAsRichard(page);
  await expect(page.getByRole('heading', { name: 'Welcome, Richard Hendricks' })).toBeVisible();
  await expect(noteField(page)).toHaveValue('Write a note, Richard Hendricks.');
  await saveNote(page, 'Richard’s private note');

  const otherPage = await browser.newPage();
  await startLogin(otherPage);
  await otherPage.getByRole('link', { name: 'Create an account' }).click();
  await otherPage.getByRole('textbox', { name: /email/i }).fill('monica@example.com');
  await otherPage.getByPlaceholder('Password', { exact: true }).fill('password');
  await otherPage.getByRole('textbox', { name: /first name/i }).fill('Monica');
  await otherPage.getByRole('textbox', { name: /last name/i }).fill('Hall');
  await otherPage.getByRole('button', { name: /submit|register|create/i }).click();
  await expect(otherPage).toHaveURL(url => url.origin === app && url.pathname === '/');
  await expect(otherPage.getByRole('heading', { name: 'Welcome, Monica Hall' })).toBeVisible();
  await expect(noteField(otherPage)).toHaveValue('Write a note, Monica Hall.');
  await saveNote(otherPage, 'Monica’s private note');

  await page.reload();
  await expect(noteField(page)).toHaveValue('Richard’s private note');
});
