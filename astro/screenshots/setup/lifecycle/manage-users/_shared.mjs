import { fixedId } from '../../kit.mjs';

const manageId = n => fixedId('f4', n);

const verification = {
  tenantId: manageId(1), appId: manageId(2), codeAppId: manageId(3),
  emailTemplateId: manageId(11), registrationTemplateId: manageId(12), phoneTemplateId: manageId(13),
  emailFieldId: manageId(21), phoneFieldId: manageId(22), emailFormId: manageId(31), phoneFormId: manageId(32),
  // email unverified, phone unverified, registration unverified, verified email, verified phone, both verified, email code, registration code
  users: {
    jared: [manageId(41), { email: 'jared@piedpiper.com', firstName: 'Jared', lastName: 'Dunn' }, { skipRegistrationVerification: true }],
    laurie: [manageId(42), { phoneNumber: '+15555552223', firstName: 'Laurie', lastName: 'Bream' }, { skipRegistrationVerification: true }],
    carla: [manageId(43), { email: 'carla@piedpiper.com', firstName: 'Carla', lastName: 'Walton' }, { skipVerification: true }],
    jack: [manageId(44), { email: 'jack@piedpiper.com', firstName: 'Jack', lastName: 'Barker' }, { skipVerification: true, skipRegistrationVerification: true }],
    ron: [manageId(45), { phoneNumber: '+15555550142', firstName: 'Ron', lastName: 'LaFlamme' }, { skipVerification: true, skipRegistrationVerification: true }],
    russ: [manageId(46), { email: 'russ@piedpiper.com', phoneNumber: '+15555550199', firstName: 'Russ', lastName: 'Hanneman' }, { skipVerification: true, skipRegistrationVerification: true }],
    peter: [manageId(47), { email: 'peter@piedpiper.com', firstName: 'Peter', lastName: 'Gregory' }, { skipRegistrationVerification: true }],
    ed: [manageId(48), { email: 'ed@piedpiper.com', firstName: 'Ed', lastName: 'Chen' }, { skipVerification: true }],
  },
};
const userActionsExample = {
  welcomeTemplateId: manageId(51), goodbyeTemplateId: manageId(52), paidReasonId: manageId(61), expiredReasonId: manageId(62), surveyActionId: manageId(72),
};
const adminFormsExample = { colorFieldId: manageId(81), backgroundFieldId: manageId(82), userFormId: manageId(83), registrationFormId: manageId(84) };

// sets form values (not saved): true/false for switches and radios, text for inputs and selects; then runs `then`
const fillFields = (fields, then) => async (page, ctx, info) => {
  for (let i = 0; ; i++) {
    if (await page.evaluate(ids => ids.every(id => document.getElementById(id)), Object.keys(fields))) break;
    if (i === 20) throw new Error(`form fields not rendered: ${Object.keys(fields).join(', ')}`);
    await page.waitForTimeout(500);
    if (i === 10) await page.goto(info.url, { waitUntil: 'networkidle' });
  }
  const missing = await page.evaluate(values => Object.entries(values).filter(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return true;
    if (typeof value === 'boolean') {
      if (el.checked !== value) el.click();
    } else {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return false;
  }).map(([id]) => id), fields);
  if (missing.length) throw new Error(`fields not found: ${missing.join(', ')}`);
  await page.waitForTimeout(300);
  await then?.(page, info);
};

// signs in on the hosted login page; `gated` expects the verification gate, `registration` its registration variant, `code` its code entry
const hostedLogin = (loginId, { gated = true, registration, code } = {}) => async page => {
  await page.fill('#loginId', loginId);
  await page.fill('#password', 'password');
  await page.locator('#submit-button').click();
  await page.waitForLoadState('networkidle');
  if (gated) await page.waitForURL(/verification-required/);
  if (registration) {
    const text = await page.locator('main').first().innerText();
    if (!/verify your registration/i.test(text)) throw new Error(`expected registration gate: ${text}`);
  }
  if (code) {
    await page.getByLabel('One-time code', { exact: true }).waitFor({ timeout: 10000 }).catch(async error => {
      throw new Error(`expected code entry: ${await page.locator('main').first().innerText()}`, { cause: error });
    });
  }
  await page.evaluate(() => document.activeElement?.blur());
};

export { manageId, verification, userActionsExample, adminFormsExample, fillFields, hostedLogin };
