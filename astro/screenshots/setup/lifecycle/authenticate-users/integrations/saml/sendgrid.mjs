import { authShot } from '../../_shared.mjs';
import { baseUrl } from '../../../../kit.mjs';
import { samlApp, viewSamlDetails } from './_shared.mjs';

export const shots = {
  'authenticate-sendgrid-application-saml': authShot({ switch: ['application_samlv2Configuration_enabled'], select: { application_name: 'SendGrid' }, fixedHeight: null }),
  'authenticate-sendgrid-saml-details': authShot({ fixedHeight: null, temporaryResources: [samlApp], resourceArgs: { 27: ['SendGrid'] } }, viewSamlDetails),
  'authenticate-sendgrid-metadata': authShot({ fixedHeight: null, temporaryResources: [samlApp], resourceArgs: { 27: ['SendGrid'] } }, async page => {
    await page.evaluate(host => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(host, 'https://local.fusionauth.io');
    }, baseUrl);
    await page.evaluate(() => {
      const cert = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^MII/.test(e.textContent.trim()));
      if (cert) {
        window.scrollTo(0, 0);
        const r = cert.getBoundingClientRect(), left = Math.max(0, r.left);
        const box = document.createElement('div');
        box.dataset.hl = 'certificate';
        box.style.cssText = `position:absolute;left:${left}px;top:${r.top + scrollY}px;width:${Math.min(r.width, innerWidth - left - 8)}px;height:${r.height}px;pointer-events:none`;
        document.body.append(box);
      }
    });
  }),
};
