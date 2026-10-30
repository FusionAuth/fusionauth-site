import { authShot } from '../../_shared.mjs';
import { samlApp, viewSamlDetails } from './_shared.mjs';

export const shots = {
  'authenticate-application-saml-view-dialog': authShot({ fixedHeight: null, temporaryResources: [samlApp], resourceArgs: { 27: ['Pied Piper SAML'] } }, viewSamlDetails),
};
