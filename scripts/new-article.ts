/**
 * new-article.ts
 * 建立新文章草稿並輸出 3 個 Banana AI 封面圖 Prompt 選項
 *
 * 用法：
 *   npx ts-node scripts/new-article.ts \
 *     --slug=acl-prehab \
 *     --title="ACL 重建術前復健：提升手術成果的關鍵準備" \
 *     --category=perioperative-rehab \
 *     --excerpt="術前強化股四頭肌肌力可顯著改善 ACL 重建後功能恢復速度與品質。" \
 *     --author="楊育愷醫師"
 */

import fs from 'fs'
import path from 'path'

// ── CLI 參數解析 ─────────────────────────────────────────────────────────────

function arg(name: string): string {
  const found = process.argv.find(a => a.startsWith(`--${name}=`))
  return found ? found.split('=').slice(1).join('=') : ''
}

const slug     = arg('slug')
const title    = arg('title')
const category = arg('category') || 'posts'
const excerpt  = arg('excerpt')
const author   = arg('author')  || '楊育愷醫師'
const date     = arg('date')    || new Date().toISOString().split('T')[0]

if (!slug || !title) {
  console.error('\n❌ 必填參數缺失。範例用法：')
  console.error('   npx ts-node scripts/new-article.ts \\')
  console.error('     --slug=acl-prehab \\')
  console.error('     --title="ACL 重建術前復健：提升手術成果的關鍵準備" \\')
  console.error('     --category=perioperative-rehab \\')
  console.error('     --excerpt="術前強化股四頭肌肌力可顯著改善術後恢復。"\n')
  process.exit(1)
}

// ── 建立 MDX 草稿 ────────────────────────────────────────────────────────────

const DRAFTS_DIR = path.join(process.cwd(), 'drafts')
if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true })

const destPath = path.join(DRAFTS_DIR, `${slug}.mdx`)
if (fs.existsSync(destPath)) {
  console.error(`\n❌ 草稿已存在：drafts/${slug}.mdx`)
  process.exit(1)
}

const mdxTemplate = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
author: "${author}"
category: "${category}"
coverImage: "/images/covers/${slug}.jpg"
---

##

