import { preparation, tabsReady, selectTab } from '../../kit.mjs';

const hierarchy = {
  types: {
    Company: 'b8d0f2a4-6e3c-4b9d-8f7a-2c4e6a8b0f59',
    Department: 'c9e1a3b5-7f4d-4c0e-9a8b-3d5f7b9c1a60',
    Document: 'd0f2b4c6-8a5e-4d1f-a9c0-4e6a8c0d2b71',
  },
  entities: {
    'Change Bank': ['Company', 'e1a3c5d7-9b6f-4e2a-b0d1-5f7b9d1e3c82'],
    'Change Insurance': ['Company', 'f2b4d6e8-0c7a-4f3b-81e2-6a8c0e2f4d93'],
    'Change Insurance Operations': ['Department', 'a3c5e7f9-1d8b-4a4c-92f3-7b9d1f3a5ea4'],
    'Change Bank Operations': ['Department', 'b4d6f8a0-2e9c-4b5d-a3a4-8c0e2a4b6fb5'],
    'Change Bank Finance': ['Department', 'c5e7a9b1-3f0d-4c6e-b4b5-9d1f3b5c7ac6'],
    Passwords: ['Document', 'e52925cb-1072-421f-9f64-a64aacd8a7cb'],
    Statements: ['Document', '832bf368-6adc-4ae0-b838-41feeb01ac47'],
  },
  // entity, the entity it is granted on, permissions
  grants: [
    ['Change Bank Operations', 'Change Bank', ['IsMember']],
    ['Change Bank Finance', 'Change Bank', ['IsMember']],
    ['Change Insurance Operations', 'Change Insurance', ['IsMember']],
    ['Passwords', 'Change Bank Operations', ['IsMember']],
    ['Statements', 'Change Bank Finance', ['IsMember']],
  ],
};

const hierarchyEntities = {
  order: 2,
  paths: [...Object.values(hierarchy.entities).map(([, id]) => `/api/entity/${id}`), ...Object.values(hierarchy.types).map(id => `/api/entity/type/${id}`)],
  create: async api => {
    for (const [name, id] of Object.entries(hierarchy.types)) {
      const permissions = (name === 'Document' ? ['Read', 'Write'] : ['Read', 'Write', 'IsMember']).map(p => ({ name: p }));
      await api(`/api/entity/type/${id}`, 'POST', { entityType: { name, permissions } });
    }
    for (const [name, [type, id]] of Object.entries(hierarchy.entities)) {
      await api(`/api/entity/${id}`, 'POST', { entity: { name, type: { id: hierarchy.types[type] } } });
    }
    const entityId = name => hierarchy.entities[name][1];
    for (const [name, parent, permissions] of hierarchy.grants) {
      await api(`/api/entity/${entityId(parent)}/grant`, 'POST', { grant: { recipientEntityId: entityId(name), permissions } });
    }
    await api(`/api/entity/${entityId('Change Bank Operations')}/grant`, 'POST', { grant: { userId: '00000000-0000-0000-0000-100000000001', permissions: ['Read', 'Write', 'IsMember'] } });
  },
};

// leave only the hierarchy's rows, hiding the printers fixtures
const hidePrinters = count => page =>
  page.evaluate(count => {
    for (const row of document.querySelectorAll('main tbody tr')) {
      if (/Printers|Office Printer/.test(row.textContent)) row.remove();
    }
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/1[–-]\d+ of \d+ results/, `1–${count} of ${count} results`);
  }, count);

// the entities page lists nothing until searched
async function searchEntities(page) {
  await page.locator('main button', { hasText: 'Search' }).first().click();
  await page.waitForFunction(() => document.querySelectorAll('main tbody tr').length >= 7, null, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await hidePrinters(7)(page);
}

async function showUserGrant(page) {
  await tabsReady(page);
  await selectTab(page, 'Entity grants');
  await page.waitForFunction(() => [...document.querySelectorAll('#entity-grants tbody tr')].some(tr => tr.textContent.includes('Change Bank Operations')), null, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

async function pinGrantId(page) {
  await page.evaluate(() => {
    for (const row of document.querySelectorAll('#entity-grants tbody tr')) {
      if (row.textContent.includes('Change Bank Operations')) row.querySelector('td').textContent = '20990ee5-5a68-4345-afd0-0fbed9e5c8ee';
    }
  });
}

export const shots = {
  'hierarchy-entity-types': { legacyVersion: true, prepare: preparation({ beforeUserTabs: hidePrinters(3) }), temporaryResources: [hierarchyEntities] },
  'hierarchy-entities': { legacyVersion: true, prepare: preparation({ beforeUserTabs: searchEntities }), temporaryResources: [hierarchyEntities] },
  'hierarchy-user-grant': { legacyVersion: true, prepare: preparation({ beforeUserTabs: showUserGrant, afterFraming: pinGrantId }), temporaryResources: [hierarchyEntities] },
};
