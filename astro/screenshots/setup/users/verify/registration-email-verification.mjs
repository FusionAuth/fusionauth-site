import { preparation } from '../../kit.mjs';
import { fillFields } from '../_shared.mjs';
import { verificationTenant, tagIdentity } from './_shared.mjs';

export const shots = {
  'manage-verification-application-registration-delete': {
    fixedHeight: 'Registration verification settings',
    prepare: preparation({ beforeUserTabs: fillFields({
      application_unverified_behavior: 'Allow', application_registrationDeletePolicy_unverified_enabled: true, application_registrationDeletePolicy_unverified_numberOfDaysToRetain: '2',
      'application_registrationConfiguration_loginIdType-phoneNumber': true, application_registrationConfiguration_confirmPassword: true,
    }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-verified-user': {
    prepare: preparation({ beforeUserTabs: tagIdentity('Email') }),
    temporaryResources: [verificationTenant],
  },
};
