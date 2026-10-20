export const REGIONS = ['基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'] as const
export type Region = typeof REGIONS[number]
export const PRIORITY_REGIONS: Region[] = ['彰化縣', '南投縣', '臺中市', '雲林縣']

export const DISEASE_GROUPS = [
  { label: '神經損傷相關', items: [
    { id: 'stroke', label: '中風' }, { id: 'sci', label: '脊髓損傷' }, { id: 'tbi', label: '腦傷' },
  ] },
  { label: '兒童發展與神經肌肉疾病', items: [
    { id: 'developmental-delay', label: '發展遲緩' }, { id: 'adhd', label: '注意力不足過動症' },
    { id: 'autism', label: '自閉症' }, { id: 'cerebral-palsy', label: '腦性麻痺' },
    { id: 'sma', label: 'SMA 脊髓性肌肉萎縮症' }, { id: 'muscular-dystrophy', label: '肌肉失養症' },
  ] },
  { label: '其他復健需求', items: [
    { id: 'parkinsons', label: '帕金森氏症' }, { id: 'als', label: 'ALS 漸凍症' },
    { id: 'amputation', label: '截肢、義肢需求' },
  ] },
] as const
export type DiseaseId = typeof DISEASE_GROUPS[number]['items'][number]['id']
export const NEEDS = [
  { id: 'medical', label: '醫療費' }, { id: 'therapy', label: '復健、兒童療育' },
  { id: 'transport', label: '看診接送' }, { id: 'assistive', label: '輪椅等輔具、居家改善' },
  { id: 'care', label: '請人照顧、短期托顧' }, { id: 'living', label: '生活費、急難救助' },
  { id: 'education', label: '上學、溝通協助' }, { id: 'employment', label: '找工作、重返職場' },
  { id: 'caregiver', label: '家屬與照顧者支持' },
  { id: 'benefits', label: '證明、保險與給付' },
] as const
export type NeedId = typeof NEEDS[number]['id']
export const KIND_LABELS = { government: '政府', foundation: '基金會', charity: '地方慈善／病友團體', hospital: '醫院', insurance: '保險諮詢' } as const
export type ResourceKind = keyof typeof KIND_LABELS
export type ApplicationStatus = 'open' | 'ongoing' | 'upcoming' | 'closed' | 'paused' | 'inquiry'

/** Evidence is recorded after an actual observation, never inferred from deployment. */
export interface ResourceReviewEvidence {
  kind: 'not-found' | 'discontinued' | 'content-verified'
  /** Taiwan calendar date of the observation. */
  observedAt: string
  /** The affected official URL; re-verification resolves only this exact URL. */
  url: string
  /** Official discontinuation notice or other supporting source, when applicable. */
  sourceUrl?: string
}

export interface RehabResource {
  id: string
  title: string
  organization: string
  kind: ResourceKind
  resourceType: 'scheme' | 'referral' | 'directory'
  regions: Array<Region | '全國'>
  geographicBasis: 'household' | 'residence' | 'hospital' | 'nationwide'
  diseases: DiseaseId[] | 'all'
  /** False for cause/insurance-based schemes; a disease tag alone is not specialist care. */
  diseaseSpecific?: boolean
  needs: NeedId[]
  summary: string
  benefits: string
  eligibility: string[]
  documents: string[]
  application: string
  contact: { name: string; phone?: string; url: string }
  status: ApplicationStatus
  statusNote: string
  startsOn?: string
  endsOn?: string
  applicationPeriod?: string
  source: { title: string; url: string; publishedOn?: string; rocYear?: number }
  checkedAt: string
  verification: 'official-page' | 'current-notice' | 'contact-confirmed'
  reviewAfterDays: number
  /** Append observations in actual order; array order breaks ties on the same day. */
  reviewEvidence?: ResourceReviewEvidence[]
  cautions: string[]
}

export interface RegionalContact {
  region: Region
  name: string
  url: string
  earlyInterventionUrl?: string
  phone?: string
  checkedAt: string
  note: string
}

export interface ResourceFilters {
  /** Multiple search areas; none of these is a claim about the patient's address. */
  regions?: Region[]
  /** A resource search area, not an assertion of the patient's registered or treatment address. */
  region?: Region | ''
  diseases: DiseaseId[]
  needs: NeedId[]
  residence: Region | ''
  household: Region | ''
  hospitalRegion: Region | ''
  kind: ResourceKind | ''
  status: ApplicationStatus | ''
}
