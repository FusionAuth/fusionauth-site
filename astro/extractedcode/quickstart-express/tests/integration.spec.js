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
    await expect(page.getByRole('heading', { name: 'Recent logins' })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Express app login, note edit, and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/');

    // unauthenticated visit redirects through FusionAuth's login page
    await page.waitForURL(/localhost:9011/, { timeout: 15000 });
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });
    await expect(page.locator('textarea[name="content"]')).toBeVisible();

    await page.fill('textarea[name="content"]', 'Playwright test note');
    await page.click('button:has-text("Save Changes")');
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('Playwright test note');

    await page.click('a.logout-btn');
    await page.waitForTimeout(1000);

    // re-visiting the app after logout should require login again
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/localhost:9011/, { timeout: 15000 });
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

// Log in as one user in a fresh browser context, write a note, and return the
// note that user sees. Each context has its own cookie jar, so the two users
// do not share a session.
async function editNoteAs(browser, { email, password, displayName, note }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/localhost:9011/, { timeout: 15000 });
    await page.getByPlaceholder('Login').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });
    await expect(page.getByText(`Welcome, ${displayName}`)).toBeVisible();

    await page.locator('textarea[name="content"]').fill(note);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });

    // Re-read after the redirect so this is the persisted value, not the
    // text that was just typed into the box.
    return await page.locator('textarea[name="content"]').inputValue();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  } finally {
    await context.close();
  }
}

test('Express app multi-user note isolation', async ({ browser }) => {
  const richardNote = 'Richard note ' + Date.now();
  const adminNote = 'Admin note ' + Date.now();

  // Notes are stored per user, keyed on the subject claim of the token, so
  // one user must never see another's note.
  const richardSees = await editNoteAs(browser, {
    email: 'richard@example.com',
    password: 'password',
    displayName: 'Richard Hendricks',
    note: richardNote,
  });
  expect(richardSees).toBe(richardNote);

  const adminSees = await editNoteAs(browser, {
    email: 'admin@example.com',
    password: 'password',
    displayName: 'Admin User',
    note: adminNote,
  });
  expect(adminSees).toBe(adminNote);
  expect(adminSees).not.toContain(richardNote);

  // Richard's note must survive the second user writing theirs.
  const richardSeesAgain = await editNoteAs(browser, {
    email: 'richard@example.com',
    password: 'password',
    displayName: 'Richard Hendricks',
    note: richardNote,
  });
  expect(richardSeesAgain).toBe(richardNote);
  expect(richardSeesAgain).not.toContain(adminNote);
});
