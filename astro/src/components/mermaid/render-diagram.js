import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

// Global diagram config
const config = {
  boxMargin: 30,
  messageMargin: 5000,
  mirrorActors: true,
  noteMargin: 5,
  wrap: true
};

export default async function renderDiagram({ code, id, nostyle=true }) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const content = await fs.readFile(
    path.join(process.cwd(), 'node_modules/mermaid/dist/mermaid.js'),
    'utf8',
  );

  await page.addScriptTag({ content });

  const result = await page.evaluate(
    (configB, codeB, id) => {
      // FIXME: `window.mermaid` global browser stubbing
      window.mermaid.initialize(configB);

      try {
        // Render the mermaid diagram
        const svgCode = window.mermaid.mermaidAPI.render(id, codeB);
        return { status: 'success', svgCode };
      } catch (error) {
        return { status: 'error', error, message: error.message };
      }
    },
    config,
    code,
    id
  );

  await browser.close();

  if (result.status === 'success' && typeof result.svgCode === 'string') {
    if (nostyle) {
      result.svgCode = result.svgCode.replace(/<style>.+<\/style>/i, '');
    }
    return result.svgCode;
  }

  return false;
}
