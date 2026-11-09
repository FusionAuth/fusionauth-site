import { registerIds, registerFields, registerShot, openSignedOut, showRegistrationUrl, realEstateTenant, uncompressedTextInputs } from './_shared.mjs';
import { apiRequest, baseUrl, runtime } from '../../kit.mjs';

// fills the add-field form with one of the example fields
const fillField = id => async page => {
  const { field } = await apiRequest(`/api/form/field/${id}`);
  await page.fill('#field_name', field.name);
  const registration = field.key.startsWith('registration.');
  await page.selectOption('#field_key', { label: registration ? 'Custom registration data (registration.data.*)' : 'Custom user data (user.data.*)' });
  await page.fill(registration ? '#registration-data-key' : '#user-data-key', field.key.split('.').slice(2).join('.'));
  await page.selectOption('select#field_control', field.control);
  await page.selectOption('select#field_type', field.type);
  if (field.required) await page.locator('label[for=field_required]').click();
  await page.waitForFunction(id => document.getElementById(id)?.style.height === 'auto', `${registration ? 'registration' : 'user'}-data-key-form-row`);
  await page.evaluate(() => document.activeElement?.blur());
};

const firstStep = (labels, placeholderNames) => async (page, info) => {
  await openSignedOut(page, info);
  for (let i = 0; labels !== await page.locator('label[for="user_email"]').isVisible(); i++) {
    if (i === 60) throw new Error('Registration theme labels did not update');
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
  }
  if (placeholderNames) {
    await page.evaluate(() => {
      for (const input of document.querySelectorAll('form input[placeholder]')) input.placeholder = input.name;
    });
  }
};

async function loginAsJared(page, { url }) {
  runtime.registerCookies = await page.context().cookies();
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('#loginId', 'jared@piedpiper.com');
  await page.fill('#password', 'password');
  await page.keyboard.press('Enter');
  await page.waitForURL(u => u.pathname.startsWith('/admin') && !u.pathname.includes('/admin/login'));
  await page.goto(url, { waitUntil: 'networkidle' });
}

async function userEditAsJared(page, info) {
  await loginAsJared(page, info);
  for (let i = 0; !await page.locator('#user_data_notes').isVisible() || await page.locator('label[for=user_firstName]').innerText() !== 'Your first name'; i++) {
    if (i === 120) throw new Error('Custom admin user form did not become ready');
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
  }
}

async function openHiddenFieldPanels(page) {
  await page.waitForTimeout(300);
  await page.evaluate(id => {
    for (let panel = document.getElementById(id); panel && panel.tagName !== 'FORM'; panel = panel.parentElement) {
      if (!panel.classList.contains('slide-open')) continue;
      panel.classList.remove('hidden');
      panel.classList.add('open');
      panel.style.removeProperty('display');
      panel.style.setProperty('height', 'auto', 'important');
      panel.style.setProperty('max-height', 'none', 'important');
    }
  }, 'user-data-key');
}

// a theme created just before can take a moment to show up in the tenant form
async function selectRegisterTheme(page) {
  for (let i = 0; i < 30 && !(await page.locator(`#tenant_themeId option[value="${registerIds.theme}"]`).count()); i++) {
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'networkidle' });
  }
  await page.selectOption('#tenant_themeId', registerIds.theme);
}

export const shots = {
  'register-built-out-advanced-form': registerShot(),
  'register-minimum-price-form-field': registerShot({ before: fillField(registerFields[0]) }),
  'register-geographic-area-form-field': registerShot({ before: fillField(registerFields[2]) }),
  'register-new-form': registerShot({ before: page => page.fill('#form_name', 'Real estate search registration form') }),
  'register-first-step-form-editor': registerShot(),
  'register-find-registration-url': registerShot({ before: showRegistrationUrl(registerIds.app) }),
  'register-first-step-no-placeholder': registerShot({ before: firstStep(false, true), temporaryState: [uncompressedTextInputs] }),
  'register-new-user-data-display': registerShot({
    textPadding: 6,
    before: (page, { tag }) => tag('register-data', () => document.querySelector('#user-data fieldset:last-child > div')),
  }),
  'register-update-theme-for-tenant': registerShot({ before: selectRegisterTheme }),
  'register-first-step-with-placeholder': registerShot({ before: firstStep(false), temporaryState: [uncompressedTextInputs] }),
  'register-first-step-with-placeholder-and-labels': registerShot({ before: firstStep(true) }),
  'register-add-custom-field': registerShot({ before: fillField(registerFields[3]) }),
  'register-add-admin-user-form': registerShot(),
  'register-add-admin-registration-form': registerShot(),
  'register-associate-admin-user-form': registerShot({ sectionBox: 'form-settings', temporaryState: [realEstateTenant] }),
  'register-associate-admin-registration-form': registerShot({ sectionBox: 'form-settings' }),
  'register-set-user-role-user-manager': registerShot(),
  'register-limited-menu': registerShot({ before: loginAsJared }),
  'register-user-edit-screen': registerShot({ before: userEditAsJared, temporaryState: [realEstateTenant] }),
  'register-registration-edit-screen': registerShot({ before: loginAsJared, temporaryState: [realEstateTenant] }),
  'register-setup-locale-selection': registerShot({
    before: (page, { tag }) => tag('register-locale', () => [...document.querySelectorAll('main tr')].reverse().find(r => r.textContent.includes('Preferred languages'))),
  }),
  'register-hidden-field': registerShot({ before: fillField(registerFields[4]), after: openHiddenFieldPanels }),
};
