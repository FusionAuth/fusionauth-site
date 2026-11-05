import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-cognito': idpShot({ login: 103 }),
  'idp-add-menu-openid-connect': idpShot({ menu: 'add/OpenIDConnect' }, { fixedHeight: null }),
  'idp-cognito-edit': idpShot({ fill: { identityProvider_oauth2_issuer: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_PiedPiper' } },
    { switch: ['useOpenIdDiscovery'], fixedHeight: null }),
};
