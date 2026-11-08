import { preparation } from '../../kit.mjs';
import { verification, fillFields } from '../_shared.mjs';
import { verificationTenant } from './_shared.mjs';

const tagTemplate = (page, { tag }) => tag('verification-template', () => document.getElementById('tenant_emailConfiguration_verificationEmailTemplateId')?.closest('label')?.parentElement);

const tenantTemplate = fields => ({
  fixedHeight: 'Messaging settings',
  prepare: preparation({ beforeUserTabs: fillFields({ tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_unverified_behavior: 'Allow', ...fields }, tagTemplate) }),
  temporaryResources: [verificationTenant],
});

const applicationTemplate = fields => ({
  fixedHeight: null,
  prepare: preparation({ beforeUserTabs: fillFields({ application_unverified_behavior: 'Allow', ...fields }) }),
  temporaryResources: [verificationTenant],
});

export const shots = {
  'manage-verification-email-template-right': tenantTemplate(),
  'manage-verification-email-template-wrong': tenantTemplate({ tenant_emailConfiguration_verificationEmailTemplateId: verification.registrationTemplateId }),
  'manage-verification-registration-template-right': applicationTemplate(),
  'manage-verification-registration-template-wrong': applicationTemplate({ application_verificationEmailTemplateId: verification.emailTemplateId }),
  'manage-verification-tenant-email-timeouts': { fixedHeight: 'External identifier durations' },
};
