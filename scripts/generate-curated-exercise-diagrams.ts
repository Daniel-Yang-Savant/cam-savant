import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CURATED_MSK_GUIDES } from '../lib/exercise-guides-curated-msk'
import { CURATED_NEURO_GUIDES } from '../lib/exercise-guides-curated-neuro'
import { CURATED_CARDIO_GUIDES } from '../lib/exercise-guides-curated-cardio'

// Original vector concept diagrams. They show the study pathway, not exact
// joint angles, a complete protocol, or a patient-specific exercise prescription.
const guides = [...CURATED_MSK_GUIDES, ...CURATED_NEURO_GUIDES, ...CURATED_CARDIO_GUIDES]
const colors = {
  orange: '#a34b18', teal: '#116d69', violet: '#7056a6', blue: '#3464a0', green: '#477341',
}
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[c]!)

function lines(value: string, maxWidth: number): string[] {
  const result: string[] = []
  let line = '', width = 0
  for (const char of value) {
    const charWidth = char.codePointAt(0)! < 128 ? 0.56 : 1
    if (width + charWidth > maxWidth) {
      result.push(line)
      line = ''
      width = 0
    }
    line += char
    width += charWidth
  }
  if (line) result.push(line)
  return result
}

function text(value: string, x: number, y: number, size: number, width: number, color: string, weight = 400) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${lines(value, width).map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.42 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>`
}

function icon(kind: string, accent: string) {
  const head = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="11" fill="#f1d6bc" stroke="#253d50" stroke-width="3"/>`
  const path = (d: string, stroke = '#253d50', width = 7) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  const arrow = (d: string) => `<path d="${d}" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="5 5" marker-end="url(#arrow)"/>`
  const ground = path('M15 155 H175', '#ccd9df', 2)
  let drawing = ''
  switch (kind) {
    case 'walk':
      drawing = head(87, 30) + path('M84 49 L90 93 M85 58 L65 82 L41 77 M87 59 L113 75 L134 56 M90 93 L62 119 L42 150 M90 93 L116 119 L145 141') + arrow('M38 164 H147'); break
    case 'supported-walk':
      drawing = path('M20 150 V8 H171 V150 M35 151 H157', '#98adb9', 5) + path('M72 9 V64 M110 9 V64 M72 64 Q90 85 110 64', accent, 4) + head(90, 28) + path('M89 48 V92 M89 61 L60 80 M89 61 L124 76 M89 92 L65 120 L50 145 M89 92 L119 112 L133 144'); break
    case 'run':
      drawing = head(107, 27) + path('M101 46 L85 87 M99 54 L126 63 L142 44 M98 55 L74 67 L57 58 M85 87 L60 102 L27 88 M85 87 L116 110 L99 146') + arrow('M29 164 H151'); break
    case 'cycle':
      drawing = `<circle cx="119" cy="123" r="24" fill="white" stroke="#98adb9" stroke-width="5"/>` + path('M30 153 H169 M50 153 L81 123 L69 75', '#98adb9', 5) + path('M81 123 H119 L137 62 H158 M55 72 H82', accent, 5) + head(108, 23) + path('M99 40 L78 65 L105 91 L89 123 M99 43 L120 57 L140 60'); break
    case 'balance':
      drawing = head(87, 27) + path('M87 47 V95 M87 59 L55 66 L28 54 M87 59 L120 66 L147 53 M87 95 L74 119 L62 150 M87 95 L113 111 L129 139') + arrow('M42 139 Q86 121 138 143'); break
    case 'supported-balance':
    case 'balance-board':
    case 'ball-balance':
      drawing = head(91, 25) + path('M91 45 V91 M91 61 L66 80 H32 M91 61 L122 78 H150 M91 91 V145 M91 91 L120 108 L137 128')
        + (kind === 'ball-balance' ? `<circle cx="152" cy="69" r="14" fill="${accent}"/>` : path('M20 84 H61 M39 84 V150', '#98adb9', 5))
        + (kind === 'balance-board' ? path('M55 146 H132 M73 148 Q94 164 114 148', accent, 4) : ''); break
    case 'chair':
      drawing = path('M30 78 V116 H92 M35 116 V152 M86 116 V152', '#98adb9', 5) + head(64, 32) + path('M62 51 L65 103 H118 L124 146 H145 M62 65 L96 82 L118 80') + arrow('M153 132 V52'); break
    case 'knee':
      drawing = path('M30 78 V116 H92 M35 116 V152 M86 116 V152', '#98adb9', 5) + head(64, 32) + path('M62 51 L65 103 H112 L151 91 L165 96 M65 103 L102 110 L111 146 M62 65 L82 94') + arrow('M149 141 Q175 120 172 103'); break
    case 'side-hip':
      drawing = head(31, 108) + path('M49 120 H103 L163 142 M103 120 L158 76 M61 120 L70 143 H98') + path('M21 150 H176', accent, 4) + arrow('M174 131 Q184 103 172 80'); break
    case 'assisted-shoulder':
      drawing = head(53, 29) + path('M51 49 L67 102 H112 V146 H137 M57 62 L94 79 H148') + path('M101 83 H179 M113 83 V150 M170 83 V150 M29 84 V115 H78 M34 115 V150', '#98adb9', 5) + arrow('M107 61 H158'); break
    case 'rotation':
      drawing = head(95, 28) + path('M95 48 V99 M95 62 L75 83 L48 80 M95 62 L115 83 L142 80 M95 99 L74 150 M95 99 L116 150') + arrow('M123 57 Q146 52 162 69'); break
    case 'cross-shoulder':
      drawing = head(95, 28) + path('M95 48 V100 M112 60 L60 70 M77 61 L85 87 L107 72 M95 100 L75 150 M95 100 L116 150') + arrow('M132 71 H116'); break
    case 'shoulder':
      drawing = head(73, 30) + path('M72 49 V101 M72 64 L104 61 L145 46 M72 64 L91 89 L117 87 M72 101 L55 150 M72 101 L91 150') + arrow('M149 98 Q174 70 157 45'); break
    case 'squat':
      drawing = head(94, 35) + path('M88 55 L66 91 L106 119 L85 150 H111 M85 62 H126 L148 50 M67 91 L48 119 L25 148 H47') + arrow('M165 138 V87'); break
    case 'strength':
      drawing = head(95, 25) + path('M95 45 V94 M95 59 L65 77 L45 59 M95 59 L125 77 L145 59 M95 94 L75 148 M95 94 L116 148') + path('M31 56 H59 M31 46 V66 M59 46 V66 M132 56 H160 M132 46 V66 M160 46 V66', accent, 5); break
    case 'reach':
      drawing = head(68, 29) + path('M67 48 L69 98 M69 62 L96 79 L141 69 M69 98 L45 148 M69 98 L90 146') + path('M113 106 H176 M128 106 V150 M168 106 V150', '#98adb9', 5) + `<rect x="137" y="86" width="17" height="20" rx="3" fill="${accent}"/>` + arrow('M95 59 Q132 37 162 62'); break
    case 'band':
      drawing = head(65, 29) + path('M65 49 V98 M65 61 L77 85 L110 81 M65 98 L49 149 M65 98 L83 149') + path('M169 33 V152', '#98adb9', 5) + path('M110 81 L169 81', accent, 4) + arrow('M147 106 H100'); break
    case 'nordic':
      drawing = head(114, 38) + path('M103 54 L72 109 L68 141 H28 M102 60 L131 91 L151 110') + path('M19 143 H61', accent, 7) + arrow('M128 26 Q164 44 172 83'); break
    case 'bed':
      drawing = path('M18 112 H173 M26 112 V151 M166 112 V151', '#98adb9', 5) + head(43, 83) + path('M61 95 H104 L133 73 L160 98') + path('M73 94 L100 81 L123 82') + `<rect x="22" y="98" width="35" height="10" rx="5" fill="${accent}"/>`; break
    case 'breath':
      drawing = head(92, 31) + path('M91 52 V101 M91 68 L66 88 L86 99 M91 68 L117 87 L99 99 M91 101 L65 145 M91 101 L117 145') + arrow('M49 58 Q27 88 50 115') + arrow('M139 115 Q160 87 139 59'); break
    case 'monitor':
      drawing = `<rect x="22" y="26" width="150" height="100" rx="12" fill="white" stroke="#253d50" stroke-width="5"/>` + path('M37 82 H63 L76 55 L91 101 L108 66 L120 82 H155', accent, 4) + path('M97 128 V151 M71 152 H125', '#98adb9', 5); break
    case 'plan':
      drawing = `<rect x="44" y="22" width="108" height="139" rx="10" fill="white" stroke="#253d50" stroke-width="5"/><rect x="73" y="15" width="48" height="18" rx="5" fill="${accent}"/>` + path('M62 60 L67 65 L78 52 M90 59 H131 M62 95 L67 100 L78 87 M90 94 H131 M62 130 L67 135 L78 122 M90 129 H131', accent, 4); break
    default:
      drawing = head(53, 32) + head(139, 32) + path('M52 52 V93 L69 115 V150 M52 64 L84 82 M138 52 V93 L121 115 V150 M138 64 L111 82') + path('M78 94 H118 M97 94 V150 M22 83 V108 H52 M143 108 H172 V83', '#98adb9', 5) + `<path d="M135 68 H143 M139 64 V72" stroke="${accent}" stroke-width="3"/>`
  }
  return `<svg x="28" y="102" width="184" height="171" viewBox="0 0 190 180">${ground}${drawing}</svg>`
}

