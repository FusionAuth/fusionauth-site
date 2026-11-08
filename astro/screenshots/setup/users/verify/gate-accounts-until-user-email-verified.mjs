import { preparation, apiRequest, baseUrl, apiKey } from '../../kit.mjs';
import { verification, fillFields, hostedLogin } from '../_shared.mjs';
import { verificationTenant, tagIdentity, openApplicationDetails, markSelfServiceStrip } from './_shared.mjs';

// the email strategy is set for the whole tenant, which verificationTenant creates
const peterEmailCode = {
  order: 17,
  apply: async () => {
    const tenant = `/api/tenant/${verification.tenantId}`, inTenant = { 'X-FusionAuth-TenantId': verification.tenantId };
    const strategy = verificationStrategy => apiRequest(tenant, 'PATCH', { tenant: { emailConfiguration: { verificationStrategy } } });
    await strategy('FormField');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await fetch(`${baseUrl}/api/identity/verify/start`, {
      method: 'POST', headers: { Authorization: apiKey, 'Content-Type': 'application/json', ...inTenant },
      body: JSON.stringify({ loginId: 'peter@piedpiper.com', loginIdType: 'email', verificationStrategy: 'FormField' }),
    }).then(async r => { if (!r.ok) throw new Error(`verify start: ${r.status} ${await r.text()}`); });
    return async () => {
      if ((await fetch(`${baseUrl}${tenant}`, { headers: { Authorization: apiKey } })).ok) await strategy('ClickableLink');
    };
  },
};

async function applicationDetails(page, ctx, { tag }) {
  await openApplicationDetails(page);
  await tag('verification-urls', () => {
    const rows = [...document.querySelectorAll('.prime-dialog.open tr')];
    const login = rows.find(r => /^OAuth IdP login URL/i.test(r.textContent.trim()));
    const register = rows.find(r => /^Registration URL/i.test(r.textContent.trim()));
    if (!login || !register) return null;
    const a = login.getBoundingClientRect(), b = register.getBoundingClientRect();
    const box = document.createElement('div');
    box.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    document.body.append(box);
    return box;
  });
}

export const shots = {
  'manage-verification-tenant-email-settings': {
    fixedHeight: 'Messaging settings',
    prepare: preparation({ beforeUserTabs: fillFields({ tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_verificationStrategy: 'FormField' }) }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-email-template': { fixedHeight: null, temporaryResources: [verificationTenant] },
  'manage-verification-application-self-service': {
    band: '#manage-self-service-strip',
    textPadding: 4,
    prepare: preparation({ afterSections: markSelfServiceStrip }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-application-details': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: applicationDetails }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-email-gate-link': {
    fixedHeight: null,
    signedOut: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('jared@piedpiper.com') }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-email-unverified-user': {
    prepare: preparation({ beforeUserTabs: tagIdentity('Email') }),
    temporaryResources: [verificationTenant],
  },
  'manage-verification-email-gate-code': {
    fixedHeight: null,
    signedOut: true,
    prepare: preparation({ beforeUserTabs: hostedLogin('peter@piedpiper.com', { code: true }) }),
    temporaryResources: [verificationTenant],
    temporaryState: [peterEmailCode],
  },
};