`

fs.writeFileSync(destPath, mdxTemplate, 'utf-8')
console.log(`\n✅ 草稿已建立：drafts/${slug}.mdx`)

// ── 封面圖 Prompt 產生器 ─────────────────────────────────────────────────────

interface VisualDetail {
  /** 寫實攝影風 prompt */
  promptA: string
  /** 極簡醫療美學風 prompt */
  promptB: string
  /** 抽象概念風 prompt */
  promptC: string
}

function detect(text: string, category: string): VisualDetail {

  // ── 術後復健 / perioperative-rehab ─────────────────────────────────────────

  if (/acl|前十字韌帶|十字韌帶|韌帶重建/.test(text)) return {
    promptA: `physical therapist guiding patient through ACL rehabilitation exercises in modern clinic gym, knee brace visible, resistance bands and foam roller, warm natural light, editorial photography style, 1200x800px, no text`,
    promptB: `extreme close-up of ACL reconstruction implant — titanium interference screw and graft tunnel in knee joint model, matte dark gray background, precision medical editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract visualization of ACL collagen graft fibers regenerating — luminous white fibers weaving through dark anatomical knee silhouette, biomechanics concept art, 1200x800px, dark background, no text`,
  }

  if (/thr|全髖|髖關節置換|hip replacement/.test(text)) return {
    promptA: `elderly patient taking first steps with walker after total hip replacement, hospital rehabilitation corridor, occupational therapist beside, soft window light, documentary photography style, 1200x800px, no text`,
    promptB: `close-up of hip arthroplasty implant — ceramic femoral head and titanium cup on dark slate background, surgical precision aesthetic, high contrast studio light, 1200x800px, dark background, no text`,
    promptC: `abstract cross-section of hip joint prosthesis integration — titanium lattice merging with bone trabeculae, glowing at interface, scientific illustration on dark background, 1200x800px, no text`,
  }

  if (/tkr|全膝|膝關節置換|knee replacement/.test(text)) return {
    promptA: `patient performing knee extension exercise on rehabilitation table after total knee replacement, physiotherapist monitoring ROM, bright clinical setting, candid healthcare photography, 1200x800px, no text`,
    promptB: `extreme close-up of total knee arthroplasty component — cobalt-chrome condyles and polyethylene insert on dark background, macro precision, medical editorial, 1200x800px, dark background, no text`,
    promptC: `abstract visualization of knee joint biomechanics — force vectors and joint contact areas rendered as glowing geometry on dark background, orthopedic engineering concept, 1200x800px, no text`,
  }

  if (/旋轉肌|肩旋轉|rotator cuff|肩袖/.test(text)) return {
    promptA: `sports medicine physician performing shoulder ultrasound-guided assessment on athlete, clinical examination room, overhead soft light, photojournalistic quality, 1200x800px, no text`,
    promptB: `close-up of shoulder anatomy model showing rotator cuff tendons — supraspinatus and infraspinatus highlighted against dark background, surgical anatomy aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract rotator cuff tendon fiber structure — luminous tendon fibers radiating from humeral head on dark anatomical illustration, regenerative medicine concept, 1200x800px, no text`,
  }

  if (/半月板|meniscus|膝關節鏡|arthroscopy/.test(text)) return {
    promptA: `arthroscopic knee surgery setup — surgeon holding arthroscope, operating room with blue-white lighting, sterile drapes, photorealistic medical photography, 1200x800px, no text`,
    promptB: `close-up of meniscus repair suture under arthroscope view — circular knee joint interior, dark cavity with bright arthroscopic illumination, 1200x800px, dark background, no text`,
    promptC: `abstract cross-section of knee meniscus — fibrocartilage collagen network glowing on dark background, biomechanical stress distribution visualization, 1200x800px, no text`,
  }

  if (/cabg|心臟繞道|冠狀動脈|coronary|心肺/.test(text)) return {
    promptA: `cardiac rehabilitation session — patient on treadmill with ECG monitoring leads, exercise physiologist supervising, bright cardiac rehab center, clinical documentary photography, 1200x800px, no text`,
    promptB: `close-up of sternotomy scar with ECG electrodes placed on chest, moody dark background, medical editorial aesthetic, high contrast, human skin texture, 1200x800px, dark background, no text`,
    promptC: `abstract coronary artery visualization — glowing vessel network branching from heart silhouette on deep dark background, cardiology concept art, 1200x800px, no text`,
  }

  if (/乳癌|breast cancer|乳房切除|mastectomy|淋巴水腫|lymphedema/.test(text)) return {
    promptA: `oncology rehabilitation — breast cancer survivor doing lymphedema management exercises with therapist, supportive clinical environment, warm natural light, 1200x800px, no text`,
    promptB: `manual lymphatic drainage technique — therapist hands on patient shoulder, dark moody studio background, therapeutic touch detail, medical editorial, 1200x800px, dark background, no text`,
    promptC: `abstract lymphatic system visualization — glowing vessel network flowing through soft tissue silhouette, cellular immune response concept on dark background, 1200x800px, no text`,
  }

  if (/肺癌|lung cancer|肺葉切除|lobectomy|肺部|pulmonary/.test(text)) return {
    promptA: `pulmonary rehabilitation — patient doing incentive spirometry with respiratory therapist guidance, bright hospital rehabilitation room, documentary style, 1200x800px, no text`,
    promptB: `close-up of incentive spirometer device and breathing tube on dark clinical background, minimalist medical aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract lung alveoli and bronchial tree visualization — translucent glowing airways on dark background, respiratory physiology concept art, 1200x800px, no text`,
  }

  if (/頭頸癌|head.?neck cancer|喉癌|咽癌|吞嚥/.test(text)) return {
    promptA: `speech-language pathologist conducting swallowing therapy session with head and neck cancer patient, clinical office, warm professional light, 1200x800px, no text`,
    promptB: `close-up of neck anatomy model showing cervical musculature and lymph node regions, dark background, surgical atlas aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract visualization of pharyngeal swallowing mechanics — motion-traced anatomy on dark background, deglutition biomechanics concept art, 1200x800px, no text`,
  }

  if (/跟腱|achilles|足底筋膜|plantar/.test(text)) return {
    promptA: `sports physiotherapist performing Achilles tendon rehabilitation on athlete, treatment table, resistance band ankle exercise, clinical gym setting, natural light, 1200x800px, no text`,
    promptB: `extreme close-up of Achilles tendon attachment on calcaneus bone model, dark matte background, anatomical precision editorial, 1200x800px, dark background, no text`,
    promptC: `abstract Achilles tendon collagen fiber visualization — dense rope-like fiber bundles glowing on dark background, tendon healing concept art, 1200x800px, no text`,
  }

  if (/脊椎|scoliosis|脊柱側彎|椎間盤|disc|椎/.test(text)) return {
    promptA: `spine specialist examining patient lumbar MRI on light box, orthopedic clinic, clinical documentary photography, 1200x800px, no text`,
    promptB: `close-up of lumbar vertebrae anatomical model — intervertebral disc and facet joints, dark gray background, medical precision aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract spinal column visualization — vertebral bodies and nerve roots rendered as glowing nodes and connections on dark background, neuroscience concept, 1200x800px, no text`,
  }

  // ── 運動醫學 / sports-medicine ────────────────────────────────────────────

  if (/跑步|runner|running|馬拉松|marathon/.test(text)) return {
    promptA: `elite runner mid-stride on track, biomechanics analysis markers visible on legs, sports science laboratory, high-speed photography, 1200x800px, no text`,
    promptB: `close-up of running shoe sole and Achilles tendon during push-off phase, dark background, sports biomechanics editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract visualization of running gait cycle — motion-traced leg silhouettes showing ground reaction forces on dark background, sports science concept art, 1200x800px, no text`,
  }

  if (/骨質疏鬆|osteoporosis|骨密度|bone density/.test(text)) return {
    promptA: `physician reviewing DEXA bone density scan results with elderly female patient, modern osteoporosis clinic, soft clinical light, documentary photography, 1200x800px, no text`,
    promptB: `close-up of trabecular bone microstructure — porous lattice detail against dark background, macro scanning electron microscope aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract comparison of healthy vs osteoporotic bone trabeculae — glowing scaffold structures on dark background, bone remodeling concept visualization, 1200x800px, no text`,
  }

  if (/增生療法|prolotherapy|prp|血小板|platelet/.test(text)) return {
    promptA: `sports medicine physician performing ultrasound-guided PRP injection into knee joint, modern procedure room, sterile technique, clinical documentary, 1200x800px, no text`,
    promptB: `close-up of PRP syringe with golden platelet-rich plasma, ultrasound probe and sterile drape in background, dark clinical aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract platelet activation and growth factor release visualization — glowing cellular particles concentrating at tissue injury site on dark background, regenerative medicine concept, 1200x800px, no text`,
  }

  if (/超音波|ultrasound|導引注射/.test(text)) return {
    promptA: `musculoskeletal ultrasound examination — physician scanning shoulder with linear probe, ultrasound screen showing tendon in background, clinical photography, 1200x800px, no text`,
    promptB: `close-up of ultrasound probe on anatomical joint — transducer head on dark background, precision diagnostic aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract ultrasound tissue visualization — echogenic tissue layers rendered as glowing wave interference patterns on dark background, medical imaging concept art, 1200x800px, no text`,
  }

  // ── FSM ───────────────────────────────────────────────────────────────────

  if (/fsm|頻率共振|microcurrent|微電流/.test(text)) {

    if (/fibromyalgia|纖維肌痛/.test(text)) return {
      promptA: `chronic pain patient receiving FSM microcurrent therapy session, electrodes on back and shoulders, quiet treatment room, soft therapeutic lighting, 1200x800px, no text`,
      promptB: `close-up of FSM microcurrent electrode pad placed on skin, dark moody background, electrotherapy precision aesthetic, 1200x800px, dark background, no text`,
      promptC: `abstract fibromyalgia pain signal desensitization — converging frequency waveforms neutralizing red pain nodes across body map, on dark background, FSM concept art, 1200x800px, no text`,
    }

    if (/parkinson|帕金森/.test(text)) return {
      promptA: `neurological rehabilitation for Parkinson's patient — therapist guiding balance and gait training with FSM therapy, calm clinical setting, 1200x800px, no text`,
      promptB: `FSM electrode placement on cervical spine, dark clinical background, precision neuromodulation aesthetic, 1200x800px, dark background, no text`,
      promptC: `abstract dopaminergic neural pathway visualization — glowing synaptic connections in basal ganglia circuit on dark background, neuromodulation frequency concept, 1200x800px, no text`,
    }

    if (/mold|黴菌|慢性疲勞|chronic fatigue/.test(text)) return {
      promptA: `functional medicine consultation — patient discussing fatigue symptoms with physician reviewing lab panel, modern integrative clinic, warm professional light, 1200x800px, no text`,
      promptB: `close-up of FSM frequency generator display showing therapeutic waveforms, dark background, medical device precision aesthetic, 1200x800px, dark background, no text`,
      promptC: `abstract mycotoxin detoxification pathway — dark cellular environment with glowing frequency waves disrupting toxin clusters, FSM mechanism concept art, 1200x800px, no text`,
    }

    return {
      promptA: `sports medicine physician applying FSM microcurrent electrodes to athlete for tissue recovery session, modern clinic, professional lighting, 1200x800px, no text`,
      promptB: `close-up of FSM frequency-specific microcurrent device with electrode leads on dark background, medical device editorial aesthetic, 1200x800px, dark background, no text`,
      promptC: `abstract resonance frequency waveforms interacting with tissue cell membrane — sinusoidal waves and cellular structures on dark background, FSM mechanism concept art, 1200x800px, no text`,
    }
  }

  // ── 功能醫學 / functional-medicine ───────────────────────────────────────

  if (/vagus|迷走神經|自律神經|autonomic/.test(text)) return {
    promptA: `integrative medicine physician performing heart rate variability assessment on patient, modern functional medicine clinic, calm professional lighting, 1200x800px, no text`,
    promptB: `anatomical illustration of vagus nerve pathway — cervical to abdominal trajectory close-up against dark background, scientific atlas aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract vagal tone visualization — glowing nerve fiber network connecting brain and visceral organs on dark background, neurovisceral integration concept art, 1200x800px, no text`,
  }

  if (/gut|腸道|microbiome|微生物|腸漏|leaky gut/.test(text)) return {
    promptA: `functional medicine consultation reviewing comprehensive stool analysis results, physician and patient at desk, modern integrative clinic, warm light, 1200x800px, no text`,
    promptB: `close-up of intestinal villi and mucosal layer model, dark background, high-magnification anatomical detail aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract gut microbiome ecosystem — diverse bacterial colonies rendered as glowing spherical clusters on dark intestinal surface, microbiome diversity concept art, 1200x800px, no text`,
  }

  if (/mitochondria|粒線體|energy|能量/.test(text)) return {
    promptA: `functional medicine physician reviewing mitochondrial function test results with fatigued patient, modern clinic, professional warm lighting, 1200x800px, no text`,
    promptB: `extreme close-up of mitochondria model — cristae membrane folds highlighted against dark background, cellular biology editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract mitochondrial ATP synthesis visualization — electron transport chain as glowing particles cascading through dark membrane folds, cellular energy concept art, 1200x800px, no text`,
  }

  // ── 血友病 / 兒童運動 ─────────────────────────────────────────────────────

  if (/hemophilia|血友病|兒童|pediatric/.test(text)) return {
    promptA: `pediatric physical therapist guiding child with hemophilia through safe joint-protective play-based exercises, colorful children's rehab gym, warm natural light, 1200x800px, no text`,
    promptB: `close-up of joint protection brace on child's knee, soft dark background, pediatric medical aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract clotting factor cascade visualization — glowing protein chain reaction on dark hematological background, hemostasis mechanism concept art, 1200x800px, no text`,
  }

  // ── 震波 / 增生療法 ───────────────────────────────────────────────────────

  if (/shockwave|震波|eswt|體外震波/.test(text)) return {
    promptA: `sports medicine physician applying ESWT shockwave therapy handpiece to athlete's Achilles tendon, modern procedure room, focused clinical lighting, 1200x800px, no text`,
    promptB: `close-up of shockwave applicator tip against tendon skin surface, dark clinical background, precision therapeutic device aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract acoustic shockwave propagation through soft tissue — radial pressure waves radiating from focal point as luminous rings on dark background, ESWT mechanism concept art, 1200x800px, no text`,
  }

  // ── Category fallbacks ────────────────────────────────────────────────────

  if (category === 'perioperative-rehab') return {
    promptA: `physical therapist guiding surgical patient through rehabilitation exercises in modern orthopedic clinic gym, equipment visible, warm professional light, clinical documentary photography, 1200x800px, no text`,
    promptB: `close-up of surgical sutures on joint anatomy model, sterile instruments detail, dark matte background, medical precision editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract tissue healing visualization — cellular regeneration and collagen fiber formation glowing on dark anatomical background, postoperative recovery concept art, 1200x800px, no text`,
  }

  if (category === 'sports-medicine') return {
    promptA: `sports medicine physician performing musculoskeletal assessment on athlete, clinical examination table, modern sports clinic, natural light, documentary photography, 1200x800px, no text`,
    promptB: `close-up of sport injury taping technique — rigid athletic tape on joint, dark studio background, sports medicine editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract biomechanical force distribution visualization — joint load vectors and muscle activation patterns rendered as glowing geometry on dark background, sports science concept art, 1200x800px, no text`,
  }

  if (category === 'functional-medicine') return {
    promptA: `functional medicine physician reviewing comprehensive lab panel with patient, integrative clinic setting, warm natural light, documentary photography, 1200x800px, no text`,
    promptB: `close-up of supplement capsule cross-section with micronutrients visible, dark background, functional medicine editorial aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract systems biology network — interconnected metabolic pathways and organ systems as glowing nodes on dark background, integrative medicine concept art, 1200x800px, no text`,
  }

  // Generic FSM fallback
  return {
    promptA: `FSM microcurrent therapy session in clinical setting — therapist applying electrode pads to patient, modern rehabilitation room, professional lighting, 1200x800px, no text`,
    promptB: `close-up of FSM frequency generator device with waveform display, dark clinical background, medical device precision aesthetic, 1200x800px, dark background, no text`,
    promptC: `abstract resonance frequency waveforms interacting with cellular membrane structures on dark background, FSM mechanism concept art, 1200x800px, no text`,
  }
}

// ── 輸出 Prompts ─────────────────────────────────────────────────────────────

const searchText = `${title} ${excerpt}`.toLowerCase()
const { promptA, promptB, promptC } = detect(searchText, category)

const DIVIDER = '─'.repeat(64)

console.log(`
${DIVIDER}
  【封面圖 Prompt 選項】
${DIVIDER}
  圖片檔名建議 ：${slug}.jpg
  存放路徑     ：public/images/covers/
${DIVIDER}

  ▸ 選項 A（寫實攝影風）：
    ${promptA}

  ▸ 選項 B（極簡醫療美學風）：
    ${promptB}

  ▸ 選項 C（抽象概念風）：
    ${promptC}

${DIVIDER}
`)
