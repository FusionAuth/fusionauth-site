import remarkLint from 'remark-lint';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkLintNoUnusedDefinitions from 'remark-lint-no-unused-definitions';
import remarkLintNoUndefinedReferences from 'remark-lint-no-undefined-references';
import { lintRule } from 'unified-lint-rule';
import { visitParents } from 'unist-util-visit-parents';

const htmlTagsWithMarkdownEquivalents = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
  'p', // Paragraphs
  'br', // Line Breaks
  'strong', 'b', // Bold
  'em', 'i', // Italic
  'blockquote', // Blockquote
  'ol', 'ul', 'li', // Lists
  'code', // Inline Code
  'pre', // Code Block
  'hr', // Horizontal Rule
  'a', // Links
  'img' // Images
];

const invalidAnchorAttributes = ['href', 'title'];
const invalidImageAttributes = ['src', 'alt', 'title'];
const checkIfHtml = (node, parents, file) => {
  if (!node.position) return

  // Is this html-ish?
  if (/^[\t ]*<!--/.test(node.value)) return

  const name = node.name;
  // check if name starts with a capital letter
  const isComponent = /^[A-Z]/.test(name);
  // check if the tag has no markdown equivalent
  const tagHasNoMarkdownEquivalent = !htmlTagsWithMarkdownEquivalents.includes(name);
  if (isComponent || tagHasNoMarkdownEquivalent) return;

  // check for attributes on the tags a and img
  if (name === 'a' && node.attributes.find(attr => !invalidAnchorAttributes.includes(attr.name))) {
    return;
  }

  if (name === 'img' && node.attributes.find(attr => !invalidImageAttributes.includes(attr.name))) {
    return;
  }

  file.message(`Unexpected HTML tag [${name}], use markdown instead`, {
    ancestors: [...parents, node],
    place: node.position
  });
}

// this is the lint rule definition
const noHtml = lintRule(
    {
      origin: 'remark-lint:no-html',
    },

    function (tree, file) {
      //console.log(tree);
      visitParents(tree, 'mdxJsxFlowElement', function (node, parents) {
        checkIfHtml(node, parents, file);
      })

      visitParents(tree, 'paragraph', function (node, parents) {
        [...node.children].forEach((child) => {
          if (child.type === 'mdxJsxTextElement') {
            checkIfHtml(child, parents, file);
          }
        });
      })
    }
)

const remarkConfig = {
  plugins: [
    remarkLint,
    remarkPresetLintRecommended,
    // remark-lint-no-unused-definitions
    [remarkLintNoUnusedDefinitions, false],
    // remark-lint-no-undefined-references
    [remarkLintNoUndefinedReferences, false],
    noHtml
  ]
};

export default remarkConfig;