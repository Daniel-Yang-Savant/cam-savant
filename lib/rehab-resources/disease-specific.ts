import type { RehabResource } from './types'

// Disease-specific service routes. A verified route is not an award decision or
// confirmation of available appointment slots, equipment or financial assistance.
export const DISEASE_SPECIFIC_RESOURCES: RehabResource[] = [
  {
    id: 'national-als-mnda-support',
    title: '漸凍人協會：到宅照護、溝通輔具與家庭支持',
    organization: '社團法人中華民國運動神經元疾病病友協會',
    kind: 'charity',
    resourceType: 'referral',
    regions: ['全國'],
    geographicBasis: 'nationwide',
    diseases: ['als'],
    diseaseSpecific: true,
    needs: ['therapy', 'assistive', 'care', 'caregiver', 'education'],
    summary: '漸凍症病友與家屬可聯絡協會社工，討論到宅專業服務、溝通輔具借用與照護支持。',
    benefits: '協會列有呼吸、物理、職能、語言等專業到宅服務與照護指導，並提供眼控電腦、叫人鈴等溝通輔具借用、心理支持及家庭照顧者訓練。個別服務由社工評估安排。',
    eligibility: [
      '服務對象為運動神經元疾病／漸凍症病友及家庭；到宅專業服務與輔具借用須依個人需要及服務安排評估。',
      '申請基本會員時，官網列年滿20歲的運動神經元疾病病患或家屬，經理事會審核；入會費及年費各500元，持低收或中低收入證明者得減免。此為會員規則，服務需求請另由社工評估。',
    ],
    documents: [
      '先向社工說明病名、服務地區及照顧或溝通需要，再依擬使用項目取得申請或評估表。',
      '需申請入會者：官網入會申請表、病友資料表及繳費存根；申請會費減免另附低收或中低收入證明。',
    ],
    application: '中部可打04-23012256聯絡中區辦公室；其他地區可打總會02-25851367或南區07-2228116。由社工了解需求、說明收案與表件；入會表可從官網「加入我們／申請入會」下載後郵寄、傳真或寄mnda@mnda.org.tw。',
    contact: {
      name: '漸凍人協會中區辦公室',
      phone: '04-23012256',
      url: 'https://www.mnda.org.tw/service_page.php?deliver=JCUxMiMh',
    },
    status: 'inquiry',
    statusNote: '已核對全人照護服務、北中南窗口及會員申請規則；各服務收案、到宅安排與輔具借用須由社工安排。',
    source: {
      title: '漸凍人協會：全人照護',
      url: 'https://www.mnda.org.tw/service_page.php?deliver=JCUxMSMh',
    },
    checkedAt: '2026-10-20',
    verification: 'official-page',
    reviewAfterDays: 90,
    cautions: [
      '這筆提供服務評估與聯繫入口，未收錄個別照護費或購買輔具補助的資格與金額。',
      '到宅服務須依服務地區、個別需求與專業團隊安排；輔具為借用服務，須依評估及設備安排辦理。',
    ],
  },
  {
    id: 'national-parkinsons-peer-support',
    // This exact official-site URL is also linked by the Taiwan Brain Bank
    // Association's September 2026 patient-group directory:
    // https://www.brainbank.tw/相關連結
    title: '帕促會：帕金森病友交流與陪伴聯繫',
    organization: '社團法人台灣帕金森病友權益促進會',
    kind: 'charity',
    resourceType: 'referral',
    regions: ['全國'],
    geographicBasis: 'nationwide',
    diseases: ['parkinsons'],
    diseaseSpecific: true,
    needs: ['caregiver'],
    summary: '帕金森病友及家屬可透過協會電子郵件，聯繫病友交流與陪伴服務。',
    benefits: '協會官網列有電話陪伴、關懷訪視及病友社群，提供病友與家屬互相支持的聯繫入口。',
    eligibility: [
      '對象為帕金森病友與家屬；家屬可主動聯繫，也可由神經內科醫師、長照機構或地方社福單位介紹。',
      '本筆收錄電子郵件聯繫與病友支持服務，不代表全台各地均有實體課程或到宅訪視。',
    ],
    documents: ['初次電子郵件詢問，可先整理想參與的交流或陪伴服務與回覆方式；參加後續活動所用表件由協會提供。'],
    application: '寄信至官網列示的tpda20190121@gmail.com，說明病友或家屬身分，以及想找的交流或陪伴服務；也可請神經內科醫師、長照機構或地方社福單位協助介紹。',
    contact: {
      name: '帕促會電子郵件：tpda20190121@gmail.com',
      url: 'https://sites.google.com/view/parkinsonss/首頁',
    },
    status: 'inquiry',
    statusNote: '已核對協會官網所列服務與電子郵件；聯繫後由協會安排支持服務或活動。',
    source: {
      title: '台灣帕金森病友權益促進會：服務內容與聯繫方式',
      url: 'https://sites.google.com/view/parkinsonss/首頁',
    },
    checkedAt: '2026-10-20',
    verification: 'official-page',
    reviewAfterDays: 90,
    cautions: [
      '此筆僅收錄病友支持聯繫；未收錄尚無完整公開申請規則的交通或急難補助。',
      '官網聯繫方式為電子郵件；活動日期、地點與報名依協會後續通知，病友交流不取代醫療評估。',
    ],
  },
  {
    id: 'cch-amputation-prosthesis-consultation',
    title: '彰基體系輔具中心：截肢後義肢申辦諮詢',
    // The shared hospital name keeps this service in the existing CCH provider.
    organization: '彰化基督教醫院／體系輔具中心',
    kind: 'hospital',
    resourceType: 'referral',
    regions: ['彰化縣'],
    geographicBasis: 'hospital',
    diseases: ['amputation'],
    diseaseSpecific: true,
    needs: ['assistive', 'benefits'],
    summary: '截肢後需要義肢，可先找彰基輔具中心詢問健保給付與戶籍地輔具補助的辦理順序。',
    benefits: '中心提供電話及現場輔具諮詢、評估建議與補助申辦協助；義肢問答說明健保給付、自付差額及身障輔具補助的銜接。',
    eligibility: [
      '此筆為彰化基督教醫院總院的輔具諮詢入口；服務地點在彰化，不能以彰化戶籍推定已符合醫院服務或補助資格。',
      '義肢健保給付須符合醫師處方及健保品項、部位與次數規定；自選超過給付範圍的差額由本人負擔。',
      '院方義肢問答列：18歲以上申請義肢身障輔具補助，須符合肢體障礙資格並優先使用健保給付，再向戶籍地社會局或輔具中心辦理。',
    ],
    documents: [
      '初次諮詢可整理現有截肢診斷、醫師處方與義肢使用情形，讓中心判斷評估與申辦順序。',
      '需申請身障輔具補助者，依戶籍地主管機關要求準備身障資格、輔具評估與申請表件；先核對流程再購置。',
    ],
    application: '先打04-7238595轉5034或5024，向體系輔具中心說明截肢與義肢需求，安排諮詢；現場位於彰化市南校街135號、總院二期地下一樓。由中心協助核對健保與戶籍地輔具補助流程。',
    contact: {
      name: '彰化基督教醫院體系輔具中心',
      phone: '04-7238595 分機5034／5024',
      url: 'https://dpt.cch.org.tw/layout/layout_1/about.aspx?ID=7250&Key=176',
    },
    status: 'inquiry',
    statusNote: '已核對輔具中心服務及2026年5月28日義肢問答；實際諮詢、評估與義肢給付依院內及主管機關規定辦理。',
    source: {
      title: '彰基體系輔具中心：義肢自付差額說明',
      url: 'https://dpt.cch.org.tw/layout/layout_1/qa.aspx?ID=7250',
      publishedOn: '2026-05-28',
    },
    checkedAt: '2026-10-20',
    verification: 'official-page',
    reviewAfterDays: 90,
    cautions: [
      '本項是諮詢與申辦協助，不代表義肢免費或醫院直接發放補助；補助審查在戶籍地主管機關。',
      '健保義肢給付不包含維修費，超出給付範圍的費用須自行負擔；先核對健保及身障輔具補助順序，避免重複申請同筆費用。',
    ],
  },
]

