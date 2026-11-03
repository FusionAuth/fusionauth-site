import { idpShot, idpSampleEcKey } from '../_shared.mjs';

export const shots = {
  'idp-login-apple': idpShot({ login: 131 }),
  'idp-apple-import-key': idpShot({ keyImport: { t: 'ec-private', name: 'Apple Private Key', kid: 'GCAMV1X32LQ', pem: idpSampleEcKey } }, { fixedHeight: null }),
  'idp-apple-configuration': idpShot(),
  'idp-cors-warning-apple': idpShot({ warning: 'Apple' }, { fixedHeight: null, sectionBox: 'apple' }),
};
