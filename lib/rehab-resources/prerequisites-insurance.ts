import type { RehabResource } from './types'

// First-party pages read on 2026-10-20; no telephone confirmation was made.
// These are statutory benefits or verified referral services, not grants awarded
// by diagnosis. Occupational and traffic causes must be established separately.
// Additional checked sources for the distinct requirements below:
// https://www.bli.gov.tw/0106211.html (occupational medical application)
// https://www.bli.gov.tw/0106950.html (occupational sickness eligibility)
// https://www.bli.gov.tw/0106951.html (occupational sickness documents)
// https://www.bli.gov.tw/0106914.html (occupational disability documents)
// https://www.bli.gov.tw/0106944.html (same-event social insurance election)
// https://www.bli.gov.tw/0103058.html (ordinary disability eligibility)
// https://www.bli.gov.tw/0007874.htm (ordinary disability cautions)
// https://www.osha.gov.tw/48110/48363/167999/168014/168017/184557/post
// https://www.cali.org.tw/Consumer1/Detail?sn=24 (covered traffic victims)
// https://www.cali.org.tw/Consumer1/Detail?sn=26 (covered costs and deductions)
// https://law.fsc.gov.tw/LawContent.aspx?id=GL003211&media=print (claim documents)

const NLIA_SERVICE = 'https://www.nlia.org.tw/office/div_car/car_04_line/保戶服務暨申訴中心/'

