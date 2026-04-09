import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: { '*': 'vp check --fix' },
  fmt: {
    ignorePatterns: ['*.md', 'components.d.ts', 'typed-router.d.ts'],
    endOfLine: 'lf',
    semi: false,
    useTabs: false,
    printWidth: 100,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'none',
    sortPackageJson: { sortScripts: true },
    arrowParens: 'avoid',
    jsxSingleQuote: true,
    singleAttributePerLine: false,
    vueIndentScriptAndStyle: false,
    sortTailwindcss: {
      preserveDuplicates: false,
      preserveWhitespace: false,
      stylesheet: './packages/app/src/index.css',
      attributes: ['overlayClass', ':class', 'Class'],
      functions: ['twMerge']
    },
    bracketSameLine: false,
    bracketSpacing: true,
    embeddedLanguageFormatting: 'auto',
    insertFinalNewline: false,
    proseWrap: 'preserve',
    htmlWhitespaceSensitivity: 'css',
    objectWrap: 'collapse',
    quoteProps: 'consistent',
    sortImports: {
      groups: [
        ['builtin'],
        ['external', 'type-external'],
        ['internal', 'type-internal'],
        ['parent', 'type-parent'],
        ['sibling', 'type-sibling'],
        ['index', 'type-index']
      ]
    }
  },
  lint: {
    plugins: ['unicorn', 'typescript', 'oxc', 'vue'],
    categories: { correctness: 'error' },
    rules: {
      'no-unused-expressions': 'allow',
      'no-useless-escape': 'allow',
      'no-non-null-asserted-optional-chain': 'allow',
      'no-thenable': 'allow',
      'restrict-template-expressions': 'allow'
    },
    settings: {
      'jsx-a11y': { components: {}, attributes: {} },
      'next': { rootDir: [] },
      'jsdoc': {
        ignorePrivate: false,
        ignoreInternal: false,
        ignoreReplacesDocs: true,
        overrideReplacesDocs: true,
        augmentsExtendsReplacesDocs: false,
        implementsReplacesDocs: false,
        exemptDestructuredRootsFromChecks: false,
        tagNamePreference: {}
      },
      'vitest': { typecheck: true }
    },
    env: { builtin: true },
    globals: {},
    ignorePatterns: ['.vscode', './package.json'],
    options: { typeAware: true, typeCheck: true }
  },
  run: { cache: { tasks: true, scripts: true } }
})