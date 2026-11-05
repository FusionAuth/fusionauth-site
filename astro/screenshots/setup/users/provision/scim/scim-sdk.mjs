import { defaultTenantId } from '../../../kit.mjs';
import { migration, windowShot, scrollToTop, migrationOpenMenu, migrationDetails } from '../../../migrate/_shared.mjs';

const scim = migration.scim;

// the SCIM entity types, the server and client entities, and a user
const scimEntities = {
  order: 17,
  paths: [`/api/entity/${scim.clientId}`, `/api/entity/${scim.serverId}`, `/api/user/${scim.userId}?hardDelete=true`, `/api/entity/type/${scim.clientTypeId}`, `/api/entity/type/${scim.serverTypeId}`],
  create: async api => {
    const permissions = ['enterprise:user:create', 'enterprise:user:delete', 'enterprise:user:read', 'enterprise:user:update', 'group:create', 'group:delete', 'group:read',
      'group:update', 'resource-types:read', 'schemas:read', 'service-provider-config:read', 'user:create', 'user:delete', 'user:read', 'user:update'];
    await api(`/api/entity/type/${scim.serverTypeId}`, 'POST', { entityType: { name: 'SCIM Server', permissions: permissions.map(p => ({ name: `scim:${p}` })) } });
    await api(`/api/entity/type/${scim.clientTypeId}`, 'POST', { entityType: { name: 'SCIM Client' } });
    await api(`/api/entity/${scim.serverId}`, 'POST', { entity: { name: 'SCIM Server for Default Tenant', type: { id: scim.serverTypeId },
      clientId: scim.serverId, clientSecret: 'scim-server-secret-not-for-production' } });
    await api(`/api/entity/${scim.clientId}`, 'POST', { entity: { name: 'SCIM Client for SCIM-SDK Client App', type: { id: scim.clientTypeId },
      clientId: scim.clientId, clientSecret: 'i2kNQKFBPKKJ3FsnFiPYDOrvBUslrz5l-270kQRYQMI' } });
    await api(`/api/user/${scim.userId}`, 'POST', { user: { username: 'test@example.com', email: 'test@example.com', password: 'password' }, skipVerification: true });
  },
};

const scimShot = shot => windowShot({ temporaryResources: [scimEntities], ...shot });

const search = async (page, text) => {
  await page.locator('main input[type=text]').first().fill(text);
  await page.locator('main button', { hasText: 'Search' }).first().click();
};

