import 'server-only'

export interface HemophiliaTemplate {
  id: string
  title: string
  hint: string
  objective: string
  plan: string
  safetyZh: string
  sources: Array<{ label: string; url: string }>
  reviewedAt: string
}

// Source verification date; this does not represent patient-specific review or
// approval by a hematologist. Complete only findings actually assessed.
const REVIEWED_AT = '2026-10-02'

const wfhAcute = {
  label: 'WFH 血友病指引第 3 版（2020）：第 7 章，特定部位出血',
  url: 'https://www1.wfh.org/publications/files/pdf-1871.pdf',
}
const wfhMsk = {
  label: 'WFH 血友病指引第 3 版（2020）：第 10 章，肌肉骨骼併發症',
  url: 'https://www1.wfh.org/publications/files/pdf-1874.pdf',
}
const wfhOutcomes = {
  label: 'WFH 血友病指引第 3 版（2020）：第 11 章，成效評估與 HJHS',
  url: 'https://www1.wfh.org/publications/files/pdf-1875.pdf',
}
const wfhComprehensive = {
  label: 'WFH 血友病指引第 3 版（2020）：第 2 章，整合照護與疼痛處理',
  url: 'https://www1.wfh.org/publications/files/pdf-1866.pdf',
}
const wfhExercise = {
  label: 'WFH：Exercises for People with Hemophilia（關節活動、肌力與平衡練習）',
  url: 'https://www1.wfh.org/publications/files/pdf-1302.pdf',
}
const masacEmergency = {
  label: 'NBDF MASAC 257（2019）：疑似出血與急診處置',
  url: 'https://www.bleeding.org/healthcare-professionals/guidelines-on-care/masac-documents/masac-document-257-guidelines-for-emergency-department-management-of-individuals-with-hemophilia-and-other-bleeding-disorders',
}
const masacEvaluation = {
  label: 'NBDF MASAC 275：附錄 A，血友病復健評估項目',
  url: 'https://www.bleeding.org/sites/default/files/document/files/Appendix-A-Evaluation-Components-PT-Management-MASAC-275.pdf',
}
const masacUltrasound = {
  label: 'NBDF MASAC 275（2023）：附錄 B，肌肉骨骼超音波的角色與限制',
  url: 'https://www.bleeding.org/sites/default/files/document/files/Appendix-B-MSKUS-PT-Management-MASAC-275.pdf',
}
const masacJoint = {
  label: 'NBDF MASAC 275（2023）：附錄 D，關節出血分期復健',
  url: 'https://www.bleeding.org/sites/default/files/document/files/Appendix-D-Joint-Bleeds-PT-Management.pdf',
}
const masacMuscle = {
  label: 'NBDF MASAC 275（2023）：附錄 E，肌肉出血分期復健',
  url: 'https://www.bleeding.org/sites/default/files/document/files/Appendix-E-Muscle-Bleed-PT-Management.pdf',
}

