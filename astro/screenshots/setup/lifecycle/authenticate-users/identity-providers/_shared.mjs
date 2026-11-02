import { fixedId, tabsReady, selectTab, baseUrl, preparation } from '../../../kit.mjs';

// identity providers, their keys and the applications they log in to
const idpId = n => fixedId('f2', n);
const piperChatId = idpId(1);
const piperNetId = idpId(2);

const idpKeys = [[201, 'ADFS Certificate', 'RS256'], [202, 'Azure AD Certificate', 'RS256'], [203, 'Pied Piper Okta IdP', 'RS256'], [204, 'Pied Piper SAML Certificate', 'RS256'], [205, 'Apple Private Key', 'ES256'], [206, 'Pied Piper Mobile Key', 'HS256']];
const idpApps = (app = piperChatId) => ({ [app]: { enabled: true, createRegistration: true } });
const idpOidc = (name, buttonText, endpoints, oauth2, extra = {}) => ({
  type: 'OpenIDConnect', name, enabled: true, buttonText, applicationConfiguration: idpApps(), ...extra,
  oauth2: { clientAuthenticationMethod: 'client_secret_basic', scope: 'openid', authorization_endpoint: `${endpoints}/authorize`, token_endpoint: `${endpoints}/token`, userinfo_endpoint: `${endpoints}/userinfo`, ...oauth2 },
});
const idpDefinitions = {
  101: idpOidc('Okta', 'Login with Okta', 'https://piedpiper.okta.com/oauth2/v1', { client_id: '0oa3xfv009bZYlCp4697', client_secret: 'd8DthWkNRBRQhkGxp', scope: 'openid email' }),
  102: idpOidc('Pied Piper with Azure AD', 'Login with Azure AD', 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/oauth2/v2.0', { client_id: '7bbfc733-5f74-4ed2-a54c-c2b4f2098cac', client_secret: 'oV-Zch01m2UjgdB.x5_yJjF9_wNl0pVga_' }),
  103: idpOidc('Cognito', 'Login with Cognito', 'https://piedpiper.auth.us-east-2.amazoncognito.com/oauth2', { client_id: '1dejfipvspjcghttmle', client_secret: '19i51qiit5r6fqme8d09srhgmdoq1kpjev' }),
  104: idpOidc('Discord OIDC', 'Login with Discord', 'https://discord.com/api/oauth2', {
    client_id: '869975291286683692', client_secret: 'sB7UbnirswU1USOuJRs_HiYGwoW2kkNx', clientAuthenticationMethod: 'client_secret_post',
    userinfo_endpoint: 'https://discord.com/api/users/@me', scope: 'identify email', uniqueIdClaim: 'id', emailVerifiedClaim: 'verified',
  }, { debug: true }),
  105: idpOidc('GitHub', 'Login with GitHub', 'https://github.com/login/oauth', {
    client_id: 'Iv1.ad9ec654d44e5a75', client_secret: '08fba234c621eb3aa84ac7112a18073fc92bc030',
    token_endpoint: 'https://github.com/login/oauth/access_token', userinfo_endpoint: 'https://api.github.com/user', scope: 'user:email',
  }, { linkingStrategy: 'LinkAnonymously', debug: true }),
  106: idpOidc('Pied Piper', 'Login with Pied Piper', 'https://login.piedpiper.com/oauth2', { client_id: '7a3906ee-b105-4ff9-bf9a-16df55c93f3f', client_secret: '3uOQq-IxbZkh38KeI1AnoS9io5SnT3Np1vwqvGibWPs' }),
  107: idpOidc('Pied Piper Workforce', 'Login with Pied Piper Workforce', 'https://workforce.piedpiper.com/oauth2', { client_id: '3f1b7c2e-9d4a-4e6b-8a1f-5c2d7e9b0a14', client_secret: 'Wf7nQ2xLp9Rt4Kv8Zs3Hy6Bm1Jc5Dg0F' }, { domains: ['piedpiper.com'], applicationConfiguration: idpApps(piperNetId) }),
  111: { type: 'SAMLv2', name: 'ADFS', enabled: true, idpEndpoint: 'https://adfs.piedpiper.com/adfs/ls', keyId: idpId(201), useNameIdForEmail: true, buttonText: 'Login with ADFS', debug: true, applicationConfiguration: idpApps() },
  112: { type: 'SAMLv2', name: 'Pied Piper via SAML', enabled: true, idpEndpoint: 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/saml2', keyId: idpId(202), buttonText: 'Login with SAML + Azure', emailClaim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', debug: true, applicationConfiguration: idpApps() },
  113: { type: 'SAMLv2', name: 'Okta SAML', enabled: true, idpEndpoint: 'https://piedpiper.okta.com/app/piedpiper_fusionauth_1/exk1jx8gwx2nxMcan697/sso/saml', keyId: idpId(203), buttonText: 'Login with Okta', uniqueIdClaim: 'userid', emailClaim: 'email', applicationConfiguration: idpApps() },
  114: { type: 'SAMLv2', name: 'Pied Piper SAML', enabled: true, idpEndpoint: 'https://login.piedpiper.com/samlv2/sso', keyId: idpId(204), buttonText: 'Login with Pied Piper', applicationConfiguration: idpApps() },
  121: { type: 'SAMLv2IdPInitiated', name: 'Pied Piper IdP Initiated Login', enabled: true, issuer: 'http://www.okta.com/exk1jx8gwx2nxMcan697', keyId: idpId(203), uniqueIdClaim: 'userId', emailClaim: 'email', debug: true, applicationConfiguration: idpApps() },
  131: { type: 'Apple', name: 'Apple', enabled: true, buttonText: 'Sign in with Apple', servicesId: 'com.piedpiper.piperchat.login', teamId: 'R4NQ1P4UEB', keyId: idpId(205), scope: 'email name', applicationConfiguration: idpApps() },
  132: { type: 'Facebook', name: 'Facebook', enabled: true, buttonText: 'Login with Facebook', appId: '1052841945310473', client_secret: 'c2a7b3f1e94d8a6b5c0e7f2d1a9b8c3e', permissions: 'email', fields: 'name,email', loginMethod: 'UseRedirect', applicationConfiguration: idpApps() },
  133: { type: 'Google', name: 'Google', enabled: true, buttonText: 'Sign in with Google', client_id: '718294035516-piperchat-login.apps.googleusercontent.com', client_secret: 'PiedPiper-Google-S3cret-7Kq9Lm2Nx5', scope: 'profile email openid', loginMethod: 'UseRedirect', debug: true, tenantConfiguration: { '30663132-6464-6665-3032-326466613934': { limitUserLinkCount: { enabled: true, maximumLinks: 2 } } }, applicationConfiguration: idpApps() },
  134: { type: 'LinkedIn', name: 'LinkedIn', enabled: true, buttonText: 'Sign in with LinkedIn', client_id: '86xq2a8kvyj4wz', client_secret: 'Wd8xV2k9Lp3TnQ7r', scope: 'openid profile email', applicationConfiguration: idpApps() },
  135: { type: 'Twitter', name: 'Twitter', enabled: true, buttonText: 'Login with Twitter', consumerKey: 'Gq5LwYp2k8XnT3vR9cZb1Mh7d', consumerSecret: 'pK4rT8yW2nB6vX1qL9mJ3fH7sD5gA0zC8eU2iO4tR6wY1nM3', applicationConfiguration: idpApps() },
  141: { type: 'EpicGames', name: 'Epic Games', enabled: true, buttonText: 'Login with Epic Games', client_id: 'xyza7891PiedPiperEpic0123', client_secret: 'Ep1cS3cretPiedPiper7Kq9Lm2Nx5', applicationConfiguration: idpApps() },
  142: { type: 'Nintendo', name: 'Nintendo', enabled: true, buttonText: 'Login with Nintendo', client_id: '3d4f6a8b1c2e5f70', client_secret: 'N1ntend0S3cretPiedPiper9xQ2', uniqueIdClaim: 'id', emailClaim: 'email', usernameClaim: 'preferred_username', applicationConfiguration: idpApps() },
  143: { type: 'SonyPSN', name: 'Sony PlayStation Network', enabled: true, buttonText: 'Login with PlayStation Network', client_id: '8f2a6c4e-1b3d-4e5f-9a7b-2c4d6e8f0a1b', client_secret: 'PsnS3cretPiedPiper4Rt7Yu2', scope: 'psn:s2s openid id_token:psn.basic_claims', applicationConfiguration: idpApps() },
  144: { type: 'Steam', name: 'Steam', enabled: true, buttonText: 'Login with Steam', client_id: 'pied-piper-steam', webAPIKey: '3F9A1C7E5B2D8F4A6C0E9B1D7F3A5C2E', scope: 'openid', applicationConfiguration: idpApps() },
  145: { type: 'Twitch', name: 'Twitch', enabled: true, buttonText: 'Login with Twitch', client_id: 'gp762nuuoqcoxypju8c569th9wz7q5', client_secret: 'k7s0w2x9q4v1m8n3b6c5z2l0p9o8i7', scope: 'openid user:read:email', applicationConfiguration: idpApps() },
  146: { type: 'Xbox', name: 'Xbox', enabled: true, buttonText: 'Login with Xbox', client_id: 'b4f8e2a6-3c1d-4e9f-8a7b-6c5d4e3f2a10', client_secret: 'Xb0x~S3cretPiedPiper.9Kq2Lm', scope: 'Xboxlive.signin Xboxlive.offline_access', applicationConfiguration: idpApps() },
  151: { type: 'HYPR', name: 'HYPR', enabled: true, relyingPartyApplicationId: 'piedpiper-hypr', relyingPartyURL: 'https://piedpiper.hypr.com', applicationConfiguration: idpApps(piperNetId) },
  161: { type: 'ExternalJWT', name: 'Pied Piper Mobile', enabled: true, headerKeyParameter: 'kid', oauth2: { uniqueIdClaim: 'sub', emailClaim: 'email', emailVerifiedClaim: 'email_verified', usernameClaim: 'preferred_username' }, verificationKeyIds: [idpId(206)], claimMap: {}, domains: ['mobile.piedpiper.com'], linkingStrategy: 'LinkAnonymously', applicationConfiguration: idpApps(piperNetId) },
};

const idpResources = {
  order: 18,
  paths: [
    ...Object.keys(idpDefinitions).map(n => `/api/identity-provider/${idpId(n)}`),
    `/api/application/${piperChatId}`, `/api/application/${piperNetId}`,
    ...idpKeys.map(([n]) => `/api/key/${idpId(n)}`),
  ],
  create: async api => {
    for (const [n, name, algorithm] of idpKeys) {
      await api(`/api/key/generate/${idpId(n)}`, 'POST', { key: { name, algorithm, ...(algorithm === 'RS256' ? { length: 2048 } : {}) } });
    }
    await api(`/api/application/${piperChatId}`, 'POST', { application: { name: 'PiperChat', oauthConfiguration: {
      clientSecret: 'piperchat-client-secret-for-screenshots',
      authorizedRedirectURLs: ['https://piperchat.piedpiper.com/oauth-redirect'], enabledGrants: ['authorization_code', 'refresh_token'], generateRefreshTokens: true,
    } } });
    await api(`/api/application/${piperNetId}`, 'POST', { application: { name: 'PiperNet', oauthConfiguration: {
      authorizedRedirectURLs: ['https://pipernet.piedpiper.com/oauth-redirect'], enabledGrants: ['authorization_code'],
    } } });
    // created last, so the first path only exists once everything does
    for (const [n, identityProvider] of Object.entries(idpDefinitions).reverse()) {
      await api(`/api/identity-provider/${idpId(n)}`, 'POST', { identityProvider });
    }
  },
};

const idpSampleCertificate = `-----BEGIN CERTIFICATE-----
MIICHzCCAYigAwIBAgIUUPGNuenG+190R8nyn9AD/SE6phswDQYJKoZIhvcNAQEL
BQAwMjEbMBkGA1UEAwwScGllZHBpcGVyLm9rdGEuY29tMRMwEQYDVQQKDApQaWVk
IFBpcGVyMB4XDTI2MTAyNzExNTYyMloXDTM2MTAyNDExNTYyMlowMjEbMBkGA1UE
AwwScGllZHBpcGVyLm9rdGEuY29tMRMwEQYDVQQKDApQaWVkIFBpcGVyMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnJM7eRh8WNiKjtAw1rBUYqY7Z7K3ZR20o
ac6WDsBNRhNxCF257ut9AvfI304GBrTLmnnZPkZ4QGu9J9zsAewH5ST04zTZkm8X
Iun3OPoKVdYil7So3EhjXnQTYRWILdo/B1FER54hfrKf4C45BoiXDDmFAQVgmz49
uZ9yDSzF5wIDAQABozIwMDAdBgNVHQ4EFgQUgi8hkWg9G+Hq1L3IGIgDmuY/41Mw
DwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQCU1wjDZEwMIV6rXAo5
GTnj9ELv06LegQUuwSUZvTltf8iORFybC9OwlsIJKQ7umK6dJEqpR06Gp9AKVNg7
kCmTo84722EIs6/R+A2TdEuD2eaQm3GivAoZ/tnGuhNPtBlT3jUIHveTIbYp5oAc
2nidS02eNrHNTEHZ+M2YXqZeTg==
-----END CERTIFICATE-----`;
const idpSampleEcKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8c440Nd8eZ7Wq+iv
QRYFuhmKJNTByaeKOAaRX4kvuaOhRANCAAQDgVPSJtir5sb+Xoyl1LUC0TZRqc2W
c/1mG2iO+WKjDmuXn0v4C+QueIdgVj+KMwlAHR6Z9thejebzW2aTmmjw
-----END PRIVATE KEY-----`;
const idpIntegrationDetails = 'SAML v2 Integration details';

// what an identity provider screenshot does on its page (shot.idp); field names are element ids
async function prepareIdp(page, ctx, { url, pathname, fragment, tag, idpShot }) {
  // login pages: the IdP whose button the screenshot shows, or null for the page that asks for the email first
  if ('login' in idpShot) {
    const target = idpShot.login && idpId(idpShot.login);
    // FusionAuth picks up new applications and IdPs after a delay
    for (let i = 0; ; i++) {
      const ready = await page.evaluate(t => t ? !!document.querySelector(`.login-button[data-identity-provider-id="${t}"]`)
        : !!document.querySelector('#loginId') && !document.querySelector('#password'), target);
      if (ready) break;
      if (i === 120) throw new Error(`login page for ${ctx.name} not ready`);
      await page.waitForTimeout(1000);
      await page.goto(url, { waitUntil: 'networkidle' });
    }
    // every IdP is enabled for PiperChat, so leave only the one the guide sets up
    if (target) {
      await page.evaluate(t => {
        for (const button of document.querySelectorAll('.login-button')) {
          if (button.dataset.identityProviderId === t) continue;
          let el = button;
          while (el.parentElement.children.length === 1) el = el.parentElement;
          el.remove();
        }
      }, target);
    }
  }

  if (pathname.startsWith('/admin/identity-provider/') && fragment) {
    await tabsReady(page);
    await page.locator(`el-tab-list button[aria-controls="${fragment}"]`).waitFor();
    const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
    if (!label) throw new Error(`no tab for #${fragment}`);
    await selectTab(page, label);
  }

  // FusionAuth shows these ids as numbers
  if (pathname.startsWith('/admin/identity-provider/edit/')) {
    await page.evaluate(id => document.querySelectorAll('input#identityProviderId').forEach(i => { i.value = id; }), pathname.split('/').pop());
  }

  if (idpShot.fill?.identityProvider_oauth2_issuer) {
    await page.locator('#useOpenIdDiscovery').check();
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const issuer = document.getElementById('issuer-configuration');
      issuer.classList.remove('hidden');
      issuer.classList.add('open');
      issuer.style.cssText = 'display:block!important;height:auto!important;max-height:none!important';
      document.getElementById('issuer-endpoint-configuration').style.setProperty('display', 'none', 'important');
    });
    await page.locator('#identityProvider_oauth2_issuer').waitFor({ state: 'visible' });
  }

  for (const [id, value] of Object.entries(idpShot.fill ?? {})) {
    const filled = await page.evaluate(([i, v]) => {
      const input = document.getElementById(i);
      if (!input) return false;
      input.value = v;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, [id, value]);
    if (!filled) throw new Error(`field not found: ${id}`);
  }

  if (pathname === '/admin/identity-provider/') {
    await page.evaluate(({ warning, rowId, menu }) => {
      const warnings = [...document.querySelectorAll('main fieldset')].filter(el => el.querySelector('legend'));
      for (const section of warnings) {
        if (section.querySelector('legend').textContent.trim() !== warning) section.remove();
      }
      const heading = [...document.querySelectorAll('main h2')].find(el => el.textContent.includes('Action required'));
      if (!warning) heading?.closest('.panel')?.remove();
      for (const row of document.querySelectorAll('main table.listing tbody > tr')) {
        if (rowId && !row.textContent.includes(rowId)) row.remove();
        else if (menu) row.remove();
      }
    }, { warning: idpShot.warning, rowId: idpShot.rowMenu && idpId(idpShot.rowMenu), menu: !!idpShot.menu });
  }

  if (idpShot.appOauth) {
    await page.evaluate(id => { document.querySelector('#applicationId').value = id; }, piperChatId);
  }

  if (idpShot.menu || idpShot.keyMenu || idpShot.rowMenu) {
    const href = idpShot.menu ?? (idpShot.keyMenu ? `/ajax/key/import?t=${idpShot.keyMenu}` : `/ajax/identity-provider/view/${idpId(idpShot.rowMenu)}`);
    await tag('idp-menu-item', new Function(`return () => {
          const item = document.querySelector('main a[href="${href}"]');
          item?.closest('[popover]')?.showPopover();
          return item;
        }`)());
    await page.waitForTimeout(500);
  }

  if (idpShot.view || idpShot.appView || idpShot.keyImport || idpShot.claimDialog) {
    const href = idpShot.view ? `/ajax/identity-provider/view/${idpId(idpShot.view)}` : idpShot.appView ? `/ajax/application/view/${idpShot.appView}`
      : idpShot.keyImport ? `/ajax/key/import?t=${idpShot.keyImport.t}` : '/ajax/identity-provider/claim/add';
    await page.evaluate(h => {
      const link = document.querySelector(`main a[href="${h}"]`);
      link?.closest('[popover]')?.showPopover();
      link?.click();
    }, href);
    await page.locator('.prime-dialog.open').waitFor();
    await page.waitForTimeout(800);
    await page.evaluate(baseUrl => {
      const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(`${baseUrl}`, 'https://local.fusionauth.io');
    }, baseUrl);
  }

  if (idpShot.view) {
    await page.evaluate(() => {
      const order = ['PiperChat', 'PiperNet', 'Tenant manager', 'Pied Piper', 'FusionAuth'];
      for (const body of document.querySelectorAll('.prime-dialog.open tbody')) {
        const rows = [...body.children].filter(row => row.tagName === 'TR');
        const name = row => row.querySelector('td')?.textContent.trim();
        if (!rows.some(row => name(row) === 'PiperChat')) continue;
        const rank = row => (order.includes(name(row)) ? order.indexOf(name(row)) : order.length);
        rows.sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b))).forEach(row => body.append(row));
      }
    });
  }

  if (idpShot.appView) {
    await page.addStyleTag({ content: '.prime-dialog.open td, .prime-dialog.open a { overflow-wrap: anywhere; }' });
  }

  // a heading or row label in the dialog, scrolled to and highlighted
  const dialogTarget = idpShot.viewBox ?? (idpShot.appView && 'OAuth IdP login URL');
  if (dialogTarget) {
    await tag('idp-dialog-section', new Function(`return () => {
          const dialog = document.querySelector('.prime-dialog.open');
          const label = [...dialog.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim().replace(/:$/, '') === ${JSON.stringify(dialogTarget)});
          const section = label?.closest('tr') ?? label?.parentElement;
          if (!section) return null;
          let scroller = section.parentElement;
          while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
          if (scroller) scroller.scrollTop += section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
          if (label.tagName !== 'H3') return section;
          const bottom = section.nextElementSibling?.nextElementSibling;
          if (!bottom) return null;
          const a = section.getBoundingClientRect(), b = bottom.getBoundingClientRect();
          const box = document.createElement('div');
          box.style.cssText = 'position:fixed;pointer-events:none;left:' + (a.left - 6) + 'px;top:' + (a.top - 6) + 'px;width:' + (a.width + 12) + 'px;height:' + (b.bottom - a.top + 12) + 'px';
          document.body.append(box);
          return box;
        }`)());
  }

  if (idpShot.keyImport) {
    const { name, kid, pem } = idpShot.keyImport;
    const set = await page.evaluate(([n, k, p]) => {
      const dialog = document.querySelector('.prime-dialog.open');
      for (const [id, v] of [['key_name', n], ['key_kid', k]]) if (v) dialog.querySelector(`#${id}`).value = v;
      if (p) dialog.querySelector('.CodeMirror')?.CodeMirror.setValue(p);
      return !p || !!dialog.querySelector('.CodeMirror');
    }, [name, kid, pem]);
    if (!set) throw new Error('key editor not found');
  }

  // the Tenant manager application and the default keys get new ids on each start
  if (pathname === '/admin/application/' || pathname === '/admin/key/') {
    await page.evaluate(() => {
      let n = 900;
      for (const td of document.querySelectorAll('main td')) {
        const text = td.textContent.trim();
        if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(text) && !text.startsWith('00000000-')) td.textContent = `00000000-0000-0000-0000-f2${String(n++).padStart(10, '0')}`;
      }
    });
  }

  if (idpShot.cors) {
    await page.evaluate(() => {
      for (const box of document.querySelectorAll('input[id^="corsConfiguration.allowedMethods-"]')) if (['GET', 'POST'].includes(box.value) && !box.checked) box.click();
    });
    await page.locator('#cors-allowed-origins-display input').fill(idpShot.cors);
    await page.keyboard.press('Enter');
    await page.evaluate(() => document.activeElement?.blur());
  }

  if (idpShot.appRow) {
    await tag('idp-app-row', new Function(`return () => [...document.querySelectorAll('#applications tr')].find(tr => tr.querySelector('td')?.textContent.trim() === ${JSON.stringify(idpShot.appRow)})`)());
  }

  if (idpShot.overrides) {
    await tag('idp-overrides', new Function(`return () => {
          const link = document.querySelector('a[data-expand-open="${idpShot.overrides}-advanced"]');
          link?.click();
          return link;
        }`)());
    await page.waitForTimeout(800);
  }

  if (idpShot.tenantConfig) {
    await tag('idp-tenants', () => document.querySelector('#tenants table'));
  }

  if (idpShot.claimDialog) await page.evaluate(() => document.activeElement?.blur());

  if (idpShot.listbox) {
    // a native select's open list doesn't render in a screenshot, so show it as a list box
    await tag('idp-listbox', new Function(`return () => {
          const select = document.getElementById(${JSON.stringify(idpShot.listbox)});
          if (!select) return null;
          select.value = 'CreatePendingLink';
          select.size = select.options.length;
          select.style.height = 'auto';
          select.style.backgroundImage = 'none';
          return select;
        }`)());
  }

  if (idpShot.scroll) {
    const marked = await page.evaluate(id => {
      const el = document.querySelector(`main label[for="${id}"]`) ?? document.getElementById(id);
      if (el) el.dataset.idpScroll = '';
      return !!el;
    }, idpShot.scroll);
    if (!marked) throw new Error(`scroll target not found: ${idpShot.scroll}`);
  }

  // one box per field, around its label and input
  for (const [i, field] of (idpShot.box ?? []).entries()) {
    await tag(`idp-box-${i + 1}`, new Function(`return () => {
          const field = ${JSON.stringify(field)};
          let els;
          if (field === 'key-pem') els = [document.querySelector('.prime-dialog.open .CodeMirror')];
          else if (field === 'cors-allowed-origins') els = [document.querySelector("label[for='cors-allowed-origins']"), document.querySelector('#cors-allowed-origins-display')];
          else if (field === 'verification-keys') {
            const label = [...document.querySelectorAll('main label, main p, main span')].find(el => el.children.length === 0 && el.textContent.trim() === 'Verification keys');
            els = [label, document.querySelector('main table:has(#samlv2VerificationKeyIds-input), main table:has(select[name*="keyId"])')];
          } else {
            const input = document.getElementById(field);
            els = [document.querySelector('label[for="' + field + '"]'), input];
          }
          els = els.filter(Boolean);
          if (!els.length) return null;
          const rects = els.map(el => el.getBoundingClientRect());
          const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
          const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
          const box = document.createElement('div');
          box.style.cssText = 'position:' + (document.querySelector('.prime-dialog.open') ? 'fixed' : 'absolute') + ';pointer-events:none;left:' + (left + (document.querySelector('.prime-dialog.open') ? 0 : scrollX) - 6) + 'px;top:' + (top + (document.querySelector('.prime-dialog.open') ? 0 : scrollY) - 6) + 'px;width:' + (right - left + 12) + 'px;height:' + (bottom - top + 12) + 'px';
          document.body.append(box);
          return box;
        }`)());
  }
}

// an open menu, frozen as a copy so it stays put in the screenshot
async function freezeIdpMenu(page) {
  await page.evaluate(() => {
    const item = document.querySelector("[data-hl='idp-menu-item']");
    const menu = item.closest('[popover]');
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    delete item.dataset.hl;
    document.body.append(copy);
    menu.hidePopover();
  });
}

// An identity provider screenshot: prepareIdp runs before sizing, and an open menu is frozen at the end.
const idpShot = (idp = {}, shot = {}, stages = {}) => ({
  ...shot,
  idp,
  prepare: preparation({ beforeSizing: prepareIdp, ...(idp.menu || idp.keyMenu || idp.rowMenu ? { finish: freezeIdpMenu } : {}), ...stages }),
  temporaryResources: [idpResources],
});

export { idpShot, idpId, piperChatId, idpSampleCertificate, idpSampleEcKey, idpIntegrationDetails };
