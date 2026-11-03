import { preparation } from '../../kit.mjs';
import { leftoversAppId } from '../../_shared.mjs';
import { temporaryResources34 as gatewayResources } from '../../extend/examples/api-gateways/_shared.mjs';
import { consentUrl, leftovers, reachConsent } from '../_shared.mjs';

// opens the scope dialog for action, with the scope's random id replaced in it
const scopeDialog = (action, edit) => async page => {
  const href = action === 'create' ? '/ajax/application/scope/add' : `/ajax/application/scope/${action}`;
  await page.locator(`a[href*="${href}"]`).first().evaluate(el => el.click());
  await page.locator('.prime-dialog.open').waitFor();
  await edit?.(page);
  await page.locator('.prime-dialog.open input[id="scopeId"]').evaluateAll(els => els.forEach(el => { if (el.type !== 'hidden') el.value = '00000000-0000-0000-0000-f70000000002'; }));
};

async function editScope(page) {
  await page.fill('#scope_description', "Provides an application read-only access to a user's data");
  await page.locator('#scope_required').check({ force: true });
}

const gatewayShot = (beforeSizing, extra) => ({ ...extra, prepare: preparation({ beforeSizing }), temporaryResources: [gatewayResources] });

export const shots = {
  'leftovers-scope-consent': gatewayShot(leftovers(reachConsent('scope-consent', consentUrl(leftoversAppId, ['openid', 'email', 'phone', 'data:read'])))),
  'leftovers-scopes': gatewayShot(leftovers()),
  'leftovers-scope-create': gatewayShot(leftovers(scopeDialog('create')), { fixedHeight: null }),
  'leftovers-scope-edit': gatewayShot(leftovers(scopeDialog('edit', editScope)), { fixedHeight: null }),
  'leftovers-scope-view': gatewayShot(leftovers(scopeDialog('view')), { fixedHeight: null }),
  'leftovers-scope-delete': gatewayShot(leftovers(scopeDialog('delete')), { fixedHeight: null }),
};
