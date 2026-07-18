// ─────────────────────────────────────────────────────────────────────────
// 醫療團隊資料（單一來源）
// about 頁、文章作者卡片、JSON-LD Physician schema 皆由此取用。
// key 對應文章 frontmatter 的 author 欄位（如 "楊育愷醫師"）。
// ─────────────────────────────────────────────────────────────────────────

export interface Author {
  /** URL anchor 與 @id 用（/about#slug） */
  slug: string
  name: string
  nameEn: string
  photo: string
  title: string
  location: string
  /** 服務院所（有明確院所才填，用於 schema affiliation） */
  affiliation?: string
  specialties: string[]
  credentials: string[]
}

export const AUTHORS: Record<string, Author> = {
  '楊育愷醫師': {
    slug: 'yu-kai-yang',
    name: '楊育愷',
    nameEn: 'Yu-Kai Yang, MD',
    photo: '/images/team/yu-kai-yang.jpg',
    title: '復健科主治醫師',
    location: '彰化縣・南投縣',
    specialties: ['增生療法', 'PRP治療', '運動醫學', '骨質疏鬆', '超音波導引注射', 'FSM'],
    credentials: ['骨質疏鬆專科醫師', '增生醫學會會員', '台灣運動醫學醫學會會員'],
  },
  '楊育彰醫師': {
    slug: 'yu-chang-yang',
    name: '楊育彰',
    nameEn: 'Yu-Chang Yang, MD',
    photo: '/images/team/yu-chang-yang.jpg',
    title: '家庭醫學科專科醫師',
    location: '台北・桃園',
    specialties: ['針灸', '減重', '醫美', '家庭醫學'],
    credentials: ['骨質疏鬆專科醫師', 'SCOPE 國際肥胖專科認證', '糖尿病 CDE 認證'],
  },
  '賴玟衛醫師': {
    slug: 'wen-wei-lai',
    name: '賴玟衛',
    nameEn: 'Wen-Wei Lai, MD',
    photo: '/images/team/wen-wei-lai.jpg',
    title: '復健科醫師',
    location: '彰化基督教醫院',
    affiliation: '彰化基督教醫院',
    specialties: ['復健醫學'],
    credentials: ['骨鬆醫學會會員', '增生醫學會會員'],
  },
  '黃雅琦醫師': {
    slug: 'huang-yachi',
    name: '黃雅琦',
    nameEn: 'Yachi Huang, MD',
    photo: '/images/team/huang-yachi.jpg',
    title: '復健科醫師',
    location: '彰化基督教醫院',
    affiliation: '彰化基督教醫院',
    specialties: [],
    credentials: [],
  },
}

export const DEFAULT_AUTHOR_KEY = '楊育愷醫師'

/** 依 frontmatter author 字串取得作者資料（找不到時回傳預設作者） */
export function getAuthor(authorKey?: string): Author {
  return (authorKey ? AUTHORS[authorKey] : undefined) ?? AUTHORS[DEFAULT_AUTHOR_KEY]
}

export const TEAM: Author[] = Object.values(AUTHORS)
