import { readFileSync } from 'fs';
import { join } from 'path';
import { projectRoot, defaultTenantId, baseUrl, selectTab } from '../../kit.mjs';
import { manageId, verification } from '../_shared.mjs';

const extractedCode = file => readFileSync(join(projectRoot, 'extractedcode', file), 'utf-8');

const verificationTenant = {
  order: 29,
  // deleting the tenant deletes its applications and users
  paths: [
    `/api/tenant/${verification.tenantId}`, `/api/form/${verification.emailFormId}`, `/api/form/${verification.phoneFormId}`,
    `/api/form/field/${verification.emailFieldId}`, `/api/form/field/${verification.phoneFieldId}`, `/api/email/template/${verification.emailTemplateId}`,
    `/api/email/template/${verification.registrationTemplateId}`, `/api/message/template/${verification.phoneTemplateId}`,
  ],
  create: async api => {
    const v = verification;
    const template = (name, subject, file) => ({ emailTemplate: { name, defaultSubject: subject, defaultFromName: 'Pied Piper', fromEmail: 'jared@piedpiper.com',
      defaultHtmlTemplate: extractedCode(`templates-email/${file}.html.ftl`), defaultTextTemplate: extractedCode(`templates-email/${file}.txt.ftl`) } });
    await api(`/api/email/template/${v.emailTemplateId}`, 'POST', template('Email Verification', 'Verify your Pied Piper email address', 'email-verification'));
    await api(`/api/email/template/${v.registrationTemplateId}`, 'POST', template('Registration Verification', 'Verify your PiperChat registration', 'registration-verification'));
    await api(`/api/message/template/${v.phoneTemplateId}`, 'POST', { messageTemplate: { name: 'Phone Verification', type: 'SMS', defaultTemplate: extractedCode('templates-messengers/phone-verification.txt.ftl') } });
    await api(`/api/tenant/${v.tenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper' } });
    // a copied tenant ignores the rest of the body
    await api(`/api/tenant/${v.tenantId}`, 'PATCH', { tenant: {
      emailConfiguration: { verifyEmail: true, verificationEmailTemplateId: v.emailTemplateId, verificationStrategy: 'ClickableLink', unverified: { behavior: 'Gated' } },
      phoneConfiguration: { messengerId: '00000000-0000-0000-0000-500000000001', verifyPhoneNumber: true, verificationTemplateId: v.phoneTemplateId, verificationStrategy: 'FormField', unverified: { behavior: 'Gated' } },
    } });
    const inTenant = { 'X-FusionAuth-TenantId': v.tenantId };
    const app = (name, strategy) => ({ application: { name,
      oauthConfiguration: { authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code', 'refresh_token'] },
      registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email' },
      verifyRegistration: true, verificationEmailTemplateId: v.registrationTemplateId, verificationStrategy: strategy, unverified: { behavior: 'Gated' },
    } });
    await api(`/api/application/${v.appId}`, 'POST', app('PiperChat', 'ClickableLink'), inTenant);
    await api(`/api/application/${v.codeAppId}`, 'POST', app('Not-Hotdog', 'FormField'), inTenant);
    await api(`/api/form/field/${v.emailFieldId}`, 'POST', { field: { key: 'user.email', name: 'Email address', control: 'text', type: 'email', required: true } });
    await api(`/api/form/field/${v.phoneFieldId}`, 'POST', { field: { key: 'user.phoneNumber', name: 'Phone number', control: 'text', type: 'phoneNumber', required: true } });
    // the built-in Password field gets a new id on each install
    const password = (await api('/api/form/field')).fields.find(f => f.name === 'Password').id;
    for (const [formId, name, fieldId, type] of [[v.emailFormId, 'Email verification', v.emailFieldId, 'verifyEmail'], [v.phoneFormId, 'Phone verification', v.phoneFieldId, 'verifyPhoneNumber']]) {
      await api(`/api/form/${formId}`, 'POST', { form: { name, type: 'registration', steps: [{ fields: [fieldId] }, { type, fields: [] }, { fields: [password] }] } });
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    for (const [name, [userId, user, options]] of Object.entries(v.users)) {
      await api(`/api/user/registration/${userId}`, 'POST', {
        user: { password: 'password', ...user }, registration: { ...(name === 'carla' ? { id: manageId(91) } : {}), applicationId: name === 'ed' ? v.codeAppId : v.appId }, sendSetPasswordEmail: false, ...options,
      }, inTenant);
    }
    // Skipping exempts an identity from gating; completing it supplies the verified indicator.
    for (const [, user, options] of Object.values(v.users)) {
      if (!options.skipVerification) continue;
      for (const [loginIdType, loginId] of [['email', user.email], ['phoneNumber', user.phoneNumber]]) {
        if (!loginId) continue;
        const { verificationId } = await api('/api/identity/verify/start', 'POST', { loginId, loginIdType, verificationStrategy: 'ClickableLink' }, inTenant);
        await api('/api/identity/verify/complete', 'POST', { verificationId }, inTenant);
      }
    }
  },
};

// the user's email or phone, with its verified icon
const tagIdentity = label => (page, ctx, { tag }) =>
  tag('identity', new Function(`return () => [...document.querySelectorAll('.id-detail-label')].find(l => l.textContent.trim().startsWith('${label}'))?.parentElement`)());

async function openApplicationDetails(page) {
  await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
    const cell = row?.querySelectorAll('td')[1];
    if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
  });
  await page.evaluate(id => {
    const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, verification.appId);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(baseUrl => {
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(baseUrl, 'https://local.fusionauth.io');
    // generated on each run
    const secret = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Client secret/.test(r.textContent.trim()))?.querySelectorAll('td')[1];
    if (secret) secret.textContent = 'pBjyQdXr1T0Hc9vWmA2sKf8LZnE4uYoG6Ri3MxJ7l5Q';
  }, baseUrl);
}

// measured after tab selection has finished; the shot's band crops to it
async function markSelfServiceStrip(page) {
  await selectTab(page, 'Registration');
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll('main legend')].find(el => el.textContent.trim().startsWith('Self-service registration'));
    const row = document.querySelector('#registration-configuration tbody tr:has(td)');
    if (!heading || !row) throw new Error('self-service registration section not found');
    const top = heading.getBoundingClientRect().top + scrollY;
    const bottom = row.getBoundingClientRect().bottom + scrollY;
    const strip = document.createElement('div');
    strip.id = 'manage-self-service-strip';
    strip.style.cssText = `position:absolute;left:0;top:${top}px;width:${innerWidth}px;height:${bottom - top}px;pointer-events:none`;
    document.body.append(strip);
  });
}

// user tabs can scroll the identity above the viewport during initialization
async function scrollEverythingToTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('*').forEach(el => { if (el.scrollTop) el.scrollTop = 0; });
  });
  await page.waitForTimeout(300);
}

export { extractedCode, verificationTenant, tagIdentity, openApplicationDetails, markSelfServiceStrip, scrollEverythingToTop };
