import { test as base } from '@playwright/test'

// Next's local access redirect uses localhost, so the browser starts on that same host.
export const origin = 'http://localhost:3199'
export const patientAccessCode = 'local-e2e-patient-access-only'

export const test = base.extend({
  context: async ({ context }, runWithContext) => {
    await context.route(
      (url) => url.origin !== origin || url.pathname.startsWith('/_vercel/'),
      (route) => route.abort(),
    )
    await runWithContext(context)
  },
})

export { expect } from '@playwright/test'
