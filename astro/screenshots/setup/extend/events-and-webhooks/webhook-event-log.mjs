import { preparation, apiRequest as api, tabsReady, selectTab } from '../../kit.mjs';
import { exampleWebhookId, pinGeneratedValues } from './_shared.mjs';

const manageLinks = 'main a[href*="/webhook-event-log/manage/"]';

// a webhook event in the log, sent once by pointing the example webhook at the receiver for a moment
async function logWebhookEvent(page) {
  const logged = async () => (await api('/api/system/webhook-event-log/search?numberOfResults=1')).total > 0;
  if (await logged()) return;
  const { webhook } = await api(`/api/webhook/${exampleWebhookId}`);
  await api('/api/system-configuration', 'PATCH', { systemConfiguration: { webhookEventLogConfiguration: { enabled: true } } });
  await api(`/api/webhook/${exampleWebhookId}`, 'PATCH', { webhook: { url: 'http://api.piedpiper.com/fusionauth/events', global: true, eventsEnabled: { 'audit-log.create': true } } });
  try {
    // FusionAuth picks up the webhook change after a delay and drops events sent before then
    for (let i = 0; i < 60 && !(await logged()); i++) {
      await api('/api/system/audit-log', 'POST', { auditLog: { insertUser: 'richard@piedpiper.com', message: 'Updated the Pied Piper application' } });
      for (let j = 0; j < 10 && !(await logged()); j++) await page.waitForTimeout(500);
    }
    if (!(await logged())) throw new Error('no webhook event was logged');
  } finally {
    await api(`/api/webhook/${exampleWebhookId}`, 'PUT', { webhook });
    await api('/api/system-configuration', 'PATCH', { systemConfiguration: { webhookEventLogConfiguration: { enabled: false } } });
  }
  await page.reload({ waitUntil: 'networkidle' });
}

async function listWebhookEvents(page, ctx, { url }) {
  await logWebhookEvent(page);
  // a search range up to 2100, so the list includes the new event
  await page.goto(new URL('/admin/system/webhook-event-log/?s.start=0&s.end=4102444800000', url).href, { waitUntil: 'networkidle' });
  for (let i = 0; !(await page.locator(manageLinks).count()); i++) {
    if (i === 120) throw new Error('Webhook event log rows did not become ready');
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
  }
}

async function openWebhookEvent(page, ctx, info) {
  await listWebhookEvents(page, ctx, info);
  // the Manage link sits in the row's actions menu
  const manage = await page.locator(manageLinks).first().getAttribute('href');
  await page.goto(new URL(manage, page.url()).href, { waitUntil: 'networkidle' });
  await tabsReady(page);
}

async function openWebhookAttempt(page, ctx, info) {
  await openWebhookEvent(page, ctx, info);
  // the View link sits in the row's actions menu
  await page.evaluate(() => {
    const link = document.querySelector('main a[href*="/webhook-attempt-log/view/"]');
    link?.closest('[popover]')?.showPopover();
    link?.click();
  });
  await page.locator('.prime-dialog.open, dialog[open]').first().waitFor();
  await page.waitForTimeout(500);
}

async function showRetentionSettings(page) {
  await selectTab(page, 'Advanced');
  await page.evaluate(() => {
    const remove = document.getElementById('systemConfiguration_webhookEventLogConfiguration_delete_enabled');
    if (!remove.checked) remove.click();
    for (const id of ['webhook-event-log-settings', 'webhook-event-log-delete-settings']) {
      const panel = document.getElementById(id);
      panel.classList.remove('hidden');
      panel.classList.add('open');
      panel.style.cssText = 'display:block!important;height:auto!important;max-height:none!important';
    }
  });
  await page.locator('#systemConfiguration_webhookEventLogConfiguration_delete_numberOfDaysToRetain').waitFor({ state: 'visible' });
}

const instants = ['1792501135648', '1792501135651'];
const pinEventValues = page => pinGeneratedValues(page, instants, { events: true });

export const shots = {
  'webhook-event-log-list': { prepare: preparation({ afterSystemTab: listWebhookEvents, afterFraming: pinEventValues }) },
  'webhook-event-manage': { prepare: preparation({ afterSystemTab: openWebhookEvent, afterFraming: pinEventValues }) },
  'webhook-event-source': {
    legacyVersion: true,
    prepare: preparation({
      afterSystemTab: async (page, ctx, info) => {
        await openWebhookEvent(page, ctx, info);
        await selectTab(page, 'Source');
      },
      afterFraming: page => pinGeneratedValues(page, instants, { events: true, sourceIds: true }),
    }),
  },
  'webhook-event-attempt': { prepare: preparation({ afterSystemTab: openWebhookAttempt, afterFraming: pinEventValues }) },
  'webhook-event-log-settings': {
    switch: ['systemConfiguration_webhookEventLogConfiguration_enabled'],
    prepare: preparation({ afterControls: showRetentionSettings, afterSystemTab: logWebhookEvent, afterFraming: pinEventValues }),
  },
};
