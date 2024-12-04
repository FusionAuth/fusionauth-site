import remarkLint from 'remark-lint';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import { lintRule } from 'unified-lint-rule';
import { visitParents } from 'unist-util-visit-parents';

const checkIfHtml = (node, parents, file) => {
  if (!node.position) return

  if (/^[\t ]*<!--/.test(node.value)) return

  const name = node.name;
  // check if name starts with a capital letter
  const isComponent = /^[A-Z]/.test(name);
  if (isComponent) return;

  file.message(`Unexpected HTML tag [${name}], use markdown instead`, {
    ancestors: [...parents, node],
    place: node.position
  })
}

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
    noHtml
  ]
};

export default remarkConfig;