import { execFileSync } from 'child_process';
import { preparation, piedPiperThemeId, defaultThemeId, projectRoot } from '../kit.mjs';
import { selectTheme } from './_shared.mjs';

// the edit page shows an id with leading zeros as a number, so this one doesn't follow the fixed id pattern
const outdatedThemeId = 'cce79624-e742-4977-9777-90aadd807d33';

// The API only accepts complete themes, so a copy of the default theme loses a template and a message key
// in the database, as a theme made before an upgrade would.
const outdatedTheme = {
  order: 38,
  paths: [`/api/theme/${outdatedThemeId}`],
  create: async api => {
    await api(`/api/theme/${outdatedThemeId}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'My Super Cool Theme' } });
    const sql = `update themes set data = ((data::jsonb #- '{templates,confirmationRequired}') || jsonb_build_object('defaultMessages',
      regexp_replace(data::jsonb->>'defaultMessages', '\\[InvalidOrMissingCSRFToken\\][^\\n]*\\n', '')))::text where id = '${outdatedThemeId}'`;
    execFileSync('docker', ['compose', '-f', 'screenshots/docker-compose.yml', 'exec', '-T', 'db', 'psql', '-U', 'fusionauth', '-q', '-c', sql], { cwd: projectRoot });
  },
};

// the template list scrolls inside its own box, so bring the missing one into it
async function showMissingTemplate(page) {
  await page.locator("button[data-tab='confirmationRequired']").evaluate(button => {
    const list = button.closest('[role=tablist]');
    list.scrollTop += button.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom + 8;
  });
}

async function openDefaultMessages(page) {
  await page.locator("button[data-tab='messages'], button[role=tab]").filter({ hasText: /^\s*Messages/ }).first().click();
  await page.locator('a[href="/ajax/theme/validate-localization?isDefault=true"]').click();
  await page.locator('.prime-dialog.open').waitFor();
  // submitting shows which keys are missing
  await page.locator('.prime-dialog.open button[type=submit]').click();
  const error = page.locator('.prime-dialog.open').getByText('Missing required keys');
  await error.waitFor();
  await error.evaluate(el => { el.dataset.hl = 'theme-missing-keys'; });
}

const outdated = stages => ({ keepAlerts: true, temporaryResources: [outdatedTheme], prepare: preparation(stages) });

export const shots = {
  'theme-needing-upgrade': outdated({}),
  'theme-missing-template': { ...outdated({ beforeSizing: showMissingTemplate }), fixedHeight: null },
  'theme-missing-message-keys': { ...outdated({ beforeSizing: openDefaultMessages }), fixedHeight: null },
  'theme-apply-tenant': { fixedHeight: null, themeSelect: piedPiperThemeId, legacyVersion: true, prepare: preparation({ afterControls: selectTheme }) },
};
