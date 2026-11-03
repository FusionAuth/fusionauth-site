import { preparation } from '../../../kit.mjs';

// expand the Warning accordion so the generation rows exist in DOM
async function expandWarning(page) {
  try {
    await page.locator('button, [role="button"], summary, a').filter({ hasText: /Warning/ }).first().click({ timeout: 5000 });
    await page.waitForTimeout(500);
  } catch (e) {
    throw new Error(`Warning accordion expand failed: ${e.message}`, { cause: e });
  }
}

// tag and scroll to the Passwordless login row of the template select's column
const passwordlessTemplateRow = (selectId, hl) => async page => {
  await page.evaluate(([selectId, hl]) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const innerFieldset = sel.closest('fieldset');
    if (!innerFieldset) return;
    let cell = sel.parentElement;
    while (cell && cell.parentElement !== innerFieldset) cell = cell.parentElement;
    if (cell) {
      cell.setAttribute('data-hl', hl);
      cell.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [selectId, hl]);
  await page.waitForTimeout(300);
};

export const shots = {
  'passwordless-tenant-duration': { legacyVersion: true },
  'passwordless-tenant-generation': { legacyVersion: true, prepare: preparation({ afterTenantWorkflow: expandWarning }) },
  'passwordless-email-templates-list': {},
  'passwordless-email-template-edit': { legacyVersion: true },
  'passwordless-tenant-email-config': {
    legacyVersion: true,
    prepare: preparation({ afterTenantWorkflow: passwordlessTemplateRow('tenant_emailConfiguration_passwordlessEmailTemplateId', 'pw-email-template') }),
  },
  'passwordless-message-templates-list': {},
  'passwordless-message-template-edit': { legacyVersion: true },
  'passwordless-tenant-message-config': {
    legacyVersion: true,
    prepare: preparation({ afterTenantWorkflow: passwordlessTemplateRow('tenant_phoneConfiguration_passwordlessTemplateId', 'pw-message-template') }),
  },
};
