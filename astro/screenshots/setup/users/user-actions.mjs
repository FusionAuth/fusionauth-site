import { preparation, apiRequest, piedPiperAppId, selectTab } from '../kit.mjs';
import { manageId, userActionsExample, fillFields, hostedLogin } from './_shared.mjs';

const userActionExamples = {
  order: 30,
  paths: [
    `/api/user-action/${userActionsExample.surveyActionId}`, `/api/user-action-reason/${userActionsExample.paidReasonId}`, `/api/user-action-reason/${userActionsExample.expiredReasonId}`,
    `/api/email/template/${userActionsExample.welcomeTemplateId}`, `/api/email/template/${userActionsExample.goodbyeTemplateId}`,
  ],
  create: async api => {
    const u = userActionsExample;
    await api(`/api/user-action/${u.surveyActionId}`, 'POST', { userAction: { name: 'Survey', options: [['Good', 'Bona'], ['Neutral', 'Meza'], ['Bad', 'Malbona']].map(([name, eo]) => ({ name, localizedNames: { eo } })) } });
    await api(`/api/user-action-reason/${u.paidReasonId}`, 'POST', { userActionReason: { text: 'Paid Subscription', code: 'PS' } });
    await api(`/api/user-action-reason/${u.expiredReasonId}`, 'POST', { userActionReason: { text: 'Expired Subscription', code: 'ES' } });
    const body = text => ({ defaultHtmlTemplate: text, defaultTextTemplate: text });
    await api(`/api/email/template/${u.welcomeTemplateId}`, 'POST', { emailTemplate: { name: 'Welcome', defaultSubject: 'Welcome', ...body('Welcome to PiedPiper. Your subscription is valid for one month of reading.') } });
    await api(`/api/email/template/${u.goodbyeTemplateId}`, 'POST', { emailTemplate: { name: 'Goodbye', defaultSubject: 'Goodbye', ...body('Your subscription has expired and you may no longer read the news. Goodbye.') } });
  },
};

// the subscriber's Pied Piper registration gets a customer role
const customerRole = {
  order: 16,
  apply: async () => {
    const userId = '00000000-0000-0000-0000-100000000002';
    const roleId = manageId(106);
    const { registration } = await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`);
    await apiRequest(`/api/application/${piedPiperAppId}/role/${roleId}`, 'POST', { role: { name: 'customer' } });
    await new Promise(resolve => setTimeout(resolve, 5000));
    await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`, 'PUT', { registration: { ...registration, roles: ['customer'] }, skipRegistrationVerification: true });
    return async () => {
      await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`, 'PUT', { registration, skipRegistrationVerification: true });
      await apiRequest(`/api/application/${piedPiperAppId}/role/${roleId}`, 'DELETE');
    };
  },
};

async function showActionUserItem(page) {
  await page.locator('header el-dropdown button').click();
  await page.locator('el-menu:has(#add-user-comment)').waitFor();
  await page.evaluate(() => {
    const menu = document.querySelector('el-menu:has(#add-user-comment)');
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
    const item = [...copy.querySelectorAll('a, button')].find(a => /^Action user$/i.test(a.textContent.trim()));
    if (item) item.dataset.hl = 'action-user';
  });
}

async function addRoles(page) {
  await page.locator('#role-add-button').click();
  await page.locator('#role-add-button').click();
  await page.locator('input[name="application.roles[0].name"]').fill('admin');
  await page.locator('input[name="application.roles[1].name"]').fill('customer');
  await page.locator('input[name="application.roles[0].isSuperRole"][type=checkbox]').check();
}

async function fillOauth(page) {
  await selectTab(page, 'OAuth');
  await page.locator('#client-secret-input').evaluate(el => { el.value = 'pied-piper-example-client-secret'; });
  const input = page.locator('#redirectURLs-display input');
  await input.fill('http://localhost:3000/oauth-redirect');
  await input.press('Enter');
  await page.waitForTimeout(300);
}

async function fillTemplateBodies(page) {
  const set = await page.evaluate(text => {
    const editors = [...document.querySelectorAll('main .CodeMirror')].map(e => e.CodeMirror);
    editors.forEach(cm => cm.setValue(text));
    return editors.length;
  }, 'Welcome to PiedPiper. Your subscription is valid for one month of reading.');
  if (!set) throw new Error('email template editors not found');
}

const formShot = (fields, then) => ({ fixedHeight: null, prepare: preparation({ beforeUserTabs: fillFields(fields, then) }) });

export const shots = {
  'manage-user-actions-action-user': { prepare: preparation({ beforeUserTabs: showActionUserItem }) },
  'manage-user-actions-tenant-smtp': formShot({ tenant_emailConfiguration_host: 'host.docker.internal', tenant_emailConfiguration_port: '1025' }),
  'manage-user-actions-application-add': formShot({ applicationId: manageId(101), application_name: 'PiedPiper' }, addRoles),
  'manage-user-actions-application-oauth': formShot({ applicationId: manageId(101), application_name: 'PiedPiper', application_oauthConfiguration_logoutURL: 'http://localhost:3000/logout' }, fillOauth),
  'manage-user-actions-admin-registrations': {},
  'manage-user-actions-subscriber': { temporaryState: [customerRole] },
  'manage-user-actions-api-key': formShot({ apiKeyId: manageId(102), apiKey_key: 'FTQkSoanK7ObbNjOoU69WDVclfTx8L_zfEJbdR8M0xu-jKotV0iQZiQh' }),
  'manage-user-actions-welcome-template': formShot({ emailTemplateId: manageId(103), emailTemplate_name: 'Welcome', emailTemplate_defaultSubject: 'Welcome' }, fillTemplateBodies),
  'manage-user-actions-reasons-button': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: (page, ctx, { tag }) => tag('reasons-button', () => [...document.querySelectorAll('main header a')].find(a => a.textContent.trim() === 'Reasons')) }),
  },
  'manage-user-actions-reasons': { fixedHeight: null, temporaryResources: [userActionExamples] },
  'manage-user-actions-webhook-add': formShot({ webhookId: manageId(104), webhook_url: 'http://host.docker.internal:3000/intercom', "webhook_eventsEnabled['UserAction']": true }),
  'manage-user-actions-subscribe-action': {
    ...formShot({
      userAction_id: manageId(105), userAction_name: 'Subscribe', userAction_temporal: true, userAction_sendEndEvent: true,
      userAction_userEmailingEnabled: true, userAction_includeEmailInEventJSON: true, userAction_startEmailTemplateId: userActionsExample.welcomeTemplateId,
      userAction_modifyEmailTemplateId: userActionsExample.goodbyeTemplateId, userAction_cancelEmailTemplateId: userActionsExample.goodbyeTemplateId,
      userAction_endEmailTemplateId: userActionsExample.goodbyeTemplateId,
    }, page => selectTab(page, 'Email')),
    temporaryResources: [userActionExamples],
  },
  'manage-user-actions-survey-action': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: page => page.locator('#userAction_name').waitFor() }),
    temporaryResources: [userActionExamples],
  },
  'manage-user-actions-locked-account': {
    fixedHeight: null,
    signedOut: true,
    keepAlerts: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('gavin@hooli.com', { gated: false }) }),
  },
};
