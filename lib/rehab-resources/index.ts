import { CENTRAL_GOVERNMENT_RESOURCES } from './central-government'
import { CENTRAL_COMMUNITY_RESOURCES } from './central-community'
import { NATIONAL_RESOURCES } from './national'
export { REGIONAL_CONTACTS } from './regional-contacts'
export * from './types'
export * from './matching'

export const REHAB_RESOURCES = [...NATIONAL_RESOURCES, ...CENTRAL_GOVERNMENT_RESOURCES, ...CENTRAL_COMMUNITY_RESOURCES]
// This is a content date, never the deployment/build time.
export const RESOURCE_UPDATED_AT = '2026-10-18'
