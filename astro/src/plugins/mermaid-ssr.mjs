/**
 * Server-side Mermaid renderer for Astro (and any remark/unified pipeline).
 *
 * Uses svgdom — a lightweight SVG DOM with real font metrics via opentype.js —
 * as a browser shim so mermaid can render to SVG at build time. Pages whose
 * diagrams all pre-render skip the ~2MB mermaid client bundle entirely.
 *
 * If a diagram fails to render (svgdom doesn't cover some API mermaid needs),
 * the original fenced code block is left untouched so a client-side mermaid
 * loader can handle it as a fallback.
 *
 * Usage in astro.config.ts:
 *   import { remarkMermaidSSR } from './src/plugins/mermaid-ssr.mjs';
 *   // add to remarkPlugins AFTER any plugin that annotates mermaid code blocks
 *   remarkPlugins: [..., remarkMermaidSSR()]
 *
 * Requirements: svgdom (devDependency)
 */

import { visit } from 'unist-util-visit';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';

const _require = createRequire(import.meta.url);

// --- Eager initialization -------------------------------------------------------
// mermaid's dynamic import must happen here, at module-evaluation time, while
// Vite's module runner is still open. By the time remark plugins are called
// (during MDX compilation), the runner has already closed and dynamic imports fail.

function setupSvgdom() {
  let createSVGWindow;
  try {
    ({ createSVGWindow } = _require('svgdom'));
  } catch {
    return null; // svgdom not installed — SSR disabled, client-side fallback used
  }

  const win = createSVGWindow();
  const doc = win.document;

  // svgdom creates SVG documents (no <body>); mermaid's d3 does select("body").
  const body = doc.createElement('body');
  doc.documentElement.appendChild(body);
  Object.defineProperty(doc, 'body', { get: () => body, configurable: true });

  // CSSStyleSheet stub — mermaid injects font/class rules via this API.
  class CSSStyleSheet {
    constructor() { this.cssRules = []; }
    insertRule(rule) { this.cssRules.push({ cssText: rule }); }
  }

  // getBoundingClientRect on HTML elements — svgdom only supports SVG elements.
  // Mermaid calls this to measure node-label text for layout; return a plausible box.
  if (win.HTMLElement) {
    win.HTMLElement.prototype.getBoundingClientRect = function () {
      const w = Math.max(50, (this.textContent || '').length * 8);
      return { width: w, height: 24, top: 0, left: 0, right: w, bottom: 24, x: 0, y: 0 };
    };
  }

  win.location = new URL('http://localhost/');
  win.crypto = webcrypto;
  win.CSSStyleSheet = CSSStyleSheet;
  win.addEventListener    = () => {};
  win.removeEventListener = () => {};
  win.dispatchEvent       = () => false;
  win.getComputedStyle    = () => new Proxy({}, { get: () => '' });
  win.MutationObserver = class { observe(){} disconnect(){} takeRecords(){ return []; } };
  win.ResizeObserver   = class { observe(){} disconnect(){} };

  // Expose as globals before mermaid's module evaluation reads them.
  globalThis.window        = win;
  globalThis.document      = doc;
  globalThis.CSSStyleSheet = CSSStyleSheet;
  for (const k of ['SVGElement', 'HTMLElement', 'Element', 'Node', 'DocumentFragment', 'Event']) {
    if (win[k]) globalThis[k] = win[k];
  }

  return { win, doc };
}

const domReady = setupSvgdom();

// Kick off the mermaid import immediately (while Vite's module runner is open).
// The promise is awaited later inside the remark plugin when the first diagram appears.
const mermaidReady = domReady
  ? (async () => {
      const { default: mermaid } = await import('mermaid');
      // htmlLabels: false forces SVG <text> elements instead of <foreignObject>+HTML.
      // svgdom's innerHTML serialization loses content inside foreignObjects, so plain
      // SVG text is the only reliable option for SSR rendering.
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        htmlLabels: false,
      });
      return mermaid;
    })().catch(err => {
      console.warn(`[mermaid-ssr] Init failed — diagrams fall back to client-side rendering.\n  ${err.message}`);
      return null;
    })
  : Promise.resolve(null);

// -------------------------------------------------------------------------------

/**
 * Remark plugin that replaces ```mermaid fenced blocks with pre-rendered inline SVGs.
 */
export function remarkMermaidSSR() {
  return async (tree) => {
    // Collect nodes first — visit() callback is synchronous
    const nodes = [];
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') nodes.push(node);
    });
    if (nodes.length === 0) return;

    const mermaid = await mermaidReady;
    if (!mermaid) return; // init failed; leave code blocks for client-side fallback

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      try {
        const id = `mermaid-ssr-${i}-${Math.random().toString(36).slice(2, 6)}`;
        let { svg } = await mermaid.render(id, node.value);

        // Mermaid injects diagram `style` directive colors as inline `fill:X !important`
        // on cluster rects. Strip the `!important` and record the color in a data attribute
        // so external CSS can override per theme (light/dark) without fighting inline !important.
        // Only target cluster background rects — they have no `class` attribute. Node rects
        // always have class="basic label-container" and must keep their custom fill colors.
        svg = svg.replace(
          /(<rect\b[^>]*)\bstyle="fill:(#[0-9a-fA-F]{3,6})\s*!important([^"]*)"/g,
          (match, prefix, color, rest) => {
            if (/\bclass=/.test(prefix)) return match;
            return `${prefix}data-fill-color="${color.toLowerCase()}" style="fill:${color}${rest}"`;
          }
        );

        // Fix edge label text horizontal alignment for multi-word labels.
        // Mermaid SSR emits .label groups with translate(dx, dy) where dx compensates
        // for measured text width, but the outer tspan keeps x="0" which doesn't account
        // for the group's offset. Shift the outer tspan's x by -dx so the text centers
        // on the background rect (which is always centered at the edgeLabel origin).
        svg = svg.replace(
          /(<g class="label"[^>]* transform="translate\()(-?[\d.]+)(,\s*-?[\d.]+\)"><g><rect[^>]*><\/rect><text[^>]*><tspan[^>]* )x="0"/g,
          (_, pre, dxStr, mid) => {
            const dx = parseFloat(dxStr);
            if (Math.abs(dx) < 0.5) return pre + dxStr + mid + 'x="0"';
            return `${pre}${dxStr}${mid}x="${-dx}"`;
          }
        );

        // Replace the remark code node with a raw HTML node.
        // data-processed=true tells the client-side skeleton CSS to skip the shimmer
        // and tells the client mermaid loader not to re-process this element.
        node.type  = 'html';
        node.value = `<div class="mermaid" data-processed="true">\n${svg}\n</div>`;
        delete node.lang;
        delete node.meta;
      } catch (err) {
        console.warn(
          `[mermaid-ssr] Diagram ${i} failed — client-side fallback active.\n  ${err.message.slice(0, 120)}`
        );
        // Leave node as-is; existing client-side loader handles it
      }
    }
  };
}

export default remarkMermaidSSR;
