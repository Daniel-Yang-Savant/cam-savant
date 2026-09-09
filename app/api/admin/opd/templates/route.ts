import { NextResponse } from 'next/server'
import { postopPrescriptions } from '@/lib/opd-prescriptions'
import { opdTemplates } from '@/lib/opd-templates'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    {
      templates: opdTemplates,
      prescriptions: postopPrescriptions.map(
        ({ id, title, category, hint, phases, safety }) => ({
          id, title, category, hint, phases, safety,
        })
      ),
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    }
  )
}
