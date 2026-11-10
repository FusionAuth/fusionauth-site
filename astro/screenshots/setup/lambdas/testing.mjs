import { readFileSync } from 'fs';
import { join } from 'path';
import { preparation, projectRoot } from '../kit.mjs';

const atestLambdaId = 'f3b3b547-7754-452d-8729-21b50d111505';
// the lambda body the testing guide shows
const atestBody = readFileSync(join(projectRoot, 'extractedcode/example-testing-lambdas/complete-application/role-permissions.js'), 'utf-8');

const atestLambda = {
  order: 3,
  paths: [`/api/lambda/${atestLambdaId}`],
  create: async api => {
    await api(`/api/lambda/${atestLambdaId}`, 'POST', { lambda: { name: '[ATest]', type: 'JWTPopulate', body: atestBody } });
  },
};

async function fillLambda(page) {
  await page.fill('#lambdaId', atestLambdaId);
  await page.fill('#lambda_name', '[ATest]');
  await page.selectOption('select[name="lambda.type"]', 'JWTPopulate');
  await page.waitForTimeout(500);
  const set = await page.evaluate(body => {
    const cm = document.querySelector('main .CodeMirror')?.CodeMirror;
    cm?.setValue(body);
    return !!cm;
  }, atestBody);
  if (!set) throw new Error('lambda body editor not found');
}

async function chooseLambda(page) {
  const set = await page.evaluate(id => {
    const select = document.getElementById('application_lambdaConfiguration_accessTokenPopulateId');
    if (!select) return false;
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return select.value === id;
  }, atestLambdaId);
  if (!set) throw new Error('access token populate lambda not set');
}

export const shots = {
  'lambda-populate': { prepare: preparation({ afterSystemTab: fillLambda }) },
  'lambda-edit-application': {
    switch: ['application_jwtConfiguration_enabled'],
    fixedHeight: 'Lambda settings',
    legacyVersion: true,
    prepare: preparation({ afterSystemTab: chooseLambda }),
    temporaryResources: [atestLambda],
  },
};
