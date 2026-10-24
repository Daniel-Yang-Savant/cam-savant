import { resourceFreshness } from './freshness'
import { publicationLevel } from './publication'
import type { ResourceProvider } from './providers'

/** Export public contact fields only; never include a person's search context. */
export function resourceContactsText(providers: ResourceProvider[], today: string): string {
  const entries = providers.flatMap((provider) => {
    const contacts = new Map<string, string>()
    for (const resource of provider.resources) {
      if (publicationLevel(resource) === 'withheld' || resourceFreshness(resource, today).level === 'hidden') continue
      const name = resource.contact.name.trim()
      const phone = resource.contact.phone?.trim() ?? ''
      if (!name && !phone) continue
      const key = JSON.stringify([name, phone])
      contacts.set(key, [name && `窗口：${name}`, phone && `電話：${phone}`].filter(Boolean).join('\n'))
    }
    return contacts.size ? [`${provider.name}\n${[...contacts.values()].join('\n\n')}`] : []
  })
  if (entries.length === 0) return ''
  return ['CAM Savant｜聯絡資訊', ...entries.map((entry, index) => `${index + 1}. ${entry}`), '請向窗口確認服務與申請條件。'].join('\n\n')
}
