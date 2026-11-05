import { preparation, baseUrl, runtime } from '../../kit.mjs';

const blueprintTenantId = 'a7c9e1b3-5d2f-4a8c-9e6b-1f3a5c7e9d48';

const blueprintTenant = {
  order: 1,
  paths: [`/api/tenant/${blueprintTenantId}`],
  create: async api => {
    await api(`/api/tenant/${blueprintTenantId}`, 'POST', { sourceTenantId: '30663132-6464-6665-3032-326466613934', tenant: { name: 'ppvctest2' } });
    await api('/api/user/00000000-0000-0000-0000-f00000000002', 'POST', { user: { email: 'jianyang@octhulu.com', password: 'password', firstName: 'Jian', lastName: 'Yang' } }, { 'X-FusionAuth-TenantId': blueprintTenantId });
  },
};

// one box down the Tenant column
const tenantColumn = () => {
  const table = document.querySelector('main table');
  const index = [...(table?.querySelectorAll('thead th') ?? [])].findIndex(th => th.textContent.trim() === 'Tenant');
  if (index < 0) return null;
  const cells = [...table.querySelectorAll('tr')].map(tr => tr.children[index]).filter(Boolean);
  const first = cells[0].getBoundingClientRect(), last = cells.at(-1).getBoundingClientRect();
  const box = document.createElement('div');
  box.style.cssText = `position:absolute;left:${first.left + scrollX}px;top:${first.top + scrollY}px;width:${first.width}px;height:${last.bottom - first.top}px;pointer-events:none`;
  document.body.append(box);
  return box;
};

async function searchJian(page, ctx, { url, tag }) {
  // The admin session caches the tenant count from its last login.
  runtime.multiTenantCookies = await page.context().cookies();
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('#loginId', 'richard@piedpiper.com');
  await page.fill('#password', 'password');
  await page.keyboard.press('Enter');
  await page.waitForURL(u => u.pathname.startsWith('/admin') && !u.pathname.startsWith('/admin/login'));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.fill('#s_queryString', 'jian');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => [...document.querySelectorAll('main tbody tr')].length === 2 && [...document.querySelectorAll('main table thead th')].some(th => th.textContent.trim() === 'Tenant'), null, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await tag('tenant-column', tenantColumn);
}

// Normalize dates before measuring the table column highlight.
async function remeasureTenantColumn(page) {
  await page.evaluate(() => {
    const table = document.querySelector('main table');
    const index = [...table.querySelectorAll('thead th')].findIndex(th => th.textContent.trim() === 'Tenant');
    const cells = [...table.querySelectorAll('tr')].map(tr => tr.children[index]).filter(Boolean);
    const a = cells[0].getBoundingClientRect(), b = cells.at(-1).getBoundingClientRect();
    const box = document.querySelector('[data-hl="tenant-column"]');
    box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
  });
}

async function boxSelfServiceSwitch(page, ctx, { tag }) {
  await tag('self-service-switch', () => {
    const labels = [...document.querySelectorAll('#registration label')].filter(el => /^(Registration mode|Type|Basic|Advanced)$/.test(el.textContent.trim()));
    const parts = [document.getElementById('selfRegistrationType-form-row'), ...labels.filter(el => el.textContent.trim() !== 'Registration mode')];
    const rects = parts.map(el => el.getBoundingClientRect()).filter(r => r.width && r.height);
    if (!rects.length) throw new Error('registration controls not visible');
    const a = { left: Math.min(...rects.map(r => r.left)), top: Math.min(...rects.map(r => r.top)), width: Math.max(...rects.map(r => r.right)) - Math.min(...rects.map(r => r.left)) };
    const b = { bottom: Math.max(...rects.map(r => r.bottom)) };
    const box = document.createElement('div');
    box.style.cssText = `position:absolute;left:${a.left + scrollX - 6}px;top:${a.top + scrollY - 6}px;width:${a.width + 12}px;height:${b.bottom - a.top + 12}px;pointer-events:none`;
    document.body.append(box);
    return box;
  });
}

export const shots = {
  'multi-tenant-users': {
    legacyVersion: true,
    prepare: preparation({ beforeUserTabs: searchJian, afterDates: remeasureTenantColumn }),
    temporaryResources: [blueprintTenant],
  },
  'multi-tenant-control-plane-registration': {
    select: { selfRegistrationType: 'Create' },
    legacyVersion: true,
    prepare: preparation({ beforeUserTabs: page => page.fill('#application_name', 'Pied Piper Video Chat'), afterFraming: boxSelfServiceSwitch }),
  },
  'multi-tenant-key-manager': {
    switch: ['apiKey_keyManager'],
    fixedHeight: null,
    prepare: preparation({
      afterFraming: async page => {
        await page.fill('#apiKey_key', 'Lah5sI9ZScU5QEngQlpS9G7VnE1JMmpJpR9-BbvNLgC9V56itzizT1f_');
        await page.evaluate(() => document.activeElement?.blur());
      },
    }),
  },
  'multi-tenant-blueprint-tenant': {
    fixedHeight: null,
    legacyVersion: true,
    prepare: preparation({ beforeUserTabs: page => page.fill('#tenant_name', 'Blueprint Tenant') }),
  },
};
