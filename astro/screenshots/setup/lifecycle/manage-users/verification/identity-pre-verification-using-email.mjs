import { preparation } from '../../../kit.mjs';
import { verification, fillFields } from '../_shared.mjs';
import { verificationTenant, openApplicationDetails, scrollEverythingToTop } from './_shared.mjs';

export const shots = {
  'manage-pre-verification-tenant-email': {
    fixedHeight: 'Messaging settings',
    prepare: preparation({ beforeUserTabs: fillFields({ tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_unverified_allowEmailChangeWhenGated: true }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-pre-verification-field-email': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({ field_name: 'Email address', field_key: 'user.email', field_required: true }) }),
  },
  'manage-pre-verification-form-email': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-pre-verification-application-email-form': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({
      application_verifyRegistration: false, 'application_registrationConfiguration_type-advanced': true, application_registrationConfiguration_formId: verification.emailFormId,
    }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-pre-verification-application-details': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: openApplicationDetails }),
    temporaryResources: [verificationTenant],
  },
  'manage-pre-verification-user-email-verified': {
    fixedHeight: null,
    prepare: preparation({ afterFraming: scrollEverythingToTop }),
    temporaryResources: [verificationTenant],
  },
};
