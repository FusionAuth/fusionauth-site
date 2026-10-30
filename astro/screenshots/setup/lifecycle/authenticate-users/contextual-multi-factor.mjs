import { authShot } from './_shared.mjs';

export const shots = {
  'authenticate-tenant-security-client-risk-signals': authShot({ switch: ['tenant_clientRiskConfiguration_enabled'], band: "[data-section='client-risk-configuration']" }),
};
