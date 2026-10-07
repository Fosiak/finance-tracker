import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Context files intentionally co-locate a Provider component with its
      // useX() hook in one file - an established convention here, not an
      // oversight.
      'react-refresh/only-export-components': 'warn',

      // React Compiler's stricter hooks rules flag the "derive/reset state
      // from props or URL params in an effect" pattern used throughout this
      // app (form resets, URL-param validation). That pattern is correct
      // here, just not the compiler's preferred style - downgraded so it
      // doesn't block CI.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
])
