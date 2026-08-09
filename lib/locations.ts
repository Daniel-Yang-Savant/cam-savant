export type LocationColor = 'blue' | 'green' | 'amber'

export interface ClinicLocation {
  slug: 'changhua' | 'hanming' | 'yuanlin' | 'nantou' | 'erlin'
  hospital: string
  hospitalEn: string
  shortName: string
  department: string
  departmentEn: string
  address: string
  addressEn: string
  streetAddress: string
  addressRegion: string
  addressLocality: string
  postalCode: string
  phone: string
  phoneHref: string
  mapUrl: string
  officialUrl: string
  transportUrl: string
  bookingUrl: string
  schedule: string[]
  scheduleEn: string[]
  color: LocationColor
  areaDescription: string
  areaDescriptionEn: string
  transportNotes: string[]
  transportNotesEn: string[]
  doctorSlugs: string[]
  services: string[]
  servicesEn: string[]
}

/**
 * 團隊服務院區資料的唯一來源。
 * 地址、電話、掛號與交通連結均以各醫院官方網站為準；
 * 門診時段沿用既有網站資料，不在地點頁另行維護。
 */
export const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    slug: 'changhua',
    hospital: '彰化基督教醫院',
    hospitalEn: 'Changhua Christian Hospital',
    shortName: '彰基總院',
    department: '復健醫學部',
    departmentEn: 'Department of Physical Medicine and Rehabilitation',
    address: '50006 彰化市南校街135號',
    addressEn: 'No. 135, Nanxiao St., Changhua City, Changhua County 50006, Taiwan',
    streetAddress: '南校街135號',
    addressRegion: '彰化縣',
    addressLocality: '彰化市',
    postalCode: '50006',
    phone: '(04) 723-8595',
    phoneHref: 'tel:+88647238595',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=彰化基督教醫院',
    officialUrl: 'https://www.cch.org.tw/',
    transportUrl: 'https://www.cch.org.tw/about_page.aspx?Id=69',
    bookingUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    schedule: ['週一 晚上', '週三 下午', '週五 上午'],
    scheduleEn: ['Monday evening', 'Wednesday afternoon', 'Friday morning'],
    color: 'blue',
    areaDescription:
      '位於彰化市南校街的彰基總院，提供復健醫學、運動傷害與肌肉骨骼疼痛相關評估與治療。',
    areaDescriptionEn:
      'The main campus on Nanxiao Street in Changhua City provides assessment and treatment for rehabilitation, sports injuries, and musculoskeletal pain.',
    transportNotes: [
      '由彰化火車站可轉乘公車、客運或計程車前往；路線與班次請查閱院方交通資訊。',
      '自行開車可由國道一號彰化交流道或台74線快官交流道進入彰化市區。',
      '停車場、接駁車及臨時交通異動，以彰基官方公告為準。',
    ],
    transportNotesEn: [
      'From Changhua Railway Station, take a local bus, coach, or taxi. Check the hospital transportation page for current routes and schedules.',
      'Drivers may enter Changhua City from the Changhua Interchange on National Freeway 1 or the Kuaiguan Interchange on Provincial Highway 74.',
      'Parking, shuttle services, and temporary traffic changes are subject to the hospital’s latest announcements.',
    ],
    doctorSlugs: ['yu-kai-yang', 'wen-wei-lai'],
    services: [
      '復健醫學評估',
      '運動傷害診斷與復健',
      '肌肉骨骼疼痛管理',
      '超音波導引評估與注射',
      '增生療法與 PRP',
      '骨質疏鬆評估與治療',
      '術前與術後復健規劃',
      'FSM 頻率特異性微電流',
    ],
    servicesEn: [
      'Rehabilitation medicine assessment',
      'Sports injury diagnosis and rehabilitation',
      'Musculoskeletal pain management',
      'Ultrasound-guided assessment and injection',
      'Prolotherapy and PRP therapy',
      'Osteoporosis assessment and treatment',
      'Preoperative and postoperative rehabilitation planning',
      'Frequency Specific Microcurrent (FSM)',
    ],
  },
  {
    slug: 'hanming',
    hospital: '漢銘基督教醫院',
    hospitalEn: 'Hanming Christian Hospital',
    shortName: '漢銘醫院',
    department: '復健科',
    departmentEn: 'Department of Rehabilitation Medicine',
    address: '500 彰化市中山路一段366號',
    addressEn: 'No. 366, Sec. 1, Zhongshan Rd., Changhua City, Changhua County 500, Taiwan',
    streetAddress: '中山路一段366號',
    addressRegion: '彰化縣',
    addressLocality: '彰化市',
    postalCode: '500',
    phone: '(04) 711-3456',
    phoneHref: 'tel:+88647113456',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=漢銘基督教醫院',
    officialUrl: 'https://hm.cch.org.tw/',
    transportUrl: 'https://hm.cch.org.tw/about_5.aspx',
    bookingUrl: 'https://opdhm.cch.org.tw/hmrg/opd/service-e.aspx?id=1400&Page=11&#p',
    schedule: ['週一 上午', '週三 上午'],
    scheduleEn: ['Monday morning', 'Wednesday morning'],
    color: 'blue',
    areaDescription:
      '位於彰化市中山路一段，提供彰化地區復健醫學、肌肉骨骼超音波與超音波導引注射等門診服務。',
    areaDescriptionEn:
      'Located on Section 1 of Zhongshan Road in Changhua City, this clinic provides rehabilitation medicine, musculoskeletal ultrasound, and ultrasound-guided procedures.',
    transportNotes: [
      '院區位於彰化市中山路一段，可使用 Google Maps 規劃開車、騎車或大眾運輸路線。',
      '公車、接駁與停車資訊可能調整，出發前請查閱漢銘基督教醫院官方交通頁。',
      '臨時交通管制與院區出入口異動，以院方現場及官方公告為準。',
    ],
    transportNotesEn: [
      'The hospital is on Section 1 of Zhongshan Road in Changhua City. Use Google Maps for current driving, scooter, or public transit routes.',
      'Bus, shuttle, and parking information may change. Check the hospital’s official transportation page before traveling.',
      'Temporary traffic controls and entrance changes are subject to on-site and official hospital announcements.',
    ],
    doctorSlugs: ['wen-wei-lai'],
    services: [
      '復健醫學評估',
      '肌肉骨骼超音波',
      '超音波導引注射',
    ],
    servicesEn: [
      'Rehabilitation medicine assessment',
      'Musculoskeletal ultrasound',
      'Ultrasound-guided injection',
    ],
  },
  {
    slug: 'yuanlin',
    hospital: '員林基督教醫院',
    hospitalEn: 'Yuanlin Christian Hospital',
    shortName: '員基醫院',
    department: '復健科',
    departmentEn: 'Department of Rehabilitation Medicine',
    address: '510 彰化縣員林市莒光路456號',
    addressEn: 'No. 456, Juguang Rd., Yuanlin City, Changhua County 510, Taiwan',
    streetAddress: '莒光路456號',
    addressRegion: '彰化縣',
    addressLocality: '員林市',
    postalCode: '510',
    phone: '(04) 838-1456',
    phoneHref: 'tel:+88648381456',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=員林基督教醫院',
    officialUrl: 'https://bc.cch.org.tw/',
    transportUrl: 'https://bc.cch.org.tw/about_5.aspx',
    bookingUrl: 'https://bc.cch.org.tw/bcrg/opd/service-e.aspx?id=1400&Page=11&#p',
    schedule: ['週五 下午'],
    scheduleEn: ['Friday afternoon'],
    color: 'amber',
    areaDescription:
      '位於員林市莒光路，提供員林及鄰近地區復健醫學、肌肉骨骼超音波與超音波導引注射等門診服務。',
    areaDescriptionEn:
      'Located on Juguang Road in Yuanlin City, this clinic provides rehabilitation medicine, musculoskeletal ultrasound, and ultrasound-guided procedures for Yuanlin and nearby areas.',
    transportNotes: [
      '院區位於員林市莒光路，可使用 Google Maps 規劃開車、騎車或大眾運輸路線。',
      '公車、接駁與停車資訊可能調整，出發前請查閱員林基督教醫院官方交通頁。',
      '臨時交通管制與院區出入口異動，以院方現場及官方公告為準。',
    ],
    transportNotesEn: [
      'The hospital is on Juguang Road in Yuanlin City. Use Google Maps for current driving, scooter, or public transit routes.',
      'Bus, shuttle, and parking information may change. Check the hospital’s official transportation page before traveling.',
      'Temporary traffic controls and entrance changes are subject to on-site and official hospital announcements.',
    ],
    doctorSlugs: ['wen-wei-lai'],
    services: [
      '復健醫學評估',
      '肌肉骨骼超音波',
      '超音波導引注射',
    ],
    servicesEn: [
      'Rehabilitation medicine assessment',
      'Musculoskeletal ultrasound',
      'Ultrasound-guided injection',
    ],
  },
  {
    slug: 'nantou',
    hospital: '南投基督教醫院',
    hospitalEn: 'Nantou Christian Hospital',
    shortName: '南基醫院',
    department: '復健科',
    departmentEn: 'Department of Rehabilitation Medicine',
    address: '54050 南投縣南投市中興路870號',
    addressEn: 'No. 870, Zhongxing Rd., Nantou City, Nantou County 54050, Taiwan',
    streetAddress: '中興路870號',
    addressRegion: '南投縣',
    addressLocality: '南投市',
    postalCode: '54050',
    phone: '(049) 222-5595',
    phoneHref: 'tel:+886492225595',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=南投基督教醫院',
    officialUrl: 'https://ny.cch.org.tw/',
    transportUrl: 'https://ny.cch.org.tw/about_5_1.aspx',
    bookingUrl: 'https://ny.cch.org.tw/nyrg/opd/service-e.aspx?id=1400&Page=11&#p',
    schedule: ['週一 上午', '週四 上午'],
    scheduleEn: ['Monday morning', 'Thursday morning'],
    color: 'green',
    areaDescription:
      '位於南投市中興路，提供南投地區復健科、運動傷害、疼痛與功能恢復相關門診服務。',
    areaDescriptionEn:
      'Located on Zhongxing Road in Nantou City, this clinic provides rehabilitation, sports injury, pain, and functional recovery services for the Nantou area.',
    transportNotes: [
      '由北往南可由國道三號南投交流道前往；由南往北可由名間交流道銜接市區道路。',
      '可由彰化客運南投總站轉乘公車或計程車，實際路線請以客運業者公告為準。',
      '院方另有醫療服務交通車；路線、班次與停車資訊請查閱南基官方交通頁。',
    ],
    transportNotesEn: [
      'From the north, use the Nantou Interchange on National Freeway 3; from the south, use the Mingjian Interchange and continue on local roads.',
      'From Changhua Bus Nantou Station, transfer to a local bus or taxi. Confirm current routes with the bus operator.',
      'The hospital operates a medical shuttle. Check the official transportation page for routes, schedules, and parking information.',
    ],
    doctorSlugs: ['yu-kai-yang'],
    services: [
      '復健醫學評估',
      '運動傷害診斷與復健',
      '肌肉骨骼疼痛管理',
      '超音波導引評估與注射',
      '增生療法與 PRP',
      '骨質疏鬆評估與治療',
      '術前與術後復健規劃',
      'FSM 頻率特異性微電流',
    ],
    servicesEn: [
      'Rehabilitation medicine assessment',
      'Sports injury diagnosis and rehabilitation',
      'Musculoskeletal pain management',
      'Ultrasound-guided assessment and injection',
      'Prolotherapy and PRP therapy',
      'Osteoporosis assessment and treatment',
      'Preoperative and postoperative rehabilitation planning',
      'Frequency Specific Microcurrent (FSM)',
    ],
  },
  {
    slug: 'erlin',
    hospital: '二林基督教醫院',
    hospitalEn: 'Erlin Christian Hospital',
    shortName: '二基醫院',
    department: '復健醫學科',
    departmentEn: 'Department of Rehabilitation Medicine',
    address: '52665 彰化縣二林鎮大成路一段558號',
    addressEn: 'No. 558, Sec. 1, Dacheng Rd., Erlin Township, Changhua County 52665, Taiwan',
    streetAddress: '大成路一段558號',
    addressRegion: '彰化縣',
    addressLocality: '二林鎮',
    postalCode: '52665',
    phone: '(04) 895-2031',
    phoneHref: 'tel:+88648952031',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=二林基督教醫院',
    officialUrl: 'https://erhlin.cch.org.tw/',
    transportUrl: 'https://www.cch.org.tw/about_page.aspx?Id=69',
    bookingUrl: 'https://erhlin.cch.org.tw/20rg/opd/service-e.aspx?id=1400&Page=11&#p',
    schedule: ['週三 上午'],
    scheduleEn: ['Wednesday morning'],
    color: 'amber',
    areaDescription:
      '位於二林鎮大成路一段，服務南彰化地區的復健醫學、運動傷害、疼痛與功能恢復需求。',
    areaDescriptionEn:
      'Located on Dacheng Road in Erlin Township, this clinic serves southern Changhua with rehabilitation, sports injury, pain, and functional recovery care.',
    transportNotes: [
      '院區位於二林鎮大成路一段，開車或騎車可使用 Google Maps 規劃即時路線。',
      '彰基醫療體系交通車班次可能調整，搭乘前請先查閱院方最新交通公告。',
      '停車位置、接駁方式與臨時動線，以二基醫院現場及官方公告為準。',
    ],
    transportNotesEn: [
      'The hospital is on Section 1 of Dacheng Road in Erlin Township. Drivers and scooter riders can use Google Maps for current routing.',
      'Hospital shuttle schedules may change; check the latest official notice before traveling.',
      'Parking, shuttle arrangements, and temporary access routes are subject to on-site and official hospital announcements.',
    ],
    doctorSlugs: ['yu-kai-yang'],
    services: [
      '復健醫學評估',
      '運動傷害診斷與復健',
      '肌肉骨骼疼痛管理',
      '超音波導引評估與注射',
      '增生療法與 PRP',
      '骨質疏鬆評估與治療',
      '術前與術後復健規劃',
      'FSM 頻率特異性微電流',
    ],
    servicesEn: [
      'Rehabilitation medicine assessment',
      'Sports injury diagnosis and rehabilitation',
      'Musculoskeletal pain management',
      'Ultrasound-guided assessment and injection',
      'Prolotherapy and PRP therapy',
      'Osteoporosis assessment and treatment',
      'Preoperative and postoperative rehabilitation planning',
      'Frequency Specific Microcurrent (FSM)',
    ],
  },
]

export function getClinicLocation(slug: string): ClinicLocation | null {
  return CLINIC_LOCATIONS.find((location) => location.slug === slug) ?? null
}
