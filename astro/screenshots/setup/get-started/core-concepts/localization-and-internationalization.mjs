import { preparation } from '../../kit.mjs';

// add registration screenshot: click Add registration on Erlich's manage page,
// then select the first available application so the full form loads
async function addRegistration(page, ctx, { url }) {
  if (url.includes('00000000-0000-0000-0000-100000000003')) {
    try {
      await page.locator('a, button').filter({ hasText: /Add registration/i }).first().click({ timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.locator('select').first().selectOption({ index: 1 });
      await page.waitForTimeout(2500);
      // remove focus so no field shows a browser focus ring in the screenshot
      await page.evaluate(() => document.activeElement?.blur());
      // registration form uses Angular bindings, not name attrs, for Languages --
      // walk up from the label until we find a container that also holds an input,
      // so the outline surrounds both the label and the field.
      await page.evaluate(() => {
        const label = [...document.querySelectorAll('label')].find(l => /^Languages\b/.test(l.textContent.trim()));
        if (!label) return;
        // stop at the <form> boundary so the nav sidebar's selects don't pull
        // the walk all the way up to app-root, which would outline the full page
        const formBoundary = label.closest('form') || document.body;
        let container = label.parentElement;
        while (container && container !== formBoundary) {
          if (container.querySelector('input, select, textarea, a-tokenizer, [class*="token"], [class*="chosen"]')) break;
          container = container.parentElement;
        }
        if (container && container !== formBoundary && container !== document.body) {
          container.style.cssText += '; outline: 3px solid #f60; outline-offset: 4px; border-radius: 3px;';
        }
      });
    } catch (e) {
      throw new Error(`registration setup failed: ${e.message}`, { cause: e });
    }
  }
}

// replaces the viewport sizing
async function openAddLocalization(page) {
  // viewport is already set to spec.height by capture.mjs before this hook runs.
  // scroll down to reach the Add Localization button (below the fold), click it,
  // then scroll back to top -- position:fixed dialog stays centred in the viewport.
  await page.waitForTimeout(2000); // code editor initialization takes time
  try {
    // wait for Angular to render the theme editor tab list before clicking Messages.
    // tabs are <a> elements; text includes trailing icon chars so use startsWith.
    // "Message Templates" in the nav starts with "Message" (no s) -- won't match.
    await page.waitForFunction(() => [...document.querySelectorAll('button, [role="tab"], a')].some(el => /^Messages\b/.test(el.textContent.trim())), null, { timeout: 20000 });
    await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('button, [role="tab"], a')].filter(el => /^Messages\b/.test(el.textContent.trim()));
      // prefer the shortest match to avoid "Message Templates" nav link if regex somehow matches
      const btn = candidates.sort((a, b) => a.textContent.trim().length - b.textContent.trim().length)[0];
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);
    // scroll down far enough to bring Add Localization into the viewport
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(h => window.scrollTo(0, h), docH);
    await page.waitForTimeout(300);
    await page.getByText(/Add Localization/i).first().click({ timeout: 5000 });
    await page.waitForTimeout(800);
    // scroll back to top -- the fixed dialog stays centred in the viewport
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
  } catch (e) {
    throw new Error(`theme/edit setup failed: ${e.message}`, { cause: e });
  }
}

export const shots = {
  'user-registration-preferred-languages': { legacyVersion: true, prepare: preparation({ afterUserTabs: addRegistration }) },
  'theme-localization-messages': { legacyVersion: true, skipSizing: true, prepare: preparation({ size: openAddLocalization }) },
  'user-locale-date-format': { legacyVersion: true, legacyDate: true },
};
