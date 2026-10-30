import { preparation } from '../../../kit.mjs';
import { leftoversAppId } from '../../../_shared.mjs';
import { authorizeUrl, openHostedPage, leftovers } from '../_shared.mjs';
import { gatewayApp } from './_shared.mjs';

export const shots = {
  'leftovers-gateway-redirect-urls': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers() }), temporaryResources: [gatewayApp] },
  'leftovers-gateway-login': {
    signedOut: true,
    prepare: preparation({ beforeSizing: leftovers(page => openHostedPage(page, 'gateway-login', authorizeUrl(leftoversAppId, 'openid'))) }),
    temporaryResources: [gatewayApp],
  },
};
