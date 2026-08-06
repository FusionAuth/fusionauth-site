/**
 * Rehype plugin that replaces Astro's built-in Prism integration.
 * Use with syntaxHighlight: false in astro.config.mjs.
 *
 * Features over stock rehypePrism:
 *  - {2,4-6}  → highlight those lines
 *  - [3-5]    → collapse those lines (hidden by default, expandable)
 *  - All Prism languages via runHighlighterWithAstro
 *
 * Meta string examples:
 *   ```js {2-3}
 *   ```json [5-8]
 *   ```bash {1} [3-10]
 */

import { visit } from 'unist-util-visit';
import { toText } from 'hast-util-to-text';
import { fromHtml } from 'hast-util-from-html';
import { removePosition } from 'unist-util-remove-position';
import { runHighlighterWithAstro } from '@astrojs/prism/dist/highlighter';
import { registerFTL } from './prism-ftl.mjs';
import Prism from 'prismjs';

// Register FTL once at module load time. Since Node caches modules,
// this runs once and the same Prism instance used by runHighlighterWithAstro sees it.
registerFTL(Prism);

const DEFAULT_EXCLUDE = ['mermaid'];

/** Parse "{1,3-5}" → Set of 1-based line numbers */
function parseRanges(spec) {
  const lines = new Set();
  if (!spec) return lines;
  for (const part of spec.split(',')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const start = parseInt(m[1], 10);
    const end = parseInt(m[2] ?? m[1], 10);
    for (let i = start; i <= end; i++) lines.add(i);
  }
  return lines;
}

/** Parse meta string → { highlight: Set, collapse: Set, diff: boolean } */
function parseMeta(meta) {
  if (!meta) return { highlight: new Set(), collapse: new Set(), diff: false };
  const hMatch = meta.match(/\{([^}]+)\}/);
  const cMatch = meta.match(/\[([^\]]+)\]/);
  return {
    highlight: parseRanges(hMatch?.[1]),
    collapse: parseRanges(cMatch?.[1]),
    diff: /\bdiff\b/.test(meta),
  };
}

/**
 * Split the children of a Prism-tokenized <code> element into per-line groups.
 * Newlines inside text nodes are the split points.
 * Returns an array of child-arrays, one per line.
 */
function splitIntoLines(children) {
  const lines = [];
  let current = [];

  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'text') {
        const parts = node.value.split('\n');
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            lines.push(current);
            current = [];
          }
          if (parts[i].length) current.push({ type: 'text', value: parts[i] });
        }
      } else {
        current.push(node);
      }
    }
  }

  walk(children);
  // Trailing line (no trailing \n) — only add if non-empty
  if (current.length) lines.push(current);

  return lines;
}

/** Extract plain text from a hast node list (for diff prefix detection) */
function getLineText(lineChildren) {
  let text = '';
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.type === 'text') text += n.value;
      else if (n.children) walk(n.children);
    }
  };
  walk(lineChildren);
  return text;
}

/** Build the line-wrapper hast nodes */
function buildLineNodes(rawLines, highlight, collapse, diff) {
  const nodes = [];
  let collapseStart = null; // 1-based line number where current collapse run started

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const lineChildren = rawLines[i];
    const isHighlighted = highlight.has(lineNum);
    const isCollapsed = collapse.has(lineNum);

    const classes = ['line'];
    if (isHighlighted) classes.push('line-highlighted');
    if (isCollapsed) classes.push('line-collapsed');

    if (diff) {
      const text = getLineText(lineChildren);
      if (/^[+]/.test(text)) classes.push('diff-inserted');
      else if (/^[-]/.test(text)) classes.push('diff-deleted');
    }

    // Insert toggle button at the START of a collapse run
    if (isCollapsed && (collapseStart === null)) {
      collapseStart = lineNum;
      // Count how many consecutive collapsed lines
      let count = 0;
      for (let j = lineNum; j <= rawLines.length && collapse.has(j); j++) count++;
      nodes.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['line', 'line-collapse-toggle'], 'data-count': String(count) },
        children: [{ type: 'text', value: `▶ ${count} hidden line${count === 1 ? '' : 's'}` }],
      });
    }
    if (!isCollapsed) collapseStart = null;

    nodes.push({
      type: 'element',
      tagName: 'span',
      properties: { className: classes },
      children: lineChildren,
    });
  }

  return nodes;
}

export function rehypeCodeMeta({ excludeLangs = DEFAULT_EXCLUDE } = {}) {
  return async (tree) => {
    const tasks = [];

    visit(tree, { type: 'element', tagName: 'code' }, (node, _, parent) => {
      if (parent?.tagName !== 'pre' || parent?.children?.length !== 1) return;

      const classList = node.properties?.className ?? [];
      const classes = Array.isArray(classList) ? classList : [classList];
      const langClass = classes.find(c => typeof c === 'string' && c.startsWith('language-'));
      const language = langClass?.slice('language-'.length) ?? 'plaintext';

      if (excludeLangs.includes(language)) return;

      const meta = node.data?.meta ?? node.properties?.metastring ?? '';
      const code = toText(node, { whitespace: 'pre' });

      tasks.push({ node, parent, language, meta, code });
    });

    // Process all code blocks (runHighlighterWithAstro is async)
    for (const { parent: preNode, language, meta, code } of tasks) {
      const { highlight, collapse, diff } = parseMeta(meta);
      const { html, classLanguage } = await runHighlighterWithAstro(language, code);

      // Parse highlighted HTML back to hast
      const fragment = fromHtml(
        `<pre class="${classLanguage}" data-language="${language}"><code class="${classLanguage}">${html}</code></pre>`,
        { fragment: true }
      );
      removePosition(fragment, { force: true });
      const newPre = fragment.children[0];

      // If meta has range specs or diff overlay, wrap each line in a <span class="line ...">
      if (highlight.size > 0 || collapse.size > 0 || diff) {
        const newCode = newPre.children[0]; // the <code> inside newPre
        const rawLines = splitIntoLines(newCode.children);
        newCode.children = buildLineNodes(rawLines, highlight, collapse, diff);
        newPre.properties['data-has-line-meta'] = 'true';
      }

      // Copy the parent index — replace preNode in its own parent
      // (visit hands us parent but not grandParent; use property assignment on preNode directly)
      Object.assign(preNode, newPre);
    }
  };
}
