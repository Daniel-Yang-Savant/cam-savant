/**
 * Product identifiers retained from the existing catalog for name lookup only.
 * These are not verified current labels, clinical indications, or endorsements.
 * Keep disease tags, dosages, efficacy claims, and unverified prices out of this data.
 */
export interface SupplementCatalogItem {
  id: string
  name: string
  englishName: string
}

export const SUPPLEMENT_CATALOG: readonly SupplementCatalogItem[] = [
  { id: 'candibactin-ar', name: '常得淨膠囊', englishName: 'Candibactin-AR' },
  { id: 'spectrazyme', name: '完整酵素加強膠囊', englishName: 'SpectraZyme Complete' },
  { id: 'ultraflora-spectrum', name: '活性益生菌體健膠囊', englishName: 'UltraFlora Spectrum' },
  { id: 'ultraflora-ib', name: '活性益生菌淨能加強膠囊', englishName: 'UltraFlora IB' },
  { id: 'ultraflora-biome', name: '活性千億益生菌膠囊', englishName: 'UltraFlora BiomePro' },
  { id: 'glutagenics', name: '補體健粉', englishName: 'Glutagenics' },
  { id: 'endefen', name: '安得健粉', englishName: 'Endefen' },
  { id: 'ultraclear-sustain', name: '體健關懷配方粉', englishName: 'UltraClear Sustain' },
  { id: 'arginine-plus', name: '新精胺酸複合葉酸加強錠', englishName: 'Arginine Plus' },
  { id: 'vasotensin', name: '新鰹魚素錠', englishName: 'Vasotensin' },
  { id: 'mag-glycinate', name: '優鎂加強錠', englishName: 'Mag Glycinate' },
  { id: 'herbulk', name: '優纖沖泡粉', englishName: 'Herbulk' },
  { id: 'fenugreek-plus', name: '葫蘆巴複合加強膠囊', englishName: 'Fenugreek Plus' },
  { id: 'metaberine-gt', name: '麗棠脂膠囊', englishName: 'Metaberine GT' },
  { id: 'chromium', name: '鉻元素錠', englishName: 'Chromium Picolinate' },
  { id: 'tococare', name: '優利脂膠囊', englishName: 'TocoCare' },
  { id: 'l-carnitine', name: 'L-肉酸膠囊', englishName: 'L-Carnitine' },
  { id: 'omega-epa1200', name: '優質魚油 EPA 1200', englishName: 'OmegaGenics EPA 1200' },
  { id: 'ultraflora-control', name: '活性益生菌輕盈膠囊', englishName: 'UltraFlora Control' },
  { id: 'coq10', name: 'CoQ-10 ST 膠囊', englishName: 'CoQ-10 ST' },
  { id: 'd3', name: '維生素D3 錠/液', englishName: 'D3 Tablet / Liquid' },
  { id: 'glycogenics', name: '優質B群加強錠', englishName: 'Glycogenics' },
  { id: 'phytomulti', name: '活力草本360維他錠', englishName: 'PhytoMulti' },
  { id: 'omega-1000', name: '優質魚油1000', englishName: 'OmegaGenics 1000 TG' },
  { id: 'inflavonoid', name: '紓活加強膠囊', englishName: 'Inflavonoid Intensive Care' },
  { id: 'spm-active', name: '新SPM 勁舒能加強膠囊', englishName: 'SPM Active' },
  { id: 'spm-one-daily', name: 'SPM勁舒能加強膠囊（One Daily）', englishName: 'SPM Active One Daily' },
  { id: 'rapidrelief', name: '利速解膠囊', englishName: 'RapidRelief' },
  { id: 'ultra-potent-c', name: 'C 1000加強錠', englishName: 'Ultra Potent-C 1000' },
  { id: 'ultrainflamx', name: '成人關懷配方360粉', englishName: 'UltraInflamX Plus 360' },
  { id: 'adreset', name: '彩色好心情加強膠囊', englishName: 'Adreset' },
  { id: 'licorice-plus', name: '植萃甘草複合錠', englishName: 'Licorice Plus' },
  { id: 'nusera', name: '舒夢靜錠', englishName: 'NuSera' },
  { id: 'phosphatidylserine', name: '健知匯膠囊', englishName: 'Phosphatidylserine' },
  { id: 'neuro-1000', name: '健智魚油1000', englishName: 'OmegaGenics Neuro 1000' },
  { id: 'mega-mag-night', name: '夜態鎂錠', englishName: 'Mega Magnesium Night' },
  { id: 'zinc-ag', name: '螫合鋅加強錠', englishName: 'Zinc A.G.' },
  { id: 'collagenics', name: '健沛原加強錠', englishName: 'Collagenics' },
  { id: 'cal-apatite-mag', name: '新鈣念佳鎂錠', englishName: 'Cal Apatite with Magnesium' },
  { id: 'cal-apatite-veg', name: '新素補鈣錠', englishName: 'Cal Apatite Vegetarian' },
  { id: 'vitamin-k2', name: '維生素K2 180膠囊', englishName: 'Vitamin K2 180' },
  { id: 'ultrameal-protein', name: '體態關懷機優粉', englishName: 'UltraMeal Advanced Protein' },
  { id: 'chondrocare', name: '舒健能加強錠', englishName: 'ChondroCare' },
  { id: 'osteovantiv', name: '新捷健錠', englishName: 'OsteoVantiv' },
]

function normalizeProductName(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('en').replace(/[\s-]+/g, '')
}

/** Match product names only; never infer an indication or rank clinical suitability. */
export function findSupplementProducts(query: string): SupplementCatalogItem[] {
  const normalizedQuery = normalizeProductName(query.trim())
  return SUPPLEMENT_CATALOG.filter((product) =>
    !normalizedQuery ||
    normalizeProductName(product.name).includes(normalizedQuery) ||
    normalizeProductName(product.englishName).includes(normalizedQuery)
  ).sort((a, b) => a.englishName.localeCompare(b.englishName, 'en'))
}
