
/**
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [allowComments=true]
 *   Allow comments or not (default: `true`).
 */

import {lintRule} from 'unified-lint-rule'
import {visitParents} from 'unist-util-visit-parents'

const remarkLintNoHtml = lintRule(
    {
      origin: 'remark-lint:no-html',
      url: 'https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-html#readme'
    },
    /**
     * @param {Root} tree
     *   Tree.
     * @param {Readonly<Options> | null | undefined} [options]
     *   Configuration (optional).
     * @returns {undefined}
     *   Nothing.
     */
    function (tree, file, options) {
      //console.log(tree)
      let allowComments = true

      if (options && typeof options.allowComments === 'boolean') {
        allowComments = options.allowComments
      }

      visitParents(tree, 'mdxJsxFlowElement', function (node, parents) {
        if (!node.position) return

        if (allowComments && /^[\t ]*<!--/.test(node.value)) return

        file.message('Unexpected HTML, use markdown instead', {
          ancestors: [...parents, node],
          place: node.position
        })
      })
    }
)

export default remarkLintNoHtml