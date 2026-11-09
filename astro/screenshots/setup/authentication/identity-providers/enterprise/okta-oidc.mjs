import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-okta-oidc-edit': idpShot({ fill: { identityProvider_oauth2_issuer: 'https://piedpiper.okta.com' } }, { switch: ['useOpenIdDiscovery'], fixedHeight: null }),
  'idp-login-okta-oidc': idpShot({ login: 101 }),
};