export const PREREQUISITE_INSURANCE_RESOURCES: RehabResource[] = [
  {
    id: 'national-occupational-accident-insurance',
    title: '職災保險：醫療、停工與失能給付',
    organization: '勞動部勞工保險局', kind: 'government', resourceType: 'scheme',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: ['stroke', 'sci', 'tbi', 'amputation'], diseaseSpecific: false,
    needs: ['benefits', 'medical', 'living'],
    summary: '因工作受傷或罹患職業病時，依不同條件申請職災醫療、傷病或失能給付。',
    benefits: '職災就醫有醫療給付；治療中不能工作且未取得原有薪資者，有傷病給付；治療後符合失能標準者，另審失能給付。三項分別申請及審查。',
    eligibility: [
      '傷病須與執行工作有關，並符合職災保險效力及職業傷病認定；中風、腦傷或脊髓損傷的病名不能直接證明職災。',
      '受僱於依法應強制納保的雇主，即使雇主漏報加保，仍有依法申請途徑；自營作業者等其他身分須符合其投保規定。',
      '傷病給付限因職業傷病不能工作、未取得原有薪資且仍在門診或住院治療者；失能給付另須治療後症狀固定並符合職災失能標準。',
    ],
    documents: [
      '職災就醫：職業傷病門診單或住院申請書、健保卡及身分證明；雇主未填發書單時，可向勞保局申請查明後發給。',
      '傷病給付：職災傷病給付申請書及收據、診斷書正本，以及出勤、請假、領薪和事故相關證明。',
      '失能給付：職災失能給付申請書及收據、合格醫療院所開具並逕寄勞保局的失能診斷書、逕寄證明及相關檢查；不是一般診斷書或身障證明即可替代。',
      '自墊醫療費核退另附診斷、費用收據與明細；上下班或公出交通事故另依表單提供事故陳述及相關證明。',
    ],
    application: '先洽投保單位或勞保局各地辦事處，按需要選擇醫療、傷病或失能表單辦理；職災認定或雇主未配合時，可請醫院職業醫學科或地方政府職災專業人員協助。',
    contact: { name: '勞保局職災給付諮詢及各地辦事處', phone: '02-2396-1266 分機 3666', url: 'https://www.bli.gov.tw/0106859.html' },
    status: 'ongoing', statusNote: '官方設有法定給付申請程序，依事故、保險身分及各項條件審查；常態辦理不代表個案會獲准。',
    applicationPeriod: '醫療核退、傷病及失能各有申請時效，應依事故與診斷日期分項確認，勿等其他補助結果才詢問。',
    source: { title: '勞保局：職災保險給付保障與各項申請問答', url: 'https://www.bli.gov.tw/0106859.html' },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '職災失能給付與普通勞保失能給付是不同制度；同一保險事故同時符合職災與其他社會保險給付條件時，依法擇一請領。',
      '醫療費核退限規定可給付的項目，同一費用已獲核付或另領補助時，須向承辦據實說明，不能重複申報已支應費用。',
      '不要單憑在工作場所發病或有身障證明，就當作已符合職災給付。',
    ],
  },
  {
    id: 'national-occupational-functional-rehabilitation',
    title: '職災職能復健：工作能力評估與復工計畫',
    organization: '勞動部職業安全衛生署', kind: 'government', resourceType: 'referral',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: ['stroke', 'sci', 'tbi', 'amputation'], diseaseSpecific: false,
    needs: ['benefits', 'therapy', 'employment'],
    summary: '職災後想回到工作，可向認可的職能復健專責醫院申請工作能力評估與復工協助。',
    benefits: '評估工作要求與身體能力，提供生理心理功能強化訓練、輔助設施及工作環境調整建議，並協助擬訂復工計畫。',
    eligibility: [
      '須為符合規範的職災勞工，具明確職災證明，且工作能力減損與該次職災有關。',
      '須有重返職場或工作適應的困難、意願及服務需要；由認可機構評估開案，不以病名或持身障證明直接核定。',
      '未參加職災保險的自營作業者或雇主，不屬本項收案對象；依法應加保卻未加保的受僱勞工，依規範取得職災證明後另行審查。',
    ],
    documents: [
      '職災證明，例如職業傷病門診單、住院申請書或勞保局職災給付證明；地方政府或重建中心轉介者依規範附職災證明。',
      '由認可機構提供的重建服務申請及同意文件；評估時整理原工作內容、目前工作困難與相關就醫資料。',
    ],
    application: '本人或雇主可從職安署最新認可名冊找專責醫院，聯絡職能復健窗口提出需求；也可由職業醫學科、地方政府職災專業人員或職災預防及重建中心轉介。',
    contact: { name: '認可職災職能復健專責醫院；重建中心轉介窗口', phone: '02-8522-9366 分機 805、807、813', url: 'https://www.osha.gov.tw/48110/48363/133471/133477/133521/' },
    status: 'ongoing', statusNote: '官方公布職能復健服務內容及115年9月更新的專責醫院名冊；實際開案須由機構評估。',
    source: { title: '職安署：認可職災職能復健專責醫院聯絡資訊', url: 'https://www.osha.gov.tw/48110/48363/133471/133477/133521/' },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '本項是職災後的工作能力與復工服務，不能當作一般健保復健或所有身障者的就業服務。',
      '機構取得的服務補助並非直接發給患者的現金；個人職能復健津貼另有完訓、申請與審核程序。',
      '職災身分尚未建立時，可先由職業醫學科或地方政府協助釐清，不能把未確認案件當作已開案。',
    ],
  },
  {
    id: 'national-labor-disability-benefit',
    title: '勞保失能給付：普通傷病造成永久失能',
    organization: '勞動部勞工保險局', kind: 'government', resourceType: 'scheme',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: 'all', diseaseSpecific: false,
    needs: ['benefits', 'living'],
    summary: '勞保被保險人因普通傷病留下永久失能，可依勞保失能標準申請一次金或年金審查。',
    benefits: '依保險資格、失能項目與工作能力等規定，核定失能一次金或失能年金；不是因領到身障證明就自動發放。',
    eligibility: [
      '須符合勞保保險事故及有效期間規定；退保後診斷失能者，另依同一傷病及退保延續保障規定審查。',
      '經治療後症狀固定，再治療仍不能期待改善，經規定的健保特約醫療院所診斷永久失能，並符合勞保失能給付標準。',
      '是否領一次金、年金或可選擇的給付，依失能狀態、工作能力及保險年資規定認定，不是每個人都能自由選擇。',
    ],
    documents: [
      '勞工保險失能給付申請書及給付收據，原則洽投保單位蓋章；符合退保或投保單位無法蓋章等例外者，依規定說明並自行申請。',
      '由規定醫療院所開具並逕寄勞保局的勞保失能診斷書，申請人附逕寄證明；有檢查者另附檢查報告與影像。',
      '神經失能診斷須由神經科、神經外科或復健科專科醫師出具；不同失能種類另有院所與專科要求。',
      '請領年金且有符合眷屬加發條件者，另附眷屬補助申請文件。',
    ],
    application: '先向勞保局或投保單位核對保險事故與請領種類，再洽符合規定的醫療院所開具失能診斷；備齊資料後郵寄或送勞保局申請。',
    contact: { name: '勞保局失能給付諮詢及各地辦事處', phone: '02-2396-1266', url: 'https://www.bli.gov.tw/0007873.html' },
    status: 'ongoing', statusNote: '官方有常態請領程序；由勞保局審查保險資格及失能程度，不保證核付。',
    applicationPeriod: '官方規定於醫院診斷永久失能之日起5年內提出；退保延續保障另有條件，應先核對。',
    source: { title: '勞保局：失能給付應備書件與申請程序', url: 'https://www.bli.gov.tw/0007873.html', publishedOn: '2024-02-19' },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '仍在治療、症狀尚未固定時，不應把一般診斷書當成永久失能認定。',
      '職業傷病適用職災保險的失能制度，不能把本項與職災失能當成同一事故可重複領取的兩份給付。',
      '部分終身無工作能力案件涉及逕予退保、與老年給付擇一或給付選擇核付後不得變更，送件前應向勞保局了解影響。',
    ],
  },
  {
    id: 'national-compulsory-auto-insurance-guidance',
    title: '強制汽車責任保險：理賠諮詢與申請指引',
    organization: '中華民國產物保險商業同業公會', kind: 'insurance', resourceType: 'referral',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: ['sci', 'tbi', 'amputation'], diseaseSpecific: false,
    needs: ['benefits', 'medical', 'transport', 'assistive', 'care'],
    summary: '車禍造成的人身傷害，可向承保公司申請強制險理賠；公會提供申請手續與爭議諮詢。',
    benefits: '公會說明汽車保險條款、理賠手續與理賠爭議；強制險的傷害醫療及失能給付須由承保公司依法審核。',
    eligibility: [
      '須為汽車交通事故造成的人身傷害，並符合乘客或車外第三人等受害人規定；脊髓損傷或腦傷本身不是理賠資格。',
      '單一車輛自撞、自摔時，駕駛本人不能以自己的強制險申請；有其他事故車輛時，依事故與承保關係判斷向哪家公司申請。',
      '傷害醫療依必要且合理的實際支出與法定項目核付；失能另須符合治療後固定、永久不能復原及強制險失能標準。',
    ],
    documents: [
      '公會一般諮詢可先整理想問的理賠問題；正式理賠文件交給承保公司，公會諮詢不等於已送件。',
      '正式申請醫療給付：承保公司理賠申請書、身分證明、警方事故處理或相關證明、醫師診斷及必要病歷、合格醫療院所收據、同意查閱病歷文件。',
      '申請失能給付另用符合規定層級院所或醫師開具的失能診斷、必要影像病歷及同意複檢文件；收款、代理或其他附件依承保公司正式表單辦理。',
    ],
    application: '先持警方事故資料找出事故車輛的承保公司，直接向該公司申請；有理賠手續或爭議問題可打公會0800-221-783。肇逃或未投保等情形，改依特別補償基金規定辦理。',
    contact: { name: '產險公會保戶服務暨申訴中心（提供諮詢，理賠向承保公司申請）', phone: '0800-221-783', url: NLIA_SERVICE },
    status: 'ongoing', statusNote: '公會官網列有理賠諮詢服務與電話；保險金由承保公司依事故和文件審核，公會不代為核付。',
    source: { title: '產險公會：保戶服務暨申訴中心的理賠諮詢服務', url: NLIA_SERVICE, publishedOn: '2019-04-24' },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '強制險不理賠修車、財物損失或精神慰撫金，不能把人身給付與所有車禍賠償混為一談。',
      '接送、看護及輔具等費用限法定醫療項目與條件，不是一般交通、長期照顧或任何輔具都可核付。',
      '同一事故不得向多家公司或特補基金重複請領同一強制險給付；已領理賠、補償及和解賠償應據實告知承辦。',
      '給付標準依事故發生日期適用；申請不須先取得對方同意或先和解，但仍須遵守事故通知及請求權時效。',
    ],
  },
  {
    id: 'national-motor-accident-compensation-fund',
    title: '車禍特別補償：肇逃、未投保等事故',
    organization: '財團法人汽車交通事故特別補償基金', kind: 'foundation', resourceType: 'scheme',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: ['sci', 'tbi', 'amputation'], diseaseSpecific: false,
    needs: ['benefits', 'medical', 'transport', 'assistive', 'care'],
    summary: '符合肇逃、未投保等法定情況的人身傷害，可透過受委託產險公司向特補基金申請。',
    benefits: '依法審查車禍傷害醫療及失能補償，項目範圍依強制險規定；已從賠償義務人取得的賠償須依規定扣除。',
    eligibility: [
      '須為符合強制險法律定義的汽車交通事故受害人，因事故車輛無法查究、未投保、未經被保險人同意使用，或屬無須投保車輛等法定原因，不能向保險公司請求給付。',
      '單一車輛駕駛人自行自撞、自摔，不因該車未投保就取得補償資格；事故全是無須投保車輛時，各車駕駛人另有不得請求規定。',
      '微型電動二輪車須符合曾投保但事故時未續保等規定；失能補償另須符合強制險失能標準。',
    ],
    documents: [
      '補償金申請書、身分證明、警方事故證明、診斷書及必要病歷、醫療收據、收款帳戶；失能案件另附規定失能診斷及必要檢查。',
      '依項目附病歷或複檢同意、未獲賠償聲明、特補基金收據暨行使代位權告知書及有利代位求償的證據。',
      '已取得法院判決、和解、調解或賠償時，附相關文件；委託他人辦理另附授權與代理人身分證明。',
    ],
    application: '打基金0800-565-678說明事故與車輛投保情形，再向受委託辦理強制險的產險公司總分支機構送件；可從基金官方各產險公司電話表找窗口。',
    contact: { name: '特別補償基金；受委託產險公司收件窗口', phone: '0800-565-678', url: 'https://www.mvacf.org.tw/Service/Application' },
    status: 'ongoing', statusNote: '官方公布常態補償程序與委託收件方式；是否補償仍須審查事故、受害人資格及已獲賠償情形。',
    source: { title: '汽車交通事故特別補償基金：申請須知與流程', url: 'https://www.mvacf.org.tw/Service/Application', publishedOn: '2026-07-01' },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '僅保障法定人身傷害，修車、財物損害或精神慰撫金不屬補償範圍。',
      '已獲加害人賠償或和解金須依規定扣除；已領補償後再取得賠償，可能須返還，不可隱匿。',
      '基金給付後會在補償範圍內向賠償義務人代位求償；申請人須依規定配合提供資料。',
      '同一事故不能把強制險與特補基金當作可重複核領的兩份給付；額度依事故日期適用，不是所有舊事故都用新標準。',
    ],
  },
]

