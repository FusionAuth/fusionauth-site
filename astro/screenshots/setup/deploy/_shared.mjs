// sets a field, or the CodeMirror editor that replaces it
async function fill(page, id, value) {
  const done = await page.evaluate(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const cm = el.nextElementSibling?.CodeMirror;
    if (cm) cm.setValue(value);
    else { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
    return true;
  }, [id, value]);
  if (!done) throw new Error(`Operate field not found: ${id}`);
}

async function openDialog(page, href) {
  const opened = await page.evaluate(h => {
    const a = document.querySelector(`a[href="${h}"]`);
    a?.closest('[popover]')?.showPopover();
    a?.click();
    return !!a;
  }, href);
  if (!opened) throw new Error(`Operate dialog link not found: ${href}`);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(500);
}

// Built-in keys and the tenant-manager application receive random ids on a fresh install.
async function pinOperateIds(page) {
  await page.evaluate(() => {
    let i = 32;
    for (const cell of document.querySelectorAll('main td')) {
      if (/^[0-9a-f-]{36}$/.test(cell.textContent.trim()) && (location.pathname === '/admin/key/' || cell.closest('tr').textContent.includes('Tenant manager'))) cell.textContent = `00000000-0000-0000-0000-f6${String(i++).padStart(10, '0')}`;
    }
  });
}

// ticks GET for the endpoint on the add API key form and centres its row
async function grantMetricsEndpoint(page, endpoint) {
  await fill(page, 'apiKey_key', 'pied-piper-metrics-documentation-only');
  await page.evaluate(endpoint => {
    const box = [...document.querySelectorAll('input[type=checkbox]')].find(i => i.name === `apiKey.permissions.endpoints['${endpoint}']` && i.value === 'GET');
    if (!box) throw new Error(`Permission not found: ${endpoint}`);
    if (!box.checked) box.click();
    box.closest('tr').dataset.hl = 'operate-permission';
    box.closest('tr').scrollIntoView({ block: 'center' });
  }, endpoint);
}

export { fill, openDialog, pinOperateIds, grantMetricsEndpoint };
