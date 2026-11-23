import { piedPiperAppId, defaultTenantId, projectRoot, baseUrl, freshUrl, appPort, freshPort, maintenancePort, apiKey, runtime, makeTag, highlightHelpers, runTemporaryState, loadFresh, selectTab, tabsReady } from './screenshots/setup/kit.mjs';
import * as docs_deploy_production_install from './screenshots/setup/deploy/production/install/fusionauth-app.mjs';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { modules, resources } from './screenshots/setup/index.mjs';

// load .env from this directory for local development (no-op if file absent)
try {
  const envFile = join(projectRoot, '.env');
  readFileSync(envFile, 'utf-8')
    .split('\n')
    .forEach(line => {
      const m = line.match(/^([^#=\s][^=]*)=(.*)/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    });
} catch {}

const shots = Object.create(null);
for (const module of modules) {
  for (const [name, shot] of Object.entries(module.shots ?? {})) {
    if (Object.hasOwn(shots, name)) throw new Error(`duplicate screenshot setup: ${name}`);
    shots[name] = shot;
  }
}
const temporaryResources = [...new Set(Object.values(shots).flatMap(shot => shot.temporaryResources ?? []))].sort((a, b) => a.order - b.order);
const temporaryState = [...new Set(Object.values(shots).flatMap(shot => shot.temporaryState ?? []))].sort((a, b) => a.order - b.order);

// list searches persist in a cookie per list, so one shot's search would filter the list in later shots
const clearListSearches = context => context.clearCookies({ name: /IndexAction\$s$/ });

const config = {
  baseUrl,
  outputDir: 'public/img/docs/screenshots',
  window: { width: 1100, height: 800 },
  // the setup hooks grow windows to 2500, and some shots ask for more than the 1600 default
  maxWindow: { width: 2560, height: 2500 },
  browser: 'webkit',
  browserContainer: true,
  chrome: {
    style: 'macos',
    renderIn: 'css',
    showUrl: true,
    showHost: false,
    showQuery: false,
    showHash: false,
    shortenIds: true,
    theme: 'light',
  },
  docker: {
    compose: 'screenshots/docker-compose.yml',
    // only the first-time setup and Maintenance Mode shots use their own instances, so other shards skip those containers
    service: specs => [
      'fusionauth',
      specs.some(spec => shots[spec.name]?.fresh) && 'fusionauth-fresh',
      specs.some(spec => docs_deploy_production_install.screenshotIds.includes(spec.name)) && 'fusionauth-maintenance',
    ].filter(Boolean).join(' '),
    env: { FUSIONAUTH_PORT: String(appPort), FUSIONAUTH_FRESH_PORT: String(freshPort), FUSIONAUTH_MAINTENANCE_PORT: String(maintenancePort) },
    healthcheck: {
      url: `${baseUrl}/api/health`,
      timeout: 300000,
      interval: 3000,
    },
  },

  beforeAll: async (context, { specs } = {}) => {
    // 1.70 scrolls smoothly, so the capture's scroll to the crop area hasn't moved yet when it shoots
    await context.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')));
    runtime.leftoversContext = context;
    // kickstart user pictures and theme fields point here; served from disk so parallel shards need no shared port
    await context.route('http://localhost:8080/**', route => {
      const file = join(projectRoot, 'screenshots/images', new URL(route.request().url()).pathname);
      return existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404 });
    });
    const seed = JSON.parse(readFileSync(join(projectRoot, 'screenshots/kickstart/kickstart.json'), 'utf-8'));
    const seedHeaders = { Authorization: seed.variables.apiKey, 'Content-Type': 'application/json' };
    const seedDeadline = Date.now() + 300_000;
    for (;;) {
      const response = await fetch(`${baseUrl}/api/application/${seed.variables.defaultApplicationId}`, { headers: seedHeaders, signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (response?.ok) break;
      if (Date.now() >= seedDeadline) throw new Error('FusionAuth bootstrap API did not become ready');
      await new Promise(r => setTimeout(r, 1000));
    }
    // Kickstart's HTTP runner can start before the server accepts fixture requests.
    const seeded = await fetch(`${baseUrl}/api/theme/${seed.variables.screenshotsThemeId}`, { headers: seedHeaders });
    if (seeded.status === 404) {
      const requests = JSON.parse(JSON.stringify(seed.requests).replace(/#\{([^}]+)\}/g, (_, name) => seed.variables[name]));
      for (const request of requests) {
        const response = await fetch(`${baseUrl}${request.url}`, {
          method: request.method, headers: { ...seedHeaders, ...(request.tenantId ? { 'X-FusionAuth-TenantId': request.tenantId } : {}) }, body: JSON.stringify(request.body),
        });
        if (!response.ok) throw new Error(`Fixture setup failed: ${request.method} ${request.url} ${response.status}`);
      }
    } else if (!seeded.ok) throw new Error(`Fixture readiness check failed: ${seeded.status}`);
    const page = await context.newPage();
    const deadline = Date.now() + 300_000;
    let ready = false;
    while (Date.now() < deadline) {
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      ready = await page.locator('#loginId').isVisible() && await page.locator('#password').isVisible();
      if (ready) break;
      await page.waitForTimeout(1000);
    }
    if (!ready) throw new Error('FusionAuth admin login form did not become ready');
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    await page.keyboard.press('Enter');
    await page.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login'), { timeout: 30000 });
    runtime.adminLocale = (await context.cookies(`${baseUrl}`)).find(c => c.name === 'fusionauth.locale')?.value;
    await page.close();
    for (const resource of resources) await resource(context);
    await clearListSearches(context);
    if (!specs?.some(spec => shots[spec.name]?.fresh)) return;
    const freshDeadline = Date.now() + 300_000;
    while (!(await fetch(`${freshUrl}/api/status`, { signal: AbortSignal.timeout(5000) }).then(r => r.ok, () => false))) {
      if (Date.now() >= freshDeadline) throw new Error('Fresh FusionAuth instance did not become ready');
      await new Promise(r => setTimeout(r, 1000));
    }
  },

  // cleaning up after each shot means the next shot's first load is already clean
  afterScreenshot: async (page, ctx) => {
    await docs_deploy_production_install.afterScreenshot(page, ctx);
    await clearListSearches(page.context());
  },

  beforeScreenshot: async (page, ctx) => {
    if (await docs_deploy_production_install.beforeScreenshot(page, ctx)) return;

    // with SCREENSHOT_TIMING=1, each stage adds h.<stage>=<ms> to the progress line
    let stageStart = Date.now();
    const stage = name => {
      if (!ctx?.timings) return;
      const now = Date.now();
      ctx.timings[`h.${name}`] = (ctx.timings[`h.${name}`] ?? 0) + now - stageStart;
      stageStart = now;
    };
    const shot = shots[ctx?.name] ?? {};
    // fresh-instance shots skip the kickstarted instance's setup
    if (shot.fresh) {
      // the Screenshot url is a path, because the fresh instance's port differs per shard
      const { pathname, search } = new URL(ctx?.url ?? page.url());
      const freshTarget = `${freshUrl}${pathname}${search}`;
      await page.goto(freshTarget, { waitUntil: 'networkidle' });
      return shot.prepare?.(page, ctx, { url: freshTarget, shot }, 'prepare');
    }
    const url = ctx?.url ?? page.url();

    const { pathname, hash } = new URL(url);

    const fragment = hash.slice(1);

    // cookie resets load the page once, after the last reset
    let cookiesChanged = false;

    if (runtime.multiTenantCookies) {
      await page.context().clearCookies();
      await page.context().addCookies(runtime.multiTenantCookies);
      runtime.multiTenantCookies = undefined;
      cookiesChanged = true;
    }

    if (runtime.savedSso && !shot.signedOut) {
      await page.context().addCookies([runtime.savedSso]);
      runtime.savedSso = undefined;
      cookiesChanged = true;
    }


    if (runtime.operateMetricsKeyExists && !shot.keepMetricsKey) {
      // cleared first so a failed delete fails this shot only, not every later one
      runtime.operateMetricsKeyExists = false;
      await page.goto(`${baseUrl}/admin/api-key/`, { waitUntil: 'networkidle' });
      const opened = await page.evaluate(() => {
        const a = document.querySelector('a[href*="/ajax/api-key/delete/00000000-0000-0000-0000-f60000000002"]');
        a?.closest('[popover]')?.showPopover();
        a?.click();
        return !!a;
      });
      if (!opened) throw new Error('could not delete the Prometheus metrics API key that operate-datadog-fusionauth-apikey created, because /admin/api-key/ has no delete link for the key; later API key screenshots will show the extra key');
      await page.locator('.prime-dialog.open').waitFor();
      await page.locator('.prime-dialog.open #apiKeyId').evaluate(el => {
        el.value = '00000000-0000-0000-0000-f60000000002';
      });
      await page.locator('.prime-dialog.open button[type=submit]').click({ timeout: 10000 });
      await page.locator('.prime-dialog.open').waitFor({ state: 'hidden', timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.goto(url, { waitUntil: 'networkidle' });
      cookiesChanged = false;
    }

    if (runtime.adminLocale && pathname.startsWith('/admin')) {
      const context = page.context();
      const locale = (await context.cookies(`${baseUrl}`)).find(c => c.name === 'fusionauth.locale');
      if (locale?.value !== runtime.adminLocale) {
        await context.addCookies([{ name: 'fusionauth.locale', value: runtime.adminLocale, url: `${baseUrl}` }]);
        cookiesChanged = true;
      }
    }

    if (runtime.registerCookies) {
      await page.context().clearCookies();
      await page.context().addCookies(runtime.registerCookies);
      runtime.registerCookies = undefined;
      cookiesChanged = true;
    }

    if (cookiesChanged) await loadFresh(page, url);

    stage('reset');
    const oauthAppId = piedPiperAppId;

    const oauthTenantId = defaultTenantId;

    const oauthLoginUrl = `${baseUrl}/oauth2/authorize?client_id=${oauthAppId}&redirect_uri=https%3A%2F%2Fexample.com&response_type=code&scope=openid`;

    const tag = makeTag(page);
    const info = {
      url,
      pathname,
      fragment,
      oauthAppId,
      oauthTenantId,
      oauthLoginUrl,
      apiKey,
      tag,
      idpShot: shot.idp,
      shot,
      ...highlightHelpers(page, fragment),
    };
    await runTemporaryState(page, url, shot, temporaryResources, temporaryState);
    stage('temporary');

    await shot.prepare?.(page, ctx, info, 'prepare'); stage('prepare');

    if (pathname.startsWith('/account')) {
      const modified = !!shot.modifiedAccount;
      for (let i = 0; i < 60 && modified !== (await page.getByText('This is now modified').isVisible()); i++) {
        await page.waitForTimeout(500);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }

    await shot.prepare?.(page, ctx, info, 'afterAccount'); stage('afterAccount');

    for (const [id, value] of Object.entries(shot.select ?? {})) {
      const selected = await page.evaluate(
        ([i, v]) => {
          const select = document.getElementById(i);
          if (!select) return false;
          select.value = v;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return select.value === v;
        },
        [id, value],
      );
      if (!selected) throw new Error(`select not set: ${id}=${value}`);
    }

    for (const id of shot.switch ?? []) {
      const switched = await page.evaluate(i => {
        const input = document.getElementById(i);
        if (input && !input.checked) input.click();
        return !!input;
      }, id);
      if (!switched) throw new Error(`switch not found: ${id}`);
    }
    // switches and selects open sections with a scripted slide; wait for the heights to settle
    if (shot.switch || shot.select) {
      await page.waitForFunction(() => new Promise(resolve => {
        const heights = () => [...document.querySelectorAll('.slide-open')].map(e => e.offsetHeight).join();
        const before = heights();
        setTimeout(() => resolve(heights() === before), 300);
      }), null, { timeout: 10000 });
    }

    await shot.prepare?.(page, ctx, info, 'afterControls'); stage('afterControls');

    if (pathname.startsWith('/admin/theme/view/') && fragment) {
      const tab = page.locator(`main button[data-tab="${fragment}"]`);
      await tab.click();
      await tab.evaluate(el => {
        el.scrollIntoView({ block: 'center' });
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1500);
    }

    await shot.prepare?.(page, ctx, info, 'afterThemeTab'); stage('afterThemeTab');

    if (/^\/admin\/(webhook\/(add|edit)|system-configuration\/edit)/.test(pathname) && fragment) {
      const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
      if (!label) throw new Error(`no tab for #${fragment}`);
      await selectTab(page, label);
    }

    await shot.prepare?.(page, ctx, info, 'afterSystemTab'); stage('afterSystemTab');

    if (shot.signedOut) {
      const context = page.context();
      runtime.savedSso ??= (await context.cookies(`${baseUrl}`)).find(c => c.name === 'fusionauth.sso');
      await context.clearCookies({ name: 'fusionauth.sso' });
      await page.goto(url, { waitUntil: 'networkidle' });
    }

    await shot.prepare?.(page, ctx, info, 'afterSignOut'); stage('afterSignOut');

    await shot.prepare?.(page, ctx, info, 'beforeUserTabs'); stage('beforeUserTabs');

    if (url.includes('00000000-0000-0000-0000-10000000000') && pathname.startsWith('/admin/user/manage/') && !shot.skipUserWait) {
      try {
        await page
          .waitForFunction(() => document.querySelector('h1')?.textContent?.trim() === 'Manage User', { timeout: 20000 })
          .catch(async () => {
            // retry the navigation once if Angular didn't route to the manage page
            await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
            await page.waitForFunction(() => document.querySelector('h1')?.textContent?.trim() === 'Manage User', { timeout: 15000 });
          });
      } catch (e) {
        throw new Error(`manage page wait failed: ${e.message}`, { cause: e });
      }
    }

    if (fragment && /^\/admin\/(user\/manage|entity\/type\/add)/.test(pathname)) {
      await tabsReady(page);
      const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
      if (!label) throw new Error(`no tab for #${fragment}`);
      await selectTab(page, label);
      await page.evaluate(
        id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`).scrollIntoView({ block: 'nearest', inline: 'nearest' }),
        fragment,
      );
      // this tab loads its rows when opened
      if (fragment === 'entity-grants') await page.locator('#entity-grants td').first().waitFor();
    }

    await shot.prepare?.(page, ctx, info, 'normalizeUser'); stage('normalizeUser');

    await shot.prepare?.(page, ctx, info, 'afterUserTabs'); stage('afterUserTabs');

    if (pathname.includes('/admin/application/edit') || (pathname.includes('/admin/application/add') && fragment)) {
      try {
        await tabsReady(page);
        const appTab = !fragment
          ? 'Security'
          : await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
        if (!appTab) throw new Error(`no tab for #${fragment}`);
        await selectTab(page, appTab);
        await page.locator('button').filter({ hasText: appTab }).first().click({ timeout: 3000 });
        await selectTab(page, appTab);
      } catch (e) {
        throw new Error(`application/edit tab failed: ${e.message}`, { cause: e });
      }
    }

    if (pathname.includes('/admin/tenant/edit/') && fragment) {
      await tabsReady(page);
      const tabLabel =
        { email: 'Email', 'email-test': 'Email', identities: 'Identities', passwordless: 'Advanced', webauthn: 'WebAuthn' }[fragment] ??
        (await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment));
      if (tabLabel) {
        try {
          await selectTab(page, tabLabel);
          // use JS click to handle tabs that are scrolled off the visible tab bar
          const result = await page.evaluate(label => {
            const btns = [...document.querySelectorAll('el-tab-list button')];
            const allLabels = btns.map(b => b.textContent.trim());
            const btn = btns.find(b => b.textContent.trim() === label);
            if (btn) {
              btn.click();
              // bring a tab scrolled out of the tab bar into view
              const bar = btn.closest('.tab-list-container');
              const b = btn.getBoundingClientRect(),
                r = bar?.getBoundingClientRect();
              if (r && b.right > r.right) bar.scrollLeft += b.right - r.right + 16;
              else if (r && b.left < r.left) bar.scrollLeft -= r.left - b.left + 16;
              return { clicked: true };
            }
            return { clicked: false, available: allLabels };
          }, tabLabel);
          if (!result.clicked) throw new Error(`tab "${tabLabel}" not found; available: ${JSON.stringify(result.available)}`);
          // the tab draws its fields after the click; without this pause, the capture misses them
          await page.waitForTimeout(1000);
          await selectTab(page, tabLabel);
        } catch (e) {
          throw new Error(`tenant/edit ${tabLabel} tab failed: ${e.message}`, { cause: e });
        }
      }

      // send-test-email screenshot: tag and scroll to the test email control
      await shot.prepare?.(page, ctx, info, 'tenantTab'); stage('tenantTab');

      // webauthn tab: click enable toggle only if workflow fieldsets aren't already visible
      // (beforeAll enables WebAuthn when a license key is present; clicking again would disable it)
      if (fragment === 'webauthn') {
        await page.evaluate(() => {
          const alreadyEnabled = !!document.querySelector('#tenant_webAuthnConfiguration_bootstrapWorkflow_enabled-form-row');
          if (!alreadyEnabled) {
            const label = document.querySelector('#tenant_webAuthnConfiguration_enabled-form-row label');
            if (label) label.click();
          }
        });
        await page.waitForTimeout(400);
      }

      await shot.prepare?.(page, ctx, info, 'afterTenantWorkflow'); stage('afterTenantWorkflow');
    }

    if (pathname.includes('/admin/email/template/edit/') && fragment === 'localization') {
      try {
        const clicked = await page.evaluate(() => {
          const els = [...document.querySelectorAll('a, button, [role="tab"]')];
          const el = els.find(e => e.textContent.trim() === 'Localization');
          if (el) {
            el.click();
            return true;
          }
          return false;
        });
        if (!clicked) throw new Error('Localization tab element not found');
        await page.waitForTimeout(800);
        // tag the Add localization button for highlighting
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('a, button')].find(el => /add localization/i.test(el.textContent));
          if (btn) btn.setAttribute('data-hl', 'add-localization');
        });
      } catch (e) {
        throw new Error(`email/template/edit localization tab failed: ${e.message}`, { cause: e });
      }
    }

    await shot.prepare?.(page, ctx, info, 'beforeSizing'); stage('beforeSizing');

    if (shot.skipSizing) await shot.prepare?.(page, ctx, info, 'size');
    else {
      // expand the viewport to fit the full inner-scroll content height;
      // this makes fullPage equivalent to a single viewport capture so fixed
      // elements stay at top: 0 rather than rendering at the wrong scroll offset.
      // cap at 2500px to avoid exploding on code-editor pages with huge scroll heights.
      const fullHeight = await page.evaluate(() => {
        return [...document.querySelectorAll('*')].reduce((max, el) => {
          const s = window.getComputedStyle(el);
          if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > max) {
            return el.scrollHeight;
          }
          return max;
        }, document.documentElement.scrollHeight);
      });
      if (fullHeight > 800 && !Object.hasOwn(shot, 'fixedHeight') && !Object.hasOwn(shot, 'band')) {
        await page.setViewportSize({ width: page.viewportSize().width, height: Math.min(fullHeight, 2500) });
        await page.waitForTimeout(300);
      }
    }

    // a dialog scrolls inside itself, so grow the window until nothing in it is hidden
    if (shot.dialog) {
      for (let i = 0; i < 3; i++) {
        const hidden = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('.prime-dialog.open, .prime-dialog.open *')]
          .filter(el => ['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
          .map(el => el.scrollHeight - el.clientHeight)));
        if (hidden <= 0) break;
        const { width, height } = page.viewportSize();
        await page.setViewportSize({ width, height: Math.min(height + hidden + 16, 2500) });
        await page.waitForTimeout(300);
      }
    }

    // the admin footer shows the build's version, which would date every screenshot; hidden keeps the layout
    await page.addStyleTag({ content: '.footer-version { visibility: hidden !important; }' });

    await page.evaluate(keep => {
      if (!keep) document.querySelectorAll('.alert, [role=alert], .notification').forEach(el => el.remove());
      // prerelease images show their build in the header
      document.querySelectorAll('.runtime-mode-notice').forEach(el => { if (/Early Access/.test(el.textContent)) el.remove(); });
      document.activeElement?.blur();
    }, shot.keepAlerts);

    await page.evaluate(() => {
      for (const legend of document.querySelectorAll('main legend')) {
        const title = legend.textContent.trim().split('\n')[0].trim();
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        // a container can hold more than one section, so tag the heading and what follows it
        for (let el = legend; el && (el === legend || el.tagName !== 'LEGEND'); el = el.nextElementSibling) {
          el.dataset.section = slug;
        }
      }
    });

    if (shot.sectionBox) {
      const boxed = await page.evaluate(section => {
        const rects = [...document.querySelectorAll(`[data-section='${section}']`)].filter(el => el.offsetParent).map(el => el.getBoundingClientRect());
        if (!rects.length) return false;
        const top = Math.min(...rects.map(r => r.top)),
          bottom = Math.max(...rects.map(r => r.bottom));
        const left = Math.min(...rects.map(r => r.left)),
          right = Math.max(...rects.map(r => r.right));
        const box = document.createElement('div');
        box.dataset.hl = 'section-box';
        box.style.cssText = `position:absolute;left:${left + scrollX - 12}px;top:${top + scrollY - 12}px;width:${right - left + 24}px;height:${bottom - top + 24}px;pointer-events:none`;
        document.body.append(box);
        return true;
      }, shot.sectionBox);
      if (!boxed) throw new Error(`section not found: ${shot.sectionBox}`);
    }

    await shot.prepare?.(page, ctx, info, 'afterSections'); stage('afterSections');

    if (shot.band) {
      const height = await page.evaluate(sel => {
        const rects = [...document.querySelectorAll(sel)].filter(el => el.offsetParent).map(el => el.getBoundingClientRect());
        if (!rects.length) return 0;
        const top = Math.min(...rects.map(r => r.top)) + window.scrollY - 16;
        const bottom = Math.max(...rects.map(r => r.bottom)) + window.scrollY + 16;
        const band = document.createElement('div');
        band.id = 'screenshot-band';
        band.style.cssText = `position:absolute;left:0;top:${top}px;width:${document.documentElement.clientWidth}px;height:${bottom - top}px;opacity:0;pointer-events:none`;
        document.body.append(band);
        return bottom - top;
      }, shot.band);
      if (!height) throw new Error(`band selector matched nothing: ${shot.band}`);
      // a window just taller than the strip keeps the sticky sidebar beside it
      await page.setViewportSize({ width: page.viewportSize().width, height: Math.max(800, Math.ceil(height) + 160) });
    }

    if (shot.fixedHeight) {
      const scrolled = await page.evaluate(target => {
        const el =
          (/^[\[#.]/.test(target) && document.querySelector(target)) ||
          [...document.querySelectorAll('main legend')].find(l => l.offsetParent && l.textContent.trim().startsWith(target));
        // leave room for the sticky top bar
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 88);
        return !!el;
      }, shot.fixedHeight);
      if (!scrolled) throw new Error(`section not found: ${shot.fixedHeight}`);
      await page.waitForTimeout(300);
    }

    await shot.prepare?.(page, ctx, info, 'afterFraming'); stage('afterFraming');

    if (shot.legacyVersion) {
      await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          node.textContent = node.textContent.replace(/FusionAuth version 1\.69\.4/g, 'FusionAuth version 1.69.1');
        }
      });
    }

    const textPadding = shot.textPadding;

    if (textPadding) {
      await page.evaluate(
        ({ specs, padding }) => {
          for (const [i, spec] of specs.entries()) {
            const target = document.querySelector(spec.selector);
            if (!target) continue;
            const r = target.getBoundingClientRect();
            const box = document.createElement('div');
            box.dataset.paddedHighlight = i;
            box.style.cssText = `position:absolute;left:${r.left + scrollX - padding}px;top:${r.top + scrollY - padding}px;width:${r.width + padding * 2}px;height:${r.height + padding * 2}px;pointer-events:none`;
            document.body.append(box);
          }
        },
        { specs: ctx.highlights, padding: textPadding },
      );
      ctx.highlights.forEach((spec, i) => (spec.selector = `[data-padded-highlight="${i}"]`));
    }

    if (new URL(page.url()).pathname.startsWith('/admin')) {
      await page.evaluate(
        ({ legacyDate, adminRole, shortTime }) => {
          let lastLogin = false,
            seenLogin = false;
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (adminRole && node.textContent.trim() === 'français') node.textContent = node.textContent.replace('français', 'French');
            if (adminRole && !seenLogin && node.textContent.trim() === 'Last login') {
              lastLogin = true;
              seenLogin = true;
            }
            node.textContent = node.textContent
              .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, adminRole ? '10/12/2026' : legacyDate ? '12/10/2026' : '24/09/2026')
              .replace(/\b\d{2}:\d{2}(:\d{2}(,\d{3})?)? (AM|PM)\b/g, (m, seconds, millis) => {
                if (lastLogin) {
                  lastLogin = false;
                  return '05:50 PM';
                }
                return legacyDate ? '05:49 PM' : shortTime ? '09:00 AM' : `09:00${seconds ? ':00' : ''}${millis ? ',000' : ''} AM`;
              });
          }
        },
        { legacyDate: !!shot.legacyDate, adminRole: !!shot.adminRole, shortTime: !!shot.shortTime },
      );
    }

    await shot.prepare?.(page, ctx, info, 'afterDates'); stage('afterDates');

    await shot.prepare?.(page, ctx, info, 'finish'); stage('finish');
  },

};

// drop playwright's "page.evaluate: Error:" prefix and say which page the setup was on
const prepareShot = config.beforeScreenshot;
config.beforeScreenshot = (page, ctx) => prepareShot(page, ctx).catch(e => {
  throw new Error(`${e.message.replace(/^\w+\.evaluate: Error: /, '')} (on ${page.url()})`, { cause: e });
});

export default config;
export { temporaryResources, temporaryState };
