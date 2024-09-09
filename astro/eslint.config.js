// @ts-check

import globals from "globals";
import pluginJs from "@eslint/js";
import eslintMdx from "typescript-eslint";
import tseslint from "typescript-eslint";
import * as mdx from 'eslint-plugin-mdx';
import esLintMdx from 'eslint-mdx';
import eslintPluginAstro from 'eslint-plugin-astro';

const preProcesspr = mdx.createRemarkProcessor({
  lintCodeBlocks: false,
  // optional, if you want to disable language mapper, set it to `false`
  // if you want to override the default language mapper inside, you can provide your own
  //languageMapper: {
  //  javascript: "js",
  //},
});

//preProcesspr.postprocess = code => {
//  console.log(code);
//  return code;
//}

console.log(preProcesspr);


export default tseslint.config(
    {
      ...mdx.flat,
      name: 'mdx',
      processor: mdx.createRemarkProcessor({}),
    }
    //{
    //  files: ['**/*.{md,mdx}'],
    //  name: 'mdx',
    //  languageOptions: {
    //    sourceType: 'module',
    //    ecmaVersion: 'latest',
    //    parser: eslintMdx,
    //    globals: {
    //      React: false,
    //    },
    //  },
    //  plugins: {
    //    mdx,
    //  },
    //  processor: preProcesspr,
    //  rules: {
    //    'mdx/remark': 'warn',
    //    'no-unused-expressions': 'error',
    //    'react/react-in-jsx-scope': 0,
    //  },
    //},
    //{
    //  name: 'mdx/code-block',
    //  ...mdx.flatCodeBlocks,
    //  rules: {
    //    ...mdx.flatCodeBlocks.rules,
    //    // if you want to override some rules for code blocks
    //    'no-var': 'error',
    //    'prefer-const': 'error',
    //  },
    //},
  //{
  //  name: 'ts',
  //  files: ['**/*.ts'],
  //  extends: [...tseslint.configs.recommended],
  //},
  //{
  //  name: 'js',
  //  files: ['**/*.js'],
  //  extends: [
  //    pluginJs.configs.recommended,
  //  ],
  //},
  //{
  //  name: 'astro',
  //  files: ['**/*.{astro}'],
  //  extends: [
  //      ...eslintPluginAstro.configs['base'],
  //  ],
  //
  //},
  //{
  //  ...mdx.flat,
  //  name: 'mdx',
  //
  //  // optional, if you want to lint code blocks at the same
  //  processor: mdx.createRemarkProcessor({
  //    lintCodeBlocks: true,
  //    // optional, if you want to disable language mapper, set it to `false`
  //    // if you want to override the default language mapper inside, you can provide your own
  //    languageMapper: {},
  //    //ignoreRemarkConfig: true,
  //  }),
  //  //rules: {
  //  //  'no-undef': ['error', { }],
  //  //},
  //  languageOptions: {
  //    //globals: ['frontmatter']
  //    parserOptions: {
  //      ignoreRemarkConfig: true,
  //    },
  //  }
  //},
  //{
  //  ...mdx.flatCodeBlocks,
  //  name: 'mdx/code-block',
  //  rules: {
  //    ...mdx.flatCodeBlocks.rules,
  //    // if you want to override some rules for code blocks
  //    'no-var': 'error',
  //    'prefer-const': 'error',
  //  },
  //},
  //{
  //  name: 'global',
  //  ignores: ['**/*.{md,mdx}'],
  //  rules: {
  //    // override/add rules settings here, such as:
  //    // "astro/no-set-html-directive": "error"
  //  },
  //  languageOptions: { globals: globals.browser }
  //},
);
