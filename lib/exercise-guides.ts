import { EXPANDED_RCT_GUIDES } from './exercise-guides-rct-expansion'
import { RECENT_RCT_GUIDES } from './exercise-guides-rct-2016-2026'

export type ExerciseGuideTheme = 'orange' | 'teal' | 'violet' | 'blue' | 'green'
export type ExerciseGuideKind = 'relaxation' | 'condition'
export type ExerciseGuideBodyRegion =
  | '頭頸與下顎'
  | '上肢與手部'
  | '脊椎與軀幹'
  | '髖膝與大腿'
  | '足踝'
  | '全身與神經'

export interface ExerciseGuideImage {
  src: string
  alt: string
  step: string
  caption: string
  width?: number
  height?: number
}

export interface ExerciseGuideSource {
  label: string
  href: string
}

export interface ExerciseGuideModule {
  id: string
  kind: ExerciseGuideKind
  selectionLabel: string
  bodyRegion?: ExerciseGuideBodyRegion
  searchAliases?: string[]
  theme: ExerciseGuideTheme
  eyebrow: string
  title: string
  summary: string
  images: ExerciseGuideImage[]
  suitableFor: string
  dosage: string
  cue: string
  regression: string
  followUpLabel?: string
  followUp?: string
  signals: {
    green: string
    yellow: string
    red: string
  }
  evidence: string
  audience: string
  sources: ExerciseGuideSource[]
}

const IMAGE_ROOT = '/images/exercise-guides'

