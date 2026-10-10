import type { ExerciseGuideModule, ExerciseGuideSource } from './exercise-guides'

const IMAGE_ROOT = '/images/exercise-guides/relaxation'
const UPDATED_DATE = '2026-10-11'
const ORIGINAL_DATE = '2026-08-31'

const stretchingConsensus: ExerciseGuideSource = {
  label: '2025 國際伸展運動共識',
  href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12305623/',
}
const sittingExercises: ExerciseGuideSource = {
  label: 'NHS｜居家坐姿活動',
  href: 'https://www.nhs.uk/live-well/exercise/sitting-exercises/',
}
const armExercises: ExerciseGuideSource = {
  label: 'Royal Marsden NHS｜肩膀、手與手腕活動',
  href: 'https://patientinfolibrary.royalmarsden.nhs.uk/document/download/1612',
}
const backMobility: ExerciseGuideSource = {
  label: 'Cambridge University Hospitals｜腰背活動',
  href: 'https://www.cuh.nhs.uk/patient-information/back-mobility-exercises/',
}
const backCare: ExerciseGuideSource = {
  label: 'South Tees NHS｜腰背活動與單膝抱胸',
  href: 'https://www.southtees.nhs.uk/resources/back-care-advice/',
}

type RelaxationInput = Omit<
  ExerciseGuideModule,
  'kind' | 'evidenceKind' | 'reviewStatus' | 'modifiedDate' | 'supervision' | 'images' | 'cover'
> & {
  imageKey: string
  imageDescriptions: [string, string, string]
  steps: NonNullable<ExerciseGuideModule['steps']>
}

function relaxationGuide(input: RelaxationInput): ExerciseGuideModule {
  const { imageKey, imageDescriptions, ...guide } = input
  return {
    ...guide,
    kind: 'relaxation',
    evidenceKind: 'education',
    reviewStatus: 'pending',
    publishedDate: guide.publishedDate ?? UPDATED_DATE,
    modifiedDate: UPDATED_DATE,
    supervision: 'self-guided',
    relaxationArea: guide.relaxationArea ?? 'region',
    cover: {
      src: `${IMAGE_ROOT}/${imageKey}-cover.webp`,
      alt: `${guide.selectionLabel}放鬆運動，穿居家或運動服的成人示範`,
    },
    images: guide.steps.map((step, index) => ({
      src: `${IMAGE_ROOT}/${imageKey}-${index + 1}.webp`,
      alt: imageDescriptions[index],
      step: `動作 ${index + 1}`,
      caption: step.title,
      width: 1152,
      height: 432,
      paired: true,
    })),
  }
}

