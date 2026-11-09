import { authShot } from './_shared.mjs';

export const shots = {
  'authenticate-tenant-oauth-access-token-bootstrap': authShot({ switch: ['tenant_ssoConfiguration_allowAccessTokenBootstrap'] }),
};