export const PREREQUISITE_INSURANCE_GUIDES: Record<string, { help: string; who: string; firstStep: string }> = {
  'national-occupational-accident-insurance': {
    help: '工作造成的傷病，分項申請醫療、停工期間傷病或失能給付。',
    who: '符合職災保險規定、傷病與工作有關者；雇主漏報加保的受僱勞工也有法定申請途徑。',
    firstStep: '聯絡投保單位或勞保局02-2396-1266轉3666，先按需要核對醫療、傷病或失能表單。',
  },
  'national-occupational-functional-rehabilitation': {
    help: '評估工作能力、安排強化訓練，協助擬訂復工計畫。',
    who: '工作能力因職災受損、有職災證明，想重返工作且經認可機構評估需要服務的勞工。',
    firstStep: '從官方名冊聯絡職災職能復健專責醫院；找轉介窗口可打02-8522-9366轉805、807或813。',
  },
  'national-labor-disability-benefit': {
    help: '因普通傷病留下永久失能時，審核勞保失能一次金或年金。',
    who: '符合勞保保險資格、永久失能與勞保失能標準者；身障證明不能直接代替失能認定。',
    firstStep: '先洽勞保局或投保單位核對資格，再請符合規定的醫療院所開立勞保失能診斷。',
  },
  'national-compulsory-auto-insurance-guidance': {
    help: '說明強制車險人身理賠的申請手續，提供理賠爭議諮詢。',
    who: '因汽車交通事故受傷、需要理賠指引的本人與家屬；單一車輛駕駛自撞、自摔不適用自己的強制險。',
    firstStep: '向事故車輛承保公司申請理賠；不清楚手續可打公會0800-221-783，公會只提供諮詢。',
  },
  'national-motor-accident-compensation-fund': {
    help: '肇逃、未投保等法定事故，審核人身傷害的醫療與失能補償。',
    who: '因肇逃、事故車未投保等法定情況無法請領強制險的受害人；單純駕駛自撞、自摔不適用。',
    firstStep: '打0800-565-678核對事故適用情形，再向基金委託的產險公司總分支機構送件。',
  },
}
