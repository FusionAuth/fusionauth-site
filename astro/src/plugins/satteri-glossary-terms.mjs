import { fileURLToPath } from 'node:url';
import { findGlossaryEntry } from './glossary.mjs';

const TERM_RE = /\[\[([^[\]|]+)(?:\|([^[\]|]+))?\]\]/g;
// a link can't nest in a link, and heading text feeds slugs and the TOC
const FORBIDDEN_PARENTS = new Set(['heading', 'link', 'linkReference']);

/**
 * Sätteri mdast plugin: replace `[[term]]` and `[[term|label]]` in MDX text with
 * `<GlossaryTerm term="...">label</GlossaryTerm>`. Unknown terms, repeat uses on
 * a page, and terms inside headings or links fail the build.
 */
export function glossaryTerms() {
  // a factory runs once per document; skip documents that can't contain a term
  return ({ sourceFormat, source }) => {
    if (sourceFormat !== 'mdx' || !source.includes('[[')) return null;
    const used = new Set();
    return {
      name: 'glossary-terms',
      options: { position: true },
      text(node, ctx) {
        if (!node.value.includes('[[')) return;
        const fail = (msg) => {
          const file = ctx.fileURL ? fileURLToPath(ctx.fileURL) : '<unknown>';
          throw new Error(`[glossary-terms] ${file}:${node.position?.start.line ?? '?'}: ${msg}`);
        };

        for (let p = ctx.parent(node); p; p = ctx.parent(p)) {
          if (FORBIDDEN_PARENTS.has(p.type)) fail(`glossary terms aren't allowed inside a ${p.type}: "${node.value}"`);
        }

        const out = [];
        let last = 0;
        for (const match of node.value.matchAll(TERM_RE)) {
          const [raw, name, label] = match;
          const entry = findGlossaryEntry(name);
          if (!entry) fail(`no glossary entry matches "${name.trim()}" in ${raw}. Add the term to src/data/glossary.json or fix the name`);
          if (used.has(entry.id)) fail(`"${entry.id}" is already a glossary term on this page. Wrap only the first use`);
          used.add(entry.id);

          if (match.index > last) out.push({ type: 'text', value: node.value.slice(last, match.index) });
          out.push({
            type: 'mdxJsxTextElement',
            name: 'GlossaryTerm',
            attributes: [{ type: 'mdxJsxAttribute', name: 'term', value: entry.id }],
            children: [{ type: 'text', value: (label ?? name).trim() }],
          });
          last = match.index + raw.length;
        }

        if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
        if (out.some(n => n.type === 'text' && n.value.includes('[['))) {
          fail(`malformed glossary term in "${node.value}". Use [[term]] or [[term|label]], or inline code for literal brackets`);
        }
        ctx.replaceNode(node, out);
      },
    };
  };
}
