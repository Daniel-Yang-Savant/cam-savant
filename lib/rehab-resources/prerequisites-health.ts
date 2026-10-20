import type { RehabResource } from './types'

// Read the official procedures on 2026-10-20; this is not a telephone check of
// hospital capacity or a determination of any visitor's eligibility.
// Disability procedure: https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050050
// NHI proof and disability proof are separate systems:
// https://www.nhi.gov.tw/ch/cp-13698-9d097-2957-1.html
// Non-covered charges remain separate from a copayment exemption:
// https://www.nhi.gov.tw/ch/cp-5173-4f8ce-2738-1.html
// PAC: the plan linked by the official programme page, sections 伍 and 陸,
// attachment 1-1 (pp. 13–15), attachment 1-3 (pp. 20–21), and section 拾.
// https://www.nhi.gov.tw/ch/dl-63796-28bf67a90b3b4880b3c86561c7ef7fbc-1.pdf
// The 115-year draft with an unfilled announcement date is not used here.
export const PREREQUISITE_HEALTH_RESOURCES: RehabResource[] = [
  {
    id: 'proof-disability-assessment',
    title: '身心障礙鑑定與證明申請',
    organization: '衛生福利部社會及家庭署', kind: 'government', resourceType: 'referral',
    regions: ['全國'], geographicBasis: 'household', diseases: 'all',
    needs: ['benefits', 'assistive', 'care', 'living', 'education', 'employment'],
    summary: '需要身障相關福利時，先向戶籍縣市公所申請鑑定，再由指定醫院與政府評估。',
    benefits: '經鑑定、審查及需求評估，符合規定者核發身心障礙證明，並連結適合的福利服務。',
    eligibility: [
      '須經指定醫療機構鑑定身體功能、結構、活動與社會參與限制，再由社政部門評估；病名或一般診斷書不能直接代替身障證明。',
      '向戶籍所在縣市的公所提出申請；戶籍與居住地不同時，應向承辦說明，以安排需求評估。',
      '核發證明後，生活補助、輔具、照顧等方案仍各有資格及申請程序，不會自動全部核准。',
    ],
    documents: [
      '身心障礙證明申請表、身分證正反面影本；未滿14歲者可用戶口名簿影本。',
      '最近3個月內的1吋半身照片3張；臨櫃申請依公所規定簽名或用印。',
      '委託代辦時另附委託書與受託人身分證明；由公所發給鑑定表後再至指定醫院辦理。',
    ],
    application: '先到戶籍縣市公所申請並領取鑑定表，依公所提供的指定醫院資訊掛號鑑定；完成醫療鑑定、衛生及社政審查與需求評估後，由縣市政府核發證明。符合線上申辦條件者也可從官方入口申請。',
    contact: {
      name: '戶籍縣市公所受理；社家署提供制度諮詢',
      phone: '02-2653-1776',
      url: 'https://www.gov.tw/News_Content_26_677435',
    },
    status: 'ongoing',
    statusNote: '官方列有常態申辦程序；證明須經鑑定與審查，社家署電話為制度諮詢，送件由公所受理。',
    applicationPeriod: '依申辦程序受理；鑑定醫院看診時間由院方安排。',
    source: {
      title: '我的E政府：身心障礙證明申請流程（資料來源：社家署）',
      url: 'https://www.gov.tw/News_Content_26_677435',
      publishedOn: '2025-05-27',
    },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '身心障礙證明與健保重大傷病證明不同，必須分別評估及申請。',
      '無法外出者可先向公所提出到宅鑑定或需求評估需求，仍須符合相關規定。',
    ],
  },
  {
    id: 'proof-nhi-major-illness',
    title: '健保重大傷病證明與部分負擔減免',
    organization: '衛生福利部中央健康保險署', kind: 'government', resourceType: 'scheme',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: 'all',
    needs: ['benefits', 'medical'],
    summary: '請診治醫師確認是否屬健保公告的重大傷病；符合者依規定申請證明或由醫院認定。',
    benefits: '有效期間內，因證明所載傷病或經醫師確認的相關治療就醫，可依健保規定免部分負擔。',
    eligibility: [
      '限健保保險對象，並須由特約醫院、診所醫師診斷屬公告重大傷病項目；不是所有中風、腦傷或身障者均需申請或一定核准。',
      '急性腦血管疾病急性發作後1個月內，由診治醫師認定後由醫院免部分負擔，無須另外向健保署申請證明。',
      '其他需申請證明的情形，由健保署依診斷及病歷資料審查；各病類有各自條件及證明效期。',
    ],
    documents: [
      '全民健康保險重大傷病證明申請書。',
      '特約醫院、診所開立30日內的診斷證明書，應包含國際疾病分類碼。',
      '身分證明文件正反面影本；14歲以下無身分證者可用戶口名簿。臨櫃申請攜帶健保卡。',
      '病歷摘要或檢查報告；特定病類依官方須知另附對應資料。',
    ],
    application: '先請診治醫師確認病類及是否需要申請證明。需申請者，可由本人、受託人或醫院備妥文件，以郵寄、臨櫃或由院所線上送至健保署分區業務組審查。',
    contact: {
      name: '診治醫師／健保署分區業務組（手機諮詢）',
      phone: '02-4128-678',
      url: 'https://www.nhi.gov.tw/ch/cp-6091-08ad9-2957-1.html',
    },
    status: 'ongoing',
    statusNote: '官方列有常態申請程序；是否符合重大傷病與免部分負擔範圍，須經醫師認定及健保規定審查。',
    applicationPeriod: '申請使用的診斷證明書須為開立30日內；個別重大傷病證明的效期依核定結果。',
    source: {
      title: '健保署：重大傷病證明申請須知及文件下載',
      url: 'https://www.nhi.gov.tw/ch/cp-6091-08ad9-2957-1.html',
    },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      '這是健保部分負擔減免，不是現金補助，也不代表掛號費、差額病房或健保不給付項目全部免費。',
      '重大傷病證明不能代替身心障礙證明；兩者資格與用途不同。',
    ],
  },
  {
    id: 'care-post-acute-pac',
    title: 'PAC 急性後期整合照護轉介',
    organization: '衛生福利部中央健康保險署', kind: 'government', resourceType: 'referral',
    regions: ['全國'], geographicBasis: 'hospital', diseases: ['stroke', 'tbi'],
    needs: ['benefits', 'therapy', 'care', 'medical'],
    summary: '中風或創傷性腦傷急性治療後，請住院醫療團隊及早評估是否符合 PAC 與轉介條件。',
    benefits: '由跨專業團隊安排有期限的整合照護與復健，依評估採住院、日間或居家模式。',
    eligibility: [
      '中風：原則限急性發作後1個月內、病況穩定，且具中度至中重度功能障礙（MRS 3–4）與積極復健潛能的住院病人；公告特定情形可延至40天內，由團隊認定。',
      '創傷性神經損傷：限18歲以上、發病60天內、病況穩定且有中度功能障礙（巴氏量表40–70分），並經住院團隊判定具積極復健潛能。',
      '創傷性神經損傷 PAC 排除脊髓損傷、長期呼吸器依賴、末期疾病、無法恢復的長期臥床、嚴重精神疾病、癌症仍需後續住院治療或其他多重創傷未穩定者。',
      '實際病類、時限、功能評估、參與意願及照護模式，須由參與計畫的醫療團隊判定；不是所有腦傷或所有疾病都適用。',
    ],
    documents: [
      '由住院醫療團隊完成病況、發病時間、功能及復健潛能評估，準備轉介與病歷資料。',
      '病人與家屬配合院方說明及收案流程；轉入醫院會再次評估，非自行下載表單即可取得服務。',
    ],
    application: '住院期間先問主治醫師、復健團隊或出院準備個管師：「是否符合 PAC？可以轉介哪家合作醫院？」由原院評估、協調轉介，承接團隊再確認收案及照護計畫。',
    contact: {
      name: '住院醫療／出院準備團隊；健保署提供制度諮詢',
      phone: '02-4128-678',
      url: 'https://www.nhi.gov.tw/ch/cp-5499-734a5-2898-1.html',
    },
    status: 'ongoing',
    statusNote: '官方有 PAC 計畫及特約團隊查詢；個案須由醫療團隊評估與轉介，不表示各院立即有床或收案名額。',
    applicationPeriod: '有發病及收案時間限制，應在急性期住院時及早詢問；期限依病類與團隊評估。',
    source: {
      title: '健保署：急性後期整合照護計畫及收案規定',
      url: 'https://www.nhi.gov.tw/ch/cp-5499-734a5-2898-1.html',
    },
    checkedAt: '2026-10-20', verification: 'official-page', reviewAfterDays: 90,
    cautions: [
      'PAC 是醫療照護計畫，不是直接發給患者的現金補助；健保部分負擔及自費項目仍須由院方說明。',
      '這筆僅列本查詢涵蓋且有正式收案依據的中風與創傷性腦傷；不可把脊髓損傷或兒童發展疾病一概套用。',
    ],
  },
]

