import { authShot, piedPiperOauthState, auth } from '../_shared.mjs';

const apiEntityType = {
  order: 23,
  paths: [`/api/entity/type/${auth.apiTypeId}`],
  create: async api => {
    await api(`/api/entity/type/${auth.apiTypeId}`, 'POST', { entityType: { name: 'API', permissions: [{ name: 'read' }, { name: 'write' }] } });
  },
};

// Email API with access to the reminder and todo APIs, on their own type so the API type above can come and go
const grantIds = { type: '00000000-0000-0000-0000-f30000000020', email: '00000000-0000-0000-0000-f30000000021', reminder: '00000000-0000-0000-0000-f30000000022', todo: '00000000-0000-0000-0000-f30000000023' };
const grantEntities = {
  order: 24,
  paths: [`/api/entity/${grantIds.email}`, `/api/entity/${grantIds.reminder}`, `/api/entity/${grantIds.todo}`, `/api/entity/type/${grantIds.type}`],
  create: async api => {
    await api(`/api/entity/type/${grantIds.type}`, 'POST', { entityType: { name: 'API', permissions: [{ name: 'read' }, { name: 'write' }] } });
    for (const [key, name] of [['email', 'Email API'], ['reminder', 'Reminder API'], ['todo', 'Todo API']]) {
      await api(`/api/entity/${grantIds[key]}`, 'POST', { entity: { name, type: { id: grantIds.type }, clientId: grantIds[key] } });
    }
    // the manage page lists the entities this one may access, so the grants are on those
    await api(`/api/entity/${grantIds.reminder}/grant`, 'POST', { grant: { recipientEntityId: grantIds.email, permissions: ['read'] } });
    await api(`/api/entity/${grantIds.todo}/grant`, 'POST', { grant: { recipientEntityId: grantIds.email } });
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
  'authenticate-entity-grants': authShot({ fixedHeight: null, temporaryResources: [grantEntities] }, async page => {
    await page.locator('main button').filter({ hasText: /Search/ }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // creation times are ISO timestamps, which the shared date pinning leaves alone, and grant ids are new each run
    await page.evaluate(() => {
      const grantIds = [...document.querySelectorAll('main td:first-child')].filter(td => /^[0-9a-f-]{36}$/.test(td.textContent.trim()));
      grantIds.forEach((td, i) => { td.textContent = `00000000-0000-0000-0000-f3000000003${i}`; });
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '2026-09-24T09:00:00.000Z');
    });
  }),
  'authenticate-oauth-device-user-code': authShot({ temporaryState: [deviceGrant] }, async page => {
    await page.locator('main input:visible, form input[type=text]:visible').first().pressSequentially('PYYS37');
  }),
};
