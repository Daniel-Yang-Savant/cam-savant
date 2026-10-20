import type { Region } from './types'

export const COUNTY_RESOURCE_PAGES = [
  { slug: 'changhua', region: '彰化縣', label: '彰化' },
  { slug: 'nantou', region: '南投縣', label: '南投' },
  { slug: 'taichung', region: '臺中市', label: '台中' },
  { slug: 'yunlin', region: '雲林縣', label: '雲林' },
] as const satisfies ReadonlyArray<{ slug: string; region: Region; label: string }>

export type CountyResourcePage = typeof COUNTY_RESOURCE_PAGES[number]

export function countyResourcePage(slug: string): CountyResourcePage | undefined {
  return COUNTY_RESOURCE_PAGES.find((county) => county.slug === slug)
}

export function countyResourceTitle(county: CountyResourcePage): string {
  return `${county.label}復健補助與援助｜政府、基金會及醫院資源`
}

export function countyResourceDescription(county: CountyResourcePage): string {
  return `整理服務範圍包含${county.region}的政府、基金會、病友團體與醫院資源，說明能幫什麼、適用對象、申請方式及正式來源；也可回到查詢頁依疾病與需要篩選，列印帶去和社工討論。`
}
