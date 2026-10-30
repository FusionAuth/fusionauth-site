import { createHmac } from 'crypto';
import { fileURLToPath } from 'url';

export const baseUrl = 'http://localhost:9011';
export const apiKey = 'screenshot-dev-key-not-for-production';
export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
// state the hooks share between screenshots
export const runtime = { operateMetricsKeyExists: false };

export const defaultTenantId = '30663132-6464-6665-3032-326466613934';
export const piedPiperAppId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
export const defaultThemeId = '75a068fd-e94b-451a-9aeb-3ddb9a3b5987';
export const simpleThemeId = '3c717291-5d83-4014-bd51-97c76475dc86';
export const piedPiperThemeId = '6e1f7a52-3c4d-4b8a-9f0e-2d7c1b9a8e31';
export const darkThemeId = '9c2d4e6f-8a1b-4c3d-9e5f-7a6b5c4d3e21';
export const accountThemeId = '00000000-0000-0000-0000-300000000002';
export const twoFactorTemplateIds = { email: '00000000-0000-0000-0000-400000000003', sms: '00000000-0000-0000-0000-400000000004' };
export const richardId = '00000000-0000-0000-0000-100000000001';
export const dineshId = '00000000-0000-0000-0000-100000000004';
export const gilfoyleId = '00000000-0000-0000-0000-100000000005';
export const monicaId = '00000000-0000-0000-0000-100000000006';
export const gavinId = '00000000-0000-0000-0000-100000000007';
export const familyId = '00000000-0000-0000-0000-800000000001';
export const printersTypeId = '00000000-0000-0000-0000-a00000000001';

// ids for resources a section creates, e.g. fixedId('f4', 91)
export const fixedId = (range, n) => `00000000-0000-0000-0000-${range}${String(n).padStart(12 - range.length, '0')}`;

