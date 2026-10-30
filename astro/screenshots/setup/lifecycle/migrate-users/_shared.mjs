import { fixedId, baseUrl, selectTab, defaultTenantId, preparation } from '../../kit.mjs';

const migration = {
  // matches the example tenant Id in the migration guides
  importTenantId: '25c9d123-8a79-4edd-9f76-8dd9c806b0f3',
  importAppId: '00000000-0000-0000-0000-f10000000001',
  importUsers: [
    ['00000000-0000-0000-0000-f10000000011', 'jared@example.com', 'Jared', 'Dunn'],
    ['00000000-0000-0000-0000-f10000000012', 'laurie@example.com', 'Laurie', 'Bream'],
  ],
  apiKeyId: '00000000-0000-0000-0000-f10000000021',
  connectorTenantId: '00000000-0000-0000-0000-f10000000031',
  ldapConnectorId: '00000000-0000-0000-0000-f10000000032',
  genericConnectorId: '00000000-0000-0000-0000-f10000000033',
  reconcileLambdaId: '00000000-0000-0000-0000-f10000000034',
  policyTenantId: '00000000-0000-0000-0000-f10000000035',
  googleIdpId: '82339786-3dff-42a6-aac6-1f1ceecb6c46',
  exampleUsers: [
    ['00000000-0000-0000-0000-f10000000061', 'janesmith@example.com', 'Jane', 'Smith'],
    ['00000000-0000-0000-0000-f10000000062', 'johndoe@example.com', 'John', 'Doe'],
  ],
  scim: {
    serverTypeId: '00000000-0000-0000-0000-f10000000071',
    clientTypeId: '00000000-0000-0000-0000-f10000000072',
    serverId: '00000000-0000-0000-0000-f10000000073',
    clientId: '00000000-0000-0000-0000-f10000000074',
    userId: '00000000-0000-0000-0000-f10000000075',
  },
  // the generic connector each guide sets up, and the tenant its policy goes on
  providers: {
    akamai: { name: 'AkamaiConnector', authenticationURL: 'http://app', timeout: 5000, debug: true },
    frontegg: { name: 'FronteggConnector', authenticationURL: 'http://host.docker.internal:6252', timeout: 3000, debug: true },
    passportjs: { name: 'My App Connector', authenticationURL: 'https://piedpiper.ngrok-free.app/fusionauth/connector', timeout: 5000, debug: true },
    rails: { name: 'My App Connector', authenticationURL: 'https://piedpiper.ngrok-free.app/fusionauth/connector', timeout: 5000, debug: true },
    pingone: { name: 'PingIdentityConnector', authenticationURL: 'https://piedpiper.ngrok-free.app/api/RopcProxy?code=s0ndU863xdbXsFO4dLZAJQXLzyTU789iaUJ43uLAtIkXm_AzFuFWP1zg==', importTenant: true },
    azureadb2c: { name: 'Azure AD B2C migration', authenticationURL: 'https://piedpiper.azurewebsites.net/api/RopcProxy?code=s0ndU863xdbXsFO4dLZAJQXLzyTU789iaUJ43uLAtIkXm_AzFuFWP1zg==', importTenant: true },
    cognito: { name: 'Cognito migration', authenticationURL: 'https://k12hcvhgk.execute-api.us-east-2.amazonaws.com/call', importTenant: true, header: ['Authorization', '2687EE95-AF19-4CE6-A8BD-963139DED32E'] },
  },
};
Object.values(migration.providers).forEach((provider, index) => {
  provider.connectorId = fixedId('f1000000008', index);
  provider.tenantId = provider.importTenant ? migration.importTenantId : fixedId('f1000000009', index);
});

const scrollToTop = page => page.evaluate(() => window.scrollTo(0, 0));

// A viewport crop preserves the framing when highlights would otherwise scroll to the centre.
async function frameMigration(page, highlights) {
  await page.evaluate(() => {
    const frame = document.createElement('div');
    frame.dataset.migrationWindow = '';
    frame.style.cssText = `position:absolute;left:0;top:${scrollY}px;width:${innerWidth}px;height:${innerHeight}px;pointer-events:none`;
    document.body.append(frame);
  });
  const clipped = await page.evaluate(specs => specs.filter(({ selector }) => {
    const el = document.querySelector(selector);
    if (!el) return true;
    const r = el.getBoundingClientRect();
    return r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth;
  }).map(({ selector }) => selector), highlights);
  if (clipped.length) throw new Error(`migration highlight outside frame: ${clipped.join(', ')}`);
}

// `before` runs before the window is sized and ends at the top of the page; `after` runs last and ends with the frame check, which band shots skip
function migrationShot({ before, after, stages, ...shot }) {
  return {
    ...shot,
    prepare: preparation({
      beforeSizing: async (page, ctx, { tag }) => {
        await before?.(page, tag);
        await scrollToTop(page);
      },
      ...(!shot.band && {
        finish: async (page, ctx, { tag }) => {
          await after?.(page, tag);
          await frameMigration(page, ctx.highlights);
        },
      }),
      ...stages,
    }),
  };
}

