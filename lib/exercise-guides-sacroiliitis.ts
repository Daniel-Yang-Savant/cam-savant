import type { ExerciseGuideModule } from './exercise-guides'

export const SACROILIITIS_EXERCISE_GUIDE: ExerciseGuideModule = {
  id: 'chronic-sacroiliitis-gentle-exercise',
  kind: 'condition',
  evidenceKind: 'education',
  reviewStatus: 'approved',
  approvalDate: '2026-09-24',
  publishedDate: '2026-09-24',
  modifiedDate: '2026-09-24',
  selectionLabel: '慢性薦髂關節炎',
  bodyRegion: '脊椎與軀幹',
  searchAliases: [
    '薦髂關節炎', '薦髂關節', '骶髂關節炎', '薦髂疼痛', '骨盆後側痛',
    '臀部痛', 'sacroiliitis', 'SI joint', '中軸型脊椎關節炎', 'axSpA', '僵直性脊椎炎',
  ],
  theme: 'teal',
  eyebrow: '指引與衛教資料整理・溫和起步',
  title: '慢性薦髂關節炎：4 個溫和運動起步選項',
  summary: '已確認診斷、症狀穩定且經專業人員評估後，可從舒服的呼吸、小幅骨盆傾斜、低幅雙腳橋式與平地步行開始。依反應選做，不必一次完成四項；若與中軸型脊椎關節炎有關，運動須配合原本的發炎治療。',
  images: [
    {
      src: '/images/exercise-guides/chronic-sacroiliitis-gentle-exercise.webp',
      alt: '左上為仰躺屈膝放鬆呼吸，右上為雙腳踩地的小幅骨盆傾斜，左下為低幅雙腳橋式，右下為平地短步幅步行',
      step: '4 個起步選項',
      caption: '先確認姿勢舒服，再小幅活動與出力；四項可分開選做，並非必須逐階完成。',
      width: 1254,
      height: 1254,
    },
  ],
  steps: [
    {
      title: '仰躺屈膝，放鬆呼吸',
      instruction: '躺在穩定墊面，頭頸用薄枕支撐到舒服位置，雙膝彎曲、雙腳踩穩。雙手輕放下胸或腹部，緩緩吸氣與吐氣，不刻意吸到最滿，也不憋氣。這是進入活動前的準備，不是矯正關節。',
      dosage: '先做 3–5 個舒服的呼吸；若平躺不舒服，可改成有靠背的坐姿。',
    },
    {
      title: '小幅骨盆傾斜',
      instruction: '維持仰躺屈膝、雙腳踩地。吐氣時輕收下腹，讓下背輕靠墊面，再放鬆回到舒服的位置。臀部留在墊上，不用力壓背、不抬臀，也不大幅拱腰。',
      dosage: '先做 5 次，每次輕收腹約 3–5 秒，期間維持呼吸；有痛就縮小幅度或略過。',
    },
    {
      title: '低幅雙腳橋式',
      instruction: '雙腳與髖同寬、平均踩穩，手臂放在身旁。輕收腹與臀部，把臀部抬離墊面少許，再慢慢放下。骨盆不歪斜，不用追求抬高或把腰拱起；先由治療師確認適合這個動作。',
      dosage: '先做 3–5 次，抬起約 2–3 秒後放下；抬臀誘發薦髂疼痛時就停止這項。',
    },
    {
      title: '平地短時間步行',
      instruction: '在平坦、沒有障礙物的路面，以舒服的小步幅慢走，保持自然呼吸。先以走完仍舒服為目標，不為完成時間而忍痛；需要輔具者依原本指示使用。',
      dosage: '可先試 3–5 分鐘，必要時分段或更短；若出現疼痛增加或跛行，先停下休息。',
    },
  ],
  suitableFor: '適合已由醫師評估、症狀相對穩定，並由醫療或復健專業人員確認可以開始這些動作的慢性薦髂關節炎成人。薦髂關節附近的痛也可能來自機械性負荷或其他疾病，不能只靠痛的位置自行診斷。尚未確診、近期外傷、疑似感染或骨折、疼痛快速惡化者，應先就醫；術後、懷孕或產後骨盆痛、已知脊椎融合或骨質疏鬆者需另行個別評估。',
  dosage: '以上次數與時間是本頁保守的衛教起步示例，不是針對慢性薦髂關節炎驗證過的固定處方。先選舒服的項目各做 1 組，依當天及隔天反應，與治療師決定頻率；只有在症狀穩定時才逐步增加一項的次數或時間，不同時加量、加幅度與加阻力。',
  cue: '呼吸自然、雙腳穩定、小幅慢做；不用扭腰、強拉或用力把骨盆「喬回去」。動作不應讓原本的疼痛明顯增加。',
  regression: '橋式不舒服就略過，不必為了完成四項勉強抬臀；骨盆傾斜可減少幅度與次數，平躺不舒服改坐姿呼吸，步行改更短的分段。症狀發作時減少負荷、保留能耐受的溫和活動，若仍惡化則停止該動作並聯絡醫療團隊。',
  followUpLabel: '哪些變化需要回診',
  followUp: '若晨間僵硬或夜間背臀痛比平常明顯增加、反覆發作，或步行與日常活動持續受限，請由原醫療團隊重新評估發炎與運動負荷，不以增加伸展或忍痛運動取代回診。已知中軸型脊椎關節炎者，持續原本的風濕科追蹤與治療。',
  signals: {
    green: '呼吸自然，動作可控制，沒有疼痛增加或跛行；運動後與隔天的日常活動維持原本狀態。',
    yellow: '運動中或隔天比平常更痛、更僵，或橋式讓骨盆歪斜：停止誘發不適的動作，下次減少幅度、次數或時間；若反覆發生，請治療師調整。這是觀察提醒，不是疾病活動度判定標準。',
    red: '出現尖銳痛或新麻木、無力時，停止並儘速接受評估。發燒、畏寒合併明顯背臀痛，或疼痛突然劇烈、快速惡化，應儘速就醫；會陰麻木、排尿困難或大小便控制異常、雙腿新發麻木或無力，應立即急診。',
  },
  evidence: 'ASAS–EULAR 指引與台灣風濕病醫學會共識支持中軸型脊椎關節炎患者規律、個別化運動及物理治療；台灣共識包含呼吸訓練與平地步行。NASS 患者手冊提供骨盆傾斜示範；橋式參考 AAOS 一般脊柱訓練並降低幅度。這四項組合及本頁起步量未經慢性薦髂關節炎專屬試驗驗證，不能宣稱可消除發炎或讓關節復位。一般脊柱訓練與機械性薦髂關節疼痛的結果，也不能直接當成發炎性薦髂關節炎的療效證據。',
  audience: '以經評估、病況穩定的成人為限；中軸型脊椎關節炎相關建議不能直接套用到感染性薦髂關節炎、急性外傷、骨折或所有不明原因臀部痛。動作需依個人狀況選擇。',
  sources: [
    {
      label: 'Ramiro S, Nikiphorou E, Sepriano A, et al. ASAS-EULAR recommendations for the management of axial spondyloarthritis: 2022 update. Ann Rheum Dis. 2023;82:19–34. doi:10.1136/ard-2022-223296.',
      href: 'https://doi.org/10.1136/ard-2022-223296',
    },
    {
      label: 'Wei JC-C, Liu C-H, Tseng J-C, et al. Taiwan Rheumatology Association consensus recommendations for the management of axial spondyloarthritis. Int J Rheum Dis. 2020;23(1):7–23. doi:10.1111/1756-185X.13752.',
      href: 'https://pubmed.ncbi.nlm.nih.gov/31777200/',
    },
    {
      label: 'NASS. Guidebook: Answers and practical advice — Axial Spondyloarthritis / Ankylosing Spondylitis. 2018. 骨盆傾斜見印刷頁 18–19。',
      href: 'https://nass.co.uk/wp-content/uploads/resources/81955-NASS-Guidebook-for-Patients.pdf',
    },
    {
      label: 'AAOS OrthoInfo. Spine Conditioning Program. Daniel K. Park, MD；同儕審閱 Thomas Ward Throckmorton, MD。第 9 項 Hip Bridge（一般脊柱訓練）。',
      href: 'https://www.orthoinfo.org/recovery/spine-conditioning-program/',
    },
    {
      label: 'NASS. Exercising during a flare. 2022-05-11（症狀發作時的運動調整）。',
      href: 'https://nass.co.uk/wp-content/uploads/2022/05/Exercising-during-a-flare.pdf',
    },
    {
      label: 'NHS. Back pain. 最後審閱 2026-03-05（運動停止與就醫警訊）。',
      href: 'https://www.nhs.uk/conditions/back-pain/',
    },
    {
      label: 'Mayo Clinic Staff. Sacroiliitis — Symptoms and causes. 2026-08-11（薦髂關節炎的不同成因）。',
      href: 'https://www.mayoclinic.org/diseases-conditions/sacroiliitis/symptoms-causes/syc-20350747',
    },
  ],
}
