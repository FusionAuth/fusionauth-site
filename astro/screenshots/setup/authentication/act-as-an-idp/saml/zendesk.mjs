import { authShot, auth } from '../../_shared.mjs';
import { projectRoot } from '../../../kit.mjs';
import { authorizeRedirect } from './_shared.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// the roles lambda as the guide shows it
const lambdaBody = () => readFileSync(join(projectRoot, 'extractedcode/example-lambdas/lambdas/samlv2-populate/zendesk-role.js'), 'utf-8');

const rolesLambda = {
  order: 25,
  paths: [`/api/lambda/${auth.zendeskLambdaId}`],
  create: async api => {
    await api(`/api/lambda/${auth.zendeskLambdaId}`, 'POST', { lambda: { name: 'Populate Zendesk roles', type: 'SAMLv2Populate', engineType: 'GraalJS', body: lambdaBody() } });
  },
};

const signingKey = {
  order: 26,
  paths: [`/api/key/${auth.zendeskKeyId}`],
  create: async api => {
    const certificate = readFileSync(join(projectRoot, 'screenshots/keys/zendesk-signing.crt'), 'utf-8');
    await api(`/api/key/import/${auth.zendeskKeyId}`, 'POST', { key: { name: 'SAML key generated for application Zendesk', certificate } });
  },
};

// long fingerprints wrap inside the dialog
async function wrapDialogTables(page) {
  await page.evaluate(() => {
    for (const table of document.querySelectorAll('.prime-dialog.open table')) {
      table.style.tableLayout = 'fixed';
      table.style.width = '100%';
      for (const cell of table.querySelectorAll('td, th')) cell.style.overflowWrap = 'anywhere';
      for (const row of table.rows) if (row.cells.length === 2) {
        row.cells[0].style.width = '28%';
        row.cells[1].style.width = '72%';
      }
    }
  });
}

export const shots = {
  'authenticate-zendesk-application-roles': authShot({ select: { application_name: 'Zendesk' }, fixedHeight: null }, async (page, ctx, { showTab }) => {
    await showTab();
    for (const [role, description] of [['agent', 'Zendesk agent'], ['admin', 'Zendesk admin']]) {
      await page.locator('#role-add-button').click();
      const added = page.locator('#role-table tbody tr').last();
      await added.locator('input[type=text]').first().fill(role);
      await added.locator('input[type=text]').last().fill(description);
    }
    await page.evaluate(() => document.activeElement?.blur());
  }),
  'authenticate-zendesk-lambda-add': authShot({ fixedHeight: null }, async page => {
    await page.fill('#lambda_name', 'Populate Zendesk roles');
    await page.selectOption('select[name="lambda.type"]', 'SAMLv2Populate');
    await page.waitForTimeout(500);
    const set = await page.evaluate(body => {
      const cm = document.querySelector('main .CodeMirror')?.CodeMirror;
      cm?.setValue(body);
      return !!cm;
    }, lambdaBody().trimEnd());
    if (!set) throw new Error('lambda body editor not found');
  }),
  'authenticate-zendesk-application-saml': authShot({
    switch: ['application_samlv2Configuration_enabled'],
    select: {
      application_name: 'Zendesk', application_samlv2Configuration_issuer: 'https://fusionauth-example.zendesk.com',
      application_samlv2Configuration_logoutURL: 'https://piedpiper.com', application_lambdaConfiguration_samlv2PopulateId: auth.zendeskLambdaId,
    },
    band: 'el-tab-list, #application_lambdaConfiguration_samlv2PopulateId-form-row',
    temporaryResources: [rolesLambda],
  }, authorizeRedirect('https://fusionauth-example.zendesk.com/access/saml/')),
  'authenticate-zendesk-key-fingerprint': authShot({ fixedHeight: null, temporaryResources: [signingKey] }, async (page, ctx, { openView, row }) => {
    await openView(`/ajax/key/view/${auth.zendeskKeyId}`, 'Fingerprint (MD5):');
    await row('sha256', 'Fingerprint (SHA-256):');
  }, { afterFraming: wrapDialogTables }),
};