export const DISEASE_SPECIFIC_GUIDES: Record<string, { help: string; who: string; firstStep: string }> = {
  'national-als-mnda-support': {
    help: '漸凍症照護指導、到宅專業評估、溝通輔具借用與家庭支持。',
    who: '漸凍症病友與家庭；由協會社工評估需要及服務安排，入會另有會員規定。',
    firstStep: '中部打04-23012256找協會社工；其他地區可打總會02-25851367，說明病名、服務地區與需要。',
  },
  'national-parkinsons-peer-support': {
    help: '聯繫帕金森病友交流、電話陪伴與家屬支持。',
    who: '帕金森病友與家屬，可主動聯繫或由醫師、長照與社福單位介紹；各地實體服務另依安排。',
    firstStep: '寄信到tpda20190121@gmail.com，說明想找交流、陪伴或家屬支持；也可請醫師或社工協助介紹。',
  },
  'cch-amputation-prosthesis-consultation': {
    help: '截肢後義肢的健保給付與身障輔具補助申辦諮詢。',
    who: '需要義肢的截肢者；醫院服務與健保、身障輔具補助各有條件，輔具補助依戶籍地審查。',
    firstStep: '打04-7238595轉5034或5024，先問義肢評估與健保辦理順序，再依規定申請戶籍地輔具補助。',
  },
}
