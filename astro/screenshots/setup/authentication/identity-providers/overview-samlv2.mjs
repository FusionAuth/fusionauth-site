import { idpShot, idpIntegrationDetails } from './_shared.mjs';

export const shots = {
  'idp-login-samlv2': idpShot({ login: 114 }),
  'idp-samlv2-configuration': idpShot(),
  'idp-samlv2-add-options': idpShot({ scroll: 'identityProvider_debug' }, { switch: ['identityProvider_loginHintConfiguration_enabled'], fixedHeight: '[data-idp-scroll]' }),
  'idp-samlv2-add-domains': idpShot({}, { band: 'el-tab-list, #managed-domains' }),
  'idp-list-samlv2-view': idpShot({ rowMenu: 114 }, { fixedHeight: null }),
  'idp-view-samlv2': idpShot({ view: 114, viewBox: idpIntegrationDetails }, { fixedHeight: null }),
  'idp-cors-warning-samlv2': idpShot({ warning: 'Pied Piper SAML' }, { fixedHeight: null, sectionBox: 'pied-piper-saml' }),
};
