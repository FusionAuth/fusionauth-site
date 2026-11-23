import { idpShot } from './_shared.mjs';

export const shots = {
  'idp-linking-strategy': idpShot({ listbox: 'identityProvider_linkingStrategy' }, { band: "label[for='identityProvider_linkingStrategy'], [data-hl='idp-listbox']" }),
};