export const PREREQUISITE_HEALTH_GUIDES: Record<string, { help: string; who: string; firstStep: string }> = {
  'proof-disability-assessment': {
    help: '申請身障鑑定與證明，作為多項身障福利的申請依據。各項補助仍要另外審查。',
    who: '需要評估身體功能、活動或生活參與限制的人；須經指定醫院鑑定，病名不能直接換成證明。',
    firstStep: '先向戶籍縣市公所申請、領鑑定表，再到指定醫院掛號鑑定。',
  },
  'proof-nhi-major-illness': {
    help: '符合健保重大傷病規定時，相關治療可免健保部分負擔。自費項目仍另計。',
    who: '醫師診斷符合公告重大傷病項目的健保病人。急性中風1個月內由醫院認定，免另申請證明。',
    firstStep: '先問診治醫師是否符合、是否需申請證明；需要申請時，可請醫院協助送健保署。',
  },
  'care-post-acute-pac': {
    help: '急性治療後，由團隊安排有期限的整合復健與照護。',
    who: '急性期後符合時限、功能及復健潛能條件的中風或18歲以上創傷性腦傷住院病人；不含脊髓損傷。',
    firstStep: '住院時問主治醫師或出院準備團隊：「是否符合 PAC？可轉哪家合作醫院？」',
  },
}
