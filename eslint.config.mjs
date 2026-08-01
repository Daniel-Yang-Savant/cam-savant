import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // These effects intentionally hydrate state from browser-only APIs after SSR.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'NKT-Local-Toolkit/**',
    'clinical-tools-site/**',
    'drafts/**',
    'fsm-drafts/**',
    'public/**',
    'scripts/**',
  ]),
])
