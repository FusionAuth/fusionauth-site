import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
const _require = createRequire(import.meta.url);
const { createSVGWindow } = _require('svgdom');

const win = createSVGWindow();
const doc = win.document;
const body = doc.createElement('body');
doc.documentElement.appendChild(body);
Object.defineProperty(doc, 'body', { get: () => body, configurable: true });
class CSSStyleSheet { constructor(){ this.cssRules=[];} insertRule(r){this.cssRules.push({cssText:r});} }
if (win.HTMLElement) {
  win.HTMLElement.prototype.getBoundingClientRect = function() {
    const w = Math.max(50, (this.textContent||'').length * 8);
    return { width: w, height: 24, top:0, left:0, right:w, bottom:24, x:0, y:0 };
  };
}
win.location = new URL('http://localhost/');
win.crypto = webcrypto;
win.CSSStyleSheet = CSSStyleSheet;
win.addEventListener = ()=>{};
win.removeEventListener = ()=>{};
win.dispatchEvent = ()=>false;
win.getComputedStyle = ()=> new Proxy({}, {get:()=>''});
win.MutationObserver = class { observe(){} disconnect(){} takeRecords(){return[];} };
win.ResizeObserver = class { observe(){} disconnect(){} };
globalThis.window = win;
globalThis.document = doc;
globalThis.CSSStyleSheet = CSSStyleSheet;
for (const k of ['SVGElement','HTMLElement','Element','Node','DocumentFragment','Event']) {
  if (win[k]) globalThis[k] = win[k];
}

const { default: mermaid } = await import('./node_modules/mermaid/dist/mermaid.core.mjs');
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

const diagram = `%%{init: {"flowchart": {"htmlLabels": false}}}%%
graph LR
    classDef orangeBorder stroke:#ff9800,stroke-width:2px;
    User((User)) -->|authenticates| FA(FusionAuth):::orangeBorder
    App[Application] -->|delegates auth| FA
    FA <-->|brokers identity| IdP[External IdPs]
    User -->|consumes| App`;

const { svg } = await mermaid.render('test-docs', diagram);
// Check for text elements
const hasText = svg.includes('>User<') || svg.includes('>FusionAuth<');
const hasForeign = svg.includes('foreignObject');
const spanContent = svg.match(/<span[^>]*>([^<]*)<\/span>/g)?.slice(0,3);
console.log('has text:', hasText);
console.log('has foreignObject:', hasForeign);
console.log('span samples:', spanContent);
// Show a snippet around nodeLabel
const idx = svg.indexOf('nodeLabel');
if (idx >= 0) console.log('nodeLabel context:', svg.slice(idx-10, idx+80));

// Test d3's html() with svgdom
import { select } from './node_modules/d3-selection/src/index.js';
const testDiv = doc.createElement('div');
doc.body.appendChild(testDiv);
const d3el = select(testDiv);
d3el.html('<span>hello</span>');
console.log('\nd3 html() result:', testDiv.innerHTML);

// Test what sanitizeText does to "User"
// Find it in mermaid source
