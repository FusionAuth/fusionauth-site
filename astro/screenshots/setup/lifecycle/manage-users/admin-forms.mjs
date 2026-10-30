import { preparation, apiRequest, defaultTenantId, piedPiperAppId, monicaId, selectTab } from '../../kit.mjs';
import { adminFormsExample } from './_shared.mjs';

// custom admin user and registration forms with one custom field each, and Monica's values for them
const customAdminForms = {
  order: 18,
  apply: async () => {
    const f = adminFormsExample;
    await apiRequest(`/api/form/field/${f.colorFieldId}`, 'POST', { field: { key: 'user.data.favoriteColor', name: 'Favorite Color', control: 'text', type: 'string' } });
    await apiRequest(`/api/form/field/${f.backgroundFieldId}`, 'POST', { field: { key: 'registration.data.backgroundColor', name: 'Desired Background Color', control: 'text', type: 'string' } });
    const { forms } = await apiRequest('/api/form');
    const withField = (type, fieldId) => {
      const steps = structuredClone(forms.find(form => form.type === type && form.name.startsWith('Default')).steps);
      steps[0].fields.push(fieldId);
      return steps;
    };
    await apiRequest(`/api/form/${f.userFormId}`, 'POST', { form: { name: 'Custom Admin User', type: 'adminUser', steps: withField('adminUser', f.colorFieldId) } });
    await apiRequest(`/api/form/${f.registrationFormId}`, 'POST', { form: { name: 'Custom Admin Registration', type: 'adminRegistration', steps: withField('adminRegistration', f.backgroundFieldId) } });
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
    const { user } = await apiRequest(`/api/user/${monicaId}`);
    const { registration } = await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`);
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { formConfiguration: { adminUserFormId: f.userFormId } } });
    await apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { formConfiguration: { adminRegistrationFormId: f.registrationFormId } } });
    await apiRequest(`/api/user/${monicaId}`, 'PATCH', { user: { data: { company: 'PiedPiper', favoriteColor: 'red' } } });
    await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`, 'PATCH', { registration: { data: { backgroundColor: 'blue' } } });
    return async () => {
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
      await apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
      await apiRequest(`/api/user/${monicaId}`, 'PUT', { user, skipVerification: true });
      await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`, 'PUT', { registration, skipRegistrationVerification: true });
      for (const path of [`/api/form/${f.userFormId}`, `/api/form/${f.registrationFormId}`, `/api/form/field/${f.colorFieldId}`, `/api/form/field/${f.backgroundFieldId}`]) {
        await apiRequest(path, 'DELETE');
      }
    };
  },
};

async function tagCustomField(page, tag, key) {
  const field = page.locator(`main [name="${key}"]`);
  for (let i = 0; !(await field.count()); i++) {
    if (i === 30) throw new Error(`custom field not rendered: ${key}`);
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
  }
  await tag('custom-field', new Function(`return () => document.querySelector('main [name="${key}"]')?.closest('[id$=-form-row], .form-row, label, .input-addon-group') ?? document.querySelector('main [name="${key}"]')?.parentElement`)());
}

async function userForm(page, ctx, { tag }) {
  await tagCustomField(page, tag, 'user.data.favoriteColor');
  await page.evaluate(() => {
    const field = document.querySelector('[data-hl=custom-field]');
    const frame = document.createElement('div');
    frame.id = 'manage-admin-user-frame';
    frame.style.cssText = `position:absolute;left:0;top:0;width:${innerWidth}px;height:${field.getBoundingClientRect().bottom + scrollY + 24}px;pointer-events:none`;
    document.body.append(frame);
  });
}

async function registrationForm(page, ctx, { tag }) {
  await page.locator('#registration-form #id').evaluate(el => { el.value = '41b154f9-f2ff-40c6-9dc6-c9c4e8ffa02e'; });
  await tagCustomField(page, tag, 'registration.data.backgroundColor');
}

async function userData(page, ctx, { tag }) {
  await selectTab(page, 'User data');
  for (const key of ['favoriteColor', 'backgroundColor']) {
    await tag(key, new Function(`return () => {
      let el = [...document.querySelectorAll('#user-data *')].filter(e => e.textContent.trim().startsWith('${key}') && e.textContent.trim().length < 40).pop();
      if (!el) return null;
      if (el.tagName === 'DT') {
        el.style.marginBlock = '6px';
        el.nextElementSibling.style.marginBlock = '6px';
      }
      const range = document.createRange();
      range.setStartBefore(el);
      range.setEndAfter(el.tagName === 'DT' ? el.nextElementSibling : el);
      const r = range.getBoundingClientRect();
      const box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:' + (r.left + scrollX) + 'px;top:' + (r.top + scrollY) + 'px;width:' + r.width + 'px;height:' + r.height + 'px;pointer-events:none';
      document.body.append(box);
      return box;
    }`)());
  }
}

export const shots = {
  'manage-admin-forms-user-form': { fixedHeight: null, prepare: preparation({ beforeUserTabs: userForm }), temporaryState: [customAdminForms] },
  'manage-admin-forms-registration-form': { fixedHeight: null, prepare: preparation({ beforeUserTabs: registrationForm }), temporaryState: [customAdminForms] },
  'manage-admin-forms-user-data': { textPadding: 4, prepare: preparation({ beforeUserTabs: userData }), temporaryState: [customAdminForms] },
};