export const EXERCISE_GUIDE_MODULES: ExerciseGuideModule[] = [
  {
    id: 'neck-shoulder-reset',
    kind: 'relaxation',
    selectionLabel: '頸肩',
    theme: 'orange',
    eyebrow: '01 · 工作中的短舒緩',
    title: '頸肩 60 秒：先卸載，再小幅活動',
    summary: '先讓手臂與肩膀有支撐，再用舒服的小幅動作改變固定姿勢。目標不是把頸部拉到最緊。',
    images: [
      {
        src: `${IMAGE_ROOT}/neck-1-support.webp`,
        alt: '前臂支撐在穩定桌面，肩膀放鬆',
        step: '15 秒',
        caption: '前臂支撐，肩膀放下',
      },
      {
        src: `${IMAGE_ROOT}/neck-2-nod.webp`,
        alt: '從坐姿站起後，以站姿做小幅點頭動作',
        step: '15 秒',
        caption: '小幅點頭，不硬縮下巴',
      },
      {
        src: `${IMAGE_ROOT}/neck-3-scapula.webp`,
        alt: '從坐姿站起後，以站姿輕收肩胛且不聳肩',
        step: '15 秒',
        caption: '肩胛輕收，不聳肩',
      },
      {
        src: `${IMAGE_ROOT}/neck-4-turn.webp`,
        alt: '從坐姿站起後，以站姿將頭轉向舒服的角度',
        step: '15 秒',
        caption: '左右轉到舒服範圍',
      },
    ],
    suitableFor: '久坐、久站、精細工作或使用螢幕後，出現一般頸肩緊繃或疲勞感，且沒有近期外傷、暈眩或手臂神經症狀。已知頸椎不穩定、類風濕性關節炎、唐氏症、近期鞭甩傷或頸椎術後者不適用。',
    dosage: '四個動作各 15 秒，完成一輪即可；先坐姿支撐前臂，接著站起來完成後三個動作。可在工作任務切換後使用。',
    cue: '幅度小、呼吸自然，做完應感覺比較容易活動，而不是更痛。',
    regression: '先只做前臂支撐與舒服範圍內的左右轉頭；坐姿也可以。',
    followUp: '規律做 2–4 週若活動或工作功能沒有改善，症狀反覆惡化，或需要持續增加止痛藥物，請安排評估。',
    signals: {
      green: '一般吃力或輕微緊繃，動作後維持穩定或較舒服。',
      yellow: '運動中疼痛或不適增加但不超過 5/10，且 24 小時內回到原本程度：縮小幅度、減少動作並觀察；若超過門檻就停止。',
      red: '尖銳痛、明顯暈眩、手臂麻木或無力、症狀向手臂擴散：立即停止並安排評估。',
    },
    evidence: '頸痛臨床指引支持依個別表現使用活動度、頸肩帶肌力與耐力訓練。本組 60 秒流程是低門檻衛教組合，不是經單獨臨床試驗驗證的治療處方；頁面的 5/10 與 24 小時規則借用肌腱復健的 pain-monitoring model，並未在這套頸肩流程中單獨驗證。',
    audience: '適用於一般成人的非急性頸肩疲勞；有外傷、神經症狀、已知上頸椎不穩定風險、頸椎術後或持續惡化者不適用。',
    sources: [
      {
        label: 'Blanpied et al. Neck Pain: Revision 2017. J Orthop Sports Phys Ther.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/28666405/',
      },
      {
        label: 'Silbernagel et al. Pain-monitoring model during Achilles tendinopathy rehabilitation: RCT. Am J Sports Med. 2007.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/17307888/',
      },
    ],
  },
  {
    id: 'hand-forearm-reset',
    kind: 'relaxation',
    selectionLabel: '手與前臂',
    theme: 'teal',
    eyebrow: '02 · 手部負荷重置',
    title: '手與前臂 60 秒：放開、甩鬆、支撐、小幅活動',
    summary: '這組只處理工作後的一般肌肉疲勞。若有夜間麻醒、持續麻刺或握力下降，不要靠加大伸展處理。',
    images: [
      {
        src: `${IMAGE_ROOT}/forearm-1-open.webp`,
        alt: '雙手自然打開並放鬆抓握',
        step: '15 秒',
        caption: '完全放開抓握',
      },
      {
        src: `${IMAGE_ROOT}/forearm-2-shake.webp`,
        alt: '雙手自然下垂並小幅甩鬆',
        step: '15 秒',
        caption: '小幅甩鬆，不用力',
      },
      {
        src: `${IMAGE_ROOT}/forearm-3-support.webp`,
        alt: '前臂放在柔軟穩定的支撐面',
        step: '15 秒',
        caption: '前臂放在軟邊支撐',
      },
      {
        src: `${IMAGE_ROOT}/forearm-4-move.webp`,
        alt: '前臂有支撐時做小幅手腕屈伸',
        step: '15 秒',
        caption: '手腕小幅屈伸',
      },
    ],
    suitableFor: '重複抓握或精細工作後的前臂痠疲感，症狀不包含麻木、夜間痛醒、明顯腫脹或握力下降。',
    dosage: '四個動作各 15 秒，完成一輪；過程不需要拉到極限。',
    cue: '先放開抓握、再支撐前臂，最後才做不痛的小幅手腕活動。',
    regression: '只做放開手指與前臂支撐；若活動會痛，可先略過手腕屈伸。',
    followUpLabel: '何時需要重新分類評估',
    followUp: '這組只適用於工作後的一般肌肉疲勞。若休息並停止重複抓握後仍反覆出現，或任何時點出現夜間麻醒、持續麻刺、握力下降、明顯腫脹，請不要增加伸展幅度或次數；應停止這組流程並安排評估，重新確認是否屬於神經壓迫、肌腱、關節或其他問題。',
    signals: {
      green: '一般疲勞感沒有增加，手指與手腕活動維持順暢。',
      yellow: '局部不適稍升：減少幅度，停止重複抓握並觀察。',
      red: '夜間麻醒、持續麻木、握力下降、明顯腫脹或外傷後疼痛：停止自我處理並安排評估。',
    },
    evidence: 'AAOS 2024 腕隧道症候群指引指出，運動與神經／肌腱滑動的研究結果不一致，且未顯示長期病人回報結果改善。因此本組是一般工作疲勞的短暫卸載，不是腕隧道症候群治療。',
    audience: '適用於沒有神經症狀的一般成人前臂疲勞；已知腕隧道症候群或持續麻木者應依專業評估處理。',
    sources: [
      {
        label: 'AAOS. Management of Carpal Tunnel Syndrome Evidence-Based Clinical Practice Guideline, 2024.',
        href: 'https://www.aaos.org/globalassets/quality-and-practice-resources/carpal-tunnel/carpal-tunnel-2024/cts-cpg.pdf',
      },
    ],
  },
  {
    id: 'lower-limb-reset',
    kind: 'relaxation',
    selectionLabel: '下肢',
    theme: 'violet',
    eyebrow: '03 · 久站久坐換負荷',
    title: '下肢 80 秒：踝泵、提踵、踏步、坐站',
    summary: '用四個簡單動作讓久站或久坐變成動態。這不是平衡測驗，站立動作都先找到穩固支撐。',
    images: [
      {
        src: `${IMAGE_ROOT}/legs-1-ankle-pump.webp`,
        alt: '坐姿進行腳踝上下活動',
        step: '20 秒',
        caption: '坐姿踝泵',
      },
      {
        src: `${IMAGE_ROOT}/legs-2-heel-raise.webp`,
        alt: '手扶穩定桌面進行站姿提踵',
        step: '20 秒',
        caption: '扶穩提踵',
      },
      {
        src: `${IMAGE_ROOT}/legs-3-march.webp`,
        alt: '手扶穩定桌面做小幅原地踏步',
        step: '20 秒',
        caption: '小幅原地踏步',
      },
      {
        src: `${IMAGE_ROOT}/legs-4-sit-to-stand.webp`,
        alt: '從穩定椅子平順起身',
        step: '20 秒',
        caption: '椅子坐站',
      },
    ],
    suitableFor: '久站或久坐後的一般下肢疲勞，能安全站立且沒有單側突然腫痛、暈眩或急性受傷。',
    dosage: '四個動作各 20 秒，完成一輪；站立動作全程可扶穩。',
    cue: '先有支撐、再活動，不追求速度或單腳平衡。',
    regression: '只做坐姿踝泵；坐站可提高椅面或先用雙手協助。',
    followUpLabel: '什麼情況要停止並評估',
    followUp: '這組只是中斷久坐或久站，不需設定「連續做幾週」的療程門檻。若每次站起或走動都反覆不穩、疼痛已影響承重、出現單側腫脹或發熱，或近期曾跌倒，請停止這組流程並安排評估；單側突然腫痛合併胸痛或明顯呼吸困難時，依紅燈警訊儘速就醫。',
    signals: {
      green: '一般腿部出力感，能保持呼吸與控制，結束後走路正常。',
      yellow: '症狀略升或平衡不穩：改坐姿、扶穩並減少次數。',
      red: '單側突然腫痛、無法承重、暈眩、胸痛或明顯呼吸困難：立即停止並依症狀就醫。',
    },
    evidence: 'WHO 身體活動與久坐行為指引支持成人規律活動與肌力訓練。這組 80 秒流程的定位是中斷固定負荷，不是針對特定疾病的治療處方。',
    audience: '適用於能安全坐站的一般成人；近期跌倒、急性下肢傷害或平衡明顯不穩者需先評估。',
    sources: [
      {
        label: 'World Health Organization. Guidelines on physical activity and sedentary behaviour, 2020.',
        href: 'https://www.who.int/publications/i/item/9789240015128',
      },
    ],
  },
  {
    id: 'low-back-strength',
    kind: 'relaxation',
    selectionLabel: '下背與核心',
    theme: 'blue',
    eyebrow: '04 · 漸進軀幹訓練',
    title: '下背 4–6 分鐘：腳跟點地、鳥狗式、橋式',
    summary: '三個動作是可調整的起步選項，不是保護脊椎的唯一方法。先追求控制與隔天恢復，再逐步增加。',
    images: [
      {
        src: `${IMAGE_ROOT}/back-1-heel-tap.webp`,
        alt: '仰躺屈膝，單側腳跟慢慢點地',
        step: '動作 1',
        caption: '腳跟點地：單腳、小幅開始',
        width: 557,
      },
      {
        src: `${IMAGE_ROOT}/back-2-bird-dog.webp`,
        alt: '四足跪姿做對側手腳延伸的鳥狗式',
        step: '動作 2',
        caption: '鳥狗式：穩定比抬高重要',
        width: 557,
      },
      {
        src: `${IMAGE_ROOT}/back-3-bridge.webp`,
        alt: '仰躺屈膝進行小幅橋式',
        step: '動作 3',
        caption: '橋式：臀部出力，不過度拱腰',
        width: 558,
      },
    ],
    suitableFor: '反覆或慢性非特異性下背不適，症狀穩定，且沒有近期重大外傷、發燒、進行性神經症狀或大小便控制改變。',
    dosage: '每個動作先做 1 組、6–8 次，每週 2–3 次；隔天反應穩定後，一次只增加次數、組數、幅度或阻力其中一項。',
    cue: '保持自然呼吸；動作做到能控制的範圍，不必把腰硬壓地面或追求抬得更高。',
    regression: '腳跟點地改成只抬一腳；鳥狗式只動手或腳，或改手扶桌面的站姿；橋式縮小抬起高度。',
    followUp: '規律做 2–4 週若活動、睡眠或工作功能沒有改善，或需要持續增加止痛藥物，請安排評估。',
    signals: {
      green: '正常吃力或短暫痠感，隔天功能與睡眠沒有變差。',
      yellow: '運動中疼痛不超過 5/10、24 小時內回到原本程度，且隔天早晨僵硬沒有增加，才可先減量觀察；超過任一門檻就停止並重新評估。',
      red: '進行性無力、持續麻木、會陰麻木、大小便控制改變、發燒或快速惡化的夜間痛：停止並儘速評估。',
    },
    evidence: 'Cochrane 系統性回顧顯示，運動治療對慢性非特異性下背痛的疼痛有中等確定性證據；功能改善的平均幅度較小。研究支持運動這個方向，但沒有證明這三個動作適合所有人；頁面的 5/10 與 24 小時規則借用肌腱復健的 pain-monitoring model，並不是下背痛的診斷或通用進階標準。',
    audience: '適用於症狀穩定的慢性非特異性下背痛成人；急性外傷、術後或有紅旗症狀者不適用。',
    sources: [
      {
        label: 'Hayden et al. Exercise therapy for chronic low back pain. Cochrane Database Syst Rev. 2021.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/34580864/',
      },
      {
        label: 'WHO guideline for non-surgical management of chronic primary low back pain, 2023.',
        href: 'https://www.who.int/publications/i/item/9789240081789',
      },
      {
        label: 'Silbernagel et al. Pain-monitoring model during Achilles tendinopathy rehabilitation: RCT. Am J Sports Med. 2007.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/17307888/',
      },
    ],
  },
  {
    id: 'three-minute-downshift',
    kind: 'relaxation',
    selectionLabel: '全身與呼吸',
    theme: 'green',
    eyebrow: '05 · 壓力與疲勞降速',
    title: '3 分鐘降速：慢吐氣＋漸進式放鬆',
    summary: '用輕微收縮與較慢吐氣降低當下的生理喚起。這是短暫調節工具，不等於治療倦怠或焦慮症。',
    images: [
      {
        src: `${IMAGE_ROOT}/relax-1-settle.webp`,
        alt: '坐姿穩定並放鬆下顎',
        step: '30 秒',
        caption: '穩定姿勢，鬆下顎',
        height: 720,
      },
      {
        src: `${IMAGE_ROOT}/relax-2-hands.webp`,
        alt: '坐姿輕握手後完全放鬆',
        step: '60 秒',
        caption: '手輕握 3 秒、放鬆 6 秒',
        height: 720,
      },
      {
        src: `${IMAGE_ROOT}/relax-3-shoulders.webp`,
        alt: '坐姿輕聳肩後完全放鬆',
        step: '60 秒',
        caption: '肩輕聳 3 秒、放鬆 6 秒',
        height: 720,
      },
      {
        src: `${IMAGE_ROOT}/relax-4-breathe.webp`,
        alt: '坐姿自然吸氣並放慢吐氣',
        step: '30 秒',
        caption: '自然吸、較慢吐',
        height: 720,
      },
    ],
    suitableFor: '工作後仍處於緊繃、呼吸偏快或難以轉換注意力，但沒有胸痛、明顯呼吸困難或急性身心危機。請在安全、穩定的環境練習，不要在開車、操作機械或高處作業時進行；少數人放鬆或專注呼吸時反而更不安，這不代表做錯，可直接停止並回到自然呼吸。',
    dosage: '依序完成 30、60、60、30 秒；肌肉只用輕到中等力量，不憋氣。',
    cue: '精準秒數不是重點，慢、舒服、規律即可。',
    regression: '完全不做收縮，只維持穩定坐姿與自然呼吸；也可以旁觀。',
    followUp: '若緊繃、呼吸急促、失眠或不安反覆 2–4 週仍影響工作、睡眠或日常功能，請安排專業評估；急性危機不等待此期限。',
    signals: {
      green: '呼吸與身體逐漸放慢，過程舒服且能保持清醒。',
      yellow: '輕微頭暈或不安增加：立即停止計時並回到自然呼吸；若停止後 10 分鐘仍未回到原本程度，當次不再嘗試。',
      red: '胸痛、明顯呼吸困難、快要暈倒或危機感持續升高：立即停止並依急症或心理支持流程求助。',
    },
    evidence: '呼吸練習的 RCT 統合分析納入 12 項壓力研究、785 人，平均呈現小到中等效果，但整體偏誤風險為中等，方案與時間也不同；Balban 研究則是單一 RCT。Braith 1988 對放鬆時焦慮增加的觀察來自 30 名長期焦慮成人，不能換算成一般族群的發生率。研究支持慢呼吸與放鬆這個方向，但沒有直接驗證本站這套 3 分鐘組合，也不能推論為立即治療效果。',
    audience: '適用於一般成人的短暫降速與恢復；持續失眠、耗竭、情緒或工作功能受影響者應尋求專業支持。',
    sources: [
      {
        label: 'Balban et al. Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Rep Med. 2023.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/36630953/',
      },
      {
        label: 'Fincham et al. Effect of breathwork on stress and mental health: a meta-analysis of RCTs. Sci Rep. 2023.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/36624160/',
      },
      {
        label: 'Cochrane Review. Individual-level interventions for reducing occupational stress in healthcare workers, 2023.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/37169364/',
      },
      {
        label: 'Braith et al. Relaxation-induced anxiety in chronically anxious adults. J Behav Ther Exp Psychiatry. 1988.',
        href: 'https://pubmed.ncbi.nlm.nih.gov/3069875/',
      },
    ],
  },
  {
    id: 'deep-cervical-flexor-rct',
    kind: 'condition',
    selectionLabel: '慢性機械性頸痛',
    bodyRegion: '頭頸與下顎',
    searchAliases: ['頸痛', '脖子痛', '肩頸痠痛', '深層頸屈肌', '點頭運動'],
    theme: 'orange',
    eyebrow: '06 · 2019 隨機對照試驗',
    title: '深層頸屈肌：6 週低負荷點頭訓練',
    summary: '研究先用壓力回饋確認動作，再練習像輕輕說「是」的小幅點頭。重點是頭不離開支撐、表層頸肌不搶著出力。',
    images: [
      {
        src: `${IMAGE_ROOT}/neck-rct-1-setup.webp`,
        alt: '仰躺屈膝，後頸以摺疊毛巾輕柔支撐',
        step: '起始',
        caption: '後頸支撐，肩膀與下顎放鬆',
        width: 589,
        height: 887,
      },
      {
        src: `${IMAGE_ROOT}/neck-rct-2-nod.webp`,
        alt: '仰躺時做小幅深層頸屈肌點頭動作',
        step: '點頭',
        caption: '像輕說「是」，頭不抬離支撐',
        width: 588,
        height: 887,
      },
      {
        src: `${IMAGE_ROOT}/neck-rct-3-return.webp`,
        alt: '控制回到仰躺中立位置並放鬆頸部',
        step: '回位',
        caption: '慢慢回中立，不把下巴往上頂',
        width: 591,
        height: 887,
      },
    ],
    suitableFor: '已由專業人員評估為慢性機械性頸痛，且沒有頸神經根或脊髓症狀、近期外傷、骨折、頸椎手術、骨質疏鬆或感染等情況。',
    dosage: '依研究：10 次為一組，每天居家練習 2 次，另每週 2 次接受指導，持續 6 週。原文沒有完整交代居家每次要做幾組，不宜自行追加高量。',
    cue: '只做非常小的點頭；後腦不離開支撐，喉嚨前方不要明顯繃起。',
    regression: '改用更薄的毛巾、再縮小幅度；若仍會抬頭或表層頸肌明顯出力，先由復健專業人員用觸診或壓力回饋教學。',
    signals: {
      green: '動作過程不誘發頸痛，能維持自然呼吸，做完活動與症狀沒有變差。',
      yellow: '下巴用力夾緊、頭抬起、頸前肌明顯鼓起或症狀稍升：縮小幅度並減少次數。',
      red: '手臂麻木或無力、走路不穩、電擊感、嚴重頭痛或近期外傷後疼痛：停止並安排評估。',
    },
    evidence: '54 名慢性機械性頸痛患者的隨機對照試驗顯示，深層頸屈肌組在 6 週後及部分追蹤點的失能、疼痛、頸部角度與肌力改善優於一般照護。原文 Figure 2 有動作圖；本站圖片依動作重新製作。限制是樣本小、介入含現場指導與壓力回饋，最長只追蹤 3 個月。',
    audience: '適用於經評估的慢性機械性頸痛成人；不能直接外推到急性頸痛、神經根病變、鞭甩傷或頸椎術後。',
    sources: [
      {
        label: 'Chotiyarnwong et al. Specific deep cervical muscle exercises for chronic mechanical neck pain: RCT. J Pain Res. 2019.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6411318/',
      },
    ],
  },
  {
    id: 'short-foot-rct',
    kind: 'condition',
    selectionLabel: '慢性踝不穩',
    bodyRegion: '足踝',
    searchAliases: ['腳踝不穩', '反覆扭傷', '拐到腳', '足弓', '短足運動'],
    theme: 'teal',
    eyebrow: '07 · 2019 隨機對照試驗',
    title: '足弓短足運動：8 週本體感覺與平衡訓練',
    summary: '把大拇趾球往腳跟方向輕收，讓足弓變短、變高，但腳趾保持平貼不抓地。先坐姿學會，再進階承重。',
    images: [
      {
        src: `${IMAGE_ROOT}/ankle-short-foot-1-relax.webp`,
        alt: '坐姿時足底完整接觸防滑墊且腳趾放鬆',
        step: '起始',
        caption: '腳掌三點貼地，腳趾放鬆',
        width: 510,
        height: 1024,
      },
      {
        src: `${IMAGE_ROOT}/ankle-short-foot-2-contract.webp`,
        alt: '坐姿做短足運動，足弓輕抬且腳趾不抓地',
        step: '收短',
        caption: '大拇趾球靠近腳跟，不捲腳趾',
        width: 505,
        height: 1024,
      },
      {
        src: `${IMAGE_ROOT}/ankle-short-foot-3-standing.webp`,
        alt: '手扶穩定扶手，在泡棉墊上進行單腳短足運動',
        step: '進階',
        caption: '第 5–8 週再扶穩做單腳承重',
        width: 507,
        height: 1024,
      },
    ],
    suitableFor: '反覆踝扭傷後仍有「軟腳」或不穩感，已排除近期急性扭傷，並能在穩固支撐旁安全練習。研究對象為 19–29 歲、CAIT 分數不超過 24 的年輕成人。',
    dosage: '依研究：維持 5 秒、12 次為一個區塊，共 3 個區塊，區塊間休息 2 分鐘，每週 3 次、持續 8 週；前 4 週坐姿，第 5–8 週才進到單腳不穩定墊。',
    cue: '想像腳掌縮短，不是把腳趾抓成拳頭；腳跟與大拇趾球都留在地面。',
    regression: '停留在坐姿與穩固地面；站姿時先雙腳承重並扶穩，不急著使用泡棉墊或單腳。',
    signals: {
      green: '足弓內側有輕微出力，腳趾仍能放鬆，結束後沒有腫脹或更不穩。',
      yellow: '腳趾抽筋、抓地、足底疼痛或膝蓋明顯內夾：回到坐姿並減少維持時間。',
      red: '近期再度扭傷、無法承重、明顯腫脹、跌倒或持續麻木：停止並安排評估。',
    },
    evidence: '30 名慢性踝不穩年輕成人的隨機對照試驗顯示，短足運動相較本體感覺運動，在部分關節位置覺、震動覺、動態平衡與 CAIT 不穩定分數有較大改善。原文 Figure 2 有動作圖；本站圖片依姿勢重新製作。限制是樣本小、沒有不運動對照組、只看 8 週結果。',
    audience: '適用於年輕成人的慢性踝不穩；不能直接外推到急性扭傷、骨折、明顯韌帶鬆弛或高跌倒風險者。',
    sources: [
      {
        label: 'Lee et al. Short-Foot Exercise Promotes Quantitative Somatosensory Function in Ankle Instability: RCT. Med Sci Monit. 2019.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6350454/',
      },
    ],
  },
  {
    id: 'shoulder-external-rotation-rct',
    kind: 'condition',
    selectionLabel: '肩峰下疼痛',
    bodyRegion: '上肢與手部',
    searchAliases: ['肩痛', '肩夾擠', '旋轉肌', '肩外旋', '抬手痛'],
    theme: 'violet',
    eyebrow: '08 · 2020 隨機對照試驗',
    title: '肩外旋肌力：8 週彈力帶訓練',
    summary: '上臂貼近身體、手肘彎曲，雙手慢慢把彈力帶拉開再控制回來。研究測試的是高訓練量方案，不是只做幾下就一定有效。',
    images: [
      {
        src: `${IMAGE_ROOT}/shoulder-rct-1-setup.webp`,
        alt: '站姿雙肘彎曲九十度並貼近身體，雙手握彈力帶',
        step: '起始',
        caption: '手肘貼身，肩膀放鬆',
        width: 582,
        height: 887,
      },
      {
        src: `${IMAGE_ROOT}/shoulder-rct-2-rotate.webp`,
        alt: '雙手向外拉開彈力帶進行肩關節外旋',
        step: '拉開',
        caption: '手向外，手肘不要離開身體',
        width: 585,
        height: 887,
      },
      {
        src: `${IMAGE_ROOT}/shoulder-rct-3-return.webp`,
        alt: '緩慢控制彈力帶回到肩外旋起始位置',
        step: '回程',
        caption: '一秒拉開、兩秒控制回來',
        width: 583,
        height: 887,
      },
    ],
    suitableFor: '已診斷肩峰下疼痛、症狀至少 1 年、年齡約 35–65 歲，且已排除冰凍肩與其他神經或骨科疾病者。',
    dosage: '研究方案為每週 3 次、持續 8 週；先無阻力暖身 2 組、每組 10–15 次，再做 7 組遞減次數（18–19 次逐組降到 6–7 次），組間休息 90 秒，主訓練達 Borg 17–19。這是高量方案，不建議未評估者直接照搬。',
    cue: '上臂留在身側、手腕保持中立；動的是肩外旋，不是挺胸或聳肩。',
    regression: '改用更輕的彈力帶與較小幅度，先只做 1–2 組動作熟悉；若夜間痛或隔天症狀增加，先由專業人員調整總量。',
    signals: {
      green: '肩後側有訓練感，動作能維持控制，當晚與隔天沒有明顯加劇。',
      yellow: '聳肩、手肘離身、出現夾擠痛或隔天症狀升高：降低阻力、組數或幅度。',
      red: '新發外傷、明顯無力、手臂抬不起來、持續麻木或胸痛：停止並安排評估。',
    },
    evidence: '這項研究分析 56 名慢性肩峰下疼痛成人；兩種 8 週外旋肌力訓練相較被動對照，在多項疼痛／功能與體能指標有統計改善。原文 Figure 3 有起始與終點圖；本站重新製作三段示範。限制是傳統彈力帶組的 SPADI 平均改善 12.7 分，較作者採用的臨床重要差異少 0.5 分，且有人因症狀惡化等原因退出，因此不能把高量處方視為一般起始量。',
    audience: '適用於經診斷的長期肩峰下疼痛成人；不適用於急性肩傷、冰凍肩、明顯旋轉肌腱斷裂或神經症狀。',
    sources: [
      {
        label: 'Schedler et al. Traditional versus alternative strengthening for subacromial shoulder pain: RCT. Sports. 2020.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7240395/',
      },
    ],
  },
  {
    id: 'patellar-tendon-loading-rct',
    kind: 'condition',
    selectionLabel: '髕腱病變',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['膝蓋下方痛', '跳躍膝', '髕腱炎', '膝肌腱', '落地膝痛'],
    theme: 'blue',
    eyebrow: '09 · 2021 隨機對照試驗',
    title: '髕腱漸進負荷：四階段回到運動',
    summary: '從等長、慢速動態、能量儲存到運動專項逐階增加。這是給已確診髕腱病變運動者的完整復健架構，不是膝痛都能直接套用。',
    images: [
      {
        src: `${IMAGE_ROOT}/patellar-rct-1-isometric.webp`,
        alt: '坐姿單腳膝伸機在中等屈膝角度維持等長收縮',
        step: '第 1 階',
        caption: '等長：中角度固定出力',
        width: 620,
        height: 617,
      },
      {
        src: `${IMAGE_ROOT}/patellar-rct-2-isotonic.webp`,
        alt: '單腳腿推機在可控制範圍進行慢速動態負荷',
        step: '第 2 階',
        caption: '等張：慢速增加重量與角度',
        width: 618,
        height: 617,
      },
      {
        src: `${IMAGE_ROOT}/patellar-rct-3-energy-storage.webp`,
        alt: '雙腳小幅跳躍後以髖膝彎曲安靜落地',
        step: '第 3 階',
        caption: '能量儲存：從雙腳跳落地開始',
        width: 620,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/patellar-rct-4-sport.webp`,
        alt: '運動員在角錐間進行控制良好的變向練習',
        step: '第 4 階',
        caption: '專項：逐步加入跑跳與變向',
        width: 618,
        height: 615,
      },
    ],
    suitableFor: '18 歲以上、症狀至少 3 個月，經臨床與影像確認髕腱病變且希望回到跑跳運動者。其他原因的前膝痛、急性肌腱傷害或術後狀態不適用。',
    dosage: '研究第 1 階每天做 5 次、每次 45 秒的約 60°膝屈等長收縮，負荷約 70%最大自主收縮；第 2 階隔日慢速等張 4×15，逐步進到 4×6；第 3 階每 3 天從雙腳 3×10 漸進到單腳 6×10；第 4 階加入運動專項。只有在目前階段疼痛不超過 3/10 時才進階。',
    cue: '先守住疼痛不超過 3/10與隔天反應，再增加重量、角度、速度或單腳負荷；一次只改一項。',
    regression: '停留在第 1 階並降低阻力；沒有器材或無法估算 70%出力時，不用牆蹲自行替代，先由專業人員選擇可量化的腿推或膝伸方式。',
    signals: {
      green: '運動中疼痛不超過 3/10，動作可控制，隔天沒有明顯增加。',
      yellow: '疼痛超過 3/10、隔天僵硬或痛感增加：退回前一階並降低重量、角度或總量。',
      red: '突然啪聲、快速腫脹、無法伸直膝蓋、膝鎖住或無法承重：立即停止並儘速評估。',
    },
    evidence: '76 名髕腱病變運動者的隨機臨床試驗顯示，24 週時四階段漸進肌腱負荷的 VISA-P 改善優於疼痛誘發型離心訓練，調整後組間差 9 分（95% CI 1–16）。原文 Figure 2 與補充附錄有動作圖和完整進階；本站依四階段重製圖像。限制是研究檢驗整套方案、以運動族群為主，且器材負荷與進階需要個別化。',
    audience: '適用於已確診且症狀穩定的成人髕腱病變運動者；一般膝痛、急性傷害或未經診斷者不應直接照做完整方案。',
    sources: [
      {
        label: 'Breda et al. Progressive tendon-loading exercise therapy for patellar tendinopathy: RCT. Br J Sports Med. 2021.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8070614/',
      },
    ],
  },
  {
    id: 'gluteal-tendon-leap-rct',
    kind: 'condition',
    selectionLabel: '臀肌腱病變',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['臀部外側痛', '大轉子疼痛', '側躺痛', '髖外側痛', '臀肌腱'],
    theme: 'green',
    eyebrow: '10 · 2018 LEAP 隨機對照試驗',
    title: '臀肌腱負荷：8 週教育＋運動方案',
    summary: '先減少壓迫臀肌腱的姿勢，再用等長、橋式、蹲與側向負荷逐步增加能力。療效來自教育與個別化運動的組合，不是某一個動作。',
    images: [
      {
        src: `${IMAGE_ROOT}/gluteal-rct-1-isometric.webp`,
        alt: '仰躺屈膝，以束帶做低負荷髖外展等長啟動',
        step: '低負荷',
        caption: '束帶只取鬆弛，外側臀部輕出力',
        width: 625,
        height: 623,
      },
      {
        src: `${IMAGE_ROOT}/gluteal-rct-2-bridge.webp`,
        alt: '仰躺雙腳橋式，骨盆維持水平且不過度抬高',
        step: '橋式',
        caption: '臀部出力，骨盆平、腰不過拱',
        width: 626,
        height: 623,
      },
      {
        src: `${IMAGE_ROOT}/gluteal-rct-3-squat.webp`,
        alt: '站姿做淺幅雙腳慢速蹲，膝蓋對準腳趾',
        step: '蹲',
        caption: '髖往後、膝蓋對準中間腳趾',
        width: 625,
        height: 624,
      },
      {
        src: `${IMAGE_ROOT}/gluteal-rct-4-sidestep.webp`,
        alt: '保持骨盆水平並做控制良好的側向跨步',
        step: '側向',
        caption: '身體直立，側跨後仍保持髖寬',
        width: 626,
        height: 624,
      },
    ],
    suitableFor: '35–70 歲、外側髖痛至少 3 個月，經臨床檢查與 MRI 確認臀中肌或臀小肌腱病變者。腹股溝痛為主、明顯髖關節炎或腰椎神經症狀者需先另行評估。',
    dosage: '研究為 8 週內 14 次個別物理治療，加上每天 4–6 個居家動作；前兩週每週 1 次指導，後六週每週 2 次。低負荷、功能動作與慢速重負荷分別依 Borg 約 11–12、13–15、14–17 漸進，不是四張圖每次全部照固定組數完成。',
    cue: '維持骨盆水平與膝蓋方向，避免讓患側髖長時間內收或跨過身體中線。',
    regression: '先做仰躺低負荷等長與小幅橋式；蹲縮小深度，側跨改成不加彈力帶並扶穩。',
    signals: {
      green: '功能動作不增加外側髖痛；重負荷即使有疼痛，也不超過 5/10、停止後能緩解，當晚與隔天早上沒有更痛。',
      yellow: '骨盆歪斜、膝內夾、痛感延續到夜間或隔天：降低負荷、次數或退回前一層級。',
      red: '突然無法承重、外傷後劇痛、發燒、快速腫脹或合併明顯腿部麻木無力：停止並儘速評估。',
    },
    evidence: '204 名經影像確認臀肌腱病變成人的 LEAP 隨機臨床試驗顯示，教育＋運動在 8 週的整體改善與疼痛優於等待觀察，也優於單次類固醇注射；52 週整體改善仍較佳。補充資料 Table S2 以照片呈現動作與進階，本站依其中四類重新製圖。限制是介入包含負荷教育、14 次個別治療與每日 4–6 個動作，不能把效果歸因到單一橋式、蹲或側跨。',
    audience: '適用於經確認的慢性臀肌腱病變成人；不適用於未診斷的一般髖痛、急性外傷或主要症狀來自髖關節／腰椎者。',
    sources: [
      {
        label: 'Mellor et al. Education plus exercise for gluteal tendinopathy (LEAP): RCT. BMJ. 2018.',
        href: 'https://www.bmj.com/content/361/bmj.k1662',
      },
      {
        label: 'LEAP trial supplementary material: exercise descriptions and photographs.',
        href: 'https://www.bmj.com/highwire/filestream/976441/field_highwire_adjunct_files/0/melr042341.ww.pdf',
      },
    ],
  },
  {
    id: 'patellofemoral-telehealth-rct',
    kind: 'condition',
    selectionLabel: '髕股疼痛',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['前膝痛', '上下樓膝痛', '跑者膝', '髕骨痛', '蹲下膝痛'],
    theme: 'orange',
    eyebrow: '11 · 2024 隨機對照試驗',
    title: '髕股疼痛：4 週髖膝肌力＋動作控制',
    summary: '研究把髖膝肌力與四種階梯動作放在即時視訊監督的完整方案中；重點是骨盆、膝蓋與腳掌的控制，不是硬把膝蓋推向某個位置。',
    images: [
      {
        src: `${IMAGE_ROOT}/pfp-rct-1-wall-slide.webp`,
        alt: '背靠牆做約四十五度小幅滑牆蹲，雙膝對準雙腳',
        step: '動作控制 1',
        caption: '滑牆小蹲：先守住膝蓋方向',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/pfp-rct-2-forward-step.webp`,
        alt: '單腳向前踩上低階並維持骨盆與膝蓋穩定',
        step: '動作控制 2',
        caption: '向前上階：整個腳掌踩穩',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/pfp-rct-3-lateral-step.webp`,
        alt: '面向前方從側面踩上低階並保持膝蓋對準腳掌',
        step: '動作控制 3',
        caption: '側向上階：骨盆保持水平',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/pfp-rct-4-step-down.webp`,
        alt: '扶穩欄杆站在低階上，以支撐腳控制身體下降並讓另一側腳跟輕點地面',
        step: '動作控制 4',
        caption: '控制下階：腳跟輕點、不急著落地',
        width: 615,
        height: 615,
      },
    ],
    suitableFor: '18–40 歲、前膝或髕骨後方疼痛至少 3 個月，且經臨床條件確認為髕股疼痛的女性。研究排除近期膝傷、關節置換、糖尿病、類風濕性關節炎與高活動量運動者。',
    dosage: '依研究：每週 3 次、持續 4 週，共 12 次，每次約 60 分鐘並由物理治療師即時視訊監督。肌力與動作控制各做 3 組、每組 10 次，組間休息 60 秒、不同動作間休息 3 分鐘；阻力需調到最後幾次有挑戰但仍能維持動作品質。',
    cue: '腳掌踩穩，讓骨盆、膝蓋與腳掌保持可控制的連線；用鏡頭或鏡子看動作，不要只追求蹲得更深。',
    regression: '降低階梯高度、縮小蹲幅、雙手扶穩，或先只練習上階而不做單腳控制下階；無法維持方向時先由專業人員提供回饋。',
    signals: {
      green: '完成動作時能維持控制，疼痛沒有明顯增加，當晚與隔天活動沒有變差。',
      yellow: '膝蓋反覆內夾、骨盆歪斜、疼痛逐組升高或隔天更痛：降低階高、幅度、阻力或組數。',
      red: '近期外傷、膝蓋快速腫脹、鎖住、明顯無力或無法承重：停止並安排評估。',
    },
    evidence: '42 名年輕女性的 RCT 顯示，即時視訊監督的髖膝肌力＋動作控制方案，相較自行伸展，在 4 週後改善疼痛、Kujala 功能分數、跳躍／下階表現與動態膝外翻角度。原文 Figures 2–3 有八種動作照片，本站選其中四種動作重新製圖。限制是樣本小、只有年輕女性與短期結果，而且介入包含完整肌力訓練、伸展與即時回饋，不能把療效歸因於這四張階梯圖。',
    audience: '適用於符合研究條件、能接受即時動作回饋的年輕女性髕股疼痛；不能直接外推到所有前膝痛、競技運動員、急性膝傷或男性。',
    sources: [
      {
        label: 'Nilmart et al. Telehealth-based therapeutic exercise for patellofemoral pain: RCT. BMJ Open Sport Exerc Med. 2024.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11667270/',
      },
    ],
  },
  {
    id: 'knee-osteoarthritis-strength-rct',
    kind: 'condition',
    selectionLabel: '膝骨關節炎',
    bodyRegion: '髖膝與大腿',
    searchAliases: ['膝退化', '退化性關節炎', '膝痛', '坐站困難', '走路膝痛'],
    theme: 'teal',
    eyebrow: '12 · 2025 隨機臨床試驗',
    title: '膝骨關節炎：12 週漸進下肢肌力',
    summary: '大型試驗比較完整瑜伽與完整下肢強化方案；本頁呈現強化組手冊中的四個代表動作，並保留研究沒有證明單一動作療效的限制。',
    images: [
      {
        src: `${IMAGE_ROOT}/knee-oa-rct-1-chair-stand.webp`,
        alt: '從穩定椅子緩慢起身，雙膝對準雙腳',
        step: '起步',
        caption: '椅子坐站：慢起、慢坐',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/knee-oa-rct-2-wall-squat.webp`,
        alt: '背靠牆做約三十度淺蹲並維持雙膝方向',
        step: '進階',
        caption: '淺幅牆蹲：先從約 30° 開始',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/knee-oa-rct-3-step-up.webp`,
        alt: '手扶欄杆慢慢踩上低階並控制膝蓋方向',
        step: '功能',
        caption: '低階上階：患側腳掌踩穩',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/knee-oa-rct-4-knee-extension.webp`,
        alt: '坐姿以固定在椅腳的彈力帶做膝伸直動作',
        step: '阻力',
        caption: '坐姿膝伸：停住再慢慢放下',
        width: 615,
        height: 615,
      },
    ],
    suitableFor: '40 歲以上、符合美國風濕病學會臨床膝骨關節炎條件，且近一個月膝痛至少 40/100 的成人；需能不用助行器走路，並通過運動安全篩檢。',
    dosage: '依研究：前 12 週每週 3 次（2 次一小時監督團體課＋1 次一小時居家），第 13–24 週改為每週 3 次居家。強化手冊以 10 次為主，第 1 週可從 1 組開始，逐步到 2–3 組，組間休息 30–60 秒，主觀用力約 5–7/10；每個人由帶課者依動作品質與反應進階。',
    cue: '平順、緩慢、膝蓋對準腳掌；訓練可以有可耐受的不適，但隔天應回到平常程度且沒有增加腫脹。',
    regression: '坐站改用較高椅面或雙手輔助；牆蹲縮小角度；上階降低高度並扶穩；彈力帶改更輕。先從 1 組開始，不要同時增加阻力與組數。',
    signals: {
      green: '用力約 5–7/10，動作仍平順，當天不適可接受且隔天回到原本程度。',
      yellow: '痛或腫脹延續超過一天、動作明顯變形或頭暈：退回前一級、減少次數並通知帶課者。',
      red: '膝蓋突然鎖住、快速腫脹、無法承重、跌倒受傷、胸痛或快要暈倒：立即停止並依情況就醫。',
    },
    evidence: '117 名膝骨關節炎成人的 RCT 比較瑜伽與實證下肢強化：12 週主要疼痛結果無顯著組間差，瑜伽符合相對於強化方案的非劣性界值；兩組疼痛都比基準改善。官方補充手冊以圖片呈現完整進階，本站從強化組八類動作選四類重新製圖。限制是沒有無運動對照、研究比較的是兩套完整方案，不能推論這四個動作單獨有效，也不能解讀成瑜伽優於肌力訓練。',
    audience: '適用於符合臨床膝骨關節炎條件、能安全參與漸進團體課的 40 歲以上成人；一般未評估膝痛、近期手術／注射或需助行器者不宜直接照搬。',
    sources: [
      {
        label: 'Abafita et al. Yoga or Strengthening Exercise for Knee Osteoarthritis: RCT. JAMA Netw Open. 2025.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11979726/',
      },
    ],
  },
  {
    id: 'insertional-achilles-low-compression-rct',
    kind: 'condition',
    selectionLabel: '跟腱止點病變',
    bodyRegion: '足踝',
    searchAliases: ['後腳跟痛', '腳跟後方痛', '止點跟腱', '阿基里斯腱痛', '提踵痛'],
    theme: 'violet',
    eyebrow: '13 · 2025 隨機對照試驗',
    title: '跟腱止點病變：低壓迫四階段負荷',
    summary: '從等長、等張、能量儲存到跑跳逐階增加，但全程限制深度背屈、避免小腿伸展並配合鞋內墊高；這與中段跟腱病變的處方不同。',
    images: [
      {
        src: `${IMAGE_ROOT}/achilles-insertion-rct-1-isometric.webp`,
        alt: '手扶欄杆做雙腳提踵等長維持，腳跟不下沉',
        step: '第 1 階',
        caption: '等長：扶穩提踵維持',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/achilles-insertion-rct-2-isotonic.webp`,
        alt: '手扶欄杆做單腳提踵，腳跟不低於前腳掌',
        step: '第 2 階',
        caption: '等張：腳跟不降到腳掌以下',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/achilles-insertion-rct-3-pogo.webp`,
        alt: '在平地做小幅雙腳彈跳並準備柔和落地',
        step: '第 3 階',
        caption: '能量儲存：從低幅雙腳彈跳開始',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/achilles-insertion-rct-4-run.webp`,
        alt: '在平坦地面進行輕鬆跑步的回場練習',
        step: '第 4 階',
        caption: '跑跳專項：平地、低量開始',
        width: 615,
        height: 615,
      },
    ],
    suitableFor: '18–60 歲、跑步型運動每週至少 2 次，症狀 3 個月至 3 年，且疼痛位於跟腱附著點 2 公分內、單腳跳可誘發症狀並有超音波異常的運動者。',
    dosage: '依研究：前 12 週每週接受個別監督並依三項標準進階。第 1 階從 5×30 秒、約 50%最大出力進到 5×60 秒、70%；第 2 階隔日等張從 4×15、約 65% 1RM進到 4×6、85%；第 3 階每 3 日加入 3×10 到 3×6的能量儲存動作；第 4 階每 2–3 日跑跳。至少完成每階 2 週且高負荷 1 週才可進階。',
    cue: '核心原則是「有負荷、少壓迫」：提踵下降時腳跟不要低於前腳掌，不做把腳踝推到深背屈的小腿伸展。',
    regression: '使用平地或墊高讓腳跟維持中立、由雙腳提踵開始，先降低出力與時間；未做最大肌力測試或沒有合適器材時，請由復健專業人員換算負荷。',
    signals: {
      green: '運動中、結束 1 小時與隔天早上疼痛都低於 5/10，且每週平均痛與僵硬沒有增加。',
      yellow: '任何一個時間點達 5/10以上、晨間僵硬增加或腳跟持續被鞋壓痛：停在原階或退階並重新調整墊高與總量。',
      red: '突然啪聲、明顯凹陷或瘀青、無法提踵或無法承重：停止並儘速排除跟腱斷裂。',
    },
    evidence: '42 名慢性跟腱止點病變運動者的 RCT 顯示，低壓迫復健相較高壓迫復健，在 12 與 24 週的 VISA-A 改善分別多 12.9 與 10.4 分，達研究預設的 10 分臨床重要差異。原文 Figure 1 與補充手冊有四階段動作圖，本站重新製圖。限制是低壓迫組同時包含教育、小腿按摩、12 mm 鞋墊與漸進負荷，無法拆分各成分效果；樣本小且只納入運動者。',
    audience: '適用於經臨床與影像確認的慢性跟腱止點病變運動者；不能外推到中段跟腱病變、急性反應性疼痛、斷裂或非運動族群。',
    sources: [
      {
        label: 'Pringels et al. Low tendon compression rehabilitation for insertional Achilles tendinopathy: RCT. Br J Sports Med. 2025.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12171478/',
      },
    ],
  },
  {
    id: 'scheuermann-schroth-rct',
    kind: 'condition',
    selectionLabel: 'Scheuermann 胸椎後凸',
    bodyRegion: '脊椎與軀幹',
    searchAliases: ['駝背', '青少年駝背', '胸椎後凸', '圓背', 'Scheuermann'],
    theme: 'blue',
    eyebrow: '14 · 2019 隨機對照試驗',
    title: 'Scheuermann 胸椎後凸：個別化 Schroth 訓練',
    summary: '論文的五種姿勢都需要依個別後凸型態調整延伸、呼吸與支撐；本頁只呈現研究流程，不提供可以自行套用的矯正方向。',
    images: [
      {
        src: `${IMAGE_ROOT}/scheuermann-rct-1-pendulum.webp`,
        alt: '青少年雙手扶高處牆架並以腳支撐做軸向延伸',
        step: '姿勢 1',
        caption: 'Pendulum：腳支撐下的軸向延伸',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/scheuermann-rct-2-supine.webp`,
        alt: '青少年仰躺屈膝，以胸椎小墊支撐並屈肘放鬆',
        step: '姿勢 2',
        caption: '仰躺修正：支撐、呼吸、不硬拱',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/scheuermann-rct-3-semi-hang.webp`,
        alt: '青少年手扶高處牆架並做有腳支撐的半懸垂',
        step: '姿勢 3',
        caption: '半懸垂：腳踩地、髖向後',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/scheuermann-rct-4-seated.webp`,
        alt: '青少年坐在穩定椅凳上做坐姿軸向延伸',
        step: '姿勢 4',
        caption: '坐姿修正：拉長軀幹、維持呼吸',
        width: 615,
        height: 615,
      },
    ],
    suitableFor: '10–17 歲、由骨科醫師診斷 Scheuermann 胸椎後凸，未接受背架或脊椎手術，且願意每天練習的青少年。姿勢性、先天性、神經肌肉性或外傷性後凸不在研究對象內。',
    dosage: '依研究：先接受約 6–10 週、每週 1 次個別治療，治療師確認每個動作品質後，每天完成個別指定的 5 個動作；每動作 3 組、每組 10 次，組間休息 30 秒，持續 12 個月並記錄。本站四張圖不能取代五動作處方與個別修正。',
    cue: '先做軸向延伸，再維持治療師設定的胸廓與骨盆位置並配合呼吸；不是用腰椎過度後彎把背「挺直」。',
    regression: '只在治療師選定的仰躺或坐姿支撐下練習，縮短維持時間並增加外部支撐；不要自行做懸吊、彈力帶或強力胸椎伸展。',
    signals: {
      green: '能維持自然呼吸與指定姿勢，沒有疼痛、暈眩或動作後功能變差。',
      yellow: '腰背代償、憋氣、手臂疲勞或背痛上升：停止該姿勢，回到治療師教過的支撐版本。',
      red: '新出現肢體麻木無力、走路改變、呼吸困難、劇烈夜間痛或外傷後疼痛：停止並儘速評估。',
    },
    evidence: '50 名 Scheuermann 後凸青少年的 RCT 比較 Schroth 與傳統抗重力運動；12 個月時，胸椎 Cobb 角與臨床後凸測量的組別×時間交互作用顯著，Schroth 組改善較大。原文 Figure 2 有五個 Schroth 動作照片，本站重製四種代表姿勢。限制包括小樣本、兩組基準年齡／身高／性別不平衡、介入高度個別化且每日持續一年，因此不能把單一姿勢當成通用矯正處方。',
    audience: '適用於由脊椎專業團隊確認並監督的青少年 Scheuermann 後凸；一般圓肩、成人姿勢問題或不明原因胸椎後凸不適用。',
    sources: [
      {
        label: 'Bezalel et al. Schroth therapy for Scheuermann thoracic kyphosis: RCT. Asian Spine J. 2019.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6547400/',
      },
    ],
  },
  {
    id: 'thumb-cmc-proprioception-rct',
    kind: 'condition',
    selectionLabel: '拇指根部骨關節炎',
    bodyRegion: '上肢與手部',
    searchAliases: ['拇指痛', '虎口痛', '拇指關節退化', '手部退化', '捏東西痛'],
    theme: 'green',
    eyebrow: '15 · 2022 隨機對照試驗',
    title: '拇指根部骨關節炎：4 週位置覺訓練',
    summary: '先由治療師示範舒服的拇指位置，再主動重現與用小物做精細控制；研究支持位置覺與部分功能改善，但沒有證明長期疼痛會額外下降。',
    images: [
      {
        src: `${IMAGE_ROOT}/thumb-cmc-rct-1-guided.webp`,
        alt: '治療師以輕柔方式示範拇指舒服的張開位置',
        step: '示範',
        caption: '先看與感覺目標位置',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/thumb-cmc-rct-2-reproduce.webp`,
        alt: '前臂有支撐時主動重現拇指張開位置',
        step: '重現',
        caption: '手腕中立，主動重現位置',
        width: 615,
        height: 615,
      },
      {
        src: `${IMAGE_ROOT}/thumb-cmc-rct-3-marble.webp`,
        alt: '以前臂支撐的手將小珠沿食指橈側做精細控制',
        step: '控制',
        caption: '拇指推珠：慢、準、無痛',
        width: 800,
        height: 800,
      },
    ],
    suitableFor: '慣用手有影像與臨床確認的第 1–3 級拇指腕掌關節骨關節炎、日常活動疼痛至少 4/10 的成年女性。研究未納入男性，也不適用於近期外傷或其他手部疾病。',
    dosage: '依研究：兩組都先使用夜間短拇指護具並接受相同保守運動；本體感覺組另做位置重現與小物控制。整體為 4 週、每週 3 次個別治療，每個無痛動作 3 組、每組 10 次，並鼓勵每天在家做 1 次。',
    cue: '前臂支撐、手腕維持中立，只在無痛範圍輕柔移動拇指；目標是準確控制，不是把關節拉得更開。',
    regression: '先只做治療師示範後的小幅位置重現；改用較大目標或較大的輕質小球，減少次數並略過任何會誘發疼痛的手法。',
    signals: {
      green: '動作無痛、手腕穩定，拇指能緩慢重現位置，做完沒有增加腫脹或捏力下降。',
      yellow: '拇指根部痛升高、關節卡住、隔天更腫或為完成目標而扭動手腕：縮小範圍並減少次數。',
      red: '近期外傷、明顯變形、快速紅腫發熱、持續麻木或突然失去捏握能力：停止並安排評估。',
    },
    evidence: '45 名女性的 RCT 顯示，在護具與常規治療之外加入拇指本體感覺訓練，可改善關節位置覺，且 QuickDASH 與活動表現／滿意度在治療後與 3 個月追蹤有組間差異；但 3 個月疼痛的組間效果很小，作者明確指出沒有帶來長期疼痛的額外下降。原文 Figure 2 有六種運動照片，本站依位置重現流程重新製圖。限制是樣本小、只有女性、追蹤短，且兩組都使用護具與接受其他保守運動。',
    audience: '適用於經確認的第 1–3 級拇指根部骨關節炎成年女性，並由手部治療專業人員先教學；一般拇指痛、板機指、神經壓迫或急性外傷不適用。',
    sources: [
      {
        label: 'Cantero-Téllez et al. Proprioception training for thumb basal joint osteoarthritis: RCT. Int J Environ Res Public Health. 2022.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8955750/',
      },
    ],
  },
  ...EXPANDED_RCT_GUIDES,
  ...RECENT_RCT_GUIDES,
]

export function getExerciseGuideById(id: string): ExerciseGuideModule | undefined {
  return EXERCISE_GUIDE_MODULES.find((guide) => guide.id === id)
}

export function getExerciseGuideFollowUp(guide: ExerciseGuideModule): string {
  if (guide.followUp) return guide.followUp

  return guide.kind === 'condition'
    ? '規律執行 2–4 週若功能沒有任何改善、症狀持續惡化，或需要增加止痛藥物，請安排專業評估；已有治療計畫者依原回診時程。'
    : '規律做 2–4 週若日常功能沒有改善、症狀反覆惡化，或需要增加止痛藥物，請安排專業評估。'
}
