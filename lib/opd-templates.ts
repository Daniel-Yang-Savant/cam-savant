import 'server-only'

export type OpdTemplateCategory =
  | '快速開始'
  | '部位檢查'
  | '常見病況'
  | '安全與功能'

export interface OpdTemplate {
  id: string
  title: string
  category: OpdTemplateCategory
  hint: string
  objective: string
  safety?: string
  sourceUrl: string
  reviewedAt: string
}

const REVIEWED_AT = '2026-09-01'

export const opdTemplates: OpdTemplate[] = [
  {
    id: 'universal-msk',
    title: '30 秒通用 MSK／神經血管檢查',
    category: '快速開始',
    hint: '先完成 side、inspection、palpation、ROM、strength、neurovascular 與 function，再加少量 targeted tests。',
    objective: `Vitals: ＿＿
Ambulates with/without ＿＿; gait: ＿＿
No gross deformity, erythema, warmth, or swelling over ＿＿
Focal tenderness at ＿＿
AROM/PROM: ＿＿; familiar pain: ＿＿
Strength: ＿＿/5
Sensation: ＿＿; DTR: ＿＿
Distal pulses: ＿＿; capillary refill: ＿＿ sec
Provocative tests: ＿＿
Function: ＿＿`,
    safety:
      '先排除重大外傷／變形、發熱紅腫關節、進行性神經缺損、神經血管受損，以及心肺或內臟症狀。未執行的檢查應記錄 not assessed，不要寫成 negative。',
    sourceUrl:
      'https://app.notion.com/p/1e5451a33b6680f2aed9e21dee02c47d',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'neck',
    title: '頸部 Neck',
    category: '部位檢查',
    hint: '先記 laterality、熟悉症狀是否被誘發，再選擇性加做 special tests。',
    objective: `Cervical posture/alignment: ＿＿
Visible swelling or deformity: absent / present ＿＿
Tenderness: ＿＿
Cervical flexion: ＿＿°
Cervical extension: ＿＿°
Cervical rotation R/L: ＿＿° / ＿＿°
Cervical lateral flexion R/L: ＿＿° / ＿＿°
Pain or symptom response during ROM: ＿＿
UE myotomes C5–T1: ＿＿/5
Sensation C5–T1: ＿＿
Biceps/brachioradialis/triceps DTR: ＿＿ and symmetric / asymmetric ＿＿
Spurling test: ＿＿
Distraction test: ＿＿
ULNT1: ＿＿
Hoffmann sign: ＿＿
Gait/tandem gait: ＿＿`,
    safety:
      '重大外傷或中線壓痛、發燒或免疫抑制、癌症或體重下降、進行性或雙側無力／麻木、新發步態或手部笨拙，以及括約肌或鞍區症狀需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/7765758a17ea466f8afe6828f4adc3e5',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'shoulder',
    title: '肩部 Shoulder',
    category: '部位檢查',
    hint: '先比較 AROM 與 PROM，再依主要假設選少量 provocative tests。',
    objective: `Shoulder contour and scapular motion: ＿＿
Erythema, warmth, swelling, or muscle wasting: absent / present ＿＿
Tenderness: ＿＿
Flexion AROM/PROM R/L: ＿＿ / ＿＿
Abduction AROM/PROM R/L: ＿＿ / ＿＿
External rotation AROM/PROM R/L: ＿＿ / ＿＿
Internal rotation functional level R/L: ＿＿ / ＿＿
Abduction strength: ＿＿/5
External rotation strength: ＿＿/5
Internal rotation strength: ＿＿/5
Painful arc: ＿＿
Hawkins-Kennedy test: ＿＿
Empty/full can test: ＿＿
ER lag/drop-arm test: ＿＿
Cross-body adduction test: ＿＿
Apprehension-relocation test: ＿＿
Distal neurovascular exam: intact / abnormal ＿＿`,
    safety:
      '外傷後變形或無法活動、發熱紅腫關節合併全身症狀、新發神經血管缺損，或肩痛合併心肺症狀需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/69037bb092824e6e8556ca1c010eff8e',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'elbow',
    title: '肘部 Elbow',
    category: '部位檢查',
    hint: '疼痛位置、ROM、阻力測試與 ulnar nerve／distal NV 一起記。',
    objective: `Elbow deformity, erythema, warmth, or effusion: absent / present ＿＿
Tenderness: ＿＿
Flexion R/L: ＿＿° / ＿＿°
Extension R/L: ＿＿° / ＿＿°
Pronation R/L: ＿＿° / ＿＿°
Supination R/L: ＿＿° / ＿＿°
Pain during ROM: ＿＿
Resisted wrist or finger extension: ＿＿
Resisted wrist flexion or pronation: ＿＿
Valgus stress/moving valgus test: ＿＿
Varus stress/PLRI test: ＿＿
Tinel sign at cubital tunnel: ＿＿
Distal motor, sensation, and pulses: intact / abnormal ＿＿`,
    safety:
      '開放性傷口／變形、發燒伴發熱紅腫關節、外傷後無法伸直、快速惡化的無力／麻木，或遠端灌流受損需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/9ee15c92c9324b16b1da5836e157e9f5',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'wrist',
    title: '腕部 Wrist',
    category: '部位檢查',
    hint: '外傷性腕痛先排除 fracture／instability，再做 tendon 或 nerve tests。',
    objective: `Wrist or hand deformity, erythema, or marked swelling: absent / present ＿＿
Tenderness: ＿＿
Anatomical snuffbox/scaphoid tubercle tenderness: ＿＿
Flexion R/L: ＿＿° / ＿＿°
Extension R/L: ＿＿° / ＿＿°
Radial deviation R/L: ＿＿° / ＿＿°
Ulnar deviation R/L: ＿＿° / ＿＿°
Pronation R/L: ＿＿° / ＿＿°
Supination R/L: ＿＿° / ＿＿°
Grip strength: ＿＿/5
Watson test: ＿＿
TFCC fovea/load test: ＿＿
Finkelstein/Eichhoff test: ＿＿
Phalen/Tinel/carpal compression test: ＿＿
Median, ulnar, and radial motor-sensory exam: intact / abnormal ＿＿
Distal perfusion: intact / abnormal ＿＿`,
    safety:
      '變形、開放性傷口、感染、腔室症候群徵象或神經血管缺損需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/c5cc9bd13d7c4dedb3b196d8b0867297',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'finger',
    title: '手指 Finger',
    category: '部位檢查',
    hint: '外傷時務必記 rotational alignment、tendon continuity 與 distal neurovascular status。',
    objective: `Examined hand/finger and side: ＿＿
Open wound, erythema, or gross deformity: absent / present ＿＿
Swelling or ecchymosis: ＿＿
Tenderness: ＿＿
Cascade and rotational alignment: ＿＿
MCP/PIP/DIP active and passive ROM: ＿＿
FDS tendon function: intact / abnormal ＿＿
FDP tendon function: intact / abnormal ＿＿
Extensor tendon function: intact / abnormal ＿＿
Collateral stress: ＿＿
Elson test: ＿＿
Thumb UCL stress: ＿＿
CMC grind test: ＿＿
A1 pulley tenderness or triggering: ＿＿
Distal sensation and capillary refill: intact / abnormal ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/7847eb386b634e668272b7d9a54d3ac0',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'upper-back',
    title: '胸椎／上背 Upper back',
    category: '部位檢查',
    hint: '先確認 vitals、cardiopulmonary／visceral symptoms 與 neurologic red flags。',
    objective: `Vitals: ＿＿
Thoracic posture/alignment: ＿＿
Rash, swelling, or deformity: absent / present ＿＿
Tenderness and location: ＿＿
Thoracic flexion: ＿＿
Thoracic extension: ＿＿
Thoracic rotation R/L: ＿＿ / ＿＿
Pain or symptom response during ROM: ＿＿
Rib/chest expansion: ＿＿
Scapular motion and resisted UE testing: ＿＿
LE strength, sensation, and reflexes: ＿＿
Gait: ＿＿
Cardiopulmonary screen: ＿＿`,
    safety:
      '胸痛、呼吸困難、低血氧、昏厥、撕裂樣疼痛、發燒、全身症狀伴新發皮疹、重大外傷／骨鬆、癌症／體重下降、夜間痛或新發脊髓徵象需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/76b24c4177bf4cffbe08f87399cadd56',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'low-back',
    title: '下背 Low back',
    category: '部位檢查',
    hint: '每次先完成 gait + L2–S1 neurologic screen；有風險時再記 red flags。',
    objective: `Gait: ＿＿
Lumbar posture/alignment: ＿＿
Skin change or deformity: absent / present ＿＿
Tenderness: ＿＿
Midline percussion tenderness: absent / present ＿＿
Lumbar flexion: ＿＿
Lumbar extension: ＿＿
Lumbar side-bend R/L: ＿＿ / ＿＿
Pain or symptom response during ROM: ＿＿
Centralization/peripheralization with repeated movement: ＿＿
L2 hip flexion strength: ＿＿/5
L3 knee extension strength: ＿＿/5
L4 ankle dorsiflexion strength: ＿＿/5
L5 great-toe extension strength: ＿＿/5
S1 plantarflexion strength: ＿＿/5
Sensation L2–S1: ＿＿
Patellar/Achilles DTR: ＿＿
SLR R/L: ＿＿° / ＿＿°
Crossed SLR: ＿＿
Slump test: ＿＿
Femoral stretch test: ＿＿
Distal pulses: ＿＿`,
    safety:
      '新發尿滯留／滿溢性失禁、糞失禁、鞍區麻木、嚴重或進行性雙側神經缺損需緊急評估；另依外傷、骨鬆／類固醇、發燒／免疫抑制、癌症／體重下降與全身症狀排除其他急症。',
    sourceUrl:
      'https://app.notion.com/p/dbaffe8975654b098e1fb24ba9830171',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'sij',
    title: '薦髂關節 SIJ',
    category: '部位檢查',
    hint: '以是否重現 familiar pain 紀錄 provocation cluster，並先排除 lumbar／hip source。',
    objective: `Gait and pelvic loading: ＿＿
Fortin area tenderness: ＿＿
Lumbar repeated movement response: ＿＿
Hip ROM/FADIR/FABER: ＿＿
SIJ distraction test with familiar pain: ＿＿
SIJ thigh-thrust test with familiar pain: ＿＿
SIJ compression test with familiar pain: ＿＿
SIJ sacral-thrust test with familiar pain: ＿＿
SIJ Gaenslen test with familiar pain: ＿＿
Positive familiar-pain provocation tests: ＿＿/5
Neurologic exam: intact / abnormal ＿＿
Distal neurovascular exam: intact / abnormal ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/b6c71ac7bc48444d8c66eadfd8f4df05',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'hip',
    title: '髖部 Hip',
    category: '部位檢查',
    hint: '先分辨 groin／lateral／posterior pain，再整合 gait、ROM、strength 與 targeted tests。',
    objective: `Gait: ＿＿
Trendelenburg sign: ＿＿
Deformity or erythema: absent / present ＿＿
Tenderness over groin, greater trochanter, ischial tuberosity, or posterior hip: ＿＿
Flexion AROM/PROM R/L: ＿＿ / ＿＿
Extension AROM/PROM R/L: ＿＿ / ＿＿
Internal rotation AROM/PROM R/L: ＿＿ / ＿＿
External rotation AROM/PROM R/L: ＿＿ / ＿＿
Abduction AROM/PROM R/L: ＿＿ / ＿＿
Pain or symptom response during ROM: ＿＿
Hip flexion strength: ＿＿/5
Hip abduction strength: ＿＿/5
Hip extension strength: ＿＿/5
Log-roll test: ＿＿
FADIR test: ＿＿
FABER test: ＿＿
Stinchfield test: ＿＿
Resisted abduction/external derotation: ＿＿
Lumbar screen: ＿＿
Distal neurologic and neurovascular screen: ＿＿`,
    safety:
      '外傷後無法負重、疑似隱匿或壓力性骨折、發燒或發熱紅腫關節、兒童跛行、夜間／全身症狀或神經血管缺損需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/16cc99dce5c94950a9e736923769af3a',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'knee',
    title: '膝部 Knee',
    category: '部位檢查',
    hint: '外傷時先記 effusion、extensor mechanism、weight bearing，再依 mechanism 做 ligament／meniscus tests。',
    objective: `Gait and alignment: ＿＿
Deformity, erythema, or warmth: absent / present ＿＿
Effusion: ＿＿
Bulge/patellar tap: ＿＿
Tenderness: ＿＿
Flexion R/L: ＿＿° / ＿＿°
Extension R/L: ＿＿° / ＿＿°
Pain or crepitus during ROM: ＿＿
Extensor mechanism: intact / abnormal ＿＿
Quadriceps/hamstring strength: ＿＿/5
Lachman test: ＿＿
Anterior drawer test: ＿＿
Posterior drawer/sag sign: ＿＿
Valgus stress at 0° and 30°: ＿＿
Varus stress at 0° and 30°: ＿＿
Joint-line tenderness: ＿＿
McMurray/Thessaly test: ＿＿
Patellar apprehension test: ＿＿
Distal neurovascular exam: intact / abnormal ＿＿`,
    safety:
      '疑似脫位或神經血管受損、發燒伴發熱紅腫關節、膝關節鎖住、伸膝機轉失效、疑似骨折而無法負重，或快速增加的緊繃積液需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/334c75ea161e49e0a0c655810785725a',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'ankle',
    title: '踝部 Ankle',
    category: '部位檢查',
    hint: '急性外傷先做 Ottawa sites、4-step weight bearing、Achilles 與 neurovascular check。',
    objective: `Gait and 4-step weight bearing: ＿＿
Deformity or open injury: absent / present ＿＿
Swelling or ecchymosis: ＿＿
Posterior distal 6 cm or tip of lateral malleolus tenderness: ＿＿
Posterior distal 6 cm or tip of medial malleolus tenderness: ＿＿
Navicular tenderness: ＿＿
Base of 5th metatarsal tenderness: ＿＿
ATFL/CFL tenderness: ＿＿
Syndesmosis tenderness: ＿＿
Achilles tenderness or gap: ＿＿
Dorsiflexion R/L: ＿＿° / ＿＿°
Plantarflexion R/L: ＿＿° / ＿＿°
Inversion R/L: ＿＿° / ＿＿°
Eversion R/L: ＿＿° / ＿＿°
Strength: ＿＿/5
Anterior drawer test: ＿＿
Talar tilt test: ＿＿
Squeeze/external-rotation stress test: ＿＿
Thompson test: ＿＿
Distal pulses, capillary refill, and sensation: intact / abnormal ＿＿`,
    safety:
      '變形、開放性傷口、神經血管缺損、腔室症候群徵象、疑似 Achilles rupture 或符合骨折條件需緊急評估。勿以 Homan sign 排除 DVT。',
    sourceUrl:
      'https://app.notion.com/p/213d6024be9a4a3a8d9afd1431617f63',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'trigger-point',
    title: '激痛點 Trigger point',
    category: '部位檢查',
    hint: '用可觀察的 findings 描述，不把單一觸診點直接等同確定診斷。',
    objective: `Posture: ＿＿
Regional AROM: ＿＿
Palpable taut band and location: ＿＿
Focal hypersensitive spot: ＿＿
Familiar local or referred pain reproduced by pressure: ＿＿
Referred pain location: ＿＿
Local twitch response: ＿＿
Regional strength: ＿＿
Regional sensation and reflexes: ＿＿
Joint/neural provocation screen: ＿＿
Erythema, warmth, swelling, or systemic signs: absent / present ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/5e43379089674e0c8506390d4e0309dc',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'tmj',
    title: '顳顎關節 TMJ／Orofacial',
    category: '部位檢查',
    hint: '依 DC/TMD 概念，重點是 examination 是否重現熟悉的顳顎／咀嚼肌疼痛。',
    objective: `Facial symmetry and occlusion: ＿＿
Maximum unassisted opening: ＿＿ mm
Maximum assisted opening: ＿＿ mm
Deviation or deflection: ＿＿
Protrusion: ＿＿ mm
Lateral excursion R/L: ＿＿ mm / ＿＿ mm
TMJ click on opening or closing: ＿＿
TMJ crepitus: ＿＿
TMJ palpation reproducing familiar pain: ＿＿
Masseter palpation reproducing familiar pain: ＿＿
Temporalis palpation reproducing familiar pain: ＿＿
Jaw opening or resisted movement response: ＿＿
Cervical screen: ＿＿
Cranial-nerve screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/254451a33b6680d2bf44e60f7a649272',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'headache',
    title: '頭痛與顱顏 Headache／Craniofacial',
    category: '安全與功能',
    hint: 'Headache 的 O 先完成 vitals、mental status、眼與 focal neurologic screen。',
    objective: `Vitals: ＿＿
General appearance: ＿＿
Mental status and orientation: ＿＿
Speech: ＿＿
Pupils and light response: ＿＿
Extraocular movements: ＿＿
Visual fields: ＿＿
Funduscopic exam: ＿＿
Facial symmetry: ＿＿
CN II–XII: ＿＿
Motor strength: ＿＿/5
Sensation: ＿＿
DTR: ＿＿
Coordination: ＿＿
Gait/tandem gait: ＿＿
Neck ROM: ＿＿
Meningismus: ＿＿
Temporal artery, scalp, sinus, or TMJ tenderness: ＿＿
Focal neurologic deficit: absent / present ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3ca451a33b6681558143eabf2e9e0203',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'chest-wall',
    title: '胸壁與肋骨 Chest wall／Rib',
    category: '安全與功能',
    hint: '在寫 musculoskeletal chest wall pain 前，先記 vitals 與必要的 cardiopulmonary screen。',
    objective: `Vitals: ＿＿
SpO₂: ＿＿% on ＿＿
Respiratory distress: absent / present ＿＿
Chest-wall symmetry: ＿＿
Rash, ecchymosis, or deformity: absent / present ＿＿
Focal tenderness: ＿＿
Familiar pain reproduced by palpation: ＿＿
Pain with deep inspiration, cough, or trunk rotation: ＿＿
Chest expansion: ＿＿
Breath sounds: ＿＿
Cardiac exam: ＿＿
Shoulder/thoracic ROM: ＿＿
Distal neurovascular exam: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3ca451a33b6681059c4ffb17f5ad2c0c',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'foot-heel',
    title: '足部與足跟 Foot／Heel',
    category: '部位檢查',
    hint: '站立與非負重都看；急性外傷先做 Ottawa midfoot／neurovascular screen。',
    objective: `Gait and weight bearing: ＿＿
Footwear: ＿＿
Foot alignment and arch: ＿＿
Ulcer, erythema, warmth, or gross swelling: absent / present ＿＿
Medial calcaneal tubercle/plantar fascia tenderness: ＿＿
Achilles tenderness: ＿＿
Navicular/base of 5th tenderness: ＿＿
Metatarsal-head tenderness: ＿＿
Ankle ROM: ＿＿
Hallux ROM: ＿＿
DF/PF/inversion/eversion strength: ＿＿/5
Toe flexion/extension strength: ＿＿/5
Windlass test: ＿＿
Calcaneal squeeze test: ＿＿
Thompson test: ＿＿
Mulder test: ＿＿
Tarsal-tunnel Tinel sign: ＿＿
DP/PT pulses and capillary refill: ＿＿
Sensation/monofilament: ＿＿`,
    safety:
      '開放性傷口／變形、神經血管缺損、快速擴散感染、發熱紅腫的神經病變足／疑似 Charcot、腔室症候群、無法負重伴骨折疑慮或疑似 Achilles rupture 需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/3ca451a33b6681f18815d9712c284a1c',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'calf-leg',
    title: '小腿 Calf／Leg',
    category: '安全與功能',
    hint: 'Calf pain 必須同時想 DVT、arterial insufficiency、compartment syndrome、radicular 與 local MSK causes。',
    objective: `Vitals: ＿＿
Gait: ＿＿
Calf or leg edema R/L: ＿＿
Erythema or warmth: ＿＿
Skin change: ＿＿
Circumference landmark: ＿＿ cm below tibial tuberosity
Calf circumference R/L: ＿＿ cm / ＿＿ cm
Tenderness: ＿＿
Compartments: soft / tense ＿＿
Pain with passive stretch: ＿＿
Knee and ankle ROM: ＿＿
Resisted testing: ＿＿
DP/PT pulses: ＿＿
Capillary refill: ＿＿ sec
Motor and sensation: ＿＿
Wells DVT score when indicated: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3ca451a33b6681ff989fc260eac0d5fe',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'gait-balance',
    title: '步態與平衡 Gait／Balance',
    category: '安全與功能',
    hint: '選一個可重複的 functional measure，比只寫 gait stable 更適合追蹤。',
    objective: `Sit-to-stand: ＿＿
Ambulation distance: ＿＿ m
Assistance level: ＿＿
Assistive device: ＿＿
Gait speed and cadence: ＿＿
Base of support: ＿＿
Step length and symmetry: ＿＿
Heel strike and toe-off: ＿＿
Trunk or pelvic deviation: ＿＿
Heel gait: ＿＿
Toe gait: ＿＿
Tandem gait: ＿＿
Romberg test: ＿＿
Timed Up and Go: ＿＿ sec
Five Times Sit-to-Stand: ＿＿ sec
Loss of balance: absent / present ＿＿
Turning: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3ca451a33b66818a9de6d055567ea7bb',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'cervical-radiculopathy',
    title: '頸神經根病變 Cervical radiculopathy',
    category: '常見病況',
    hint: '記錄測試是否重現或減輕病人的 familiar arm symptom，並完成 myelopathy screen。',
    objective: `Arm pain or paresthesia distribution: ＿＿
C5 shoulder abduction strength: ＿＿/5
C6 elbow flexion/wrist extension strength: ＿＿/5
C7 elbow extension strength: ＿＿/5
C8 finger flexion strength: ＿＿/5
T1 finger abduction strength: ＿＿/5
C5–T1 sensory examination: ＿＿
Biceps/brachioradialis/triceps DTR: ＿＿
Spurling test reproducing familiar arm symptom: ＿＿
Cervical distraction relieving arm symptom: ＿＿
ULNT1 reproducing familiar symptom with structural differentiation: ＿＿
Cervical rotation toward symptomatic side: ＿＿°
Shoulder-abduction relief sign: ＿＿
Myelopathy screen: negative / abnormal ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681efb133eb8903b94370',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'cervical-myelopathy',
    title: '頸髓病變篩檢 Degenerative cervical myelopathy',
    category: '安全與功能',
    hint: '整合手部精細動作、步態、反射與括約肌症狀；單一 Hoffmann sign 不能確診。',
    objective: `Hand intrinsic strength R/L: ＿＿/5 / ＿＿/5
Grip-release test in 10 seconds R/L: ＿＿ / ＿＿
Finger escape sign: ＿＿
Fine-motor task or buttoning/handwriting difficulty observed: ＿＿
Gait pattern: ＿＿
Tandem gait: ＿＿
Romberg test: ＿＿
Upper-extremity DTR: ＿＿
Patellar/Achilles DTR: ＿＿
Hoffmann sign R/L: ＿＿ / ＿＿
Trömner sign R/L: ＿＿ / ＿＿
Inverted supinator sign R/L: ＿＿ / ＿＿
Babinski sign R/L: ＿＿ / ＿＿
Ankle clonus R/L: ＿＿ / ＿＿
Sphincter or saddle symptoms: absent / present ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681178e62f0be7e5b5ac3',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'thoracic-outlet',
    title: '神經性胸廓出口 Neurogenic TOS',
    category: '常見病況',
    hint: '記錄是否重現熟悉症狀，並同步篩檢頸神經根與血管異常。',
    objective: `Posture and scapular position: ＿＿
Supraclavicular tenderness: ＿＿
Pectoralis-minor/coracoid tenderness: ＿＿
Tinel sign over supraclavicular plexus reproducing familiar symptom: ＿＿
Infraclavicular Tinel sign reproducing familiar symptom: ＿＿
EAST/Roos reproducing familiar symptom and duration: ＿＿
Symptoms with 90° abduction/external rotation: ＿＿
ULTT reproducing familiar symptom: ＿＿
Hand intrinsic strength and atrophy: ＿＿
Median, ulnar and radial sensory-motor screen: ＿＿
Cervical radiculopathy screen: ＿＿
Radial/ulnar pulses and limb color/temperature: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668161970ee49afb5ebd1f',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'adhesive-capsulitis',
    title: '五十肩 Adhesive capsulitis',
    category: '常見病況',
    hint: '比較主動與被動活動度，尤其外旋，並記錄 end feel 與代償。',
    objective: `Shoulder AROM flexion R/L: ＿＿° / ＿＿°
Shoulder PROM flexion R/L: ＿＿° / ＿＿°
Shoulder AROM abduction R/L: ＿＿° / ＿＿°
Shoulder PROM abduction R/L: ＿＿° / ＿＿°
External rotation at side PROM R/L: ＿＿° / ＿＿°
Internal rotation functional level R/L: ＿＿ / ＿＿
Pain at end range: ＿＿
End feel: ＿＿
Scapular substitution during elevation: ＿＿
Rotator-cuff strength within available ROM: ＿＿
Cervical and distal neurologic screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b66811fa984ec450a15e0d8',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'rotator-cuff',
    title: '旋轉肌袖 Rotator cuff',
    category: '常見病況',
    hint: '以 AROM／PROM、力量、lag signs 與 pain inhibition 的整體圖像判斷。',
    objective: `Active elevation R/L: ＿＿° / ＿＿°
Passive elevation R/L: ＿＿° / ＿＿°
Painful arc: ＿＿
Scaption/abduction strength R/L: ＿＿/5 / ＿＿/5
External-rotation strength R/L: ＿＿/5 / ＿＿/5
Internal-rotation strength R/L: ＿＿/5 / ＿＿/5
External-rotation lag sign: ＿＿
Drop-arm sign: ＿＿
Hornblower sign: ＿＿
Belly-press/bear-hug test: ＿＿
Pain inhibition versus true weakness: ＿＿
Distal neurologic screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668156a022ec069c8b72a5',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'lateral-epicondylalgia',
    title: '網球肘 Lateral epicondylalgia',
    category: '常見病況',
    hint: '確認熟悉的外側肘痛是否被阻力測試重現，並與 radial tunnel／cervical source 比較。',
    objective: `Lateral epicondyle/common extensor origin tenderness: ＿＿
Resisted wrist extension reproducing familiar pain: ＿＿
Resisted middle-finger extension reproducing familiar pain: ＿＿
Passive wrist flexion with elbow extension reproducing familiar pain: ＿＿
Grip strength with elbow flexed R/L: ＿＿ / ＿＿
Grip strength with elbow extended R/L: ＿＿ / ＿＿
Radial-tunnel tenderness distal to lateral epicondyle: ＿＿
Pain with resisted supination: ＿＿
C6–C7 motor, sensory and reflex screen: ＿＿
Cervical radiculopathy screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668136b5eae7caff555232',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'carpal-tunnel',
    title: '腕隧道症候群 Carpal tunnel',
    category: '常見病況',
    hint: '記錄症狀分布、thenar 功能與 provocative tests，並排除近端或其他神經來源。',
    objective: `Median-distribution sensory symptoms: ＿＿
Small-finger sparing: ＿＿
Thenar eminence sensory sparing: ＿＿
Thenar atrophy: absent / present ＿＿
Thumb abduction/opposition strength R/L: ＿＿/5 / ＿＿/5
Median-innervated fingertip sensation: ＿＿
Two-point discrimination: ＿＿ mm
Tinel sign at carpal tunnel: ＿＿
Phalen test and time to familiar symptom: ＿＿
Carpal-compression test and time to familiar symptom: ＿＿
Ulnar and radial nerve screen: ＿＿
Cervical radiculopathy/proximal median nerve screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668127bf19e370cc282304',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'de-quervain',
    title: '橈側腕痛 De Quervain',
    category: '常見病況',
    hint: '定位第一伸肌腱室，並與 CMC、intersection syndrome、scaphoid injury 比較。',
    objective: `Swelling over first dorsal compartment: ＿＿
Tenderness over radial styloid/first dorsal compartment: ＿＿
Pain with resisted thumb abduction: ＿＿
Pain with resisted thumb extension: ＿＿
Finkelstein test reproducing familiar pain: ＿＿
WHAT test reproducing familiar pain: ＿＿
Thumb CMC grind test: ＿＿
Tenderness proximal/dorsal to crossover region: ＿＿
Anatomical-snuffbox tenderness after trauma: ＿＿
Superficial radial-nerve sensory screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668123b828d0fa8ddd574e',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'trigger-finger',
    title: '板機指 Trigger finger',
    category: '常見病況',
    hint: '記錄受影響手指、A1 pulley、卡住程度、ROM 與 tendon continuity。',
    objective: `Affected digit and side: ＿＿
A1 pulley tenderness: ＿＿
Palpable flexor-tendon nodule: ＿＿
Crepitus during tendon excursion: ＿＿
Active triggering: absent / present ＿＿
Locking requiring passive correction: absent / present ＿＿
PIP flexion contracture: ＿＿°
Active MCP/PIP/DIP ROM: ＿＿
Passive MCP/PIP/DIP ROM: ＿＿
FDS/FDP tendon continuity: ＿＿
Digital sensation and capillary refill: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668182b238e66db17b44e0',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'lumbar-radiculopathy',
    title: '腰薦神經根病變 Lumbar radiculopathy',
    category: '常見病況',
    hint: '記錄熟悉的遠端症狀、L2–S1 神經學檢查、neural tension 與 cauda-equina screen。',
    objective: `Leg pain or paresthesia distribution: ＿＿
L2 hip flexion strength: ＿＿/5
L3 knee extension strength: ＿＿/5
L4 ankle dorsiflexion strength: ＿＿/5
L5 great-toe extension strength: ＿＿/5
S1 plantarflexion strength: ＿＿/5
L2–S1 sensory examination: ＿＿
Patellar/Achilles DTR: ＿＿
Heel walk/toe walk: ＿＿
SLR reproducing familiar distal symptom R/L: ＿＿° / ＿＿°
SLR structural differentiation: ＿＿
Crossed SLR: ＿＿
Slump test: ＿＿
Femoral nerve stretch test: ＿＿
Centralization/peripheralization: ＿＿
Cauda-equina screen: negative / abnormal ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668177a72ed9a00d573a5f',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'lumbar-stenosis',
    title: '腰椎狹窄 Lumbar spinal stenosis',
    category: '常見病況',
    hint: '量化站立／步行耐受與屈曲緩解，並比較神經性與血管性跛行。',
    objective: `Standing tolerance before familiar leg symptom: ＿＿ min
Walking distance before familiar leg symptom: ＿＿ m
Symptom distribution with standing/walking: ＿＿
Symptom relief with sitting: ＿＿
Symptom relief with lumbar flexion: ＿＿
Lumbar extension reproducing familiar leg symptom: ＿＿
Stooped posture or shopping-cart behavior observed: ＿＿
Gait: ＿＿
Heel/toe walk: ＿＿
L2–S1 strength: ＿＿
L2–S1 sensation: ＿＿
Patellar/Achilles DTR: ＿＿
Hip ROM and symptom response: ＿＿
DP/PT pulses: ＿＿
Vascular claudication/ABI screen: ＿＿`,
    safety:
      '快速進展的神經缺損、cauda-equina symptoms、急性肢體缺血或全身性紅旗需緊急進行其他評估。',
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b66814eb3a9c064389009a9',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'hip-oa',
    title: '髖關節退化 Hip osteoarthritis',
    category: '常見病況',
    hint: '量化 gait、sit-to-stand、髖旋轉與功能負重反應。',
    objective: `Gait and stance time: ＿＿
Sit-to-stand: ＿＿
Groin/anterior-thigh familiar pain: ＿＿
Hip flexion PROM R/L: ＿＿° / ＿＿°
Hip internal-rotation PROM R/L: ＿＿° / ＿＿°
Hip external-rotation PROM R/L: ＿＿° / ＿＿°
Pain during passive hip rotation: ＿＿
Log-roll test: ＿＿
Squat or functional loading response: ＿＿
Hip abduction strength R/L: ＿＿/5 / ＿＿/5
Leg-length discrepancy: ＿＿
Lumbar and knee comparison screen: ＿＿`,
    safety:
      '無法負重、外傷／骨鬆、發燒或發熱紅腫關節、夜間／全身性疼痛或活動度快速惡化需緊急評估。',
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681b7917fcc8d5f3da9a8',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'gtps',
    title: '大轉子疼痛 Greater trochanteric pain',
    category: '常見病況',
    hint: '確認 lateral-hip familiar pain，整合 palpation、resisted testing 與 single-leg loading。',
    objective: `Lateral-hip familiar pain location: ＿＿
Greater-trochanter/gluteal-tendon palpation reproducing familiar pain: ＿＿
Resisted hip abduction reproducing familiar pain: ＿＿
Hip abduction strength R/L: ＿＿/5 / ＿＿/5
Single-leg stance and time to familiar pain: ＿＿
Resisted external derotation test: ＿＿
Trendelenburg sign: ＿＿
Gait and pelvic drop: ＿＿
FADIR/FABER symptom location: ＿＿
Lumbar radiculopathy screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681989efbcfa274580fe0',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'knee-oa',
    title: '膝退化性關節炎 Knee osteoarthritis',
    category: '常見病況',
    hint: '除了 ROM 與壓痛，也量化步態、力量與 sit-to-stand／樓梯等功能。',
    objective: `Gait and assistive device: ＿＿
Varus/valgus alignment: ＿＿
Bony enlargement: ＿＿
Joint warmth: absent / present ＿＿
Effusion: ＿＿
Medial/lateral joint-line tenderness: ＿＿
Crepitus during active motion: ＿＿
Knee flexion R/L: ＿＿° / ＿＿°
Knee extension deficit R/L: ＿＿° / ＿＿°
Quadriceps strength R/L: ＿＿/5 / ＿＿/5
Five Times Sit-to-Stand: ＿＿ sec
Squat or stair response: ＿＿
Hip and distal neurovascular screen: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681e89ae8ea4d9a841445',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'patellofemoral-pain',
    title: '髕股疼痛 Patellofemoral pain',
    category: '常見病況',
    hint: '以 squat、stairs、step-down 與 prolonged sitting 重現熟悉症狀，並記錄動作品質。',
    objective: `Anterior/retropatellar pain location: ＿＿
Pain during squat: ＿＿
Pain during stair ascent/descent: ＿＿
Pain during step-down: ＿＿
Pain after prolonged sitting: ＿＿
Single-leg squat alignment and symptom response: ＿＿
Patellar mobility/tilt: ＿＿
Patellar apprehension: ＿＿
Quadriceps strength R/L: ＿＿/5 / ＿＿/5
Hip abduction/external-rotation strength R/L: ＿＿/5 / ＿＿/5
Hamstring/calf/rectus-femoris flexibility: ＿＿
Effusion or joint-line tenderness: absent / present ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b668180a91fce250736ea06',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'plantar-heel-pain',
    title: '足底筋膜痛 Plantar heel pain',
    category: '常見病況',
    hint: '記錄 first-step pain、壓痛、Windlass、踝背屈與神經血管狀態。',
    objective: `First-step or post-rest heel pain: ＿＿
Medial calcaneal tubercle tenderness: ＿＿
Tenderness along proximal plantar fascia: ＿＿
Windlass test reproducing familiar pain: ＿＿
Ankle dorsiflexion with knee extended R/L: ＿＿° / ＿＿°
Ankle dorsiflexion with knee flexed R/L: ＿＿° / ＿＿°
Foot posture and arch: ＿＿
Single-leg heel raise: ＿＿
Calcaneal squeeze test: ＿＿
Tarsal-tunnel Tinel sign: ＿＿
Protective sensation and pulses: ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b66813a81ddc704a5ed6b86',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'achilles-tendinopathy',
    title: '阿基里斯腱病變 Achilles tendinopathy',
    category: '常見病況',
    hint: '定位 insertion 距離，量化 heel raise，並排除 rupture。',
    objective: `Pain location from calcaneal insertion: ＿＿ cm
Tendon thickening or nodularity: ＿＿
Focal tendon tenderness: ＿＿
Pain with passive dorsiflexion/compression: ＿＿
Single-leg heel-raise repetitions R/L: ＿＿ / ＿＿
Heel-raise height and quality: ＿＿
Pain during single-leg heel raise: ＿＿
Hop response when safe: ＿＿
Royal London Hospital test: ＿＿
Arc sign: ＿＿
Ankle dorsiflexion R/L: ＿＿° / ＿＿°
Thompson test: ＿＿
Palpable tendon gap: absent / present ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681ac849fe065c0fef393',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'acute-monoarthritis',
    title: '急性單關節炎／痛風 Acute monoarthritis',
    category: '安全與功能',
    hint: '安全導向：急性紅腫關節需同時考慮 gout、CPPD、septic arthritis、cellulitis 與 trauma。',
    objective: `Vitals and systemic appearance: ＿＿
Affected joint and side: ＿＿
Erythema and warmth: ＿＿
Swelling or effusion: ＿＿
Active ROM: ＿＿
Passive ROM and pain: ＿＿
Weight bearing or functional use: ＿＿
Skin wound, ulcer, cellulitis, or recent procedure: ＿＿
Tophus at ear, olecranon, finger, toe or Achilles region: ＿＿
Other joint involvement: ＿＿
Distal neurovascular status: ＿＿`,
    safety:
      '不能只憑外觀將急性紅腫關節判定為痛風；敗血性關節炎或其他感染風險需依臨床情境緊急處理。',
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b6681cdb5a5d9639b344fc6',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'fibromyalgia',
    title: '纖維肌痛 Fibromyalgia',
    category: '常見病況',
    hint: '量化 WPI／SSS，同時記錄有無客觀 synovitis、atrophy 或 focal neurologic findings。',
    objective: `Generalized pain regions involved: ＿＿/5
Widespread Pain Index: ＿＿/19
Symptom Severity Scale: ＿＿/12
Duration of symptoms: ＿＿
Generalized pressure tenderness: ＿＿
Objective joint swelling or synovitis: absent / present ＿＿
Focal muscle atrophy: absent / present ＿＿
Strength with pain/effort limitation: ＿＿
Sensation and DTR: ＿＿
Gait and balance: ＿＿
Inflammatory, neurologic or systemic red flags: negative / abnormal ＿＿`,
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b66812096ace90945cf0789',
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'diabetic-neuropathy',
    title: '糖尿病周邊神經／足部風險',
    category: '安全與功能',
    hint: '整合 skin、deformity、protective sensation、vascular、footwear 與 gait。',
    objective: `Foot skin, fissure, callus, ulcer or infection R/L: ＿＿ / ＿＿
Nail and trophic change R/L: ＿＿ / ＿＿
Foot deformity or Charcot change R/L: ＿＿ / ＿＿
Semmes-Weinstein 10-g monofilament R/L: ＿＿ / ＿＿
128-Hz vibration at great toe R/L: ＿＿ / ＿＿
Pinprick or temperature sensation R/L: ＿＿ / ＿＿
Great-toe proprioception R/L: ＿＿ / ＿＿
Achilles reflex R/L: ＿＿ / ＿＿
Toe and ankle strength R/L: ＿＿/5 / ＿＿/5
DP/PT pulses R/L: ＿＿ / ＿＿
Capillary refill and foot temperature/color: ＿＿
Footwear and pressure points: ＿＿
Gait and balance: ＿＿`,
    safety:
      '潰瘍合併感染／缺血、發熱腫脹的神經病變足、壞疽或急性不對稱無力需緊急跨專業評估。',
    sourceUrl:
      'https://app.notion.com/p/3cd451a33b66819380b8ed49ea354312',
    reviewedAt: REVIEWED_AT,
  },
]
