import { idpShot, idpIntegrationDetails, idpSampleCertificate } from '../_shared.mjs';

// a taller window, with the box stretched from the origins label to its input
async function boxAllowedOrigins(page) {
  await page.setViewportSize({ width: page.viewportSize().width, height: 1297 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('*').forEach(el => { if (el.scrollTop) el.scrollTop = 0; });
    const label = document.querySelector("label[for='cors-allowed-origins']");
    const input = document.querySelector('#cors-allowed-origins-display');
    const box = document.querySelector('[data-hl="idp-box-1"]');
    const a = label.getBoundingClientRect(), b = input.getBoundingClientRect();
    box.style.top = `${a.top + scrollY - 6}px`;
    box.style.height = `${b.bottom - a.top + 12}px`;
  });
}

export const shots = {
  'idp-key-import-okta': idpShot({ keyImport: { t: 'certificate', name: 'Pied Piper Okta IdP', pem: idpSampleCertificate }, box: ['key_name', 'key-pem'] }, { fixedHeight: null }),
  'idp-okta-idp-initiated-edit': idpShot({}, { fixedHeight: null }),
  'idp-view-saml-idp-initiated': idpShot({ view: 121, viewBox: idpIntegrationDetails }, { fixedHeight: null }),
  'idp-cors-settings': idpShot({ cors: 'https://piedpiper.okta.com', box: ['cors-allowed-origins'] },
    { switch: ['systemConfiguration_corsConfiguration_enabled', 'systemConfiguration_corsConfiguration_debug'] }, { finish: boxAllowedOrigins }),
  'idp-okta-idp-initiated-options': idpShot({}, { band: 'el-tab-list, #options' }),
};
