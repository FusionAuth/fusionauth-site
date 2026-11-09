import { preparation } from '../../kit.mjs';
import { fillFields, hostedLogin } from '../_shared.mjs';
import { verificationTenant, tagIdentity, markSelfServiceStrip } from './_shared.mjs';

const tagPhoneLoginType = (page, { tag }) => tag('login-type-phone', () =>
  document.querySelector('label[for="application_registrationConfiguration_loginIdType-phoneNumber"]') ?? document.getElementById('application_registrationConfiguration_loginIdType-phoneNumber')?.parentElement);

export const shots = {
  'manage-verification-tenant-messenger': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-verification-tenant-phone-settings': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({ tenant_emailConfiguration_verifyEmail: false }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-phone-template': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-verification-application-self-service-phone': {
    band: '#manage-self-service-strip',
    textPadding: 4,
    prepare: preparation({
      beforeUserTabs: fillFields({ 'application_registrationConfiguration_loginIdType-phoneNumber': true }, tagPhoneLoginType),
      afterSections: markSelfServiceStrip,
    }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-phone-gate': {
    signedOut: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('+15555552223', { code: true }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-phone-unverified-user': {
    prepare: preparation({ beforeUserTabs: tagIdentity('Phone') }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-tenant-phone-timeout': { fixedHeight: 'External identifier durations' },
};
