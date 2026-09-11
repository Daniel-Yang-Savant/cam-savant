import 'server-only'
import { orthopedicPlanPhases } from './opd-plan-phases-orthopedic'
import { nonOrthopedicPlanPhases } from './opd-plan-phases-nonorthopedic'
import type { PostopPlanPhase } from './opd-plan-phase-types'

export type PostopPrescriptionCategory =
  | '骨科術後'
  | '癌症術後'
  | '心肺術後'

export interface PostopPrescriptionSource {
  label: string
  url: string
}

export interface PostopPrescription {
  id: string
  title: string
  planTitle: string
  category: PostopPrescriptionCategory
  hint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  phases: PostopPlanPhase[]
  safety: string
  origin: '現有 Notion' | '循證補充'
  reviewStatus: '待醫師確認'
  sources: PostopPrescriptionSource[]
}

type BasePostopPrescription = Omit<
  PostopPrescription,
  'subjective' | 'objective' | 'assessment' | 'phases'
>

type PostopSoapFields = Pick<
  PostopPrescription,
  'subjective' | 'objective' | 'assessment'
>

const NOTION_POSTOP_ROOT =
  'https://app.notion.com/p/2e3451a33b66809aa660f4b286c5bec7'

const COMMON_POSTOP_SAFETY =
  'Follow surgeon-specific weight-bearing, bracing, ROM and progression orders based on the procedure, fixation and tissue healing. Stop treatment and arrange prompt assessment for signs of wound infection, uncontrolled pain or swelling, new neurovascular abnormalities, dyspnea or other acute deterioration.'

