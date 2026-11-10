import { defineConfig } from '@playwright/test'
import { origin, patientAccessCode } from './tests/e2e/fixture'

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: {
    baseURL: origin,
    browserName: 'chromium',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3199',
    url: `${origin}/api/search`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: '',
      ADMIN_SECRET: '',
      PERIOP_ACCESS_TOKEN: patientAccessCode,
      PERIOP_SIGNING_SECRET: 'local-e2e-patient-signing-only',
    },
  },
})