export const RELAXATION_GUIDES: ExerciseGuideModule[] = [
  relaxationGuide({
    id: 'neck-shoulder-reset',
    publishedDate: ORIGINAL_DATE,
    selectionLabel: '頸部',
    bodyRegion: '頭頸與下顎',
    searchAliases: ['脖子', '頸肩', '肩頸', '轉頭', '久坐'],
    theme: 'orange',
    eyebrow: '坐著就能做',
    title: '頸部放鬆：輕轉、側傾、收下巴',
    summary: '坐穩、放下肩膀，用三個小動作讓固定姿勢換個方向。',
    imageKey: 'neck',
    imageDescriptions: [
      '坐姿從面向前方慢慢轉頭，肩膀保持放鬆的兩個姿勢',
      '坐姿頭部由中立輕輕側傾，雙手放在腿上、不拉頭的兩個姿勢',
      '坐姿保持視線平直，下巴小幅向後收再放鬆的兩個姿勢',
    ],
    steps: [
      {
        title: '舒服地左右轉頭',
        instruction: '雙腳踩地，慢慢看向一側，再回到正前方。肩膀不跟著轉，只到舒服的位置。',
        dosage: '每側 3 次，每次停約 5 秒。',
      },
      {
        title: '頭部輕輕側傾',
        instruction: '耳朵輕靠向同側肩膀，感覺另一側頸部微微伸展，再回中間。肩膀不抬起，雙手不拉頭。',
        dosage: '每側 5 次，每次停約 3 秒。',
      },
      {
        title: '小幅收下巴',
        instruction: '眼睛看前方，下巴輕輕往後收，像把後頸拉長，再放鬆。不要用力低頭或咬緊牙齒。',
        dosage: '慢慢做 5 次。',
      },
    ],
    suitableFor: '久坐或看螢幕後的一般頸部緊繃；近期頸部外傷、手術、已知頸椎不穩定或手臂麻木者，先由專業人員評估。',
    dosage: '三個動作各做一輪，可依當下感受減少次數。',
    cue: '感覺輕微拉伸即可，不追求轉到底。',
    regression: '縮小角度，或只選一個舒服的動作。',
    followUp: '若緊繃反覆、影響睡眠或日常活動，請安排評估。',
    signals: {
      green: '只有輕微伸展感，活動後沒有更不舒服。',
      yellow: '疼痛增加時，停止該動作，休息後再縮小幅度。',
      red: '頭暈、視線異常、手臂麻木無力或疼痛往手臂延伸：停止並就醫評估。',
    },
    evidence: '依 NHS 頸部活動衛教整理，供日常輕柔活動使用；整套組合未經臨床試驗驗證。',
    audience: '沒有急性受傷或神經症狀的一般成人。',
    sources: [
      sittingExercises,
      {
        label: 'North Bristol NHS｜頸部活動',
        href: 'https://www.nbt.nhs.uk/our-services/a-z-services/emergency-zone/ed-miu-patient-information/neck-injuries',
      },
    ],
  }),
  relaxationGuide({
    id: 'shoulder-thoracic-reset',
    selectionLabel: '肩膀與上背',
    bodyRegion: '上肢與手部',
    searchAliases: ['肩胸', '肩胛', '胸椎', '上背', '久坐'],
    theme: 'teal',
    eyebrow: '給肩背一點空間',
    title: '肩膀與上背放鬆：放肩、橫抱、輕轉身',
    summary: '從肩膀的抬起與放下開始，接著輕伸肩後側、活動上背。',
    imageKey: 'shoulders',
    imageDescriptions: [
      '穿運動服的成人輕聳雙肩，再緩慢放下肩膀的兩個姿勢',
      '單臂橫過胸前、另一手托住上臂進行肩後側伸展的兩個姿勢',
      '坐姿雙腳踩地，雙臂交叉胸前，身體輕轉向一側的兩個姿勢',
    ],
    steps: [
      {
        title: '輕聳肩，再慢慢放下',
        instruction: '手臂自然放著，雙肩輕輕靠近耳朵，再慢慢放下。不要憋氣，也不用把肩膀往下壓。',
        dosage: '做 5 次。',
      },
      {
        title: '橫抱手臂伸展肩後側',
        instruction: '一隻手臂橫過胸前，另一手托住上臂輕帶向身體。肩膀保持放鬆，感覺肩後側微微拉伸。',
        dosage: '每側停約 20 秒，做 2 次。',
      },
      {
        title: '坐姿輕轉上背',
        instruction: '雙腳踩穩，雙臂交叉胸前。骨盆留在椅面，上半身慢慢轉向一側，再回中間。',
        dosage: '每側 5 次，每次停約 5 秒。',
      },
    ],
    suitableFor: '久坐或日常活動後的肩背緊繃；近期肩部外傷、脫臼或手術者，先確認可做的方向。',
    dosage: '三個動作各做一輪，伸展之間先放鬆再換邊。',
    cue: '讓動作慢下來，肩前方不應有夾痛。',
    regression: '手臂放低、縮小轉身幅度；不舒服的動作直接略過。',
    followUp: '若抬手困難、夜間痛或症狀反覆影響生活，請安排評估。',
    signals: {
      green: '肩後或上背有輕微伸展感，動作後沒有加重。',
      yellow: '肩前夾痛、轉身疼痛：停止該動作並縮小幅度。',
      red: '突然無法抬手、新的手臂麻木無力，或肩背痛合併胸痛、呼吸困難：停止並就醫。',
    },
    evidence: '依 NHS 與 AAOS 動作衛教整理；伸展以活動度為目標，不宣稱能矯正姿勢或治療肩部疾病。',
    audience: '可以安全坐穩、沒有急性肩傷的一般成人。',
    sources: [
      armExercises,
      {
        label: 'AAOS｜肩部伸展',
        href: 'https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/',
      },
      sittingExercises,
      stretchingConsensus,
    ],
  }),
  relaxationGuide({
    id: 'hand-forearm-reset',
    publishedDate: ORIGINAL_DATE,
    selectionLabel: '手腕與前臂',
    bodyRegion: '上肢與手部',
    searchAliases: ['手', '手指', '打字', '抓握', '手與前臂'],
    theme: 'violet',
    eyebrow: '放下手機，鬆開抓握',
    title: '手腕與前臂放鬆：張手、動腕、轉掌',
    summary: '找個桌面支撐前臂，讓手指、手腕和前臂依序動一動。',
    imageKey: 'wrists',
    imageDescriptions: [
      '雙手放在大腿上，手指由輕握到自然張開的兩個姿勢',
      '前臂靠在桌面，手腕緩慢向上及向下活動的兩個姿勢',
      '手肘靠近身體且彎曲約九十度，前臂水平、手掌由向下轉向上的兩個姿勢',
    ],
    steps: [
      {
        title: '輕握，再張開手指',
        instruction: '雙手放在大腿上，或以前臂靠在桌面。手指輕輕合起，再自然張開，不用握緊或撐到最開。',
        dosage: '做 5–10 次。',
      },
      {
        title: '有支撐地活動手腕',
        instruction: '前臂留在桌面，手伸出桌緣。緩慢抬起手掌，再向下彎，手指保持放鬆。',
        dosage: '上下往返 5 次。',
      },
      {
        title: '手心向下，再向上',
        instruction: '手肘靠近身體、彎曲約九十度，前臂朝前。慢慢把手心轉向上，再轉回向下，肩膀和身體不跟著扭。',
        dosage: '來回 5 次。',
      },
    ],
    suitableFor: '打字或抓握後的一般疲勞；持續麻木、夜間麻醒、腫脹或近期外傷者，先安排評估。',
    dosage: '各做一輪即可，動作保持小而平順。',
    cue: '靠支撐卸下重量，不靠另一手強拉。',
    regression: '只做張開手指，或減少手腕與轉掌的幅度。',
    followUp: '若休息後仍反覆不適，或握力逐漸下降，請安排評估。',
    signals: {
      green: '活動順暢，只有輕微緊繃感。',
      yellow: '手腕或手指疼痛增加：停止該動作，減少抓握負荷。',
      red: '麻木持續、握力突然下降、明顯紅腫或外傷後疼痛：停止並就醫評估。',
    },
    evidence: '依 NHS 手部活動衛教整理，供一般活動使用；不是腕隧道症候群或肌腱疾病的治療處方。',
    audience: '沒有神經症狀、急性腫痛或近期手術的一般成人。',
    sources: [
      armExercises,
      {
        label: 'Cambridge University Hospitals｜手腕與前臂活動',
        href: 'https://www.cuh.nhs.uk/patient-information/hand-therapy-active-wrist-exercises/',
      },
    ],
  }),
  relaxationGuide({
    id: 'low-back-mobility',
    selectionLabel: '腰背',
    bodyRegion: '脊椎與軀幹',
    searchAliases: ['下背', '腰部', '骨盆', '久坐'],
    theme: 'blue',
    eyebrow: '小幅度，換個姿勢',
    title: '腰背放鬆：骨盆輕搖、屈膝擺動、拱背',
    summary: '用坐姿、仰躺和四足跪姿，練習舒服範圍內的腰背活動。',
    imageKey: 'back',
    imageDescriptions: [
      '坐穩椅子、雙腳踩地，骨盆小幅前後轉動的兩個姿勢',
      '仰躺屈膝、雙腳在墊上，雙膝小幅擺向一側的兩個姿勢',
      '四足跪姿由自然背部位置慢慢拱背的兩個姿勢',
    ],
    steps: [
      {
        title: '坐姿骨盆輕搖',
        instruction: '坐在穩固椅子上，雙腳踩地。骨盆小幅向前、向後轉動，讓腰背跟著微彎、回正。',
        dosage: '慢慢來回 5 次。',
      },
      {
        title: '仰躺屈膝左右擺',
        instruction: '仰躺、雙膝彎曲，雙腳留在墊上。膝蓋靠近，慢慢擺向一側再回中間，肩膀留在墊上。',
        dosage: '每側 5 次，小幅往返。',
      },
      {
        title: '四足跪姿輕拱背',
        instruction: '手在肩下、膝在髖下。從自然姿勢慢慢拱起背部，再回到起始位置，不向下硬壓腰。',
        dosage: '做 5 次，每次拱背停約 5 秒。',
      },
    ],
    suitableFor: '久坐後的一般腰背僵硬，且能安全上下地墊；急性外傷、脊椎骨折、近期手術或腿部麻木者先評估。',
    dosage: '各做一輪，選擇舒服的動作即可，不需全部完成。',
    cue: '用小幅活動找舒服的位置，不追求扭到最深。',
    regression: '不方便躺下、跪姿壓手腕或膝蓋時，只保留坐姿骨盆輕搖。',
    followUp: '若腰痛反覆影響走路、睡眠或工作，請安排評估。',
    signals: {
      green: '腰背有輕微活動感，做完沒有更不舒服。',
      yellow: '疼痛增加或往腿部延伸：停止該動作。',
      red: '新出現腿部無力、會陰麻木或大小便控制改變：立即停止並儘速就醫。',
    },
    evidence: '依 NHS 腰背活動衛教整理，定位為一般活動；不取代個別下背痛的評估與運動處方。',
    audience: '沒有急性受傷、骨折或神經症狀的一般成人。',
    sources: [
      backMobility,
      backCare,
      {
        label: 'Cambridge University Hospitals｜骨盆活動與輕拱背',
        href: 'https://www.cuh.nhs.uk/patient-information/pelvic-girdle-pain-pgp-in-pregnancy/',
      },
    ],
  }),
  relaxationGuide({
    id: 'hip-glute-reset',
    selectionLabel: '髖臀',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['臀部', '髖部', '屁股', '久坐'],
    theme: 'green',
    eyebrow: '椅子、支撐、地墊',
    title: '髖臀放鬆：坐姿四字、髖前伸展、單膝抱胸',
    summary: '用有支撐的姿勢，輕輕伸展臀部與髖部周圍。',
    imageKey: 'hips',
    imageDescriptions: [
      '坐姿將腳踝放在另一側大腿上，從髖部輕微前傾的兩個姿勢',
      '扶穩椅背採前後站姿，骨盆輕收並向前移動的髖前伸展兩個姿勢',
      '仰躺屈膝，以雙手輕抱一側膝下小腿上端、讓膝蓋靠近胸口的兩個姿勢',
    ],
    steps: [
      {
        title: '坐姿四字伸展',
        instruction: '坐穩，一側腳踝放在另一側大腿上。背部自然延伸，從髖部輕微前傾，感覺臀部拉伸；不要壓膝蓋。',
        dosage: '每側停約 20 秒，做 2 次。',
      },
      {
        title: '扶穩，伸展髖前側',
        instruction: '扶住穩固椅背，雙腳前後站。骨盆輕收、前膝微彎，身體小幅向前移，感覺後腿髖前側拉伸，不拱腰。',
        dosage: '每側停約 20 秒，做 2 次。',
      },
      {
        title: '仰躺單膝靠近胸口',
        instruction: '仰躺、雙膝彎曲。雙手輕抱一側膝下的小腿上端，讓膝蓋靠近胸口，再慢慢放回；不壓膝，另一腳留在墊上。',
        dosage: '每側 5 次，舒服地短暫停留。',
      },
    ],
    suitableFor: '久坐後的一般髖臀緊繃；髖關節置換、近期手術、鼠蹊夾痛或臀痛伴隨腿麻者，先確認動作是否適合。',
    dosage: '各做一輪，伸展之間先放鬆；可只選方便的姿勢。',
    cue: '伸展感應溫和，髖部前方和膝蓋不應疼痛。',
    regression: '四字姿勢不舒服就略過；縮短站距或抱膝幅度。',
    followUp: '若髖臀痛反覆、走路跛行或坐著仍痛，請安排評估。',
    signals: {
      green: '髖臀周圍微微伸展，沒有關節夾痛。',
      yellow: '鼠蹊夾痛、膝痛或症狀往腿部延伸：停止該動作。',
      red: '外傷後無法承重、髖部紅腫伴發燒，或新出現腿部無力：儘速就醫。',
    },
    evidence: '依 NHS 動作衛教與伸展共識整理。伸展以活動度為目標，不能據此診斷或治療坐骨神經痛。',
    audience: '沒有急性受傷、髖部術後限制或神經症狀的一般成人。',
    sources: [
      {
        label: 'South Tees NHS｜坐姿臀部伸展',
        href: 'https://www.southtees.nhs.uk/resources/gluteal-stretch-in-sitting/',
      },
      {
        label: 'Leicester Hospitals｜髖前側伸展',
        href: 'https://yourhealth.leicestershospitals.nhs.uk/library/women-s-children-s/women-s-health-physiotherapy/406-hip-stretches/file',
      },
      backCare,
      stretchingConsensus,
    ],
  }),
  relaxationGuide({
    id: 'thigh-reset',
    selectionLabel: '大腿',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['大腿前側', '大腿後側', '大腿內側', '股四頭肌', '腿後肌'],
    theme: 'orange',
    eyebrow: '先坐穩，再輕伸展',
    title: '大腿放鬆：後側、前側、內側伸展',
    summary: '用椅子提供支撐，分別照顧大腿的三個方向。',
    imageKey: 'thighs',
    imageDescriptions: [
      '坐姿一腿向前伸、腳跟著地，從髖部輕微前傾的腿後側伸展兩個姿勢',
      '單手扶椅背、另一手握住同側腳踝，膝蓋朝下的大腿前側伸展兩個姿勢',
      '坐穩椅子、雙腳舒適地分開，以髖部輕微前傾的大腿內側伸展兩個姿勢',
    ],
    steps: [
      {
        title: '坐姿伸展大腿後側',
        instruction: '坐在椅面前段，一腳向前、腳跟踩地，膝蓋不鎖死。背部保持自然，從髖部前傾到腿後側微微拉伸。',
        dosage: '每側停約 20 秒，做 2 次。',
      },
      {
        title: '扶椅伸展大腿前側',
        instruction: '一手扶穩椅背，另一手握同側腳踝，腳跟輕靠近臀部。膝蓋朝下、兩腿靠近，不拱腰。',
        dosage: '每側停約 20 秒，做 2 次。',
      },
      {
        title: '坐姿輕伸大腿內側',
        instruction: '坐穩，雙腳舒適地分開、腳掌踩地。雙手放腿上，從髖部小幅前傾，感覺內側拉伸即可，不用手壓膝。',
        dosage: '停約 20 秒，做 2 次。',
      },
    ],
    suitableFor: '日常活動後的一般大腿緊繃；近期拉傷、髖膝手術或膝蓋彎曲會痛者，先確認適合的動作。',
    dosage: '各做一輪，兩次伸展之間放鬆一下。',
    cue: '穩定支撐、輕微拉伸，不彈震，也不追求更深。',
    regression: '減少前傾幅度；抓不到腳踝或站不穩時，略過站姿動作。',
    followUp: '若局部疼痛反覆、影響走路或運動，請安排評估。',
    signals: {
      green: '大腿有溫和拉伸感，膝蓋與鼠蹊部不痛。',
      yellow: '膝痛、鼠蹊夾痛或腿後出現麻刺：停止該動作。',
      red: '突然腫脹瘀青、受傷後明顯無力或無法承重：停止並就醫評估。',
    },
    evidence: '依醫院與物理治療動作教材整理，伸展時間參考國際共識；不保證預防拉傷或消除運動後痠痛。',
    audience: '能安全坐穩、站姿可扶穩的一般成人。',
    sources: [
      {
        label: 'Whittington Health｜腿後側與大腿前側伸展',
        href: 'https://www.whittington.nhs.uk/document.ashx?id=13822',
      },
      {
        label: 'Physitrack｜坐姿大腿內側伸展',
        href: 'https://www.physitrack.com/exercise-library/how-to-perform-the-adductor-stretch-exercise',
      },
      stretchingConsensus,
    ],
  }),
  relaxationGuide({
    id: 'lower-limb-reset',
    publishedDate: ORIGINAL_DATE,
    selectionLabel: '小腿與足踝',
    bodyRegion: '足踝',
    searchAliases: ['下肢', '小腿', '腳踝', '踝泵', '久站'],
    theme: 'violet',
    eyebrow: '從腳踝開始動一動',
    title: '小腿與足踝放鬆：踝泵、直膝與彎膝伸展',
    summary: '先坐著活動腳踝，再扶牆伸展小腿，腳跟保持穩穩著地。',
    imageKey: 'calves',
    imageDescriptions: [
      '坐姿雙腳踩地，先以腳跟著地抬起前腳掌，再以前腳掌著地輕抬腳跟的兩個姿勢',
      '雙手扶牆、後腿膝蓋伸直且腳跟著地的小腿伸展兩個姿勢',
      '雙手扶牆、後腿膝蓋微彎且腳跟著地的小腿伸展兩個姿勢',
    ],
    steps: [
      {
        title: '坐姿踝泵',
        instruction: '坐穩、雙腳踩地。腳跟留在地上，輕抬前腳掌；放回後，再保持前腳掌著地、輕抬腳跟。',
        dosage: '前後來回 5–10 次。',
      },
      {
        title: '後膝伸直，伸展小腿',
        instruction: '雙手扶牆、雙腳前後站。前膝微彎、後膝伸直，後腳跟踩地，身體慢慢向牆靠近。',
        dosage: '每側停約 30 秒，做 2 次。',
      },
      {
        title: '後膝微彎，再輕伸展',
        instruction: '維持扶牆，站距可稍縮短。後膝輕彎、腳跟留在地上，感覺小腿下段輕微拉伸，不硬壓腳踝。',
        dosage: '每側停約 30 秒，做 2 次。',
      },
    ],
    suitableFor: '久坐或久站後的一般小腿緊繃；近期扭傷、跟腱疼痛或單側腫痛者，不直接套用。',
    dosage: '各做一輪，伸展之間先回正放鬆。',
    cue: '扶穩、腳跟著地，伸展感不應變成腳跟痛。',
    regression: '只做坐姿踝泵；站姿時縮短站距與伸展幅度。',
    followUp: '若腳跟痛、腫脹或走路不適反覆出現，請安排評估。',
    signals: {
      green: '小腿溫和伸展，結束後走路沒有變差。',
      yellow: '腳跟、踝部疼痛或站立不穩：停止伸展，改坐姿。',
      red: '單側突然腫痛、無法承重，或合併胸痛與呼吸困難：停止並儘速就醫。',
    },
    evidence: '依 NHS 與 AAOS 動作衛教整理，供一般活動與伸展使用；跟腱病變需要另外評估。',
    audience: '沒有急性下肢傷害、單側突然腫痛的一般成人。',
    sources: [
      {
        label: 'University Hospitals Sussex｜坐姿腳踝活動',
        href: 'https://www.uhsussex.nhs.uk/resources/chair-exercises/',
      },
      {
        label: 'AAOS｜直膝與彎膝小腿伸展',
        href: 'https://www.orthoinfo.org/recovery/foot-and-ankle-conditioning-program',
      },
      stretchingConsensus,
    ],
  }),
  relaxationGuide({
    id: 'three-minute-downshift',
    publishedDate: ORIGINAL_DATE,
    relaxationArea: 'whole-body',
    selectionLabel: '全身與呼吸',
    bodyRegion: '全身與神經',
    searchAliases: ['呼吸', '壓力', '全身放鬆', '下班'],
    theme: 'green',
    eyebrow: '留一段安靜的時間',
    title: '全身與呼吸放鬆：鬆開雙手、放下肩膀',
    summary: '舒服坐著，感受肌肉從輕微用力到放鬆，再把注意力帶回自然呼吸。',
    imageKey: 'breathing',
    imageDescriptions: [
      '坐在穩固椅子上，雙手輕握後張開放鬆的兩個姿勢',
      '舒服坐著，雙肩輕聳後自然放下的兩個姿勢',
      '坐姿有靠背支撐，一手放在腹部與下胸廓、另一手放大腿，肩膀放鬆並自然呼吸的兩個姿勢',
    ],
    steps: [
      {
        title: '雙手輕握，再鬆開',
        instruction: '雙腳踩地、手臂有支撐。雙手稍微握起，接著張開放鬆，留意前後感覺的不同，不用全力。',
        dosage: '輕握約 3–5 秒，充分放鬆，做 3 次。',
      },
      {
        title: '肩膀輕抬，再放下',
        instruction: '雙肩輕抬向耳朵，再緩慢放下。下顎和雙手一起鬆開，過程保持呼吸。',
        dosage: '輕抬約 3–5 秒，充分放鬆，做 3 次。',
      },
      {
        title: '回到舒服的呼吸',
        instruction: '背部靠穩，自然吸氣、輕柔吐氣。若舒服，可讓吐氣稍慢一些；不憋氣、不刻意吸得很深。',
        dosage: '先練習約 1 分鐘，舒服時可逐漸延長。',
      },
    ],
    suitableFor: '想在忙碌後短暫休息的一般成人；請在安全安靜的地方練習，不在開車或操作機械時進行。',
    dosage: '依序做一輪，不需精準計時或強迫自己放鬆。',
    cue: '以舒服為準，睜眼或閉眼都可以。',
    regression: '略過肌肉收縮，只舒服坐著；專注呼吸會不安時，改看周遭物品。',
    followUp: '若緊繃、失眠或不安持續影響生活，請尋求專業支持。',
    signals: {
      green: '身體感覺舒服，呼吸自然。',
      yellow: '頭暈、麻刺或不安增加：停止練習，回到自然呼吸。',
      red: '胸痛、明顯呼吸困難或快要暈倒：立即停止並儘速就醫。',
    },
    evidence: '依 NHS 呼吸與肌肉放鬆衛教整理；這是短暫休息練習，不是焦慮症或失眠的治療方案。',
    audience: '適用於一般成人短暫休息；急性胸悶或呼吸困難不以放鬆練習處理。',
    sources: [
      {
        label: 'NHS｜舒服的呼吸練習',
        href: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/',
      },
      {
        label: 'Oxford Health NHS｜漸進式肌肉放鬆',
        href: 'https://www.ppn.nhs.uk/resources-url/publications/21-heart2heart-step-2-cardiac-guided-self-help-booklet/file',
      },
    ],
  }),
]
