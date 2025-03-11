/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.wxt/**',
      '**/.output/**',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
