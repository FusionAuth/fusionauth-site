import remarkLint from 'remark-lint';
import remarkLintNoHtml from 'remark-lint-no-html';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkLintHeadingStyle from 'remark-lint-heading-style';
import remarkToc from 'remark-toc';

const remarkConfig = {
  settings: {
    //bullet: '*', // Use `*` for list item bullets (default)
    // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
  },
  plugins: [
    //remarkLint,
    //[remarkLintNoHtml, {allowComments: false}]
      remarkLint,
    //remarkPresetLintConsistent,
    remarkPresetLintRecommended,
    [remarkLintNoHtml, {allowComments: false}],
    //[remarkLintHeadingStyle, 'off']
  ]
}

export default remarkConfig