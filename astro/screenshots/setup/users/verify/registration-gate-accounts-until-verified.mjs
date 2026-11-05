import { preparation, selectTab, apiRequest } from '../../kit.mjs';
import { verification, hostedLogin } from '../_shared.mjs';
import { verificationTenant } from './_shared.mjs';

// Carla's source JSON, with stable ids and timestamps and her unverified registration marked
async function registrationSource(page, ctx, { tag }) {
  await selectTab(page, 'Source');
  const [userId] = verification.users.carla;
  const { user } = await apiRequest(`/api/user/${userId}`);
  await page.waitForFunction(id => document.querySelector('#raw-user pre')?.textContent.includes(id), userId);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(([ids]) => {
    const pre = document.querySelector('#raw-user pre');
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      let text = node.textContent;
      ids.forEach((id, i) => { text = text.replaceAll(id, `00000000-0000-0000-0000-f4000000009${i + 1}`); });
      node.textContent = text.replace(/\b1\d{12}\b/g, '1790000000000');
    }
  }, [user.registrations.map(r => r.id)]);
  await tag('registration-verified', () => {
    const pre = document.querySelector('#raw-user pre');
    const text = pre.textContent;
    const registrations = text.indexOf('"registrations"');
    const match = registrations < 0 ? null : /"verified"\s*:\s*false/.exec(text.slice(registrations));
    if (!match) return null;
    const start = registrations + match.index, end = start + match[0].length;
    const range = document.createRange();
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
    let offset = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = offset + node.textContent.length;
      if (start >= offset && start < next) range.setStart(node, start - offset);
      if (end > offset && end <= next) {
        range.setEnd(node, end - offset);
        const marker = document.createElement('span');
        marker.append(range.extractContents());
        range.insertNode(marker);
        return marker;
      }
      offset = next;
    }
    return null;
  });
}

export const shots = {
  'manage-verification-application-registration-settings': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-verification-registration-template': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-verification-registration-gate-link': {
    fixedHeight: null,
    signedOut: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('carla@piedpiper.com', { registration: true }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-registration-unverified-user': {
    prepare: preparation({ beforeUserTabs: registrationSource }),
    temporaryResources: [verificationTenant],
    // hosted logins add identity history to the source JSON
    recreateResources: true,
  },
  'manage-verification-registration-gate-code': {
    fixedHeight: null,
    signedOut: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('ed@piedpiper.com', { registration: true, code: true }) }),
    temporaryResources: [verificationTenant],
  },
};
