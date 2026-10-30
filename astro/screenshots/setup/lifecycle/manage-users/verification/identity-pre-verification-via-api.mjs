import { preparation } from '../../../kit.mjs';
import { verificationTenant, scrollEverythingToTop } from './_shared.mjs';

export const shots = {
  'manage-pre-verification-user-email-phone-verified': {
    fixedHeight: null,
    prepare: preparation({ afterFraming: scrollEverythingToTop }),
    temporaryResources: [verificationTenant],
  },
};
