import { preparation } from '../../../kit.mjs';
import { leftovers } from '../_shared.mjs';
import { gatewayApp, fillGatewayApplication } from './_shared.mjs';

export const shots = {
  'leftovers-gateway-application-create-jwt': {
    switch: ['application_jwtConfiguration_enabled'],
    fixedHeight: null,
    prepare: preparation({ beforeSizing: leftovers(page => fillGatewayApplication(page, ['accessTokenKeyId'])) }),
    temporaryResources: [gatewayApp],
  },
};