// Evidence mapping:
// - WFH 7.1/7.2 and MASAC 257: treat suspected bleeding promptly; diagnostic
//   studies and consultation must not delay the established emergency plan.
// - WFH 10.4: muscle bleeds, neurovascular/iliopsoas precautions and rehabilitation.
// - MASAC 275 appendices A/D/E: selected examination and symptom-led progression.
// - WFH 10.3/11: chronic arthropathy rehabilitation and optional joint-health scores.
// - MASAC 275 appendix B: ultrasound complements clinical assessment and depends
//   on operator skill. The negative-scan caution below is a conservative clinical
//   synthesis with MASAC 257, not a claim that ultrasound cannot detect a bleed.
// - WFH 7.2 and MASAC 257: invasive procedures require a hemostatic plan; applying
//   this to needling/injections is a precaution, not an endorsement of efficacy.
// - Plan activity examples rechecked 2026-10-02: MASAC 275 appendix E supports
//   opposite-limb ROM for acute lower-limb muscle bleeds excluding iliopsoas;
//   D/E support graded ROM,
//   strengthening and functional recovery. WFH 2.3 supports walking, cycling
//   and swimming. Keep five actionable lines; detailed cautions stay in safetyZh.
export const hemophiliaTemplates: HemophiliaTemplate[] = [
  {
    id: 'hemophilia-acute-bleed',
    title: '疑似急性關節／肌肉出血',
    hint: '新發腫痛、活動減少或疑似再出血時使用；優先記錄出血風險與神經血管狀態。',
    objective: `Record review: hemophilia type/severity ____; baseline factor activity/date ____
Inhibitor status, latest result/date, and source record: ____
Current factor/non-factor prophylaxis ____; last documented administration ____; emergency plan available ____
Affected joint/muscle and side ____; documented previous target joints/bleeds ____
Vitals: BP ____; HR ____; temperature ____
Inspection: swelling ____; bruising ____; erythema/warmth ____; comparison with baseline ____
Gentle palpation: tenderness ____; muscle tension ____; examination limits ____
Observed resting position/spontaneous movement ____; pain behavior ____; no forced ROM or resisted testing
Distal sensation ____; observed motor function ____; pulses ____; capillary refill ____
Observed limb use/transfers ____; weight-bearing assessment performed or deferred/reason ____
Relevant laboratory records, dates, and assay methods if available: ____
Imaging already available: modality/site/date ____; findings ____; limitations ____`,
    plan: `1. Hemostasis: Activate the existing emergency hemostatic plan and contact HTC urgently without waiting for imaging; suspend loading of the affected region.
2. Daily Activity: Assist self-care and transfers within HTC restrictions; protect the affected limb. For suspected iliopsoas bleeding, avoid walking/crutch training pending specialist assessment.
3. Exercise: For an isolated lower-limb muscle bleed (not iliopsoas), HTC may allow pain-free opposite-limb ROM without moving/loading the bleeding region.
4. Restart Criteria: Only after bleeding control, pain relief, and HTC clearance, begin gentle affected-limb AROM/AAROM; defer resistance and forced stretching.
5. Review: Stop activity for increasing pain/swelling; seek emergency care for severe worsening pain, tense swelling, weakness/numbness, or impaired circulation. Urgent HTC reassessment/contact: ____.`,
    safetyZh:
      '疑似出血應立即依既有急救止血計畫處理並聯絡血液科／血友病中心，不能等影像或會診；emicizumab 預防治療不能取代急性止血。陰性超音波不能單獨排除出血。劇痛惡化、緊繃腫脹、麻木無力、末梢循環異常、頭頸部症狀或發燒合併熱腫關節須緊急評估。疑似髂腰肌出血不做一般拐杖步行；未出血肢體活動也不得牽動患部。急性期避免強拉、深層按摩及熱療；避免 aspirin／非選擇性 NSAIDs，針刺／注射／抽吸須先有止血計畫。未檢查項目填 not assessed。',
    sources: [wfhAcute, wfhMsk, masacEmergency, masacEvaluation, masacUltrasound, masacMuscle],
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'hemophilia-recovery',
    title: '出血控制後的復健恢復期',
    hint: '供已接受止血處理、經團隊評估可恢復活動者使用；依症狀與原有功能逐步進展。',
    objective: `Record review: hemophilia type/severity ____; inhibitor status/result date ____
Recent bleed: site/side ____; treatment dates ____; documented evidence of bleeding control ____
Current factor/non-factor prophylaxis ____; last administration ____; HTC rehabilitation coverage/restrictions ____
Pre-bleed ROM, strength, gait, and functional baseline from available records: ____
Inspection: swelling/warmth ____; bruising ____; change from prior assessment ____
Measured girth if appropriate: landmark ____; affected/comparison side ____ cm
Gentle AROM within permitted limits: joint/movement ____; degrees ____; symptom response ____
Gentle PROM/muscle length only if appropriate: ____; deferred components/reasons ____
Submaximal strength assessment if safe: method/muscle ____; result ____; symptom response ____
Distal sensation ____; motor function ____; perfusion ____
Observed transfers/gait with prescribed aid and loading limits ____; selected functional task/result ____
Relevant imaging/laboratory review ____; optional HJHS by trained assessor when appropriate, score/date ____ or not assessed`,
    plan: `1. ROM: Confirm bleeding control and HTC clearance/hemostatic coverage; once acute pain subsides, begin gentle pain-free AROM/AAROM of affected joints.
2. Strengthening: Start submaximal isometric contractions; progress to light resistance-band exercises only as tolerated without recurrent pain/swelling.
3. Walking: Progress weight bearing and gait with prescribed aids toward pre-bleed function; wean aids as control improves. Iliopsoas bleeding requires a separate specialist plan.
4. Balance / Function: Once pain-free weight bearing is cleared, practice supported standing balance, weight shifts, and daily tasks without recurrent pain/swelling.
5. Home / Review: Individualize exercise repetitions and frequency; stop for new pain, warmth, swelling, or loss of function and contact HTC urgently. Follow-up: ____.`,
    safetyZh:
      '開始與進階復健前先確認出血已控制，並與血液科／血友病中心約定止血保護與活動限制；不以固定天數自動放行。新發腫熱、疼痛或功能退步應停止運動並重新評估出血。髂腰肌出血另需專屬計畫；侵入性處置必須先有止血計畫。',
    sources: [wfhAcute, wfhMsk, wfhOutcomes, wfhExercise, masacJoint, masacMuscle, masacEmergency, masacUltrasound],
    reviewedAt: REVIEWED_AT,
  },
  {
    id: 'hemophilia-arthropathy',
    title: '穩定期血友病關節病變',
    hint: '適用慢性關節病變的功能評估與長期復健；若出現急性變化，先重新評估出血。',
    objective: `Record review: hemophilia type/severity ____; inhibitor status/result date ____
Current factor/non-factor prophylaxis ____; last administration ____; HTC activity/hemostatic plan ____
Documented target joints, recent bleed frequency/sites, prior surgery, and imaging dates: ____
Affected joints/sides ____; alignment/deformity ____; muscle atrophy ____
Inspection/palpation: swelling ____; warmth ____; tenderness ____; comparison with usual baseline ____
Measured AROM/PROM by joint and movement ____ degrees; contracture ____; symptom response ____
Strength assessment: muscle/method ____; measured result ____; limitations ____
Gait/assistive device ____; observed transfers/stairs or other selected functional task ____
Balance/proprioception test if safe: method ____; result ____
Distal sensation ____; motor function ____; perfusion ____
Optional HJHS by trained assessor: joints assessed ____; score/date ____ or not assessed
Relevant radiograph/ultrasound/MRI findings and dates ____; change from prior objective assessment ____`,
    plan: `1. Aerobic Activity: Confirm no suspected bleeding and HTC hemostatic coverage; choose low-impact walking, stationary cycling, or swimming and gradually increase duration as tolerated.
2. Strengthening: Use light resistance bands for affected limb muscles; progress resistance gradually without provoking joint pain/swelling.
3. ROM: Practice gentle active joint flexion/extension and comfortable muscle stretching; avoid forcing a fixed contracture.
4. Balance / Function: Practice supported standing balance, weight shifts, and gait; adapt footwear, orthoses, or walking aids to joint function.
5. Home / Review: Individualize exercise duration, repetitions, and frequency; for new pain, warmth, swelling, or loss of function, stop loading and contact HTC urgently. Follow-up: ____.`,
    safetyZh:
      '穩定期也可能發生新的出血，不能將突然腫熱、劇痛或功能下降一律視為慢性退化。運動強度需配合個別止血保護，不強行拉開固定攣縮；HJHS 為可選的標準化評估，不預填正常值。針刺、注射與抽吸等處置須先有專科評估及止血計畫。',
    sources: [wfhMsk, wfhOutcomes, wfhComprehensive, wfhExercise, masacEvaluation, masacJoint, masacEmergency, masacUltrasound],
    reviewedAt: REVIEWED_AT,
  },
]
