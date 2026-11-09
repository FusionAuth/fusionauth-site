import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-external-jwt-configuration': idpShot(),
  'idp-external-jwt-add': idpShot(),
  'idp-external-jwt-jwt': idpShot({ scroll: 'identityProvider_debug' }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-external-jwt-domains': idpShot({ scroll: 'identityProvider_enabled' }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-external-jwt-claim-dialog': idpShot({ claimDialog: true }, { fixedHeight: null }),
  'idp-external-jwt-oauth': idpShot({ scroll: 'identityProvider_enabled' }, { fixedHeight: '[data-idp-scroll]' }),
};
