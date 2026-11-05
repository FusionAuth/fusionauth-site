import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-samlv2-idp-initiated-add': idpShot({}, { fixedHeight: null }),
  'idp-samlv2-idp-initiated-add-options': idpShot({}, { band: 'el-tab-list, #options' }),
  'idp-list-saml-idp-initiated-view': idpShot({ rowMenu: 121 }, { fixedHeight: null }),
};
