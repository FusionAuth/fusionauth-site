import { preparation } from '../kit.mjs';

const waitForEditor = async page => {
  await page.waitForFunction(() => customElements.get('el-tab-list'));
  await page.waitForTimeout(1000);
};

// apply the pre-built theme from its card in the Pre-built themes panel
const loadPrebuilt = label => async page => {
  await waitForEditor(page);
  await page.locator('#prebuilt-themes, main [role=tabpanel]:visible').getByText(label, { exact: true }).first().click();
  await page.waitForTimeout(500);
  const confirm = page.locator('.prime-dialog.open button, dialog[open] button').filter({ hasText: /^(Yes|OK|Confirm|Load)/ });
  if (await confirm.count()) await confirm.first().click();
  await page.waitForTimeout(1200);
};

// opens the shot's simpleEditorTab panel, then edits it (not saved) so the preview shows what the panel changes
const editPanel = edit => async (page, ctx, info) => {
  await waitForEditor(page);
  await page.locator('main [role=tab]', { hasText: info.shot.simpleEditorTab }).first().click();
  await page.waitForTimeout(800);
  await edit(page);
};

const setFields = (page, fields) => page.evaluate(f => f.every(([id, value]) => {
  const el = document.getElementById(id);
  if (!el) return false;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}), fields);

async function setBackgroundImage(page) {
  await page.locator('#images button', { hasText: 'Background image' }).first().click();
  await page.waitForTimeout(300);
  if (!(await setFields(page, [['backgroundImageURLInput', 'http://localhost:8080/starry-night.jpg']]))) throw new Error('background image field not found');
  await page.waitForTimeout(2000);
}

async function setStyles(page) {
  const set = await setFields(page, [
    ['pageBackgroundColor', '#1d2b4f'], ['primaryButtonColor', '#e2672b'], ['linkTextColor', '#e2672b'], ['iconColor', '#e2672b'],
  ]);
  if (!set) throw new Error('style color fields not found');
  await page.evaluate(() => {
    const font = document.querySelector('#styles select');
    const serif = [...font.options].find(o => /georgia|serif/i.test(o.textContent) && !/sans/i.test(o.textContent));
    if (serif) { font.value = serif.value; font.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.waitForTimeout(1500);
}

async function setMessages(page) {
  await page.locator('#messages a', { hasText: 'Edit' }).first().click();
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(1000);
  const filled = await page.evaluate(() => {
    const editors = [...document.querySelectorAll('.prime-dialog.open .CodeMirror')];
    editors.at(-1)?.CodeMirror?.setValue('oauth2-authorize-page-title=Pied Piper | Log in\noauth2-logout-page-title=Pied Piper | Log out');
    // show the default messages the custom ones override, like the original
    const cm = editors[0]?.CodeMirror;
    const line = cm?.getValue().split('\n').findIndex(l => l.startsWith('oauth2-logout-page-title='));
    if (!(line >= 0)) return false;
    cm.setOption('viewportMargin', Infinity);
    cm.scrollIntoView({ line, ch: 0 }, 80);
    cm.setSelection({ line, ch: 0 }, { line, ch: cm.getLine(line).length });
    return editors.length > 1;
  });
  if (!filled) throw new Error('custom messages editor not found');
}

async function previewRegister(page) {
  await page.locator('#pages a', { hasText: 'OAuth register' }).first().click();
  await page.waitForTimeout(1500);
}

export const shots = {
  'theme-simple-editor-index': { legacyVersion: true },
  'theme-simple-editor-light': { legacyVersion: true, prepare: preparation({ afterControls: loadPrebuilt('Light') }) },
  'theme-simple-editor-dark': { legacyVersion: true, prepare: preparation({ afterControls: loadPrebuilt('Dark') }) },
  'theme-simple-editor-images': { simpleEditorTab: 'Images', legacyVersion: true, prepare: preparation({ afterControls: editPanel(setBackgroundImage) }) },
  'theme-simple-editor-styles': { simpleEditorTab: 'Styles', legacyVersion: true, prepare: preparation({ afterControls: editPanel(setStyles) }) },
  'theme-simple-editor-messages': { fixedHeight: null, simpleEditorTab: 'Messages', prepare: preparation({ afterControls: editPanel(setMessages) }) },
  'theme-simple-editor-preview': { simpleEditorTab: 'Pages preview', legacyVersion: true, prepare: preparation({ afterControls: editPanel(previewRegister) }) },
};