// windows kept at the screenshot's height, like the originals
const windowShot = shot => migrationShot({ fixedHeight: null, ...shot });

// opens a dropdown menu and leaves a plain copy of it, since the menu can close before the capture
async function migrationOpenMenu(page, button) {
  await button.click();
  const menu = page.locator('el-menu:popover-open').first();
  await menu.waitFor();
  // let the menu finish opening and take its place
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const menu = document.querySelector('el-menu:popover-open');
    // Measure the open menu rather than an intermediate animation scale.
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.dataset.menuCopy = '';
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
  });
}

// opens a row's Delete menu, from the copy migrationOpenMenu leaves
async function openDeleteMenu(page, tag, row) {
  await migrationOpenMenu(page, row.locator('el-dropdown button'));
  await tag('migration-delete', () => [...document.querySelectorAll('[data-menu-copy] a')].find(a => a.textContent.trim() === 'Delete'));
}

// opens the details dialog of a list row and marks the row with the given label
async function migrationDetails(page, href, label, tagName) {
  await page.evaluate(h => {
    const link = document.querySelector(`main a[href="${h}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, href);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(800);
  const found = await page.evaluate(([[l, t], baseUrl]) => {
    const dialog = document.querySelector('.prime-dialog.open');
    for (const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT); walker.nextNode();) {
      walker.currentNode.textContent = walker.currentNode.textContent.replaceAll(`${baseUrl}`, 'https://local.fusionauth.io');
    }
    if (!l) return true;
    const row = [...dialog.querySelectorAll('tr')].find(r => new RegExp(`^(${l})`).test(r.textContent.trim()));
    if (!row) return false;
    if (row.getBoundingClientRect().right > dialog.getBoundingClientRect().right - 12) {
      for (const table of dialog.querySelectorAll('table')) {
        table.style.tableLayout = 'fixed';
        table.style.width = '100%';
        for (const cell of table.querySelectorAll('td, th')) cell.style.overflowWrap = 'anywhere';
        for (const row of table.rows) if (row.cells.length === 2) { row.cells[0].style.width = '28%'; row.cells[1].style.width = '72%'; }
      }
    }
    let scroller = row.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    if (scroller) scroller.scrollTop += row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 160;
    row.dataset.hl = t;
    return true;
  }, [[label, tagName], baseUrl]);
  if (!found) throw new Error(`no ${label} row`);
}

const showLoginUrl = (page, appId) => migrationDetails(page, `/ajax/application/view/${appId}`, 'OAuth IdP login URL|Login URLs?:', 'migration-login-url');

async function migrationAddPolicy(page, connector, submit) {
  await page.locator('#add-connector-policy').click();
  await page.locator('.prime-dialog.open').waitFor();
  await page.locator('.prime-dialog.open #connectorId').selectOption({ label: connector });
  await page.evaluate(() => { const m = document.querySelector('.prime-dialog.open #connectorMigrate'); if (!m.checked) m.click(); });
  await page.waitForTimeout(500);
  if (!submit) return;
  await page.locator('.prime-dialog.open button[type=submit]').click();
  await page.locator('.prime-dialog.open').waitFor({ state: 'detached' });
  await page.waitForTimeout(500);
  // move the new policy above the default one
  await page.evaluate(name => {
    const row = [...document.querySelectorAll('#connectors tbody tr')].find(r => r.textContent.includes(name));
    row.querySelector('.updown.up').click();
  }, connector);
  await page.waitForTimeout(300);
}

async function migrationFillConnector(page, provider) {
  await page.fill('#connector_name', provider.name);
  await page.fill('#connector_authenticationURL', provider.authenticationURL);
  if (provider.timeout) {
    await page.fill('#connector_connectTimeout', String(provider.timeout));
    await page.fill('#connector_readTimeout', String(provider.timeout));
  }
  if (provider.debug) await page.evaluate(() => { const d = document.getElementById('connector_debug'); if (!d.checked) d.click(); });
  await page.waitForTimeout(500);
  if (provider.header) {
    await selectTab(page, 'Headers');
    await page.locator('#header-add-button').click();
    await page.waitForTimeout(300);
    const inputs = page.locator('#headers tbody input[type=text]');
    await inputs.nth(0).fill(provider.header[0]);
    await inputs.nth(1).fill(provider.header[1]);
    await scrollToTop(page);
  }
}

// a provider's connector, and its own tenant unless the policy goes on the import tenant
function connectorResources(key, order) {
  const provider = migration.providers[key];
  return {
    order,
    paths: [...(!provider.importTenant ? [`/api/tenant/${provider.tenantId}`] : []), `/api/connector/${provider.connectorId}`],
    create: async api => {
      await api(`/api/connector/${provider.connectorId}`, 'POST', { connector: {
        type: 'Generic', name: provider.name, authenticationURL: provider.authenticationURL, connectTimeout: provider.timeout ?? 1000, readTimeout: provider.timeout ?? 2000,
        debug: !!provider.debug, headers: provider.header && { [provider.header[0]]: provider.header[1] },
      } });
      if (!provider.importTenant) await api(`/api/tenant/${provider.tenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper migration' } });
    },
  };
}

// the guide's three connector shots: filling in the connector, adding its policy, and the policy added
function connectorShots(key, temporaryResources, { boxFields } = {}) {
  const provider = migration.providers[key];
  return {
    [`migration-${key}-connector`]: windowShot({
      before: async (page, tag) => {
        await migrationFillConnector(page, provider);
        if (!boxFields) return;
        await tag('migration-connector-fields', () => {
          const ids = ['connector_name', 'connector_authenticationURL', 'connector_connectTimeout', 'connector_readTimeout'];
          const rects = ids.map(id => document.getElementById(id + '-form-row').getBoundingClientRect());
          const box = document.createElement('div');
          box.style.cssText = `position:absolute;left:${rects[0].left + scrollX}px;top:${rects[0].top + scrollY}px;width:${rects[0].width}px;height:${rects.at(-1).bottom - rects[0].top}px;pointer-events:none`;
          document.body.append(box);
          return box;
        });
      },
    }),
    [`migration-${key}-connector-policy`]: windowShot({ before: page => migrationAddPolicy(page, provider.name, false), temporaryResources }),
    [`migration-${key}-connector-added`]: windowShot({ before: page => migrationAddPolicy(page, provider.name, true), temporaryResources }),
  };
}

// searches the users list for the example.com users and boxes their rows
async function searchUsers(page, tag, users) {
  const ids = users.map(([id]) => id);
  await page.fill('#s_queryString', 'example.com');
  await page.keyboard.press('Enter');
  await page.waitForFunction(n => document.querySelectorAll('main tbody tr').length === n, ids.length, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await tag('migration-users', new Function(`return () => {
    const rows = ${JSON.stringify(ids)}.map(id => document.querySelector(\`main a[href*="\${id}"]\`)?.closest('tr'));
    if (rows.some(r => !r)) return null;
    const a = rows[0].getBoundingClientRect(), b = rows.at(-1).getBoundingClientRect();
    const box = document.createElement('div');
    box.style.cssText = \`position:absolute;left:\${a.left + scrollX}px;top:\${Math.min(a.top, b.top) + scrollY}px;width:\${a.width}px;height:\${Math.abs(b.top - a.top) + a.height}px;pointer-events:none\`;
    document.body.append(box);
    return box;
  }`)());
}

// the connector tenant with an LDAP and a generic connector policy
const connectorTenant = {
  order: 7,
  paths: [`/api/tenant/${migration.connectorTenantId}`, `/api/connector/${migration.ldapConnectorId}`, `/api/connector/${migration.genericConnectorId}`, `/api/lambda/${migration.reconcileLambdaId}`],
  create: async api => {
    await api(`/api/lambda/${migration.reconcileLambdaId}`, 'POST', { lambda: { name: 'Active Directory reconcile', type: 'LDAPConnectorReconcile', engineType: 'GraalJS',
      body: 'function reconcile(user, userAttributes) {\n  user.email = userAttributes.mail;\n}' } });
    await api(`/api/connector/${migration.ldapConnectorId}`, 'POST', { connector: {
      type: 'LDAP', name: 'Active Directory', authenticationURL: 'ldaps://ldap.piedpiper.com:636', securityMethod: 'LDAPS', connectTimeout: 1000, readTimeout: 2000,
      baseStructure: 'dc=piedpiper,dc=com', systemAccountDN: 'cn=fusionauth,ou=system,dc=piedpiper,dc=com', systemAccountPassword: 'not-a-secret',
      loginIdAttribute: 'mail', identifyingAttribute: 'uid', requestedAttributes: ['cn', 'givenName', 'sn', 'mail', 'uid'],
      lambdaConfiguration: { reconcileId: migration.reconcileLambdaId },
    } });
    await api(`/api/connector/${migration.genericConnectorId}`, 'POST', { connector: {
      type: 'Generic', name: 'Legacy User API', authenticationURL: 'https://api.piedpiper.com/legacy/login', connectTimeout: 1000, readTimeout: 2000,
    } });
    await api(`/api/tenant/${migration.connectorTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper' } });
    const { tenant } = await api(`/api/tenant/${migration.connectorTenantId}`);
    await api(`/api/tenant/${migration.connectorTenantId}`, 'PUT', { tenant: { ...tenant, connectorPolicies: [
      { connectorId: migration.ldapConnectorId, domains: ['example.com'], migrate: false },
      { connectorId: migration.genericConnectorId, domains: ['*'], migrate: true },
      { connectorId: 'e3306678-a53a-4964-9040-1c96f36dda72', domains: ['*'], migrate: false },
    ] } });
  },
};

export {
  migration, scrollToTop, frameMigration, migrationShot, windowShot, migrationOpenMenu, openDeleteMenu, migrationDetails, showLoginUrl, migrationAddPolicy,
  migrationFillConnector, connectorResources, connectorShots, searchUsers, connectorTenant,
};
