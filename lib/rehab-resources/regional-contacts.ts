import type { RegionalContact } from './types'

// Government contact directory, deliberately separate from individual funding schemes.
// Deep links are included only where their content was readable at the recorded check.
export const REGIONAL_CONTACTS: RegionalContact[] = [
  {
    region: '基隆市', name: '基隆市政府社會處', url: 'https://www.klcg.gov.tw/tw/social/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。身障及急難需求可由社會處詢問；兒童早療請轉兒童及少年事務處，當年度辦法另確認。',
  },
  {
    region: '臺北市', name: '臺北市政府社會局', url: 'https://dosw.gov.taipei/Default.aspx',
    earlyInterventionUrl: 'https://dosw.gov.taipei/cp.aspx?n=8F97E5D532EE9C35',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。早療另有設籍、通報、證明效期及核銷期限要求，請依所附申請說明確認。',
  },
  {
    region: '新北市', name: '新北市政府社會局', url: 'https://www.sw.ntpc.gov.tw/index.jsp',
    earlyInterventionUrl: 'https://www.sw.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=490876a2ea5230f5ed8daaf4598cc80c&id=af6b347895e3de2c',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。可由兒童健康發展／早期療育專區及身障福利專區，確認戶籍、證明與當期辦法。',
  },
  {
    region: '桃園市', name: '桃園市政府社會局', url: 'https://sab.tycg.gov.tw/',
    earlyInterventionUrl: 'https://dowcd.tycg.gov.tw/News.aspx?n=16390&sms=18037',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。一般福利洽社會局；早期療育業務另由婦幼發展局公告，請循早療專區查當期規定。',
  },
  {
    region: '新竹市', name: '新竹市政府社會處聯絡資訊', url: 'https://society.hccg.gov.tw/ch/home.jsp?id=10359&parentpath=0%2C1',
    earlyInterventionUrl: 'https://kids.hccg.gov.tw/explain.php?pageid=JCUyMTcjIQ%3D%3D',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。可由社會處分科聯絡表或兒童發展資源服務網，詢問目前申請規定與通報轉介。',
  },
  {
    region: '新竹縣', name: '新竹縣政府社會處', url: 'https://social.hsinchu.gov.tw/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。請詢問身障福利、兒少及家庭支持或社會救助承辦，核對當期辦法與所需文件。',
  },
  {
    region: '苗栗縣', name: '苗栗縣政府社會處', url: 'https://www.miaoli.gov.tw/social_affairs/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。首頁申辦須知列有115年7月1日起實施的早療計畫，請查閱最新版本與自費療育核准單位。',
  },
  {
    region: '臺中市', name: '臺中市政府社會局', url: 'https://www.society.taichung.gov.tw/',
    earlyInterventionUrl: 'https://www.society.taichung.gov.tw/13710/13735/13738/13744/461274/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。已另收錄中部資源；早療、輔具、生活與急難補助仍需逐案核對戶籍及申請期限。',
  },
  {
    region: '彰化縣', name: '彰化縣政府社會處', url: 'https://www.chcg.gov.tw/DTO/social/00home/index01.aspx',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。已另收錄中部資源；可由業務專區與聯絡通訊確認早療、身障及急難救助承辦。',
  },
  {
    region: '南投縣', name: '南投縣政府社會及勞動局', url: 'https://welfare.nantou.gov.tw/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。已另收錄中部資源；可由兒少、身障、社會救助與勞青就業專區詢問當期服務。',
  },
  {
    region: '雲林縣', name: '雲林縣政府社會處', url: 'https://social.yunlin.gov.tw/',
    earlyInterventionUrl: 'https://social.yunlin.gov.tw/News.aspx?n=5414&sms=19109',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。已另收錄中部資源；早療資訊專區與身障、急難承辦可協助核對當期規定。',
  },
  {
    region: '嘉義市', name: '嘉義市政府社會處', url: 'https://social.chiayi.gov.tw/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。請由兒童少年、身心障礙及社會救助專區，詢問可用服務與當期申請規定。',
  },
  {
    region: '嘉義縣', name: '嘉義縣社會局', url: 'https://sabcc.cyhg.gov.tw/',
    checkedAt: '2026-10-18', note: '官方總覽所列福利窗口，非個別補助方案。本次僅由官方來源核對機關入口；當期補助、資格與文件尚待承辦確認。',
  },
  {
    region: '臺南市', name: '臺南市政府社會局', url: 'https://sab.tainan.gov.tw/',
    earlyInterventionUrl: 'https://sab.tainan.gov.tw/News_Content.aspx?n=21346&s=4378108',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。早療費用補助有獨立公告；其他身障、照顧與急難需求請洽相應承辦。',
  },
  {
    region: '高雄市', name: '高雄市政府社會局機關資訊', url: 'https://www.kcg.gov.tw/Organ_Detail.aspx?n=D33B55D537402BAA&s=6577239FDC0F719E&sms=9F779BBA07F163E2',
    checkedAt: '2026-10-18', note: '官方機關聯絡入口，非個別補助方案。市府頁列有社會局官網、身障與社會救助分工；個別補助及早療規定需向承辦確認。',
  },
  {
    region: '屏東縣', name: '屏東縣政府社會處', url: 'https://www.pthg.gov.tw/planjdp/',
    checkedAt: '2026-10-18', note: '官方來源所列福利窗口，非個別補助方案。本次僅由官方來源核對機關入口；當期補助、資格與文件尚待承辦確認。',
  },
  {
    region: '宜蘭縣', name: '宜蘭縣政府社會處', url: 'https://sntroot.e-land.gov.tw/Default.aspx',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。請詢問兒少、身障或社會救助承辦，確認當期規定與戶籍、居住地限制。',
  },
  {
    region: '花蓮縣', name: '花蓮縣政府社會處', url: 'https://sa.hl.gov.tw/',
    earlyInterventionUrl: 'https://sa.hl.gov.tw/Detail_sp/d0564bb2d83141688962ae789a8a96da',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。早期療育服務有獨立專區；交通、療育及其他補助請依當期縣府規定核對。',
  },
  {
    region: '臺東縣', name: '臺東縣政府社會處', url: 'https://taisoc.taitung.gov.tw/WebSite/Page/index.aspx',
    checkedAt: '2026-10-18', note: '官方來源所列福利窗口，非個別補助方案。本次僅由官方來源核對機關入口；當期補助、資格與文件尚待承辦確認。',
  },
  {
    region: '澎湖縣', name: '澎湖縣政府社會處', url: 'https://www.penghu.gov.tw/society/',
    checkedAt: '2026-10-18', note: '官方福利窗口，非個別補助方案。離島就醫及療育交通可能另有規定，請向兒少、身障或社會救助承辦核對。',
  },
  {
    region: '金門縣', name: '金門縣政府社會處', url: 'https://social.kinmen.gov.tw/',
    checkedAt: '2026-10-18', note: '官方總覽所列福利窗口，非個別補助方案。本次僅由官方來源核對機關入口；當期補助、資格及離島交通規定尚待承辦確認。',
  },
  {
    region: '連江縣', name: '連江縣衛生福利局', url: 'https://www.matsuhb.gov.tw/',
    checkedAt: '2026-10-18', note: '官方衛生與福利窗口，非個別補助方案。請洽社會福利業務或長照中心；早療及離島交通的當期資格與文件需另確認。',
  },
]
