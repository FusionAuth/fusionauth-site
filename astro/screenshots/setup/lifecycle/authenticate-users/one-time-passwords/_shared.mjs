import { defaultTenantId, baseUrl, apiKey } from '../../../kit.mjs';

const messengerId = '00000000-0000-0000-0000-500000000001';
const emailTemplateId = '00000000-0000-0000-0000-400000000001';
const smsTemplateId = '00000000-0000-0000-0000-400000000002';

async function configurePasswordlessTemplates() {
  // always PUT the canonical email template content (matches the .ftl files referenced in the docs)
  try {
    const htmlTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\n<p>\n  Login code: ${oneTimeCode}\n</p>\n[#else]\n<p>\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n  <a href="${url?html}">${url?html}</a>\n</p>\n[/#if]\n- Pied Piper';
    const txtTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\nLogin code: ${oneTimeCode}\n[#else]\n[#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n[#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n${url}\n\n[/#if]\n- Pied Piper';
    const etMethod = (await fetch(`${baseUrl}/api/email/template/${emailTemplateId}`, { headers: { Authorization: apiKey } })).ok ? 'PUT' : 'POST';
    await fetch(`${baseUrl}/api/email/template/${emailTemplateId}`, {
      method: etMethod,
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailTemplate: { name: 'Pied Piper Passwordless Login', defaultSubject: 'Complete your Pied Piper login', defaultHtmlTemplate: htmlTpl, defaultTextTemplate: txtTpl } }),
    });
  } catch (e) {
    throw new Error(`beforeAll: email template update failed: ${e.message}`, { cause: e });
  }

  // always PUT the canonical message template content
  try {
    const smsTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this phone number. If you do not recognize this request please ignore this message.\n\n[#if oneTimeCode??]\n  Login code: ${oneTimeCode}\n[#else]\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n  ${url}\n[/#if]\n\n- Pied Piper';
    const mtMethod = (await fetch(`${baseUrl}/api/message/template/${smsTemplateId}`, { headers: { Authorization: apiKey } })).ok ? 'PUT' : 'POST';
    await fetch(`${baseUrl}/api/message/template/${smsTemplateId}`, {
      method: mtMethod,
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageTemplate: { name: 'Pied Piper Passwordless SMS', type: 'SMS', defaultTemplate: smsTpl } }),
    });
  } catch (e) {
    throw new Error(`beforeAll: message template update failed: ${e.message}`, { cause: e });
  }

  // create Generic HTTP messenger for phone OTP flow (points to sms-mock service in docker-compose)
  try {
    const mResp = await fetch(`${baseUrl}/api/messenger/${messengerId}`, { headers: { Authorization: apiKey } });
    if (!mResp.ok) {
      await fetch(`${baseUrl}/api/messenger/${messengerId}`, {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messenger: { id: messengerId, type: 'Generic', name: 'Pied Piper SMS', url: 'http://sms-mock:8081/', connectTimeout: 2000, readTimeout: 2000, debug: false } }),
      });
      console.log('[screenshot] beforeAll: created SMS mock messenger');
    }
  } catch (e) {
    throw new Error(`beforeAll: messenger setup failed: ${e.message}`, { cause: e });
  }
}

// the passwordless templates on the default tenant (the email one is needed for the login button to render)
async function configurePasswordlessTenant() {
  for (const [tenant, step] of [
    [{ emailConfiguration: { passwordlessEmailTemplateId: emailTemplateId } }, 'email template'],
    [{ phoneConfiguration: { messengerId, passwordlessTemplateId: smsTemplateId } }, 'phone'],
  ]) {
    try {
      const r = await fetch(`${baseUrl}/api/tenant/${defaultTenantId}`, {
        method: 'PATCH',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: ${step} PATCH failed: ${e.message}`, { cause: e });
    }
  }
}

export const resources = [configurePasswordlessTemplates, configurePasswordlessTenant];
