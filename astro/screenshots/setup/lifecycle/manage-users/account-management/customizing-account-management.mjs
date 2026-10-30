import { readFileSync } from 'fs';
import { join } from 'path';
import { preparation, selfServiceFormId, apiRequest, richardId, projectRoot, defaultThemeId, accountThemeId, defaultTenantId, baseUrl, tabsReady } from '../../../kit.mjs';

// the self-service form asks for a birthdate, which Richard has
const richardBirthdate = {
  order: 3,
  apply: async () => {
    const formId = await selfServiceFormId();
    const { form } = await apiRequest(`/api/form/${formId}`);
    const { fields } = await apiRequest('/api/form/field');
    const birthdate = fields.find(f => f.name === 'Birthdate').id;
    await apiRequest(`/api/form/${formId}`, 'PUT', { form: { ...form, steps: [{ fields: [...form.steps[0].fields, birthdate] }, ...form.steps.slice(1)] } });
    await apiRequest(`/api/user/${richardId}`, 'PATCH', { user: { birthDate: '1981-06-04' } });
    return async () => {
      await apiRequest(`/api/form/${formId}`, 'PUT', { form });
      await apiRequest(`/api/user/${richardId}`, 'PATCH', { user: { birthDate: null } });
    };
  },
};

// the Account index template with the change from the guide
const modifiedAccountTheme = {
  order: 4,
  apply: async () => {
    const change = readFileSync(join(projectRoot, 'src/content/docs/lifecycle/manage-users/account-management/customizing-account-management.mdx'), 'utf-8')
      .match(/```ftl\n(<p>This is now modified[\s\S]*?)```/)[1];
    const { theme: source } = await apiRequest(`/api/theme/${defaultThemeId}`);
    const accountIndex = source.templates.accountIndex.replace(/(\n\s*<\/div>\n\n\s*\[#-- Edit button)/, `\n${change}$1`);
    await apiRequest(`/api/theme/${accountThemeId}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Account' } });
    await apiRequest(`/api/theme/${accountThemeId}`, 'PATCH', { theme: { templates: { accountIndex } } });
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: accountThemeId } });
    return async () => {
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: defaultThemeId } });
      await apiRequest(`/api/theme/${accountThemeId}`, 'DELETE');
    };
  },
};

async function formsList(page, ctx, { tag }) {
  await page.evaluate(() => {
    const ids = { 'Default User Self Service': 'cd2e5189-af39-4898-b3f3-78dcf4e4c6e8', 'Default Admin User': 'ba708008-432a-43d0-bdee-dac4cacc57d1', 'Default Admin Registration': '0b1faa30-0ff9-4922-b0b9-6517dd9ee7c8' };
    for (const row of document.querySelectorAll('main tbody tr')) {
      const name = Object.keys(ids).find(name => row.textContent.includes(name));
      if (name) row.querySelectorAll('td')[1].textContent = ids[name];
    }
  });
  await tag('self-service-form', () => [...document.querySelectorAll('main tbody tr')].find(tr => tr.textContent.includes('Default User Self Service')));
}

const openSelfServiceForm = async page => page.goto(`${baseUrl}/admin/form/edit/${await selfServiceFormId()}`, { waitUntil: 'networkidle' });

async function formEdit(page) {
  await openSelfServiceForm(page);
  await page.locator('#formId').evaluate(el => { el.value = 'e8270120-1ee6-49d8-805d-78de4f9e97b5'; });
}

async function formAddField(page, ctx, { tag }) {
  await openSelfServiceForm(page);
  await page.locator('a[href="/ajax/form/field/add"]').click();
  await page.locator('.prime-dialog.open #fieldId').selectOption({ label: 'Birthdate' });
  await tag('add-field-dialog', () => {
    // the dimmed page shows through the rounded corners of the crop
    const dialog = document.querySelector('.prime-dialog.open > div');
    for (const el of [dialog, dialog?.parentElement]) el?.style.setProperty('border-radius', '0');
    return dialog;
  });
}

async function themeTemplates(page, ctx, { tag }) {
  await tabsReady(page);
  // each label is followed by its tooltip text
  await page.locator('.tab-list-container button', { hasText: /^\s*Account edit\b/ }).click();
  await page.waitForTimeout(500);
  await tag('account-templates', () => {
    const buttons = [...document.querySelectorAll('.tab-list-container button')];
    const first = buttons.find(b => b.textContent.trim().startsWith('Account edit'));
    const last = buttons.find(b => b.textContent.trim().startsWith('Account WebAuthn index'));
    if (!first || !last) return null;
    // the template list scrolls on its own
    first.scrollIntoView({ block: 'start' });
    window.scrollTo(0, 0);
    const a = first.getBoundingClientRect(), b = last.getBoundingClientRect();
    const box = document.createElement('div');
    box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    document.body.append(box);
    return box;
  });
}

export const shots = {
  'account-forms-list': { prepare: preparation({ beforeUserTabs: formsList }) },
  'account-form-edit': { prepare: preparation({ beforeUserTabs: formEdit }) },
  'account-form-add-field': { prepare: preparation({ beforeUserTabs: formAddField }) },
  'account-edit-birthdate': { temporaryState: [richardBirthdate] },
  'account-theme-templates': { fixedHeight: null, prepare: preparation({ beforeUserTabs: themeTemplates }) },
  'account-home-birthdate': { modifiedAccount: true, temporaryState: [richardBirthdate, modifiedAccountTheme] },
};
