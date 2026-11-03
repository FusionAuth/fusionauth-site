import { idpShot, piperChatId } from './_shared.mjs';

export const shots = {
  'idp-google-tenants': idpShot({ tenantConfig: true }),
  'idp-google-applications': idpShot({ appRow: 'PiperChat' }),
  'idp-apple-overrides': idpShot({ overrides: piperChatId }, { band: 'el-tab-list, #applications' }),
  'idp-linking-strategy': idpShot({ listbox: 'identityProvider_linkingStrategy' }, { band: "label[for='identityProvider_linkingStrategy'], [data-hl='idp-listbox']" }),
};
