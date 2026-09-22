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
const REVIEWED_AT = '2026-09-22'

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
    plan: `If bleeding is suspected, contact hematology/hemophilia treatment center (HTC) urgently and activate the existing emergency hemostatic plan without waiting for consultation, laboratory tests, or imaging.
Confirm hemostatic treatment with the emergency/hematology team according to hemophilia type, inhibitors, current therapy, and prior response; emicizumab prophylaxis does not treat an acute bleed.
Arrange emergency assessment for escalating severe pain, tense swelling, sensory/motor loss, impaired perfusion, head/neck symptoms, or suspected iliopsoas bleeding with groin/back pain or femoral nerve signs.
If fever, a hot joint, major trauma, or poor treatment response is present, urgently evaluate infection, fracture, persistent bleeding, and inhibitors.
Protect/rest the affected region and suspend rehabilitation/loading; for suspected iliopsoas bleeding avoid walking or crutch training pending specialist assessment.
Consider protected cold packs and comfortable elevation for symptom relief; avoid compression when neurovascular compromise is suspected. These measures do not replace hemostatic treatment.
Defer forceful ROM, resisted strength tests, stretching, deep massage, and heat over the suspected bleed.
If imaging is indicated, use it as an adjunct; a negative ultrasound alone or an initially unremarkable examination must not exclude a clinically suspected bleed.
Defer needling, injections, aspiration, or other invasive procedures unless specifically indicated with an agreed hemostatic plan; coordinate analgesia and avoid aspirin/non-selective NSAIDs.
Arrange urgent serial reassessment with HTC: pain/swelling, neurovascular findings, and response to hemostasis; timing/contact ____; begin rehabilitation only after bleeding control and appropriate clinical reassessment.`,
    safetyZh:
      '疑似出血應立即依既有急救止血計畫處理並聯絡血液科／血友病中心，不能等影像或會診。陰性超音波不能單獨排除出血。劇痛惡化、緊繃腫脹、麻木無力、末梢循環異常，或鼠蹊／腰背痛合併股神經症狀須緊急評估；疑似髂腰肌出血不套用一般拐杖步行訓練。未檢查項目填 not assessed。',
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
    plan: `Confirm bleeding control and rehabilitation readiness with hematology/HTC; agree appropriate hemostatic coverage, session timing, and restrictions before exercising the affected region.
If bleeding remains suspected or new pain, warmth, swelling, or loss of function develops, stop exercise and seek urgent HTC reassessment; do not wait for imaging to activate the emergency plan.
When cleared and acute pain has subsided, introduce gentle pain-free AROM; use assisted movement only within the individually permitted range.
For a recovering muscle bleed, progress muscle length gently and add submaximal isometrics as tolerated; avoid forced stretching, ballistic loading, and painful resistance.
Progress loading and gait with suitable aids only as symptoms and control permit; iliopsoas rehabilitation requires a separate specialist plan.
Add graded strengthening, balance/proprioception, and functional tasks after earlier activities are tolerated without recurrent bleeding signs.
Set a home program with individualized exercise, repetitions, frequency, and stop rules: ____; aim for the patient's pre-bleed function and reassess before return to sport/work demands.
Defer needling, injections, aspiration, or other invasive procedures without a specific indication and agreed hemostatic plan; review analgesia with the treating team and avoid aspirin/non-selective NSAIDs.
Arrange emergency assessment for severe progressive pain, tense swelling, new sensory/motor loss, impaired perfusion, head/neck symptoms, or fever with an acutely hot joint.
Review on ____ with HTC/rehabilitation; reassess swelling, safe ROM/strength, gait, and function; consider imaging for persistent or recurrent symptoms, without using negative ultrasound alone to exclude bleeding.`,
    safetyZh:
      '開始與進階復健前先確認出血已控制，並與血液科／血友病中心約定止血保護與活動限制；不以固定天數自動放行。新發腫熱、疼痛或功能退步應停止運動並重新評估出血。髂腰肌出血另需專屬計畫；侵入性處置必須先有止血計畫。',
    sources: [wfhAcute, wfhMsk, wfhOutcomes, masacJoint, masacMuscle, masacEmergency, masacUltrasound],
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
    plan: `Confirm a stable clinical state; if new pain, warmth, swelling, or functional loss suggests bleeding, stop loading and contact hematology/HTC urgently using the emergency plan without waiting for imaging.
Coordinate prophylaxis/hemostatic coverage and activity risk with hematology/HTC; individualize intensity for inhibitor status, current therapy, joint damage, and response.
Prescribe graded low-impact aerobic activity and strengthening within tolerated limits; exercise, intensity, frequency, and goals: ____.
Use gentle mobility and muscle-length work within available motion; avoid forcing a fixed contracture or provoking pain/swelling.
Include balance/proprioception, gait, and task-specific training; adapt footwear, orthoses, or walking aids when assessment identifies a need.
Provide an individualized home program, pacing and joint-protection advice, and monitoring for bleeding; modify activities that repeatedly trigger symptoms.
Coordinate pain management with the treating team; consider acetaminophen if appropriate, avoid aspirin/non-selective NSAIDs, and reserve other analgesic choices for individualized review.
Defer needling, injections, aspiration, or other invasive procedures without specialist assessment and an agreed hemostatic plan; consider HTC musculoskeletal/orthopedic referral for persistent synovitis, recurrent bleeds, or disabling symptoms.
Arrange emergency assessment for severe progressive pain, tense swelling, new sensory/motor loss, impaired perfusion, head/neck symptoms, or fever with an acutely hot joint.
Follow up on ____; track joint status, function, and bleeding pattern, with HJHS when appropriate; use imaging if indicated, without using negative ultrasound alone to exclude suspected bleeding.`,
    safetyZh:
      '穩定期也可能發生新的出血，不能將突然腫熱、劇痛或功能下降一律視為慢性退化。運動強度需配合個別止血保護，不強行拉開固定攣縮；HJHS 為可選的標準化評估，不預填正常值。針刺、注射與抽吸等處置須先有專科評估及止血計畫。',
    sources: [wfhMsk, wfhOutcomes, wfhComprehensive, masacEvaluation, masacEmergency, masacUltrasound],
    reviewedAt: REVIEWED_AT,
  },
]
