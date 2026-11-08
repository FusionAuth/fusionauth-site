import { idpShot, idpSampleCertificate } from '../_shared.mjs';

export const shots = {
  'idp-login-adfs': idpShot({ login: 111 }),
  'idp-key-import-adfs': idpShot({ keyImport: { t: 'certificate', name: 'ADFS Certificate', pem: idpSampleCertificate } }, { fixedHeight: null }),
  'idp-adfs-edit': idpShot({}, { fixedHeight: null }),
  'idp-view-adfs': idpShot({ view: 111 }, { fixedHeight: null }),
};
