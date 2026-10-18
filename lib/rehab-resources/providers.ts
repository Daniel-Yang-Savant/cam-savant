import { PRIORITY_REGIONS, type RehabResource, type ResourceFilters } from './types'
import { matchesResource } from './matching'

export interface ResourceProvider {
  id: string
  name: string
  resources: RehabResource[]
}

export interface ProviderSelection {
  providerId: string
  resourceIds: string[]
}

export function toggleProviderSelection(selections: ProviderSelection[], provider: ResourceProvider): ProviderSelection[] {
  const existing = selections.find((selection) => selection.providerId === provider.id)
  if (!existing) return [...selections, { providerId: provider.id, resourceIds: provider.resources.map((resource) => resource.id) }]
  const additions = provider.resources.map((resource) => resource.id).filter((id) => !existing.resourceIds.includes(id))
  if (additions.length) return selections.map((selection) => selection.providerId === provider.id
    ? { ...selection, resourceIds: [...selection.resourceIds, ...additions] } : selection)
  return selections.filter((selection) => selection.providerId !== provider.id)
}

// Count organisations, never programmes, departments, branches or service sites.
// Explicit operators take precedence where a public programme names its provider.
const OPERATORS: Record<string, string> = {
  'changhua-independent-living-support': '財團法人切膚之愛社會福利慈善事業基金會',
  'taichung-independent-living-support': '財團法人老五老社會福利慈善事業基金會',
}
const CANONICAL_NAMES: Array<[RegExp, string]> = [
  [/家扶|台灣兒童暨家庭扶助/, '財團法人台灣兒童暨家庭扶助基金會'],
  [/切膚之愛/, '財團法人切膚之愛社會福利慈善事業基金會'],
  [/老五老/, '財團法人老五老社會福利慈善事業基金會'],
  [/雲林縣啟智協會/, '社團法人雲林縣啟智協會'],
  [/國軍臺中總醫院|國軍台中總醫院/, '國軍臺中總醫院'],
]

export function providerIdentity(resource: RehabResource): { id: string; name: string } {
  const operator = OPERATORS[resource.id]
  if (operator) return { id: operator, name: operator }
  if (resource.kind === 'government') {
    const county = resource.regions.find((region) => region !== '全國' && PRIORITY_REGIONS.includes(region))
    if (county) return { id: `${county}政府`, name: `${county}政府` }
    if (resource.organization.startsWith('衛生福利部')) return { id: '衛生福利部', name: '衛生福利部' }
  }
  for (const [pattern, name] of CANONICAL_NAMES) {
    if (pattern.test(resource.organization)) return { id: name, name }
  }
  const name = resource.organization.split('／')[0]
    .replace(/社會工作部$|社會工作室$|社會服務室$|醫療事務室社會工作組$/, '')
  return { id: name, name }
}

export function groupResourceProviders(resources: RehabResource[]): ResourceProvider[] {
  const providers = new Map<string, ResourceProvider>()
  for (const resource of resources) {
    const identity = providerIdentity(resource)
    const existing = providers.get(identity.id)
    if (existing) existing.resources.push(resource)
    else providers.set(identity.id, { ...identity, resources: [resource] })
  }
  return [...providers.values()]
}

export function matchingProviders(resources: RehabResource[], filters: ResourceFilters, today: string): ResourceProvider[] {
  const providers = groupResourceProviders(resources.filter((resource) => matchesResource(resource, filters, today)))
  const region = filters.region
  const local = (provider: ResourceProvider) => region && provider.resources.some((resource) => resource.regions.includes(region)) ? 1 : 0
  return providers.sort((left, right) => local(right) - local(left))
}
