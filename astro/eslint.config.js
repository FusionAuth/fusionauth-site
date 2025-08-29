import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import * as mdx from 'eslint-plugin-mdx';
import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from "@typescript-eslint/parser";
import astroParser from 'astro-eslint-parser';

export default [
  {files: ["**/*.{js,mjs,cjs,ts,md,mdx}"]},
  {languageOptions: { globals: globals.browser }},
  {
    ...pluginJs.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"]
  },
  ...(tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts"]
  }))),
  {
    name: 'ts-overrides',
    rules: {
    }
  },
  ...(eslintPluginAstro.configs['flat/base'].map(config => {
    return {
      ...config,
      files: ["**/*.astro"],
      languageOptions: {
        parser: astroParser,
        parserOptions: {
          parser: tsParser,
          extraFileExtensions: ['.astro'],
          project: './tsconfig.json',
          sourceType: 'module',
        }
      }
    }})),
  {
    ...mdx.flat,
    // optional, if you want to lint code blocks at the same
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
      // optional, if you want to disable language mapper, set it to `false`
      // if you want to override the default language mapper inside, you can provide your own
      languageMapper: {},
    }),
    rules: {
      ...mdx.flat.rules,
      // if you want to override some rules for md/mdx files
      'mdx/remark': 'error',
      'no-unused-expressions': 'off',
      'remark-lint-no-undefined-references': 'off',
      'remark-lint-no-unused-definitions': 'off',
      'no-undef': 'off',
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
        project: './tsconfig.json',
        sourceType: 'module',
      }
    }
  }
];
