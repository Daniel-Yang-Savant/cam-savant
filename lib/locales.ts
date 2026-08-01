export const BASE_URL = 'https://camsavant.com'

export const ENGLISH_PERIOP_SLUGS: string[] = [
  'achilles-repair-rehab',
  'acl-meniscus-repair-rehab',
  'acl-reconstruction-rehab',
  'ankle-fracture-rehab',
  'breast-cancer-rehab',
  'cabg-ami-rehab',
  'cardiovascular-surgery',
  'distal-radius-fracture-rehab',
  'esophageal-cancer-rehab',
  'gynecologic-cancer-rehab',
  'hip-fracture-rehab',
  'lumbar-discectomy-rehab',
  'lumbar-fusion-rehab',
  'lung-cancer-rehab',
  'oral-neck-cancer-rehab',
  'pcl-reconstruction',
  'prostate-cancer-rehab',
  'rotator-cuff-slap-rehab',
  'thr-rehab',
  'tkr-rehab',
]

export function bilingualAlternates(zhPath: string, enPath = `/en${zhPath === '/' ? '' : zhPath}`) {
  return {
    canonical: zhPath,
    languages: {
      'zh-TW': zhPath,
      en: enPath,
      'x-default': zhPath,
    },
  }
}

export function englishAlternates(zhPath: string, enPath = `/en${zhPath === '/' ? '' : zhPath}`) {
  return {
    canonical: enPath,
    languages: {
      'zh-TW': zhPath,
      en: enPath,
      'x-default': zhPath,
    },
  }
}
