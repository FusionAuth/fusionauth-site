import { apiRequest, defaultTenantId, fixedId } from '../../kit.mjs';

const emailTemplateId = fixedId('4', 101);
const smsTemplateId = fixedId('4', 102);
const messengerId = '00000000-0000-0000-0000-500000000001';

// forgot password templates for both columns, so the shot shows recovery by email and text message
const recoveryTemplates = {
  order: 41,
  apply: async () => {
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    const original = {
      emailConfiguration: { forgotPasswordEmailTemplateId: tenant.emailConfiguration.forgotPasswordEmailTemplateId ?? null },
      phoneConfiguration: { forgotPasswordTemplateId: tenant.phoneConfiguration.forgotPasswordTemplateId ?? null, messengerId: tenant.phoneConfiguration.messengerId ?? null },
    };
    const link = '${baseUrl}/password/change/${changePasswordId}?tenantId=${user.tenantId}';
    await apiRequest(`/api/email/template/${emailTemplateId}`, 'POST', { emailTemplate: { name: 'Pied Piper Forgot Password', defaultSubject: 'Reset your Pied Piper password', defaultHtmlTemplate: `<a href="${link}">${link}</a>`, defaultTextTemplate: link } });
    await apiRequest(`/api/message/template/${smsTemplateId}`, 'POST', { messageTemplate: { name: 'Pied Piper Forgot Password SMS', type: 'SMS', defaultTemplate: `Reset your Pied Piper password: ${link}` } });
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: {
      emailConfiguration: { forgotPasswordEmailTemplateId: emailTemplateId },
      phoneConfiguration: { forgotPasswordTemplateId: smsTemplateId, messengerId },
    } });
    return async () => {
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: original });
      await apiRequest(`/api/email/template/${emailTemplateId}`, 'DELETE');
      await apiRequest(`/api/message/template/${smsTemplateId}`, 'DELETE');
    };
  },
};

export const shots = {
  'account-recovery-tenant-templates': { fixedHeight: 'Template settings', temporaryState: [recoveryTemplates] },
  'account-recovery-forgot-password-page': { signedOut: true },
};
