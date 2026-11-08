import GithubSlugger from 'github-slugger';
import { toString } from 'hast-util-to-string';

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/**
 * Sätteri hast plugin equivalent to rehype-slug followed by
 * rehype-autolink-headings with `behavior: 'append'`: slug every heading that
 * has no id, then give it `headingProperties` and append an anchor link.
 *
 * @param {object} [opts]
 * @param {Record<string, string>} [opts.properties] - attributes for the appended <a>
 * @param {Record<string, string>} [opts.headingProperties] - attributes added to the heading
 * @param {string} [opts.content='#'] - text inside the appended <a>
 */
export function headingLinks({ properties = {}, headingProperties = {}, content = '#' } = {}) {
  // a factory runs once per document, so slugs dedupe within a page like rehype-slug's
  return () => {
    const slugs = new GithubSlugger();
    return {
      name: 'heading-links',
      element: {
        filter: HEADINGS,
        visit(node, ctx) {
          let id = node.properties?.id;
          if (!id) {
            // rehype-slug reads the full text, including MDX expression source
            id = slugs.slug(toString(node));
            ctx.setProperty(node, 'id', id);
          }
          if (!id) return;
          for (const [key, value] of Object.entries(headingProperties)) ctx.setProperty(node, key, value);
          ctx.appendChild(node, {
            type: 'element',
            tagName: 'a',
            properties: { ...properties, href: `#${id}` },
            children: [{ type: 'text', value: content }],
          });
        },
      },
    };
  };
}
