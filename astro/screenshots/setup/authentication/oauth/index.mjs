import { authShot, piedPiperOauthState, auth } from '../_shared.mjs';

const apiEntityType = {
  order: 23,
  paths: [`/api/entity/type/${auth.apiTypeId}`],
  create: async api => {
    await api(`/api/entity/type/${auth.apiTypeId}`, 'POST', { entityType: { name: 'API', permissions: [{ name: 'read' }, { name: 'write' }] } });
  },
};

const deviceGrant = piedPiperOauthState(15, {
  enabledGrants: ['authorization_code', 'refresh_token', 'urn:ietf:params:oauth:grant-type:device_code'], deviceVerificationURL: 'https://piedpiper.com/device',
});

export const shots = {
  'authenticate-entity-add-email-api': authShot({ fixedHeight: null, temporaryResources: [apiEntityType] }, async page => {
    await page.fill('#entity_name', 'Email API');
    await page.selectOption('#entity_type_id', auth.apiTypeId);
  }),
  'authenticate-oauth-device-user-code': authShot({ temporaryState: [deviceGrant] }, async page => {
    await page.locator('main input:visible, form input[type=text]:visible').first().pressSequentially('PYYS37');
  }),
};
