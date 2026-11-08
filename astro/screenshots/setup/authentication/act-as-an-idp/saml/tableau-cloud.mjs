import { authShot, allowCors } from '../../_shared.mjs';
import { samlApp, viewSamlDetails, authorizeRedirect } from './_shared.mjs';

export const shots = {
  'authenticate-tableau-cloud-cors': authShot({ switch: ['systemConfiguration_corsConfiguration_enabled'], fixedHeight: 'Cross-origin requests' }, (page, ctx, info) =>
    allowCors(page, info, ['https://sso.online.tableau.com'])),
  'authenticate-tableau-cloud-application-add': authShot({ select: { application_name: 'Tableau' }, fixedHeight: null }),
  'authenticate-tableau-cloud-application-saml': authShot({
    switch: ['application_samlv2Configuration_enabled'],
    select: { application_name: 'Tableau', application_samlv2Configuration_issuer: 'https://placeholder.example.com' },
    fixedHeight: null,
  }, authorizeRedirect('https://placeholder.example.com/acs')),
  'authenticate-tableau-cloud-metadata-url': authShot({ fixedHeight: null, temporaryResources: [samlApp], resourceArgs: { 27: ['Tableau'] } }, viewSamlDetails),
};
