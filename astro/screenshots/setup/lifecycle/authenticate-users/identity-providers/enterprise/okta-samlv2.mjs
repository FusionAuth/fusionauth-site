import { idpShot, idpIntegrationDetails } from '../_shared.mjs';

export const shots = {
  'idp-login-okta-saml': idpShot({ login: 113 }),
  'idp-key-import-menu': idpShot({ keyMenu: 'certificate' }, { fixedHeight: null }),
  'idp-add-menu-samlv2': idpShot({ menu: 'add/SAMLv2' }, { fixedHeight: null }),
  'idp-okta-saml-settings': idpShot({
    scroll: 'identityProvider_enabled', box: ['identityProvider_name', 'identityProvider_idpEndpoint', 'verification-keys', 'identityProvider_buttonText'],
  }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-okta-saml-claims': idpShot({ scroll: 'identityProvider_buttonText', box: ['identityProvider_uniqueIdClaim', 'identityProvider_emailClaim'] }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-view-okta-saml': idpShot({ view: 113, viewBox: idpIntegrationDetails }, { fixedHeight: null }),
  'idp-cors-warning-okta': idpShot({ warning: 'Okta SAML' }, { fixedHeight: null, sectionBox: 'okta-saml' }),
};