export const apiRequest = (path, method = 'GET', body, headers = {}) =>
  fetch(`${baseUrl}${path}`, { method, headers: { Authorization: apiKey, 'Content-Type': 'application/json', ...headers }, body: body && JSON.stringify(body) }).then(async r => {
    const text = await r.text();
    if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${text}`);
    return text ? JSON.parse(text) : null;
  });

export const selfServiceFormId = async () => (await apiRequest('/api/form')).forms.find(f => f.name === 'Default User Self Service provided by FusionAuth').id;

export const tabsReady = page => page.waitForFunction(() => customElements.get('el-tab-group') && customElements.get('el-tab-list'), null, { timeout: 10000 });

const alignTabBar = page => page.evaluate(() => {
  const btn = document.querySelector('el-tab-list button[aria-selected="true"]');
  const bar = btn?.closest('.tab-list-container');
  if (!bar) return;
  const x = el => el.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
  const end = x(btn) + btn.offsetWidth;
  bar.scrollLeft = end <= bar.clientWidth ? 0 : [...bar.querySelectorAll('el-tab-list button')].map(x).find(left => left >= end - bar.clientWidth);
});

export async function selectTab(page, label) {
  await tabsReady(page);
  for (let i = 0; i < 20; i++) {
    const selected = await page.evaluate(l => {
      const btn = [...document.querySelectorAll('el-tab-list button')].find(b => b.textContent.trim() === l);
      const shown = () => btn?.getAttribute('aria-selected') === 'true' && !document.getElementById(btn.getAttribute('aria-controls'))?.hidden;
      if (btn && !shown()) btn.click();
      return shown();
    }, label);
    if (selected) return alignTabBar(page);
    await page.waitForTimeout(250);
  }
  throw new Error(`tab "${label}" was not selected`);
}

export const totpSecret = Buffer.from('PiedPiperRocks!');
const totpSecretBase32 = [...totpSecret].map(b => b.toString(2).padStart(8, '0')).join('').match(/.{5}/g).map(bits => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[parseInt(bits, 2)]).join('');

export const totpCode = () => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', totpSecret).update(counter).digest();
  const offset = digest.at(-1) & 0xf;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
};

// the account page generates a new secret each time, so swap in a fixed one
export async function pinTotp(page) {
  await page.route('**/account/two-factor/enable*', async route => {
    const response = await route.fetch();
    let body = await response.text();
    const value = name => body.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0].match(/value="([^"]+)"/)?.[1];
    const [secret, base32] = [value('secret'), value('secretBase32Encoded')];
    if (secret) body = body.replaceAll(secret, totpSecret.toString('base64')).replaceAll(base32, totpSecretBase32);
    await route.fulfill({ response, body });
  });
}

export async function removeTwoFactor() {
  const { user } = await apiRequest(`/api/user/${richardId}`);
  const method = user.twoFactor?.methods?.[0];
  if (!method) return;
  const { recoveryCodes } = await apiRequest(`/api/user/two-factor/recovery-code/${richardId}`, 'POST');
  await apiRequest(`/api/user/two-factor/${richardId}`, 'DELETE', { methodId: method.id, code: recoveryCodes[0] });
}

// Each stage runs at its original position among the shared steps.
export const preparation = stages => (page, ctx, info, phase) => stages[phase]?.(page, ctx, info);

export const makeTag = page => async (name, find) => {
  const tagged = await page.evaluate(([n, f]) => {
    const el = new Function(`return (${f})`)()();
    if (el) el.dataset.hl = n;
    return !!el;
  }, [name, find.toString()]);
  if (!tagged) throw new Error(`nothing to tag as ${name}`);
};

export function highlightHelpers(page, fragment) {
  const box = (hl, selectors, pad = 0) => page.evaluate(([hl, selectors, pad]) => {
    const els = selectors.map(s => (typeof s === 'string' ? document.querySelector(s) : null));
    if (els.some(e => !e)) return false;
    const rects = els.map(e => e.getBoundingClientRect());
    const scroller = els[0].closest('.prime-dialog')?.querySelector('main');
    const origin = scroller?.getBoundingClientRect();
    if (scroller) scroller.style.position = 'relative';
    const [x, y] = scroller ? [scroller.scrollLeft - origin.left, scroller.scrollTop - origin.top] : [scrollX, scrollY];
    const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
    const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
    const div = document.createElement('div');
    div.dataset.hl = hl;
    div.style.cssText = `position:absolute;left:${left + x - pad}px;top:${top + y - pad}px;width:${right - left + 2 * pad}px;height:${bottom - top + 2 * pad}px;pointer-events:none`;
    (scroller ?? document.body).append(div);
    return true;
  }, [hl, selectors, pad]).then(ok => { if (!ok) throw new Error(`nothing to box as ${hl}`); });
  const mark = (attr, value, selector, text) => page.evaluate(([attr, value, selector, text]) => {
    const el = [...document.querySelectorAll(selector)].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(text));
    if (el) el.setAttribute(attr, value);
    return !!el;
  }, [attr, value, selector, text]).then(ok => { if (!ok) throw new Error(`${selector} "${text}" not found`); });
  const showTab = async () => {
    const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
    await selectTab(page, label);
  };
  const addTokens = async (display, values) => {
    for (const value of values) {
      await page.locator(`#${display} input`).fill(value);
      await page.locator(`#${display} input`).press('Enter');
    }
    await page.evaluate(() => document.activeElement?.blur());
  };
  const setClientSecret = value => page.locator('input[name="application.oauthConfiguration.clientSecret"]').evaluateAll((fields, value) => fields.forEach(field => { field.value = value; }), value);
  // a popover sits in the top layer above the highlight, so swap in a plain copy
  const freezeMenu = selector => page.evaluate(selector => {
    const menu = document.querySelector(selector);
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.querySelectorAll('[data-hl]').forEach(el => el.removeAttribute('data-hl'));
    menu.hidePopover();
  }, selector);
  const openView = async (href, firstRow) => {
    await page.evaluate(h => {
      const link = document.querySelector(`main a[href="${h}"]`);
      link?.closest('[popover]')?.showPopover();
      link?.click();
    }, href);
    await page.locator('.prime-dialog.open').waitFor();
    await page.waitForTimeout(800);
    await page.evaluate(([host, first]) => {
      const dialog = document.querySelector('.prime-dialog.open');
      const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(host, 'https://local.fusionauth.io');
      for (const tr of dialog.querySelectorAll('tr')) {
        if (tr.textContent.trim().startsWith('Admin registration form Id:')) tr.querySelectorAll('td')[1].textContent = '00000000-0000-0000-0000-f30000000015';
      }
      const row = [...dialog.querySelectorAll('h3, tr')].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(first));
      const scroller = dialog.querySelector('main');
      if (row && scroller) scroller.scrollTop += row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
    }, [baseUrl, firstRow]);
  };
  const row = (n, text) => mark('data-row', n, '.prime-dialog.open tr', text).then(() => `.prime-dialog.open tr[data-row='${n}']`);
  const hostedLogin = async email => {
    await page.fill('#loginId', email);
    await page.fill('#password', 'password');
    await page.locator('#submit-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  };
  return { box, mark, showTab, addTokens, setClientSecret, freezeMenu, openView, row, hostedLogin };
}

// Creates the resources and applies the state the shot asks for, and removes the rest.
export async function runTemporaryState(page, url, shot, temporaryResources, temporaryState) {
  const wantedState = new Set(shot.temporaryState ?? []);
  const wantedResources = new Set(shot.temporaryResources ?? []);
  for (const state of temporaryState) {
    if (state.section === 'register' && state.undo && !wantedState.has(state)) {
      await state.undo();
      state.undo = undefined;
    }
  }

  const exists = async path => (await fetch(`${baseUrl}${path}`, { headers: { Authorization: apiKey } })).ok;
  // deletes come first, since a second tenant makes creating an application need a tenant Id
  const unwantedFirst = [...temporaryResources].sort((a, b) => wantedResources.has(a) - wantedResources.has(b));
  for (const resources of unwantedFirst) {
    const wanted = wantedResources.has(resources);
    if (wanted === (await exists(resources.paths[0])) && !(wanted && shot.recreateResources)) continue;
    // clears what a failed create left behind too
    for (const path of resources.paths) {
      if (!(await exists(path))) continue;
      for (let i = 0; ; i++) {
        // applications and user actions otherwise remain deactivated
        try {
          await apiRequest((path.startsWith('/api/application/') || path.startsWith('/api/user-action/')) && !path.includes('hardDelete=') ? `${path}${path.includes('?') ? '&' : '?'}hardDelete=true` : path, 'DELETE');
          break;
        } catch (e) {
          // a form stays in use until its deleted application is gone
          if (i >= 60 || !e.message.includes('[inUse]')) throw e;
          await page.waitForTimeout(500);
        }
      }
      // applications and tenants are deleted in the background
      for (let i = 0; i < 60 && (await exists(path)); i++) await page.waitForTimeout(500);
    }
    if (wanted) await resources.create(apiRequest, ...(shot.resourceArgs?.[resources.order] ?? []));
    // the admin UI caches the tenant count; two tenants adds a Tenant field to some forms
    if (resources.paths[0].startsWith('/api/tenant/')) await page.waitForTimeout(5000);
    // goto alone keeps the loaded page when only the fragment differs
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
  }

  for (const state of temporaryState) {
    const wanted = wantedState.has(state);
    if (wanted === !!state.undo) continue;
    if (wanted) state.undo = await state.apply(page);
    else {
      await state.undo();
      state.undo = undefined;
    }
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
  }
}
