import { piedPiperAppId, twoFactorTemplateIds, apiRequest, defaultTenantId, baseUrl, selfServiceFormId, apiKey } from '../../../kit.mjs';

// email and SMS two-factor templates, enabled on the default tenant
const twoFactorMessaging = {
  order: 2,
  apply: async () => {
    const emailTemplate = `/api/email/template/${twoFactorTemplateIds.email}`, messageTemplate = `/api/message/template/${twoFactorTemplateIds.sms}`;
    await apiRequest(emailTemplate, 'POST', { emailTemplate: {
      name: 'Two Factor Authentication', defaultFromName: 'Pied Piper', defaultSubject: 'Your second factor code',
      defaultHtmlTemplate: '<p>Your verification code is ${code}</p>', defaultTextTemplate: 'Your verification code is ${code}',
    } });
    await apiRequest(messageTemplate, 'POST', { messageTemplate: { name: 'Default Two Factor Request', type: 'SMS', defaultTemplate: 'Your verification code is ${code}' } });
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { multiFactorConfiguration: {
      email: { enabled: true, templateId: twoFactorTemplateIds.email },
      sms: { enabled: true, messengerId: '00000000-0000-0000-0000-500000000001', templateId: twoFactorTemplateIds.sms },
    } } });
    return async () => {
      // a PUT clears the template ids, so the templates can be deleted
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
      await apiRequest(emailTemplate, 'DELETE');
      await apiRequest(messageTemplate, 'DELETE');
    };
  },
};

// the self-service form for the Pied Piper account pages
async function configureAccountManagement() {
  try {
    const r = await fetch(`${baseUrl}/api/application/${piedPiperAppId}`, {
      method: 'PATCH',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: { formConfiguration: { selfServiceFormId: await selfServiceFormId() } } }),
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  } catch (e) {
    throw new Error(`beforeAll: selfServiceFormId patch failed: ${e.message}`, { cause: e });
  }
}

export const resources = [configureAccountManagement];

export { twoFactorMessaging };
