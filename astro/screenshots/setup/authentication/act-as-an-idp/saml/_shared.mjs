import { auth } from '../../_shared.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { projectRoot } from '../../../kit.mjs';

// a SAML application named by the screenshot's resourceArgs, with its signing key
const samlApp = {
  order: 27,
  paths: [`/api/application/${auth.samlAppId}`, `/api/key/${auth.samlKeyId}`],
  create: async (api, applicationName) => {
    const asset = file => readFileSync(join(projectRoot, `screenshots/keys/${file}`), 'utf-8');
    await api(`/api/key/import/${auth.samlKeyId}`, 'POST', { key: {
      name: 'Pied Piper demonstration SAML key', algorithm: 'RS256', privateKey: asset('saml-demo.key'), certificate: asset('saml-demo.crt'),
    } });
    await api(`/api/application/${auth.samlAppId}`, 'POST', { application: { name: applicationName, samlv2Configuration: {
      enabled: true, issuer: 'https://piedpiper.com', keyId: auth.samlKeyId, authorizedRedirectURLs: ['https://piedpiper.com/saml/acs'],
    } } });
  },
};

// the application's view dialog with its SAML integration details boxed
async function viewSamlDetails(page, ctx, { box, mark, openView, row }) {
  await openView(`/ajax/application/view/${auth.samlAppId}`, 'SAML v2 Integration details');
  await mark('data-row', 'saml', '.prime-dialog.open h3', 'SAML v2 Integration details');
  await box('saml-details', [".prime-dialog.open h3[data-row='saml']", await row('initiate', 'Initiate login URL:')], 4);
  await box('entity-login', [await row('entity', 'Entity Id:'), await row('login', 'Login URL:')]);
  await row('metadata', 'Metadata URL:');
}

const authorizeRedirect = url => async (page, ctx, { showTab, addTokens }) => {
  await showTab();
  await addTokens('application_samlv2Configuration_authorizedRedirectURLs-display', [url]);
};

export { samlApp, viewSamlDetails, authorizeRedirect };
