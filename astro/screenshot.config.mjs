export default {
  baseUrl: 'http://localhost:9011',
  outputDir: 'public/img/docs/screenshots',
  window: { width: 1100, height: 800 },
  browser: 'webkit',
  chrome: {
    style:         'safari-macos',
    showUrl:       true,
    dark:          false,
    shadowBlur:    40,
    shadowPadding: 48,
  },

  docker: {
    compose:  'screenshots/docker-compose.yml',
    service:  'fusionauth',
    healthcheck: {
      url:      'http://localhost:9011/api/status',
      timeout:  120000,
      interval: 3000,
    },
  },

  beforeAll: async (context) => {
    const page = await context.newPage();

    // FusionAuth's API healthcheck passes before the kickstart finishes and the
    // login UI becomes available. Retry navigation until the login form appears.
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      await page.goto('http://localhost:9011/admin/login', {
        waitUntil: 'load',
        timeout: 15000,
      }).catch(() => {});
      const ready = await page.$('#loginId');
      if (ready) break;
      await new Promise(r => setTimeout(r, 3000));
    }

    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    // press Enter to submit -- more reliable than clicking a specific button selector
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/admin/, { timeout: 30000 });
    await page.close();
  },

  beforeScreenshot: async (page) => {
    const url = page.url();

    if (url.includes('/registration/add/')) {
      await page.waitForTimeout(2000);
    }

    // add registration screenshot: click Add registration on Erlich's manage page,
    // then select the first available application so the full form loads
    if (url.includes('00000000-0000-0000-0000-100000000003')) {
      try {
        await page.locator('a, button').filter({ hasText: /Add registration/i }).first().click({ timeout: 5000 });
        await page.waitForTimeout(1500);
        await page.locator('select').first().selectOption({ index: 1 });
        await page.waitForTimeout(2500);
        // the registration form uses Angular bindings, not name attributes, for the
        // Languages input -- manually highlight the row so it's visible in the screenshot
        await page.evaluate(() => {
          const label = [...document.querySelectorAll('label')]
            .find(l => /^Languages\b/.test(l.textContent.trim()));
          if (label) {
            const row = label.closest('div') || label.parentElement;
            if (row) row.style.cssText += '; outline: 2px solid #f26522; outline-offset: 4px; border-radius: 2px;';
          }
        });
      } catch (e) {}
    }

    if (url.includes('/theme/edit/')) {
      // viewport is already set to spec.height by capture.mjs before this hook runs.
      // scroll down to reach the Add Localization button (below the fold), click it,
      // then scroll back to top -- position:fixed dialog stays centred in the viewport.
      await page.waitForTimeout(500);
      try {
        // click Messages tab (button nth(18)) to load the messages template and
        // reveal the Localization section below the code editor
        await page.locator('button').nth(18).click({ timeout: 3000 });
        await page.waitForTimeout(1500);
        // scroll down far enough to bring Add Localization into the viewport
        const docH = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate((h) => window.scrollTo(0, h), docH);
        await page.waitForTimeout(300);
        await page.getByText(/Add Localization/i).first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
        // scroll back to top -- the fixed dialog stays centred in the 800px viewport
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        // a 2px empty div (class "border") sits at y=0, pushing the sticky header to y=2.
        // under the dialog backdrop this gap appears as a black bar. zero it out.
        await page.evaluate(() => {
          [...document.querySelectorAll('div')].filter(el => {
            const r = el.getBoundingClientRect();
            return r.top === 0 && r.height > 0 && r.height <= 3 && el.children.length === 0;
          }).forEach(el => {
            el.style.cssText += '; height:0 !important; min-height:0 !important; border:none !important; padding:0 !important; margin:0 !important;';
          });
        });
      } catch (e) {}
    } else {
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
      if (fullHeight > 800) {
        await page.setViewportSize({ width: 1100, height: Math.min(fullHeight, 2500) });
        await page.waitForTimeout(300);
      }
    }

    await page.evaluate(() => {
      document.querySelectorAll('.alert, [role=alert], .notification').forEach(el => el.remove());
    });
  },
};