async function searchScimEntities(page) {
  await search(page, 'SCIM');
  await page.waitForFunction(id => document.querySelector(`main tbody a[href*="${id}"]`), scim.clientId, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

async function tagAddLink(page, tag) {
  await page.locator('main a[href="add"]').waitFor();
  await tag('scim-add', () => document.querySelector('main a[href="add"]'));
}

const addTypeShot = id => windowShot({
  after: async (page, tag) => {
    await migrationOpenMenu(page, page.locator('main el-dropdown button').first());
    await tag('scim-add', new Function(`return () => document.querySelector('[data-menu-copy] #${id}')`)());
  },
});

const entityDetailsShot = (name, typeId) => scimShot({
  before: async page => {
    await page.fill('#entity_name', name);
    await page.locator('#entity_type_id').selectOption(typeId);
    await page.evaluate(() => document.getElementById('entity_type_id-form-row').dataset.hl = 'scim-type');
  },
});

// boxes the client and server Id cells, from the client's top to the server's bottom
const boxIds = new Function(`return () => {
  const cells = ${JSON.stringify([scim.clientId, scim.serverId])}.map(id => [...document.querySelectorAll('main td')].find(td => td.textContent.trim() === id));
  if (cells.some(c => !c)) return null;
  const a = cells[0].getBoundingClientRect(), b = cells[1].getBoundingClientRect();
  const box = document.createElement('div');
  box.style.cssText = \`position:absolute;left:\${a.left + scrollX}px;top:\${a.top + scrollY}px;width:\${a.width}px;height:\${b.bottom - a.top}px;pointer-events:none\`;
  document.body.append(box);
  return box;
}`)();

export const shots = {
  'scim-sdk-server-type-add': addTypeShot('add-scim-server'),
  'scim-sdk-server-type-details': scimShot({ before: page => page.fill('#entityType_name', 'SCIM Server') }),
  'scim-sdk-client-type-add': addTypeShot('add-scim-client'),
  'scim-sdk-client-type-details': scimShot({ before: page => page.fill('#entityType_name', 'SCIM Client') }),
  'scim-sdk-server-entity-add': scimShot({ before: tagAddLink }),
  'scim-sdk-server-entity-details': entityDetailsShot('SCIM Server for Default Tenant', scim.serverTypeId),
  'scim-sdk-client-entity-add': scimShot({
    before: async (page, tag) => {
      await tagAddLink(page, tag);
      await search(page, 'SCIM Server');
      await page.waitForFunction(id => document.querySelector(`main tbody a[href*="${id}"]`), scim.serverId);
    },
  }),
  'scim-sdk-client-entity-details': entityDetailsShot('SCIM Client for SCIM-SDK Client App', scim.clientTypeId),
  'scim-sdk-entities-manage': scimShot({
    before: searchScimEntities,
    after: async (page, tag) => {
      await migrationOpenMenu(page, page.locator('main tbody tr', { hasText: scim.clientId }).locator('el-dropdown button'));
      await tag('scim-manage', () => [...document.querySelectorAll('[data-menu-copy] a')].find(a => a.textContent.trim() === 'Manage'));
    },
  }),
  'scim-sdk-client-grants': scimShot({
    before: (page, tag) => tag('scim-add', () => document.querySelector('main a[href^="/admin/entity/grant/upsert"]')),
    after: page => page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '2026-10-28T09:07:06.468Z');
    }),
  }),
  'scim-sdk-grant-search': scimShot({
    before: async page => {
      await page.locator('#entity').pressSequentially('SCIM Server', { delay: 50 });
      await page.getByText('SCIM Server for Default Tenant').first().waitFor();
      await page.waitForTimeout(500);
    },
  }),
  'scim-sdk-grant-permissions': scimShot({
    before: page => page.evaluate(() => {
      for (const box of document.querySelectorAll('main input[name="grant.permissions"]')) {
        if (['scim:user:create', 'scim:user:read'].includes(box.value) && !box.checked) box.click();
      }
    }),
  }),
  'scim-sdk-entities-ids': scimShot({
    before: async (page, tag) => {
      await searchScimEntities(page);
      await tag('scim-ids', boxIds);
    },
    after: page => page.evaluate(ids => {
      const cells = ids.map(id => [...document.querySelectorAll('main td')].find(td => td.textContent.trim() === id));
      const a = cells[0].getBoundingClientRect(), b = cells[1].getBoundingClientRect();
      const box = document.querySelector('[data-hl="scim-ids"]');
      box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    }, [scim.clientId, scim.serverId]),
  }),
  'scim-sdk-client-secret': scimShot({
    before: async page => {
      await searchScimEntities(page);
      await migrationDetails(page, `/ajax/entity/view/${scim.clientId}?tenantId=${defaultTenantId}`, 'Client secret', 'scim-secret');
    },
  }),
  'scim-sdk-lambdas': windowShot({
    before: async (page, tag) => {
      await search(page, 'SCIM');
      await page.waitForFunction(() => document.querySelectorAll('main tbody tr').length === 4);
      await tag('scim-lambdas', () => {
        const rows = [...document.querySelectorAll('main tbody tr')].filter(r => /SCIM/.test(r.querySelector('td')?.textContent));
        if (rows.length !== 4) return null;
        const a = rows[0].getBoundingClientRect(), b = rows[3].getBoundingClientRect();
        const box = document.createElement('div');
        box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
        document.body.append(box);
        return box;
      });
    },
    after: page => page.evaluate(() => [...document.querySelectorAll('main tbody tr')].filter(row => /SCIM/.test(row.querySelector('td')?.textContent)).forEach((row, index) => {
      row.querySelectorAll('td')[1].textContent = `00000000-0000-0000-0000-f100000000a${index}`;
    })),
  }),
  'scim-sdk-user-request-lambda': windowShot({
    before: async page => {
      const href = await page.evaluate(() => [...document.querySelectorAll('main tbody tr')].find(r => r.textContent.includes('SCIM User Request Converter')).querySelector('a[href^="edit/"]').getAttribute('href'));
      await page.goto(new URL(href, page.url()).href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    },
    after: page => page.evaluate(() => { const id = document.querySelector('#lambdaId, #lambda_id'); if (id) id.value = '00000000-0000-0000-0000-f100000000a2'; }),
  }),
  'scim-sdk-tenant-settings': scimShot({
    switch: ['tenant_scimServerConfiguration_enabled'],
    fixedHeight: 'SCIM server settings',
    before: async page => {
      const selects = {
        tenant_scimServerConfiguration_clientEntityTypeId: 'SCIM Client', tenant_scimServerConfiguration_serverEntityTypeId: 'SCIM Server',
        tenant_lambdaConfiguration_scimUserRequestConverterId: '[FusionAuth Default] SCIM User Request Converter',
        tenant_lambdaConfiguration_scimUserResponseConverterId: '[FusionAuth Default] SCIM User Response Converter',
        tenant_lambdaConfiguration_scimEnterpriseUserRequestConverterId: '[FusionAuth Default] SCIM User Request Converter',
        tenant_lambdaConfiguration_scimEnterpriseUserResponseConverterId: '[FusionAuth Default] SCIM User Response Converter',
        tenant_lambdaConfiguration_scimGroupRequestConverterId: '[FusionAuth Default] SCIM Group Request Converter',
        tenant_lambdaConfiguration_scimGroupResponseConverterId: '[FusionAuth Default] SCIM Group Response Converter',
      };
      for (const [id, label] of Object.entries(selects)) await page.locator(`#${id}`).selectOption({ label });
    },
  }),
  'scim-sdk-user-added': scimShot({
    stages: {
      // tagged after the scroll to the top
      beforeSizing: async (page, ctx, { tag }) => {
        await scrollToTop(page);
        await tag('scim-user', new Function(`return () => document.querySelector('main a[href*="${scim.userId}"]')?.closest('tr')`)());
      },
    },
  }),
};