const POSTOP_SOAP_PARTS = {
  'acl-reconstruction': {
    subjective: `Procedure / side / date: ACL reconstruction, ＿＿ side, ＿＿
Post-op week: ＿＿; graft / concomitant procedure: ＿＿
Pain NRS: ＿＿/10; location / irritability: ＿＿
Swelling / stiffness / giving way: ＿＿
Weight-bearing / brace / crutch instruction and adherence: ＿＿
Home exercise adherence and response: ＿＿
Walking / stairs / sleep / ADL limitation: ＿＿
Fever, wound drainage, calf pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `General condition / vitals when indicated: ＿＿
Incision: clean-dry-intact / ＿＿
Knee warmth / effusion / girth: ＿＿
Patellar mobility: ＿＿
AROM / PROM extension-flexion: ＿＿°–＿＿° / ＿＿°–＿＿°
Quadriceps activation / extension lag: ＿＿
SLR: independent without lag / ＿＿
Strength tested within precautions: ＿＿
Weight-bearing / brace setting: ＿＿
Gait with ＿＿: ＿＿
Distal neurovascular status: intact / ＿＿
Calf swelling / tenderness or other VTE concern: absent / ＿＿
Functional control performed when appropriate: ＿＿`,
    assessment: `Status post ＿＿-side ACL reconstruction, post-op week ＿＿.
Current rehabilitation phase: protection / ROM / strengthening / return-to-run / return-to-sport.
Primary impairments: pain ＿＿; effusion ＿＿; ROM ＿＿; quadriceps control ＿＿; gait / function ＿＿.
Progress relative to surgeon-specific protocol: on track / slower / faster; reason: ＿＿
Precautions / concomitant-procedure restrictions reviewed: ＿＿
Postoperative red flags: none identified today / ＿＿`,
  },
  'acl-meniscus-repair': {
    subjective: `Procedure / side / date: ACL reconstruction + meniscal repair, ＿＿ side, ＿＿
Repair site / type if known: ＿＿; post-op week: ＿＿
Pain NRS: ＿＿/10; joint-line pain / locking: ＿＿
Swelling / stiffness / giving way: ＿＿
Weight-bearing, flexion and brace restrictions understood: yes / no / ＿＿
Crutch / brace use and home exercise adherence: ＿＿
Walking / stairs / ADL limitation: ＿＿
Fever, wound drainage, calf pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision: clean-dry-intact / ＿＿
Knee warmth / effusion / girth: ＿＿
Joint-line tenderness: not tested / absent / present ＿＿
AROM / PROM extension-flexion within restriction: ＿＿°–＿＿° / ＿＿°–＿＿°
Quadriceps activation / extension lag: ＿＿
SLR within brace instruction: ＿＿
Brace setting / weight-bearing observed: ＿＿
Gait with ＿＿: ＿＿
Hamstring activation: not tested / tested per clearance ＿＿
Distal neurovascular status: intact / ＿＿
Calf / VTE screen: no concern / ＿＿`,
    assessment: `Status post ACL reconstruction with meniscal repair, post-op week ＿＿.
Repair-specific protection phase and restrictions: ＿＿
Primary impairments: pain / effusion ＿＿; ROM ＿＿; quadriceps control ＿＿; gait / function ＿＿.
Mechanical symptoms or joint-line irritability: absent / ＿＿
Progress relative to operative protocol: on track / requires review ＿＿
Postoperative red flags: none identified today / ＿＿`,
  },
  'pcl-reconstruction': {
    subjective: `Procedure / side / date: PCL reconstruction, ＿＿ side, ＿＿
Concomitant ligament / meniscus procedure: ＿＿; post-op week: ＿＿
Pain NRS: ＿＿/10; swelling / stiffness: ＿＿
Sense of posterior instability: denied / ＿＿
Brace / weight-bearing instruction and adherence: ＿＿
Hamstring restriction understood: yes / no / ＿＿
Walking / stairs / ADL limitation: ＿＿
Fever, wound drainage, calf pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision: clean-dry-intact / ＿＿
Knee warmth / effusion / girth: ＿＿
Resting tibial position / posterior sag observation: ＿＿
ROM using tibial support / prone method: extension ＿＿°; flexion ＿＿°
Quadriceps activation / extension lag: ＿＿
SLR with tibial control: ＿＿
Hamstring strength: not tested / cleared and tested ＿＿
Posterior drawer / stress testing: not performed unless cleared / ＿＿
Brace setting / weight-bearing / gait: ＿＿
Distal neurovascular and calf screen: ＿＿`,
    assessment: `Status post ＿＿-side PCL reconstruction, post-op week ＿＿.
Current phase prioritizes protection from posterior tibial translation and quadriceps control.
Primary impairments: pain / effusion ＿＿; ROM ＿＿; quadriceps activation ＿＿; gait / function ＿＿.
Graft-protection and hamstring precautions reviewed: ＿＿
Progress relative to surgeon-specific protocol: on track / requires review ＿＿
Postoperative red flags: none identified today / ＿＿`,
  },
  'rotator-cuff-slap': {
    subjective: `Procedure / side / date: rotator cuff repair + SLAP repair, ＿＿ side, ＿＿
Tendon(s) / tear size / additional procedure: ＿＿; post-op week: ＿＿
Pain NRS: rest ＿＿/10; movement / night ＿＿/10
Sling use and sleep tolerance: ＿＿
Hand swelling / numbness / distal symptoms: ＿＿
PROM / biceps / lifting precautions understood: yes / no / ＿＿
Home exercise adherence and response: ＿＿
Wound drainage, fever or acute traumatic event: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision: clean-dry-intact / ＿＿
Sling fit / positioning: ＿＿
Shoulder swelling / guarding / scapular posture: ＿＿
PROM within repair limits: flexion ＿＿°; abduction ＿＿°; ER ＿＿°
AAROM / AROM: not indicated / cleared ＿＿
Scapular setting / control: ＿＿
Elbow / wrist / hand AROM: ＿＿
Biceps activation / resisted shoulder testing: not performed unless cleared / ＿＿
Distal motor / sensation / perfusion: intact / ＿＿
Functional use within precautions: ＿＿`,
    assessment: `Status post ＿＿-side rotator cuff and SLAP repair, post-op week ＿＿.
Current tissue-protection / mobility / strengthening phase: ＿＿
Primary impairments: pain ＿＿; protected ROM ＿＿; scapular control ＿＿; sleep / ADL ＿＿.
Cuff- and biceps-labral precautions reviewed: ＿＿
Progress relative to tear size and surgeon protocol: on track / requires review ＿＿
Postoperative red flags: none identified today / ＿＿`,
  },
  'total-knee-replacement': {
    subjective: `Procedure / side / date: TKR, ＿＿ side, ＿＿; post-op week: ＿＿
Pain NRS: ＿＿/10; stiffness / swelling: ＿＿
Analgesic response / sleep: ＿＿
Walking aid and distance: ＿＿
Stairs / transfers / ADL limitation: ＿＿
Exercise adherence and response: ＿＿
Fever, wound drainage, increasing redness, calf pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Vitals / general condition when indicated: ＿＿
Incision / surrounding erythema or drainage: clean-dry-intact / ＿＿
Knee warmth / effusion / girth: ＿＿
AROM / PROM extension-flexion: ＿＿°–＿＿° / ＿＿°–＿＿°
Patellar mobility: ＿＿
Quadriceps activation / extension lag: ＿＿
Strength within tolerance: ＿＿
Transfer / sit-to-stand: ＿＿
Gait with ＿＿: ＿＿
Stair performance when appropriate: ＿＿
Distal neurovascular and calf / VTE screen: ＿＿`,
    assessment: `Status post ＿＿-side total knee replacement, post-op week ＿＿.
Primary impairments: pain / edema ＿＿; extension ＿＿; flexion ＿＿; quadriceps control ＿＿; gait / stairs ＿＿.
Functional mobility and fall risk: ＿＿
Progress relative to individual baseline and surgical plan: on track / requires review ＿＿
Postoperative infection / VTE / neurovascular concern: none identified / ＿＿`,
  },
  'total-hip-replacement': {
    subjective: `Procedure / side / date: THR, ＿＿ side, ＿＿; approach: ＿＿; post-op week: ＿＿
Pain NRS: ＿＿/10; groin / lateral thigh / other: ＿＿
Weight-bearing and approach-specific precautions: ＿＿
Walking aid and distance: ＿＿
Transfers / bed mobility / stairs / dressing limitation: ＿＿
Perceived instability, clicking or leg-length concern: ＿＿
Fever, wound drainage, calf pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision / erythema / drainage: clean-dry-intact / ＿＿
Hip / thigh swelling or ecchymosis: ＿＿
Leg position / apparent length difference: ＿＿
ROM tested only within approach-specific precautions: ＿＿
Hip abductor / extensor activation: ＿＿
Transfer / sit-to-stand technique: ＿＿
Gait with ＿＿: ＿＿
Balance / stair performance when appropriate: ＿＿
Distal neurovascular status: intact / ＿＿
Calf / VTE screen: no concern / ＿＿
Dislocation-provoking testing: not performed`,
    assessment: `Status post ＿＿-side total hip replacement via ＿＿ approach, post-op week ＿＿.
Primary impairments: pain / edema ＿＿; protected mobility ＿＿; hip muscle control ＿＿; gait / transfers ＿＿.
Approach-specific precautions and weight-bearing status confirmed: ＿＿
Progress relative to individual baseline and surgical plan: on track / requires review ＿＿
Dislocation / infection / VTE / neurovascular concern: none identified / ＿＿`,
  },
  'oral-cancer-postop': {
    subjective: `Cancer / procedure / date: oral cancer resection ＿＿; reconstruction ＿＿; ＿＿
Post-op week: ＿＿; radiotherapy / chemotherapy status: ＿＿
Pain / oral tightness / trismus: ＿＿
Swallowing, coughing with intake or secretion difficulty: ＿＿
Current diet / tube feeding and SLP instruction: ＿＿
Speech / communication concern: ＿＿
Neck / shoulder / donor-site symptoms: ＿＿
Fever, bleeding, wound change, dyspnea or sudden flap concern: denied / ＿＿
Patient goal: ＿＿`,
    objective: `General condition / airway / tracheostomy status: ＿＿
External wound / flap status per surgical-team documentation: ＿＿
Oral hygiene / secretion management observed: ＿＿
Jaw opening: ＿＿ mm / finger breadth; pain / deviation: ＿＿
Tongue / lip ROM and control within clearance: ＿＿
Voice / articulation / communication: ＿＿
Swallow screen / instrumental result: not assessed here / ＿＿
Cervical and shoulder AROM within precautions: ＿＿
Head-neck swelling / fibrosis / scar: ＿＿
Donor-site mobility / weight-bearing restriction: ＿＿`,
    assessment: `Status post oral-cancer resection with ＿＿ reconstruction, post-op week ＿＿.
Primary issues: airway / secretion ＿＿; swallowing / nutrition ＿＿; oral-jaw mobility ＿＿; speech ＿＿; neck-shoulder / donor site ＿＿.
Aspiration / trismus / lymphedema / fibrosis risk requiring referral: ＿＿
Surgical and SLP restrictions confirmed: ＿＿
Urgent postoperative concern: none identified / ＿＿`,
  },
  'neck-cancer-postop': {
    subjective: `Cancer / procedure / side / date: neck cancer surgery / neck dissection ＿＿; ＿＿
Post-op week: ＿＿; radiotherapy / chemotherapy status: ＿＿
Neck pain / tightness / numbness: ＿＿
Shoulder pain, weakness, droop or overhead limitation: ＿＿
Swelling / heaviness / skin tightness: ＿＿
Swallowing / voice / breathing concern: ＿＿
ADL / sleep / work limitation: ＿＿
Fever, bleeding, rapid neck swelling or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision / drainage / erythema: clean-dry-intact / ＿＿
Neck posture / swelling / scar mobility when healed: ＿＿
Cervical AROM: flex ＿＿; ext ＿＿; rotation R/L ＿＿/＿＿; side-bend R/L ＿＿/＿＿
Shoulder AROM R/L: flex ＿＿/＿＿; abduction ＿＿/＿＿
Scapular position / winging / shoulder droop: ＿＿
Upper trapezius / scapular muscle activation within tolerance: ＿＿
CN XI-related shoulder function: ＿＿
Head-neck lymphedema / fibrosis observation: ＿＿
Swallow / voice: not assessed here / ＿＿
Neurologic and donor-site findings: ＿＿`,
    assessment: `Status post ＿＿ neck-dissection / head-neck surgery, post-op week ＿＿.
Primary impairments: cervical mobility ＿＿; shoulder / CN XI pattern ＿＿; scar / fibrosis ＿＿; lymphedema ＿＿; swallowing / voice ＿＿.
Functional limitation: ＿＿
Need for PT / OT / SLP / lymphedema referral: ＿＿
Urgent postoperative concern: none identified / ＿＿`,
  },
  'breast-cancer-postop': {
    subjective: `Procedure / side / date: breast surgery ＿＿; SLNB / ALND ＿＿; reconstruction ＿＿
Post-op week: ＿＿; radiotherapy / chemotherapy status: ＿＿
Pain / chest-wall or axillary tightness: ＿＿
Shoulder limitation / heaviness / swelling: ＿＿
Cording symptoms: ＿＿
Drain / wound / reconstruction precautions: ＿＿
ADL / sleep / work limitation: ＿＿
Fever, wound change, sudden arm swelling, chest pain or dyspnea: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Incision / drain / erythema / drainage: ＿＿
Chest-wall / breast / arm swelling observation: ＿＿
Arm circumference or other lymphedema measure when indicated: ＿＿
Axillary web syndrome / scar mobility when healed: ＿＿
Shoulder AROM R/L: flex ＿＿/＿＿; abduction ＿＿/＿＿; ER ＿＿/＿＿
Scapular control / posture: ＿＿
Strength tested within reconstruction precautions: ＿＿
Sensation / pain distribution: ＿＿
Functional reach / dressing / lifting: ＿＿`,
    assessment: `Status post ＿＿-side breast-cancer surgery with ＿＿ nodal procedure / reconstruction, post-op week ＿＿.
Primary impairments: pain / tightness ＿＿; shoulder ROM ＿＿; cording / scar ＿＿; edema / lymphedema concern ＿＿; strength / function ＿＿.
Reconstruction- and drain-specific precautions confirmed: ＿＿
Need for oncology rehab / lymphedema referral: ＿＿
Urgent postoperative concern: none identified / ＿＿`,
  },
  'esophageal-cancer-postop': {
    subjective: `Procedure / date: esophagectomy ＿＿; approach ＿＿; post-op day / week ＿＿
Pain NRS: ＿＿/10; fatigue / sleep: ＿＿
Dyspnea / cough / sputum: ＿＿
Swallowing / regurgitation / aspiration symptoms: ＿＿
Current diet / tube feeding / weight change: ＿＿
Walking tolerance / ADL limitation: ＿＿
Exercise / breathing practice adherence: ＿＿
Fever, chest pain, palpitations, wound change or calf symptoms: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Vitals / oxygen setting / SpO₂ response when indicated: ＿＿
Breathing pattern / respiratory effort: ＿＿
Cough / huff effectiveness and secretion: ＿＿
Chest / abdominal incision and drain status: ＿＿
Shoulder / cervical / thoracic mobility: ＿＿
Bed mobility / transfer: ＿＿
Walking distance / assistance / exertion response: ＿＿
Sit-to-stand / lower-limb function: ＿＿
Nutrition / weight trend per team record: ＿＿
Fall / VTE / cardiopulmonary concern: ＿＿`,
    assessment: `Status post esophagectomy, post-op day / week ＿＿.
Primary impairments: pain ＿＿; respiratory / airway-clearance ＿＿; mobility / deconditioning ＿＿; swallowing / nutrition ＿＿; shoulder-posture ＿＿.
Activity tolerance and oxygen response: ＿＿
Need for inpatient / outpatient rehabilitation and nutrition / SLP coordination: ＿＿
Urgent surgical or cardiopulmonary concern: none identified / ＿＿`,
  },
  'lung-cancer-postop': {
    subjective: `Procedure / side / date: lung resection ＿＿; open / VATS / RATS ＿＿; post-op day / week ＿＿
Pain NRS: rest ＿＿/10; cough / movement ＿＿/10
Dyspnea / cough / sputum / hemoptysis: ＿＿
Oxygen / chest-drain status if present: ＿＿
Walking tolerance / ADL / sleep limitation: ＿＿
Breathing and home exercise adherence: ＿＿
Fever, increasing chest pain, palpitations, calf pain or sudden decline: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Vitals / oxygen setting / resting SpO₂: ＿＿
Breathing pattern / accessory-muscle use: ＿＿
Cough / huff effectiveness and secretion: ＿＿
Incision / chest-drain status: ＿＿
Affected shoulder AROM and scapular movement: ＿＿
Thoracic expansion / posture / trunk mobility: ＿＿
Transfer / gait assistance: ＿＿
Walking distance, exertional SpO₂ / HR / RPE: ＿＿
Sit-to-stand / lower-limb function: ＿＿
Cardiopulmonary / VTE concern: none / ＿＿`,
    assessment: `Status post ＿＿ lung resection via ＿＿ approach, post-op day / week ＿＿.
Primary impairments: postoperative pain ＿＿; ventilation / secretion ＿＿; shoulder-thoracic mobility ＿＿; deconditioning / gait ＿＿.
Activity tolerance and oxygen response: ＿＿
Need for individual physiotherapy / pulmonary rehabilitation: ＿＿
Urgent pulmonary, cardiac, wound or VTE concern: none identified / ＿＿`,
  },
  'ami-rehabilitation': {
    subjective: `Event / date / intervention: AMI ＿＿; PCI / CABG / medical treatment ＿＿; post-event week ＿＿
Chest discomfort / dyspnea / palpitations / dizziness: ＿＿
Fatigue / sleep / anxiety: ＿＿
Walking and ADL tolerance: ＿＿
Medication adherence / adverse effect concern: ＿＿
Home BP / HR / glucose when relevant: ＿＿
Exercise adherence and perceived exertion: ＿＿
Smoking / nutrition / return-to-work concern: ＿＿
Patient goal: ＿＿`,
    objective: `Resting HR / BP / SpO₂ / rhythm information: ＿＿
Symptoms at rest: absent / ＿＿
Edema / signs of congestion: ＿＿
Orthostatic response when indicated: ＿＿
Walking / exercise duration and workload: ＿＿
Exercise HR / BP / SpO₂ / RPE / symptom response: ＿＿
Recovery response: ＿＿
Functional test when cleared: ＿＿
Musculoskeletal or balance limitation: ＿＿
Cardiac rehabilitation risk information / restrictions: ＿＿`,
    assessment: `Post-AMI status following ＿＿, post-event week ＿＿.
Current cardiac-rehabilitation phase and risk category: ＿＿
Exercise tolerance: ＿＿; hemodynamic / symptom response: ＿＿
Primary barriers: deconditioning ＿＿; cardiopulmonary symptoms ＿＿; confidence / adherence ＿＿; other ＿＿.
Need for monitored cardiac rehabilitation / medical reassessment: ＿＿
Unstable cardiac red flags: none identified / ＿＿`,
  },
  'cabg-rehabilitation': {
    subjective: `Procedure / date / graft donor site: CABG ＿＿; ＿＿; post-op week ＿＿
Chest / sternal / donor-site pain: ＿＿
Dyspnea / cough / sputum / palpitations / dizziness: ＿＿
Sternal clicking or instability sensation: denied / ＿＿
Walking / stairs / ADL / sleep tolerance: ＿＿
Move-in-the-tube and wound-care adherence: ＿＿
Medication / exercise adherence: ＿＿
Fever, wound drainage, calf swelling or sudden decline: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Resting HR / BP / SpO₂ / rhythm information: ＿＿
Sternal and donor-site wound: clean-dry-intact / ＿＿
Sternal stability / clicking with function: ＿＿
Breathing pattern / cough effectiveness: ＿＿
Shoulder / thoracic AROM within comfort: ＿＿
Edema at graft donor limb / general congestion: ＿＿
Transfer and gait without excessive arm loading: ＿＿
Walking workload and HR / BP / SpO₂ / RPE response: ＿＿
Recovery response: ＿＿
Balance / fall / VTE concern: ＿＿`,
    assessment: `Status post CABG, post-op week ＿＿.
Primary impairments: pain / sternal function ＿＿; respiratory function ＿＿; shoulder-thoracic mobility ＿＿; walking tolerance ＿＿; donor-site edema ＿＿.
Hemodynamic and symptom response to activity: ＿＿
Sternal and move-in-the-tube precautions reviewed: ＿＿
Need for monitored cardiac rehabilitation / medical reassessment: ＿＿
Urgent cardiac, wound or VTE concern: none identified / ＿＿`,
  },
  'head-neck-cancer-integrated': {
    subjective: `Cancer / procedure / date: head-neck cancer resection ＿＿; neck dissection ＿＿; free flap ＿＿
Donor site / post-op week: ＿＿ / ＿＿
Airway / tracheostomy / secretion concern: ＿＿
Swallowing, coughing with intake, current diet / tube feeding: ＿＿
Speech / voice / communication concern: ＿＿
Oral-jaw tightness / trismus / pain: ＿＿
Neck / shoulder weakness, swelling or donor-site limitation: ＿＿
Fever, bleeding, rapid swelling, dyspnea or sudden flap change: denied / ＿＿
Patient and caregiver goal: ＿＿`,
    objective: `General condition / vitals / airway / tracheostomy status: ＿＿
Flap and wound status per reconstructive-team documentation: ＿＿
Secretion management / cough effectiveness: ＿＿
Swallow / voice / speech result per SLP: not assessed here / ＿＿
Jaw opening: ＿＿ mm; tongue / lip control: ＿＿
Cervical AROM within pedicle / wound precautions: ＿＿
Shoulder AROM, scapular position and CN XI-related function: ＿＿
Head-neck lymphedema / fibrosis / scar: ＿＿
Donor-site ROM, strength, weight-bearing and gait: ＿＿
Current drains / lines and mobility assistance: ＿＿`,
    assessment: `Status post major head-neck cancer surgery with ＿＿ reconstruction, post-op week ＿＿.
Priority problems: airway / secretion ＿＿; swallowing / nutrition ＿＿; communication ＿＿; jaw / oral mobility ＿＿; neck-shoulder / CN XI ＿＿; lymphedema / fibrosis ＿＿; donor site ＿＿.
Current surgical / flap / airway restrictions confirmed: ＿＿
PT / OT / SLP / nutrition / dental / lymphedema needs: ＿＿
Urgent flap, airway, bleeding, infection or aspiration concern: none identified / ＿＿`,
  },
  'vats-lung-resection-integrated': {
    subjective: `Procedure / side / date: VATS ＿＿ectomy / wedge / segmentectomy, ＿＿ side, ＿＿
Post-op day / week: ＿＿; chest drain / oxygen: ＿＿
Pain NRS: rest ＿＿/10; deep breath / cough / movement ＿＿/10
Dyspnea / cough / sputum / hemoptysis: ＿＿
Walking distance / stairs / ADL / sleep: ＿＿
Breathing / walking / shoulder exercise adherence: ＿＿
Fever, increasing chest pain, palpitations, calf symptoms or sudden decline: denied / ＿＿
Patient goal: ＿＿`,
    objective: `Resting HR / BP / respiratory rate / oxygen setting / SpO₂: ＿＿
Breathing pattern / thoracic expansion / respiratory effort: ＿＿
Huff / supported cough and secretion: ＿＿
Incision / chest-drain status: ＿＿
Affected shoulder flexion / abduction and scapular movement: ＿＿
Thoracic posture / extension / rotation / side-bending: ＿＿
Transfer / gait assistance and chest-drain safety: ＿＿
Walking distance; exercise HR / SpO₂ / RPE / symptoms: ＿＿
Sit-to-stand / lower-limb function: ＿＿
Pulmonary / cardiac / wound / VTE concern: none / ＿＿`,
    assessment: `Status post ＿＿-side VATS lung resection, post-op day / week ＿＿.
Primary impairments: postoperative pain ＿＿; ventilation / airway clearance ＿＿; affected shoulder / thoracic mobility ＿＿; deconditioning / mobility ＿＿.
Activity tolerance and oxygen response: ＿＿
Need for targeted physiotherapy / pulmonary rehabilitation: ＿＿
Chest-drain and surgical restrictions confirmed: ＿＿
Urgent pulmonary, cardiac, wound or VTE concern: none identified / ＿＿`,
  },
} satisfies Record<string, PostopSoapFields>

const basePostopPrescriptions: BasePostopPrescription[] = [
  {
    id: 'acl-reconstruction',
    title: 'ACL 重建術後',
    planTitle: 'ACL Reconstruction',
    category: '骨科術後',
    hint: '依術後週數安排負重、護具、ROM、閉鎖鏈訓練與回場條件。',
    plan: `術式／移植物：ACL reconstruction，graft ＿＿；合併處置：＿＿
Post-op week：＿＿
Weight bearing／brace：依手術醫師指示；初期雙拐、護具鎖伸直，股四頭肌控制與步態穩定後再逐步解鎖／減少輔具。
ROM：優先恢復完全伸直；屈曲依反應漸進，約第 1 週 0–90°、第 2–4 週逐步至 120°，並做髕骨活動。
Exercise：ankle pump、quad／hamstring／gluteal isometric、NMES（如適用）、無 extension lag 的 SLR；第 2 週後依耐受加入 mini-squat 0–30°、leg press 0–60°、heel raise、單腳平衡與腳踏車 ROM。
Week 4–12：逐步增加 CKC 0–60°、lunge、平衡與腳踏車；OKC knee extension 約第 4 週後先採 90–45°保護角度。Hamstring graft 初期避免額外 hamstring 負重。
Return progression：無積水、完整 ROM、動作品質良好後再進階；跑步、跳躍、急停轉向及運動專項須依醫囑與功能測試，常以 limb symmetry ≥90% 作為其中一項條件。
Follow-up：＿＿`,
    safety:
      'Do not apply the isolated ACL timeline unchanged after concomitant meniscal repair, cartilage procedures or other ligament reconstruction. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：ACL',
        url: 'https://app.notion.com/p/2e7451a33b66808490a8d2bddcef8498',
      },
    ],
  },
  {
    id: 'acl-meniscus-repair',
    title: 'ACL 重建合併半月板修補',
    planTitle: 'ACL Reconstruction with Meniscal Repair',
    category: '骨科術後',
    hint: '保留半月板修補所需的負重、屈曲與旋轉限制。',
    plan: `術式／修補位置：ACLR + meniscal repair；＿＿側；＿＿horn／root／其他：＿＿
Post-op week：＿＿
Week 0–4：toe-touch／限制負重、雙拐、護具鎖伸直（依醫囑）；ROM 0–90°；ankle pump、quad set、SLR。避免負重屈膝與扭轉；posterior horn 修補者依醫囑避免 active hamstring。
Week 4–8：依醫囑由部分負重漸進至全負重，約第 6–8 週視步態減少拐杖；第 4 週後才逐步超過 90°，目標約第 8 週恢復完整 ROM；達安全負重且無明顯疼痛／積水後加入 mini-squat 0–45°。
Month 2–3：CKC 0–60°、proprioception、stationary bike；暫不做衝擊活動、深蹲或 pivot。
Month 4–6+：依關節線壓痛、積水、肌力與控制進展動態訓練；直線慢跑與回場時程須由手術團隊確認，運動回場多落在術後 9–12 個月並需功能測試。
Follow-up：＿＿`,
    safety:
      'Root or radial repairs and complex tears may require stricter restrictions; follow the operative report and individualized orders. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：ACLR with Meniscal Repair',
        url: 'https://app.notion.com/p/2e7451a33b6680da82b0d26de3168923',
      },
    ],
  },
  {
    id: 'pcl-reconstruction',
    title: 'PCL 重建術後',
    planTitle: 'PCL Reconstruction',
    category: '骨科術後',
    hint: '以保護後向脛骨位移與股四頭肌主導訓練為核心。',
    plan: `術式／合併處置：PCL reconstruction；＿＿
Post-op week：＿＿
Week 0–6：護具維持伸直約 6–8 週或依醫囑；NWB 至 PWB 依癒合進展。採支撐脛骨的被動屈曲／prone ROM，約第 4–6 週達 90°；quad set、patellar mobilization、無 lag 的 SLR。
Protection：避免 posterior tibial translation；active／resisted hamstring 依醫囑延後（原流程為至少 6 週，部分個案可延至 24 週）。
Week 6–12：依醫囑漸進至 FWB，屈曲約第 12 週達 120°；加入 quad-dominant CKC、mini-squat 0–45°，暫不做 isolated hamstring curl。
Month 3–6：漸進 CKC、proprioception 與耐力；依穩定度、積水與動作品質調整。
Month 6–12：跑跳、敏捷與回場須經功能測試；可參考 limb symmetry ≥90%、完整 ROM、無積水及病人回報量表。
Follow-up：＿＿`,
    safety:
      'Protect the PCL graft from posterior shear; concomitant PLC or multiligament injury requires different restrictions. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：PCL',
        url: 'https://app.notion.com/p/324451a33b66803aa5f1ea779d02b80d',
      },
    ],
  },
  {
    id: 'rotator-cuff-slap',
    title: '旋轉肌袖修補合併 SLAP',
    planTitle: 'Rotator Cuff Repair with SLAP Repair',
    category: '骨科術後',
    hint: '同時保護 cuff repair 與 biceps–labral complex。',
    plan: `術式／修補範圍：rotator cuff repair + SLAP repair；＿＿
Post-op week：＿＿
Week 0–6：sling 約 6 週或依醫囑；shoulder PROM only，初期 ER 約 0–30°、elevation 約 90°並依修補張力調整。pendulum、distal AROM、scapular setting。避免主動肘屈曲／旋後及牽拉 biceps anchor。
Week 6–10：漸退 sling；由 AAROM 漸進 AROM。避免提重與 resisted biceps。
Week 10–16：在動作品質與無代償前提下加入輕阻力 rotator cuff／scapular exercise；biceps 與 overhead loading 依醫囑漸進。
Month 4–6+：進階肌力與耐力；達疼痛穩定、完整功能 ROM、肌力與控制門檻後再做輕量 plyometric／專項。重複高負荷 overhead 活動通常至少延至 6 個月並需醫療團隊放行。
Follow-up：＿＿`,
    safety:
      'Large or massive tears, poor tissue quality or additional subscapularis repair generally require more conservative ROM and loading progression. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Rotator Cuff Repair + SLAP',
        url: 'https://app.notion.com/p/2e7451a33b6680f092aec9a8e501d353',
      },
    ],
  },
  {
    id: 'total-knee-replacement',
    title: '人工膝關節置換 TKR',
    planTitle: 'Total Knee Replacement (TKR)',
    category: '骨科術後',
    hint: '疼痛腫脹控制、伸直、屈曲、步態與上下樓梯進階。',
    plan: `術式／側別：TKR，＿＿側；post-op week：＿＿
Week 0–1：依醫囑 WBAT，walker／crutches；目標膝伸直並逐步屈曲至約 90°。ankle pump、quad／gluteal set、heel slide、SLR；冰敷、抬高與步態訓練。
Week 2–4：依步態由助行器進展至手杖；ROM 目標約 0–110°以上；stationary bike、sit-to-stand、mini-squat 0–45°、step-up、patellar／scar mobility（傷口癒合後）。
Week 4–8：漸進 resisted CKC、balance、cycling、walking endurance、gait 與 stair training。
Month 3+：依功能需求增進社區步行與日常活動；ROM 可朝約 0–120°努力，但以個別術前狀況與功能為準。
Long term：優先低衝擊活動，避免未經醫囑的高衝擊運動。
Follow-up：＿＿`,
    safety: COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：TKR',
        url: 'https://app.notion.com/p/2e7451a33b66804f9249e01cc97f8cd8',
      },
    ],
  },
  {
    id: 'total-hip-replacement',
    title: '人工髖關節置換 THR',
    planTitle: 'Total Hip Replacement (THR)',
    category: '骨科術後',
    hint: '依前側／後側手術路徑套用不同脫臼預防與功能進展。',
    plan: `術式／側別／approach：THR，＿＿側，＿＿ approach；post-op week：＿＿
Week 0–1：依醫囑 WBAT 與 walker／crutches；ankle pump、quad／gluteal set、heel slide、transfer 與 gait training。
Hip precautions：posterior approach 常需避免過度 flexion、adduction、internal rotation；anterior approach 常需避免過度 extension、external rotation。確切組合與期限依手術醫師指示。
Week 2–4：依步態漸減輔具；站姿 hip abduction／extension、sit-to-stand、shallow squat、knee extension；傷口與腫脹照護。
Week 4–8：漸進 hip abductor／extensor resistance、step、side-step、balance 與 gait symmetry。
Month 3+：walking、cycling、CKC 與 core control；工作與提重依職務需求、肌力及醫囑漸進。
Long term：以低衝擊活動為主；持續監測疼痛、跛行與不穩。
Follow-up：＿＿`,
    safety:
      'Dislocation precautions vary by surgical approach; confirm the individual restrictions specified by the surgeon. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：THR',
        url: 'https://app.notion.com/p/2e7451a33b6680fc9f46d066bd12fba6',
      },
    ],
  },
  {
    id: 'oral-cancer-postop',
    title: '口腔癌術後復健',
    planTitle: 'Oral Cancer Surgery',
    category: '癌症術後',
    hint: '傷口／皮瓣保護、口顎活動、吞嚥、構音與張口受限預防。',
    plan: `手術／重建／donor site：＿＿；post-op week：＿＿
Week 0–4：依外科團隊指示保護傷口與皮瓣；良好擺位、早期活動。經團隊放行後做輕柔 tongue／lip AROM；由語言治療師完成吞嚥與溝通評估，未確認安全前不自行進食。
Week 4–8：傷口穩定後處理 scar／soft tissue mobility；依吞嚥評估進行個別化吞嚥訓練與飲食質地調整。
Week 8–12+：持續 jaw ROM／trismus prevention、tongue mobility、articulation／speech 與吞嚥功能訓練；同步評估頸肩活動、淋巴水腫與放療相關緊繃。
Home program：＿＿
SLP／dental／nutrition／lymphedema referral：＿＿
Follow-up：＿＿`,
    safety:
      'Prioritize flap viability, airway safety, fistula, infection, bleeding and aspiration risks. Select swallowing maneuvers and diet texture from individual assessment findings; a generic template does not replace assessment. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Oral Cancer Post-Op Rehab',
        url: 'https://app.notion.com/p/2e7451a33b66809f810fff7b81e9d0df',
      },
    ],
  },
  {
    id: 'neck-cancer-postop',
    title: '頸癌／頸部廓清術後復健',
    planTitle: 'Neck Cancer Surgery / Neck Dissection',
    category: '癌症術後',
    hint: '聚焦副神經相關肩功能、頸肩 ROM、姿勢與淋巴水腫。',
    plan: `手術／側別／是否保留 CN XI：＿＿；post-op week：＿＿
Week 0–4：依傷口與引流管狀況做輕柔 cervical AROM、scapular setting、姿勢與擺位；避免牽扯傷口。監測肩下垂、scapular winging、淋巴水腫與神經症狀。
Week 4–8：傷口穩定且團隊同意後進展 shoulder AAROM／AROM、scar／soft tissue mobility；由受訓專業人員評估是否進行 lymphedema therapy。
Week 8–12+：漸進 scapular stabilizer、rotator cuff／upper-quarter endurance；針對 neck-dissection shoulder syndrome、放療後緊繃與日常／工作需求做功能訓練。
Home program：頸肩活動 ＿＿；scapular control ＿＿；姿勢／呼吸 ＿＿
PT／OT／SLP／lymphedema referral：＿＿
Follow-up：＿＿`,
    safety:
      'Avoid excessive early tension on the incision or flap. Assess spinal accessory nerve function for marked shoulder weakness. Exclude infection, thrombosis and other contraindications before lymphedema treatment. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Neck Cancer Post-Op Rehab',
        url: 'https://app.notion.com/p/2e7451a33b6680e7879af3ad133a8163',
      },
    ],
  },
  {
    id: 'breast-cancer-postop',
    title: '乳癌術後復健',
    planTitle: 'Breast Cancer Surgery',
    category: '癌症術後',
    hint: '肩活動、腋網症候群、疤痕、漸進阻力與淋巴水腫風險管理。',
    plan: `手術／側別／ALND or SLNB／reconstruction：＿＿；post-op week：＿＿
Week 0–2：依外科／整形外科與引流管限制做 distal ROM、ball squeeze、呼吸、步行與輕柔 shoulder AAROM；提重與重複高舉依醫囑。
Week 2–6：傷口與引流狀況允許後漸進完整 shoulder AROM、wall slide、scapular exercise；評估 scar、axillary web syndrome、疼痛與腫脹。
Week 6–12+：由低負荷開始漸進 resistance（高次數、低重量起步）、功能與有氧訓練；放療期間持續胸肩伸展與姿勢活動。
Lymphedema：衛教皮膚照護與早期症狀；若有持續腫脹／沉重／緊繃，轉介合格淋巴水腫專業人員評估。血壓、抽血與注射依院內風險評估及可行性個別決定。
Follow-up：＿＿`,
    safety:
      'Reconstruction type, tissue expanders and wound status modify shoulder ROM and lifting restrictions. Individualize risk assessment for ipsilateral blood pressure measurement or needle procedures rather than imposing a blanket prohibition. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Breast Cancer',
        url: 'https://app.notion.com/p/2e7451a33b66801dab79d12d76a71fb9',
      },
    ],
  },
  {
    id: 'esophageal-cancer-postop',
    title: '食道癌手術前後復健',
    planTitle: 'Esophageal Cancer Surgery',
    category: '癌症術後',
    hint: '術前預復健、術後早期活動、呼吸／排痰與營養配合。',
    plan: `術式／post-op day or week：＿＿
Prehabilitation（術前如時間允許）：aerobic 30 min、每週 3–5 日，合併低至中強度 resistance；高風險者考慮 inspiratory muscle training。呼吸／huff cough 衛教、戒菸與營養評估。
Post-op day 0–7：生命徵象與疼痛控制穩定後，依團隊許可在 24 小時內開始坐起、站立與步行；deep breathing／thoracic expansion、supported huff／cough、shoulder／neck ROM。誘發性肺量計僅依院內路徑或個別適應症使用。
Week 2–6：分段步行並逐步增加時間，配合 posture、pacing 與 ADL；飲食／管灌與餐後姿勢依外科及營養團隊。
Month 2–6：漸進 aerobic、resistance、flexibility 與回歸生活／工作；持續癌症治療相關副作用與營養監測。
Follow-up／referral：＿＿`,
    safety:
      'Monitor for anastomotic, respiratory, infectious, swallowing / aspiration, nutritional and cardiac rhythm complications. Exercise must not delay surgical assessment. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Esophageal cancer',
        url: 'https://app.notion.com/p/2e7451a33b668019a312ebf8c076d130',
      },
    ],
  },
  {
    id: 'lung-cancer-postop',
    title: '肺癌手術前後復健',
    planTitle: 'Lung Cancer Surgery',
    category: '癌症術後',
    hint: '既有肺癌流程，涵蓋預復健、早期活動、呼吸與長期體能。',
    plan: `術式／approach／post-op day or week：＿＿
Prehabilitation（術前如時間允許）：aerobic、resistance；高風險者評估 inspiratory muscle training。練習 diaphragmatic／thoracic expansion、huff cough，並配合戒菸與營養評估。
Post-op day 0–7：生命徵象穩定後依團隊許可在 24 小時內離床活動；upright positioning、分段步行、deep breathing／thoracic expansion、supported huff／cough、患側 shoulder AAROM 與 trunk mobility。誘發性肺量計不列為常規必做，僅依院內路徑或個別適應症。
Week 2–6：由 15–20 分鐘分段步行起，依症狀漸進；加入 chest-wall expansion、side-bending、posture、shoulder ROM 與傷口穩定後的 scar care。
Month 2–3+：漸進 aerobic interval、全身 resistance 與 ADL／工作活動；追蹤呼吸症狀、運動耐受與後續放化療影響。
Follow-up／pulmonary rehab referral：＿＿`,
    safety:
      'Follow thoracic-team orders for oxygen therapy, chest drains, air leaks and activity limits. Individualize SpO2 targets; do not apply one fixed target to all patients. ' +
      COMMON_POSTOP_SAFETY,
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：Lung cancer',
        url: 'https://app.notion.com/p/2e7451a33b66806b89dbd3b3d4f331af',
      },
    ],
  },
  {
    id: 'ami-rehabilitation',
    title: '急性心肌梗塞後心臟復健',
    planTitle: 'Cardiac Rehabilitation after Acute Myocardial Infarction (AMI)',
    category: '心肺術後',
    hint: '既有 AMI 流程；依醫療穩定度、運動測試與心臟復健團隊進階。',
    plan: `Diagnosis／intervention／risk：AMI；PCI／＿＿；post-event day or week：＿＿
Day 1–7：醫療穩定且團隊放行後早期坐起、站立與短距離步行；監測症狀、ECG／HR／BP／SpO₂（依場域）。強度約 RPE <11 或 resting HR + <20 bpm 起步，須個別化。
Week 2–6：正式心臟復健；walking／cycle 15–30 min、每週 3–5 日，常由 HRR 40–60% 或 RPE 11–13 起步；低負荷 resistance，避免憋氣／Valsalva。
Week 6–12+：依運動測試與風險分層漸進 30–60 min aerobic；需要時進展至 HRR 60–80%，合併 resistance、危險因子與生活型態管理。
Education：藥物遵從、症狀辨識、戒菸、睡眠、營養與回歸工作／性生活。
Follow-up／cardiac rehab referral：＿＿`,
    safety:
      'Base exercise progression on ischemia, rhythm, heart failure, blood pressure response and post-intervention status. Stop immediately and arrange assessment and management for new chest pain, marked dyspnea, syncope or unstable vital signs.',
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：AMI',
        url: 'https://app.notion.com/p/2e7451a33b668075904fc353333d16bf',
      },
    ],
  },
  {
    id: 'cabg-rehabilitation',
    title: 'CABG 術後心臟復健',
    planTitle: 'Coronary Artery Bypass Grafting (CABG)',
    category: '心肺術後',
    hint: '早期活動、胸骨保護、呼吸排痰與門診心臟復健。',
    plan: `術式／取 graft 部位／post-op day or week：CABG；＿＿
Day 0–7：醫療穩定後早期坐起、站立與步行；supported cough／deep breathing，誘發性肺量計依院內路徑。採 move-in-the-tube 原則，日常動作讓上臂靠近軀幹，避免疼痛性用力拉推。
Week 2–6：walking／cycle 20–30 min，常以 RPE 11–13 或 resting HR + <20 bpm 起步；gentle shoulder／thoracic AROM、gait 與 ADL。監測胸骨、傷口、取 graft 肢體腫脹與心律。
Week 6–12+：胸骨穩定且外科放行後漸進上肢 resistance 與提重；依運動測試進展 aerobic，合併危險因子管理與回歸工作。
Education：move-in-the-tube、傷口照護、藥物遵從、症狀辨識、戒菸與生活型態。
Follow-up／cardiac rehab referral：＿＿`,
    safety:
      'Individualize sternal precautions according to pain, sternal stability and surgical orders rather than a fixed weight or ROM limit. Stop and assess for sternal clicking, wound abnormalities, chest pain, dyspnea, syncope or unstable rhythm.',
    origin: '現有 Notion',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'Notion：CABG',
        url: 'https://app.notion.com/p/2e7451a33b66802e87b4d540ccbb4fbe',
      },
    ],
  },
  {
    id: 'head-neck-cancer-integrated',
    title: '頭頸癌術後整合處方（補充）',
    planTitle: 'Head and Neck Cancer Surgery - Integrated Rehabilitation',
    category: '癌症術後',
    hint: '整合自由皮瓣、氣道／吞嚥、頸肩功能、張口受限與淋巴水腫。',
    plan: `Diagnosis／procedure：頭頸癌術後；resection ＿＿；neck dissection ＿＿；free flap／donor site ＿＿
Airway／nutrition／drain：tracheostomy ＿＿；NG／PEG ＿＿；drain ＿＿；post-op day or week ＿＿
Acute phase：生命徵象、氣道、傷口與皮瓣穩定後依外科團隊放行早期坐起、站立與步行；配合疼痛、譫妄、VTE 與壓瘡預防。所有牽涉皮瓣 pedicle、頸部、donor site 與 weight bearing 的活動遵照重建團隊限制。
Swallow／communication：NPO／diet texture 由外科與 SLP 決定；吞嚥安全未確認前不自行試吃。轉介 SLP 評估吞嚥、構音、語音及替代溝通需求。
Neck／shoulder：傷口允許後由 gentle cervical ROM、scapular setting、shoulder AAROM／AROM 漸進；記錄肩下垂、scapular winging、疼痛與 CN XI 相關無力，逐步加入 scapular stabilizer 與 rotator cuff endurance。
Oral／jaw：依切除與重建範圍進行 tongue／lip／jaw ROM；有 trismus 風險者建立規律張口訓練，強度與器材依團隊評估。
Lymphedema／scar：傷口穩定後評估 head-and-neck lymphedema、fibrosis 與 scar；有適應症時轉介受訓治療師。
Home program／referrals：PT ＿＿；OT ＿＿；SLP ＿＿；nutrition ＿＿；dental ＿＿
Follow-up：＿＿`,
    safety:
      'This is a multidisciplinary prescription draft. Immediately notify the surgical team of airway obstruction, acute changes in flap color / temperature / capillary refill, active bleeding, rapidly increasing neck swelling, fever / infection, fistula, aspiration or neurological deterioration. Treatment must not compress the flap pedicle or delay flap monitoring.',
    origin: '循證補充',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'ERAS Society：頭頸癌自由皮瓣指引',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27737447/',
      },
      {
        label: '日本頭頸癌臨床指引（術後口腔照護與早期肩復健）',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28325607/',
      },
      {
        label: 'American Head and Neck Society survivorship consensus',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35155786/',
      },
    ],
  },
  {
    id: 'vats-lung-resection-integrated',
    title: '胸腔鏡肺切除術後 VATS（補充）',
    planTitle: 'Video-Assisted Thoracoscopic (VATS) Lung Resection',
    category: '心肺術後',
    hint: '以 24 小時內早期活動、呼吸／排痰、患側肩胸廓活動與返家進階為主。',
    plan: `Diagnosis／procedure：VATS ＿＿ectomy／wedge／segmentectomy；＿＿側；post-op day or week ＿＿
Current devices／support：chest drain ＿＿；oxygen ＿＿；epidural／regional analgesia ＿＿
Post-op day 0–1：生命徵象與疼痛控制穩定後，依胸腔團隊許可在 24 小時內坐起、站立並開始短距離步行；每次活動前後記錄症狀、HR、BP、SpO₂／oxygen setting。
Respiratory care：upright positioning、深呼吸／thoracic expansion、supported huff／cough；有分泌物、肺容積下降或高風險因子時由治療師個別處置。誘發性肺量計不列為所有人的常規必做，僅依院內路徑或個別適應症。
Mobility：短而頻繁的走路，逐步增加距離與 ADL；配合 adequate analgesia、胸管與跌倒安全。
Shoulder／trunk：患側 shoulder flexion／abduction AAROM-to-AROM、scapular movement、胸椎伸展與側彎，在不牽扯傷口／胸管且疼痛可接受下每日練習。
After discharge（約 Week 1–6）：分段步行逐日漸進；以 talk test／RPE 約 3–4/10 控制中等強度，症狀穩定後加入 sit-to-stand、heel raise 與輕阻力全身訓練。提重、開車、泡水、工作與飛行依外科傷口／胸管指示。
Week 6+：依呼吸症狀、體能與後續癌症治療進展 aerobic + resistance；功能未恢復或高風險者轉介 pulmonary rehabilitation。
Follow-up：＿＿`,
    safety:
      'Stop activity and arrange urgent assessment for new or worsening dyspnea, persistent oxygen desaturation, chest pain, syncope, palpitations, fever, hemoptysis, wound / chest-drain abnormalities, unilateral calf swelling or pain, or acute functional decline.',
    origin: '循證補充',
    reviewStatus: '待醫師確認',
    sources: [
      {
        label: 'ERAS Society／ESTS 肺手術指引',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30304509/',
      },
      {
        label: 'VATS 肺切除多專業臨床指南',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35610172/',
      },
      {
        label: 'VATS lobectomy 術後物理治療評估研究',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31000366/',
      },
    ],
  },
]

const planPhases = { ...orthopedicPlanPhases, ...nonOrthopedicPlanPhases }

export const postopPrescriptions: PostopPrescription[] =
  basePostopPrescriptions.map((prescription) => {
    const soap =
      POSTOP_SOAP_PARTS[
        prescription.id as keyof typeof POSTOP_SOAP_PARTS
      ]

    if (!soap) {
      throw new Error(`Missing postoperative SOAP template: ${prescription.id}`)
    }

    const phases = planPhases[prescription.id]
    if (!phases?.length) {
      throw new Error(`Missing postoperative Plan phases: ${prescription.id}`)
    }

    return {
      ...prescription,
      ...soap,
      phases: phases.map((phase) => ({
        ...phase,
        plan: [
          `Procedure: ${prescription.planTitle}`,
          `Phase: ${phase.label}`,
          phase.plan,
          `General Precautions: ${prescription.safety}`,
          'Follow-up: ____',
        ].join('\n\n'),
      })),
      sources:
        prescription.origin === '現有 Notion'
          ? [
              ...prescription.sources,
              { label: 'Notion：術後索引', url: NOTION_POSTOP_ROOT },
            ]
          : prescription.sources,
    }
  })
