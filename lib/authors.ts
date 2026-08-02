// ─────────────────────────────────────────────────────────────────────────
// 醫療團隊資料（單一來源）
// about 頁、文章作者卡片、JSON-LD Physician schema 皆由此取用。
// key 對應文章 frontmatter 的 author 欄位（如 "楊育愷醫師"）。
// ─────────────────────────────────────────────────────────────────────────

export interface Author {
  /** 獨立醫師頁與 @id 用（/doctors/slug） */
  slug: string
  name: string
  nameEn: string
  photo: string
  title: string
  titleEn: string
  bio?: string
  bioEn?: string
  location: string
  locationEn: string
  /** 服務院所（有明確院所才填，用於 schema affiliation） */
  affiliation?: string
  specialties: string[]
  specialtiesEn: string[]
  credentials: string[]
  credentialsEn: string[]
  education?: string[]
  educationEn?: string[]
  experience?: string[]
  experienceEn?: string[]
  publications?: {
    title: string
    citation: string
    url: string
  }[]
  sameAs?: string[]
  contactPath?: string
}

export const AUTHORS: Record<string, Author> = {
  '楊育愷醫師': {
    slug: 'yu-kai-yang',
    name: '楊育愷',
    nameEn: 'Yu-Kai Yang, MD',
    photo: '/images/team/yu-kai-yang.jpg',
    title: '復健科主治醫師',
    titleEn: 'Attending Physician, Physical Medicine and Rehabilitation',
    location: '彰化縣・南投縣',
    locationEn: 'Changhua County · Nantou County, Taiwan',
    specialties: ['增生療法', 'PRP治療', '運動醫學', '骨質疏鬆', '超音波導引注射', 'FSM'],
    specialtiesEn: ['Prolotherapy', 'PRP Therapy', 'Sports Medicine', 'Osteoporosis', 'Ultrasound-Guided Injection', 'FSM'],
    credentials: ['骨質疏鬆症專科醫師', '台灣增生療法醫學會會員', '台灣運動醫學醫學會會員'],
    credentialsEn: ['Certified Osteoporosis Specialist', 'Member, Taiwan Association of Prolotherapy and Regenerative Medicine', 'Member, Taiwan Society of Sports Medicine'],
    education: ['國立陽明大學醫學系畢業', '國立中興大學博士班進修'],
    educationEn: ['MD, National Yang-Ming University', 'Doctoral studies, National Chung Hsing University'],
    experience: [
      '彰化基督教醫院復健醫學部主治醫師',
      '南投基督教醫院復健科主任',
      '二林基督教醫院復健醫學科主治醫師',
      '林口長庚紀念醫院復健科進修',
    ],
    experienceEn: [
      'Attending Physician, Department of Physical Medicine and Rehabilitation, Changhua Christian Hospital',
      'Director, Department of Rehabilitation Medicine, Nantou Christian Hospital',
      'Attending Physician, Department of Rehabilitation Medicine, Erlin Christian Hospital',
      'Advanced training, Department of Rehabilitation Medicine, Linkou Chang Gung Memorial Hospital',
    ],
    publications: [
      {
        title: 'Timing and Dose of Constraint-Induced Movement Therapy after Stroke: A Systematic Review and Meta-Regression',
        citation: 'Journal of Clinical Medicine, 2023; 12(6):2267',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10058952/',
      },
      {
        title: 'Associations between doses of fall-risk-increasing drugs (FRIDs) and falls of hospitalized patients',
        citation: 'Scientific Reports, 2023; 13:14380',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37658229/',
      },
      {
        title: 'Factors Impacting Fall Severity in Hospitalized Patients: A Retrospective Cohort Study',
        citation: 'Journal of Clinical Medicine, 2024; 13(10):2827',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11122293/',
      },
    ],
    sameAs: [
      'https://dpt.cch.org.tw/layout/layout_1/doctor.aspx?ID=1400&Key=11334',
      'https://ny.cch.org.tw/doctor_1_detial.aspx?cID=65&key=1400',
      'https://www.toa1997.org.tw/orthopedist/?n=%E6%A5%8A%E8%82%B2%E6%84%B7',
    ],
    contactPath: '/contact',
  },
  '楊育彰醫師': {
    slug: 'yu-chang-yang',
    name: '楊育彰',
    nameEn: 'Yu-Chang Yang, MD',
    photo: '/images/team/yu-chang-yang.jpg',
    title: '家庭醫學科專科醫師',
    titleEn: 'Board-Certified Family Physician',
    bio: '以家庭醫學為核心，整合肥胖與代謝異常、三高與慢性病、男性更年期及骨質疏鬆照護；並具糖尿病與初期慢性腎臟病照護訓練，投入健康管理、功能與營養醫學及醫學美容。',
    bioEn: 'His family-medicine practice integrates obesity and metabolic health, cardiometabolic and chronic disease care, male menopause, and osteoporosis. His additional training includes diabetes education and early chronic kidney disease care, alongside health management, functional and nutritional medicine, and aesthetic medicine.',
    location: '台北・桃園',
    locationEn: 'Taipei · Taoyuan, Taiwan',
    affiliation: '存奕美學診所',
    specialties: ['家庭醫學', '肥胖與體重管理', '代謝症候群與慢性病管理', '男性更年期', '骨質疏鬆', '功能與營養醫學', '醫學美容'],
    specialtiesEn: ['Family Medicine', 'Obesity and Weight Management', 'Metabolic and Chronic Disease Care', 'Male Menopause', 'Osteoporosis', 'Functional and Nutritional Medicine', 'Aesthetic Medicine'],
    credentials: ['家庭醫學科專科醫師', 'SCOPE 國際肥胖專科認證', '骨質疏鬆專科醫師', '糖尿病衛教師（CDE）認證', '初期慢性腎臟病照護認證'],
    credentialsEn: ['Board-Certified Family Physician', 'SCOPE-Certified Obesity Specialist', 'Certified Osteoporosis Specialist', 'Certified Diabetes Educator (CDE)', 'Certified in Early Chronic Kidney Disease Care'],
    education: ['中山醫學大學醫學系畢業', '中國醫藥大學針灸訓練班結業'],
    educationEn: ['MD, Chung Shan Medical University', 'Completed acupuncture training, China Medical University'],
    experience: [
      '存奕美學診所專任醫師',
      '樂菲時尚整形外科集團醫療團隊',
      '臺北市立聯合醫院家庭醫學科總醫師',
      '臺北市立聯合醫院優良醫師',
      '臺北榮民總醫院一般科醫師',
      '臺大醫院代訓醫師',
    ],
    experienceEn: [
      'Staff Physician, Glow Beauty Clinic',
      'Medical Team, ABeauty Plastic Surgery Group',
      'Chief Resident, Department of Family Medicine, Taipei City Hospital',
      'Outstanding Physician, Taipei City Hospital',
      'General Practice Physician, Taipei Veterans General Hospital',
      'Visiting Trainee Physician, National Taiwan University Hospital',
    ],
    publications: [
      {
        title: 'Factors Associated With Potentially Inappropriate Medication Use and Deprescribing Among Patients Receiving Home-Based Hospice Care',
        citation: 'American Journal of Hospice & Palliative Medicine, 2026; 43(9):932–939. Epub 2025 Jul 27',
        url: 'https://journals.sagepub.com/eprint/7ZFHSP9BGBVHBAYHDHJS/full',
      },
    ],
    sameAs: [
      'https://www.abeauty-hf.com.tw/member.php?act=view&id=49',
      'https://drglowbeauty.com.tw/%e6%a5%8a%e8%82%b2%e5%bd%b0%e9%86%ab%e5%b8%ab',
    ],
  },
  '賴玟衛醫師': {
    slug: 'wen-wei-lai',
    name: '賴玟衛',
    nameEn: 'Wen-Wei Lai, MD',
    photo: '/images/team/wen-wei-lai.jpg',
    title: '復健科醫師',
    titleEn: 'Physician, Physical Medicine and Rehabilitation',
    location: '彰化基督教醫院',
    locationEn: 'Changhua Christian Hospital',
    affiliation: '彰化基督教醫院',
    specialties: ['復健醫學'],
    specialtiesEn: ['Physical Medicine and Rehabilitation'],
    credentials: ['骨鬆醫學會會員', '增生醫學會會員'],
    credentialsEn: ['Member, Taiwanese Osteoporosis Association', 'Member, Taiwan Association of Prolotherapy and Regenerative Medicine'],
    contactPath: '/contact/wen-wei-lai',
  },
  '黃雅琦醫師': {
    slug: 'huang-yachi',
    name: '黃雅琦',
    nameEn: 'Yachi Huang, MD',
    photo: '/images/team/huang-yachi.jpg',
    title: '復健科住院醫師',
    titleEn: 'Resident Physician, Physical Medicine and Rehabilitation',
    location: '彰化基督教醫院',
    locationEn: 'Changhua Christian Hospital',
    affiliation: '彰化基督教醫院',
    specialties: [],
    specialtiesEn: [],
    credentials: [],
    credentialsEn: [],
  },
}

export const DEFAULT_AUTHOR_KEY = '楊育愷醫師'

/** 依 frontmatter author 字串取得作者資料（找不到時回傳預設作者） */
export function getAuthor(authorKey?: string): Author {
  return (authorKey ? AUTHORS[authorKey] : undefined) ?? AUTHORS[DEFAULT_AUTHOR_KEY]
}

export function getAuthorEntryBySlug(slug: string): { key: string; author: Author } | null {
  const entry = Object.entries(AUTHORS).find(([, author]) => author.slug === slug)
  return entry ? { key: entry[0], author: entry[1] } : null
}

export const TEAM: Author[] = Object.values(AUTHORS)