mkdirSync(join(process.cwd(), 'public/images/exercise-guides'), { recursive: true })
const panelIcons: Record<string, string[]> = {
  'lumbar-stenosis-individualized-rct': ['consult', 'cycle', 'chair', 'monitor'],
  'low-back-restore-cft-rct': ['consult', 'chair', 'walk', 'plan'],
  'frozen-shoulder-uk-frost-rct': ['consult', 'assisted-shoulder', 'rotation', 'reach'],
  'subacromial-specific-exercise-rct': ['consult', 'rotation', 'band', 'cross-shoulder'],
  'acl-kanon-rehabilitation-rct': ['consult', 'knee', 'squat', 'consult'],
  'young-meniscus-dream-rct': ['consult', 'walk', 'squat', 'balance'],
  'adolescent-pfp-school-rct': ['plan', 'knee', 'side-hip', 'chair'],
  'ankle-recurrence-balance-rct': ['consult', 'supported-balance', 'balance-board', 'plan'],
  'nordic-hamstring-prevention-rct': ['consult', 'nordic', 'nordic', 'plan'],
  'football-11plus-youth-rct': ['run', 'ball-balance', 'squat', 'run'],
  'life-mobility-disability-rct': ['consult', 'walk', 'knee', 'balance'],
  'sprintt-frailty-mobility-rct': ['consult', 'knee', 'walk', 'plan'],
  'taijiquan-falls-prevention-rct': ['consult', 'balance', 'balance', 'balance'],
  'dapa-dementia-exercise-rct': ['consult', 'cycle', 'strength', 'plan'],
  'leaps-stroke-walking-rct': ['consult', 'supported-walk', 'walk', 'balance'],
  'avert-early-stroke-mobilisation-rct': ['consult', 'bed', 'consult', 'monitor'],
  'icare-stroke-arm-training-rct': ['consult', 'reach', 'reach', 'plan'],
  'sparx-parkinson-treadmill-rct': ['consult', 'walk', 'monitor', 'walk'],
  'park-in-shape-cycling-rct': ['consult', 'cycle', 'plan', 'monitor'],
  'hf-action-aerobic-training-rct': ['consult', 'cycle', 'monitor', 'plan'],
  'rehab-hf-multidomain-rehabilitation-rct': ['balance', 'chair', 'walk', 'walk'],
  'copd-home-pulmonary-rehabilitation-rct': ['consult', 'walk', 'chair', 'plan'],
  'icu-team-early-mobilization-rct': ['consult', 'plan', 'monitor', 'consult'],
  'colon-cancer-challenge-exercise-rct': ['consult', 'walk', 'plan', 'monitor'],
  'breast-cancer-lymphedema-resistance-rct': ['consult', 'strength', 'strength', 'monitor'],
  'diabetes-dare-combined-exercise-rct': ['consult', 'walk', 'strength', 'monitor'],
  'urinary-incontinence-group-pelvic-floor-rct': ['consult', 'breath', 'breath', 'plan'],
  'fibromyalgia-tai-chi-comparison-rct': ['balance', 'balance', 'breath', 'plan'],
}
for (const guide of guides) {
  if (guide.steps?.length !== 4) throw new Error(`${guide.id}: expected four diagram panels`)
  if (panelIcons[guide.id]?.length !== 4) throw new Error(`${guide.id}: missing reviewed panel icons`)
  const accent = colors[guide.theme]
  const panels = guide.steps.map((step, index) => {
    const x = 36 + (index % 2) * 576, y = 165 + Math.floor(index / 2) * 326
    const sentence = step.instruction.split('。')[0] + '。'
    const size = lines(sentence, 14).length > 7 ? 17 : 20
    if (lines(sentence, 280 / size).length > 8) throw new Error(`${guide.id} panel ${index + 1}: description too long`)
    if (lines(step.title, 18).length > 2) throw new Error(`${guide.id}: title too long`)
    return `<g transform="translate(${x} ${y})"><rect width="552" height="304" rx="22" fill="white" stroke="#dce5e9"/>
      <rect x="24" y="23" width="40" height="40" rx="13" fill="${accent}"/>
      <text x="44" y="51" text-anchor="middle" fill="white" font-size="25" font-weight="700">${index + 1}</text>
      ${text(step.title, 80, 52, 25, 18, '#1e3445', 700)}
      ${icon(panelIcons[guide.id][index], accent)}
      ${text(sentence, 236, 128, size, 280 / size, '#486071')}
    </g>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc">
    <title id="title">${escapeXml(guide.title)}：研究方案圖解</title>
    <desc id="desc">${escapeXml(guide.images[0].alt)}</desc>
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="${accent}"/></marker></defs>
    <rect width="1200" height="900" fill="#eef3f5"/>
    <g font-family="PingFang TC, Noto Sans CJK TC, Microsoft JhengHei, sans-serif">
      <rect width="1200" height="140" fill="#193244"/>
      <text x="38" y="38" fill="#a9cbd4" font-size="18" letter-spacing="3">CAM SAVANT / RESEARCH GUIDE</text>
      ${text(guide.selectionLabel, 36, 93, 34, 31, '#ffffff', 700)}
      <text x="1164" y="125" text-anchor="end" fill="#c1d7dd" font-size="17">方案概念・完整說明請見內文</text>
      ${panels}
      <text x="600" y="861" text-anchor="middle" fill="#486071" font-size="20">原創研究方案示意・非論文原圖・非個人運動處方</text>
    </g>
  </svg>\n`
  writeFileSync(join(process.cwd(), 'public', guide.images[0].src), svg)
}
console.log(`Generated ${guides.length} original research diagrams.`)
