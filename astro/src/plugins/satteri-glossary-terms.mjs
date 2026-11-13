import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findGlossaryEntry, suggestGlossaryTerms } from './glossary.mjs';

const TERM_RE = /\[\[([^[\]]*?)(?:::([^[\]]*))?\]\]/g;
// a link can't nest in a link, and heading text feeds slugs and the TOC
const FORBIDDEN_PARENTS = new Set(['heading', 'link', 'linkReference']);

function unknownTermMessage(name, label) {
  const withLabel = (id) => label ? `[[${id}::${label}]]` : `[[${id}]]`;
  const suggestions = suggestGlossaryTerms(name);
  return [
    `"${name}" isn't in the glossary.`,
    '',
    ...(suggestions.length
      ? ['If you misspelled the term, use one of these instead:', ...suggestions.map(id => `  ${withLabel(id)}`), '']
      : []),
    `If "${name}" is a new term, add an entry to src/data/glossary.json:`,
    `  "${name}": { "definition": "One or two sentences.", "link": "/docs/path/to/page" }`,
    '',
    'See "Glossary Terms" in CONTRIBUTING.md.',
  ].join('\n');
}

/**
 * Sätteri mdast plugin: replace `[[term]]` and `[[term::label]]` in MDX text with
 * `<GlossaryTerm term="...">label</GlossaryTerm>`. Unknown terms, malformed
 * brackets, and terms inside headings or links fail the build.
 */
export function glossaryTerms() {
  // a factory runs once per document; skip documents that can't contain a term
  return ({ sourceFormat, source }) => {
    if (sourceFormat !== 'mdx' || !source.includes('[[')) return null;
    return {
      name: 'glossary-terms',
      options: { position: true },
      text(node, ctx) {
        if (!node.value.includes('[[')) return;
        const fail = (snippet, msg) => {
          const file = ctx.fileURL ? path.relative(process.cwd(), fileURLToPath(ctx.fileURL)) : '<unknown file>';
          const where = `${file}:${node.position?.start.line ?? '?'}`;
          throw new Error(`[glossary-terms] ${where}: ${snippet}\n\n${msg}\n`);
        };

        for (let p = ctx.parent(node); p; p = ctx.parent(p)) {
          if (FORBIDDEN_PARENTS.has(p.type)) {
            fail(node.value, `Glossary terms can't go inside a ${p.type}. Move the term into the surrounding text.`);
          }
        }

        const out = [];
        let last = 0;
        for (const match of node.value.matchAll(TERM_RE)) {
          const [raw, rawName, rawLabel] = match;
          const name = rawName.trim();
          const label = rawLabel?.trim();
          if (!name) fail(raw, 'The term name is empty. Write [[term]] or [[term::label]].');
          if (rawLabel !== undefined && !label) fail(raw, `The label after "::" is empty. Write [[${name}]] to show the term as written.`);
          const entry = findGlossaryEntry(name);
          if (!entry) fail(raw, unknownTermMessage(name, label));

          if (match.index > last) out.push({ type: 'text', value: node.value.slice(last, match.index) });
          out.push({
            type: 'mdxJsxTextElement',
            name: 'GlossaryTerm',
            attributes: [{ type: 'mdxJsxAttribute', name: 'term', value: entry.id }],
            children: [{ type: 'text', value: label ?? name }],
          });
          last = match.index + raw.length;
        }

        if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
        const stray = out.find(n => n.type === 'text' && n.value.includes('[['));
        if (stray) {
          fail(stray.value, 'Unclosed glossary term. Write [[term]] or [[term::label]]. For literal double brackets, use inline code.');
        }
        ctx.replaceNode(node, out);
      },
    };
  };
}
