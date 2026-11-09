import { preparation, apiRequest, piedPiperAppId } from '../kit.mjs';

// resources for the authenticate users pages
const auth = {
  lockActionId: '00000000-0000-0000-0000-f30000000001',
  jaredId: '00000000-0000-0000-0000-f30000000002',
  laurieId: '00000000-0000-0000-0000-f30000000003',
  hooliAppId: '00000000-0000-0000-0000-f30000000004',
  tableauKeyId: '00000000-0000-0000-0000-f30000000005',
  apiKeyId: '00000000-0000-0000-0000-f30000000006',
  apiTypeId: '00000000-0000-0000-0000-f30000000007',
  salesforceAppId: '00000000-0000-0000-0000-f3000000000b',
  zendeskLambdaId: '00000000-0000-0000-0000-f3000000000c',
  zendeskKeyId: '00000000-0000-0000-0000-f3000000000d',
  emailTemplateId: '00000000-0000-0000-0000-f3000000000e',
  messageTemplateId: '00000000-0000-0000-0000-f3000000000f',
  samlAppId: '00000000-0000-0000-0000-f30000000010',
  samlKeyId: '00000000-0000-0000-0000-f30000000011',
  voiceMessengerId: '00000000-0000-0000-0000-f30000000012',
  tableauAppId: '00000000-0000-0000-0000-f30000000013',
  voiceTemplateId: '00000000-0000-0000-0000-f30000000014',
};

// the Tenant manager application gets a new id on each start
export async function normalizeApplicationManager(page, { pathname }) {
  if (pathname === '/admin/application/') {
    await page.evaluate(() => {
      const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
      const cell = row?.querySelectorAll('td')[1];
      if (cell) cell.textContent = '00000000-0000-0000-0000-f300000001ff';
    });
  }
}

// An authenticate users screenshot: its steps run before the user tabs,
// then a page shown from the top (fixedHeight: null) is scrolled back up.
export const authShot = (shot, steps, stages = {}) => ({
  ...shot,
  prepare: preparation({
    ...stages,
    beforeUserTabs: async (page, ctx, info) => {
      await normalizeApplicationManager(page, info);
      await steps?.(page, ctx, info);
      if (shot.fixedHeight === null) await page.evaluate(() => window.scrollTo(0, 0));
    },
  }),
});

// Pied Piper's OAuth settings changed for one screenshot and put back after it.
export const piedPiperOauthState = (order, oauthConfiguration) => ({
  order,
  apply: async () => {
    const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
    await apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { oauthConfiguration } });
    return () => apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
  },
});

// GET and POST ticked and boxed, and the allowed origins added, on the system CORS settings
export async function allowCors(page, { box, showTab, addTokens }, origins) {
  await showTab();
  await page.evaluate(() => {
    for (const box of document.querySelectorAll('#corsConfiguration_allowedMethods input')) if (['GET', 'POST'].includes(box.value) && !box.checked) box.click();
  });
  const methods = await page.evaluate(() => [...document.querySelectorAll('#corsConfiguration_allowedMethods input')].filter(i => ['GET', 'POST'].includes(i.value)).map(i => `#${CSS.escape(i.id)}`));
  await page.evaluate(sels => sels.forEach((s, i) => { document.querySelector(s).closest('.checkbox, div').dataset.method = i; }), methods);
  await box('methods', ["#corsConfiguration_allowedMethods [data-method='0']", "#corsConfiguration_allowedMethods [data-method='1']"], 4);
  await addTokens('cors-allowed-origins-display', origins);
}

export { auth };
