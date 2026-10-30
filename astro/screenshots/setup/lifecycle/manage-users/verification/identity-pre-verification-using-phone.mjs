import { preparation } from '../../../kit.mjs';
import { verification, fillFields } from '../_shared.mjs';
import { verificationTenant, scrollEverythingToTop } from './_shared.mjs';

export const shots = {
  'manage-pre-verification-twilio-messenger': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({
      messenger_name: 'Twilio Example', messenger_url: 'https://api.twilio.com', messenger_accountSID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      messenger_authToken: '2dacc9b0317671b0b9dacc9b0317671b', messenger_fromPhoneNumber: '+18559728742',
    }) }),
  },
  'manage-pre-verification-tenant-phone': {
    fixedHeight: 'Messaging settings',
    prepare: preparation({ beforeUserTabs: fillFields({
      tenant_emailConfiguration_verifyEmail: false, tenant_phoneConfiguration_verificationStrategy: 'ClickableLink', tenant_phoneConfiguration_unverified_allowPhoneNumberChangeWhenGated: true,
    }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-pre-verification-field-phone': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({ field_name: 'Phone number', field_key: 'user.phoneNumber', field_required: true }) }),
  },
  'manage-pre-verification-form-phone': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-pre-verification-application-phone-form': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({
      application_verifyRegistration: false, 'application_registrationConfiguration_type-advanced': true, application_registrationConfiguration_formId: verification.phoneFormId,
    }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-pre-verification-user-phone-verified': {
    fixedHeight: null,
    prepare: preparation({ afterFraming: scrollEverythingToTop }),
    temporaryResources: [verificationTenant],
  },
};
