import { fixedId, apiRequest, preparation, runtime, baseUrl, defaultThemeId, defaultTenantId } from '../../kit.mjs';

const registerIds = {
  app: '00000000-0000-0000-0000-f50000000001',
  basic: '00000000-0000-0000-0000-f50000000002',
  form: '00000000-0000-0000-0000-f50000000003',
  first: '00000000-0000-0000-0000-f50000000004',
  adminUser: '00000000-0000-0000-0000-f50000000005',
  adminRegistration: '00000000-0000-0000-0000-f50000000006',
  locale: '00000000-0000-0000-0000-f50000000007',
  theme: '00000000-0000-0000-0000-f50000000008',
  user: '00000000-0000-0000-0000-f50000000009',
  manager: '00000000-0000-0000-0000-f5000000000a',
};
const registerFields = [
  '00000000-0000-0000-0000-f5000000000b',
  '00000000-0000-0000-0000-f5000000000c',
  '00000000-0000-0000-0000-f5000000000d',
  '00000000-0000-0000-0000-f5000000000e',
  '00000000-0000-0000-0000-f5000000000f',
  '00000000-0000-0000-0000-f50000000010',
];

const realEstateRegistration = {
  order: 31,
  paths: [
    `/api/application/${registerIds.app}`, `/api/application/${registerIds.basic}`,
    `/api/user/${registerIds.user}?hardDelete=true`, `/api/user/${registerIds.manager}?hardDelete=true`,
    ...['form', 'first', 'adminUser', 'adminRegistration', 'locale'].map(k => `/api/form/${registerIds[k]}`),
    ...registerFields.map(id => `/api/form/field/${id}`), `/api/theme/${registerIds.theme}`,
  ],
  create: async api => {
    const r = registerIds;
    const definitions = [
      { name: 'Minimum Price', key: 'registration.data.minprice', control: 'number', type: 'number', required: true },
      { name: 'Maximum Price', key: 'registration.data.maxprice', control: 'number', type: 'number', required: true },
      { name: 'Geographic Area', key: 'registration.data.geographicarea', control: 'text', type: 'string' },
      { name: 'User notes', key: 'user.data.notes', control: 'textarea', type: 'string' },
      { name: 'My hidden field', key: 'user.data.answer', control: 'text', type: 'string' },
      { name: 'Preferred languages', key: 'user.preferredLanguages', control: 'select', type: 'string', options: ['en', 'fr', 'es'] },
    ];
    for (const [i, field] of definitions.entries()) await api(`/api/form/field/${registerFields[i]}`, 'POST', { field });
    const { fields } = await api('/api/form/field');
    const builtin = name => {
      const field = fields.find(f => f.name === name);
      if (!field) throw new Error(`Missing built-in field: ${name}`);
      return field.id;
    };
    const identity = ['First name', 'Email', 'Password', 'Mobile phone'].map(builtin);
    const custom = [registerFields[2], registerFields[0], registerFields[1]];
    const forms = [
      ['form', 'Real estate search registration form', 'registration', [{ fields: identity }, { fields: custom }]],
      ['first', 'Real estate search first step', 'registration', [{ fields: identity }]],
      ['adminUser', 'Real estate admin user form', 'adminUser', [{ fields: ['[Admin User] email', '[Admin User] first name', '[Admin User] mobile phone'].map(builtin).concat(registerFields[3]) }]],
      ['adminRegistration', 'Real estate admin registration form', 'adminRegistration', [{ fields: custom }]],
      ['locale', 'Capture preferred languages', 'registration', [{ fields: ['Email', 'Password'].map(builtin).concat(registerFields[5]) }]],
    ];
    for (const [key, name, type, steps] of forms) await api(`/api/form/${r[key]}`, 'POST', { form: { name, type, steps } });
    const { theme } = await api(`/api/theme/${defaultThemeId}`);
    await api(`/api/theme/${r.theme}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Real Estate Registration' } });
    await api(`/api/theme/${r.theme}`, 'PATCH', { theme: { defaultMessages: `${theme.defaultMessages}
user.firstName=Your first name
user.email=Email
user.password=Password
user.mobilePhone=Your mobile phone number
registration.data.minprice=Minimum price
registration.data.maxprice=Maximum price
registration.data.geographicarea=Geographic area
user.data.notes=User notes` } });
    const oauthConfiguration = { authorizedRedirectURLs: ['https://local.fusionauth.io/callback'], enabledGrants: ['authorization_code'] };
    await api(`/api/application/${r.app}`, 'POST', { application: { name: 'Pied Piper Real Estate', themeId: r.theme, oauthConfiguration,
      registrationConfiguration: { enabled: true, type: 'advanced', formId: r.form }, formConfiguration: { adminRegistrationFormId: r.adminRegistration } } });
    await api(`/api/application/${r.basic}`, 'POST', { application: { name: 'Pied Piper Registration', oauthConfiguration,
      registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email', confirmPassword: true,
        firstName: { enabled: true, required: true }, lastName: { enabled: true, required: false } } } });
    await api(`/api/user/registration/${r.user}`, 'POST', { user: { email: 'carla@piedpiper.com', firstName: 'Carla', lastName: 'Walton', password: 'password', mobilePhone: '+15555550112', data: { notes: 'Interested in a family home.' } },
      registration: { applicationId: r.app, data: { minprice: 500000, maxprice: 1000000, geographicarea: 'Near University' } } });
    await api(`/api/user/registration/${r.user}`, 'POST', { registration: { applicationId: '3c219e58-ed0e-4b18-ad48-f4f92793ae32', roles: ['user_manager'] } });
    await api(`/api/user/registration/${r.manager}`, 'POST', { user: { email: 'jared@piedpiper.com', firstName: 'Jared', lastName: 'Dunn', password: 'password' },
      registration: { applicationId: '3c219e58-ed0e-4b18-ad48-f4f92793ae32', roles: ['user_manager'] } });
  },
};

const realEstateTenant = {
  order: 19,
  section: 'register',
  apply: async () => {
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: registerIds.theme, formConfiguration: { adminUserFormId: registerIds.adminUser } } });
    return () => apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
  },
};

const uncompressedTextInputs = {
  order: 20,
  section: 'register',
  apply: async () => {
    const { theme } = await apiRequest(`/api/theme/${registerIds.theme}`);
    const helpers = theme.templates.helpers.replace(/(\[#macro _input_text[\s\S]*?)\[#compress\][\s\S]*?\[\/#compress\]/, '$1');
    await apiRequest(`/api/theme/${registerIds.theme}`, 'PATCH', { theme: { templates: { helpers } } });
    return () => apiRequest(`/api/theme/${registerIds.theme}`, 'PATCH', { theme: { templates: { helpers: theme.templates.helpers } } });
  },
};

export async function normalizeRegistrationIds(page, { pathname }) {
  if (!pathname.includes(registerIds.user)) return;
  const { user } = await apiRequest(`/api/user/${registerIds.user}`);
  const ids = user.registrations.map(r => r.id);
  const stableIds = ids.map((_, i) => fixedId('f5000000002', i));
  await page.evaluate(([ids, stableIds]) => {
    const stable = id => stableIds[ids.indexOf(id)];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const id of ids) node.textContent = node.textContent.replaceAll(id, stable(id));
    }
    for (const input of document.querySelectorAll('input')) if (ids.includes(input.value)) input.value = stable(input.value);
  }, [ids, stableIds]);
}

// `before` runs ahead of the id normalisation, `after` between it and the scroll to top.
export const registerShot = ({ before, after, afterFraming, ...shot } = {}) => ({
  fixedHeight: null,
  ...shot,
  prepare: preparation({
    beforeSizing: async (page, ctx, info) => {
      await before?.(page, info);
      await normalizeRegistrationIds(page, info);
      await after?.(page, info);
      await page.evaluate(() => window.scrollTo(0, 0));
    },
    afterFraming,
  }),
  temporaryResources: [realEstateRegistration],
});

export async function openSignedOut(page, { url }) {
  const context = page.context();
  runtime.savedSso ??= (await context.cookies(`${baseUrl}`)).find(c => c.name === 'fusionauth.sso');
  await context.clearCookies({ name: 'fusionauth.sso' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('form input:not([type=hidden])').first().waitFor();
}

export const showRegistrationUrl = appId => async (page, { tag }) => {
  await page.evaluate(id => {
    const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, appId);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(500);
  await tag('register-url', () => {
    const row = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Registration URL/.test(r.textContent.trim()));
    row?.scrollIntoView({ block: 'center' });
    return row;
  });
  await page.evaluate(baseUrl => {
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(baseUrl, 'https://local.fusionauth.io');
  }, baseUrl);
};

// user-support-guide imports the old names
export { registerIds, registerFields, realEstateRegistration, realEstateTenant, uncompressedTextInputs, realEstateRegistration as temporaryResources31 };
