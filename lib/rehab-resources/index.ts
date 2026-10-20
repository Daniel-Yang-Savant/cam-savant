import { CENTRAL_GOVERNMENT_RESOURCES } from './central-government'
import { CENTRAL_COMMUNITY_RESOURCES } from './central-community'
import { NATIONAL_RESOURCES } from './national'
import { EXPANDED_CHANGHUA_TAICHUNG } from './expanded-changhua-taichung'
import { EXPANDED_NANTOU_YUNLIN } from './expanded-nantou-yunlin'
import { EXPANDED_CENTRAL_COMMUNITY } from './expanded-central-community'
import { PROVIDER_SUPPLEMENT } from './provider-supplement'
import { PROVIDER_CENTRAL_NONPROFITS } from './provider-central-nonprofits'
import { PROVIDER_LOCAL_ASSOCIATIONS } from './provider-local-associations'
import { PROVIDER_HOSPITAL_RESOURCES } from './provider-hospitals'
import { publicationLevel } from './publication'
export { REGIONAL_CONTACTS } from './regional-contacts'
export * from './types'
export * from './matching'
export * from './providers'
export * from './publication'

export const REHAB_RESOURCE_CATALOGUE = [
  ...NATIONAL_RESOURCES, ...CENTRAL_GOVERNMENT_RESOURCES, ...CENTRAL_COMMUNITY_RESOURCES,
  ...EXPANDED_CHANGHUA_TAICHUNG, ...EXPANDED_NANTOU_YUNLIN, ...EXPANDED_CENTRAL_COMMUNITY,
  ...PROVIDER_SUPPLEMENT,
  ...PROVIDER_CENTRAL_NONPROFITS,
  ...PROVIDER_LOCAL_ASSOCIATIONS,
  ...PROVIDER_HOSPITAL_RESOURCES,
]
export const REHAB_RESOURCES = REHAB_RESOURCE_CATALOGUE.filter((resource) => publicationLevel(resource) !== 'withheld')
// This is a content date, never the deployment/build time.
export const RESOURCE_UPDATED_AT = '2026-10-19'
