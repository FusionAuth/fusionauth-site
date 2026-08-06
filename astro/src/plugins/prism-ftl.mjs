export function registerFTL(Prism) {
  if (Prism.languages.ftl) return;

  // Base on markup so HTML tag/attr/entity highlighting works in .ftl template files.
  // FTL-specific tokens are inserted *before* markup's 'comment' so they win over
  // the HTML tag pattern for both <#...> and [#...] directive syntax.
  Prism.languages.ftl = Prism.languages.extend('markup', {});

  Prism.languages.insertBefore('ftl', 'comment', {

    'ftl-comment': {
      // <#-- ... --> (angle-bracket) or [#-- ... --] (bracket)
      pattern: /<#--[\s\S]*?-->|\[#--[\s\S]*?--\]/,
      greedy: true,
      alias: 'comment',
    },

    'ftl-interpolation': {
      // ${expr} and #{expr}; handles one level of nested {} for e.g. list!{}
      pattern: /[$#]\{(?:[^{}]|\{[^{}]*\})*\}/,
      greedy: true,
      inside: {
        punctuation: { pattern: /^[$#]\{|\}$|[()[\]{},.:!?]/ },
        builtin:     /\?[a-zA-Z_][a-zA-Z0-9_]*/,
        string:      { pattern: /"[^"]*"|'[^']*'/, greedy: true },
        number:      /\b\d+(?:\.\d+)?\b/,
        boolean:     /\b(?:true|false)\b/,
        operator:    /[!=<>]=?|&&|\|\||[+\-*/]/,
      },
    },

    'ftl-tag': {
      // Angle-bracket form: <#if>, </@macro>, <#list items as x>, etc.
      // Bracket form: [#if], [@macro args], [/#if], etc.
      // Bracket form requires [# or [@ to avoid matching Tailwind arbitrary values like [352px].
      pattern: /<[#@]\/?\s*[a-zA-Z_][a-zA-Z0-9_.]*(?:\s+(?:"[^"]*"|'[^']*'|[^>])*)?\/?>|\[[#@]\/?\s*[a-zA-Z_][a-zA-Z0-9_.]*(?:\s+(?:"[^"]*"|'[^']*'|[^\]])*)?\/?\]/,
      greedy: true,
      alias: 'tag',
      inside: {
        'ftl-keyword': {
          // Opening delimiter + tag name: <#if, [@helpers.button, [/#if, etc.
          pattern: /^[<[]\/?[#@]\s*[a-zA-Z_][a-zA-Z0-9_.]*/,
          alias: 'keyword',
        },
        interpolation: { pattern: /[$#]\{[^}]*\}/, alias: 'variable' },
        string:        { pattern: /"[^"]*"|'[^']*'/, greedy: true },
        boolean:       /\b(?:true|false)\b/,
        number:        /\b\d+(?:\.\d+)?\b/,
        builtin:       /\?[a-zA-Z_][a-zA-Z0-9_]*/,
        operator:      /[!=<>]=?|&&|\|\||[+\-*/]/,
        punctuation:   /[()[\]{},.:!?]/,
      },
    },

  });
}
