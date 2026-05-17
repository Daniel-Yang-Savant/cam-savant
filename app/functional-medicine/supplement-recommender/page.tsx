'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// ─── 完整產品資料庫（來源：Metagenics 2025.07 臨床處方建議） ───────────────
const PRODUCTS = [
  // ── 腸道 ──
  {
    id: 'candibactin-ar',
    name: '常得淨膠囊',
    englishName: 'Candibactin-AR',
    category: '腸道調理',
    tags: ['SIBO', '小腸細菌過度增生', '脹氣', '排氣', '皮膚搔癢', '腸道菌相', '泌尿道', '呼吸道感染', '黴菌感染', '抗菌'],
    description: '天然草本濃縮精油（紅百里香、奧勒岡），支持消化道、泌尿道、呼吸道菌相調理',
    usage: '每次1顆，每天3次，餐前食用',
    price: 3120,
  },
  {
    id: 'spectrazyme',
    name: '完整酵素加強膠囊',
    englishName: 'SpectraZyme Complete',
    category: '腸道調理',
    tags: ['消化不良', '胃食道逆流', '火燒心', '打嗝', '腹痛', '腹部痙攣', '脹氣', '排氣', '食物不耐受', '消化吸收差'],
    description: '提供11種完整消化酵素，支持蛋白質、脂肪、醣類完整分解吸收',
    usage: '每次2顆，餐前食用',
    price: 2040,
  },
  {
    id: 'ultraflora-spectrum',
    name: '活性益生菌體健膠囊',
    englishName: 'UltraFlora Spectrum',
    category: '腸道調理',
    tags: ['便秘', '腹瀉', '腹脹', '腸躁症', '腸漏症', '消化不良', '免疫低下', '反覆感染', '泌尿道', '呼吸道', '皮膚', '抗生素後'],
    description: '7種人體實證益生菌菌株，單顆300億活菌數，全方位腸道與免疫支持',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 2800,
  },
  {
    id: 'ultraflora-ib',
    name: '活性益生菌淨能加強膠囊',
    englishName: 'UltraFlora IB',
    category: '腸道調理',
    tags: ['腸躁症', '便秘', '腹瀉', '腸漏症', '腸胃不適', '過敏', '消化不良', '代謝失衡'],
    description: '2種人體原生益生菌（NCFM、Bi-07），單顆600億高濃度活菌',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 3540,
  },
  {
    id: 'ultraflora-biome',
    name: '活性千億益生菌膠囊',
    englishName: 'UltraFlora BiomePro',
    category: '腸道調理',
    tags: ['免疫低下', '反覆感染', '腸道健康', '泌尿道感染', '呼吸道感染', '超高菌數', '化療後', '腸胃不適'],
    description: '8種益生菌菌株，單顆1050億超高活菌數，提供全方位免疫與腸道支持',
    usage: '每次1顆，每天1次，餐後食用',
    price: 5240,
  },
  {
    id: 'glutagenics',
    name: '補體健粉',
    englishName: 'Glutagenics',
    category: '腸道調理',
    tags: ['腸漏症', '黏膜損傷', '腹瀉', '化療副作用', '癌症治療', '反覆感染', '腸道修復', '麩醯胺酸'],
    description: '麩醯胺酸、甘草根、蘆薈葉萃取，修復腸胃道屏障完整性',
    usage: '每次1匙，餐前食用',
    price: 3880,
  },
  {
    id: 'endefen',
    name: '安得健粉',
    englishName: 'Endefen',
    category: '腸道調理',
    tags: ['胃潰瘍', '消化性潰瘍', '腸漏症', '腸躁症', '食物過敏', '孩童偏食', '腸道修復'],
    description: '未成熟香蕉粉、阿拉伯半乳聚醣、蝦紅素等複合配方，支持消化道完整性',
    usage: '每次1匙，餐前食用',
    price: 4000,
  },
  {
    id: 'ultraclear-sustain',
    name: '體健關懷配方粉',
    englishName: 'UltraClear Sustain',
    category: '腸道調理',
    tags: ['腸道修復', '腸漏症', '腸躁症', '嚴重食物過敏', '排毒', '肝臟解毒', '消化不良', '代謝調整'],
    description: '米澱粉蛋白基底全營養配方，促進腸道修復，含鋅、麩醯胺酸、MCT油',
    usage: '每次2匙，每日2次（240-350ml飲用水）',
    price: 4720,
  },
  // ── 心血管/代謝 ──
  {
    id: 'arginine-plus',
    name: '新精胺酸複合葉酸加強錠',
    englishName: 'Arginine Plus',
    category: '心血管代謝',
    tags: ['高血壓', '血管健康', '一氧化氮', '心血管', '同半胱胺酸', '心肌功能', '血流', '內皮功能'],
    description: '左旋精胺酸1500mg + 甲基化活性葉酸，促進一氧化氮生成，支持血管內皮功能',
    usage: '每次2顆，每天2次，餐後食用',
    price: 3380,
  },
  {
    id: 'vasotensin',
    name: '新鰹魚素錠',
    englishName: 'Vasotensin',
    category: '心血管代謝',
    tags: ['高血壓', '降血壓', '血管收縮素', '心血管', '血壓管理'],
    description: '專利活性鰹魚胜肽，臨床實證可幫助維持正常血壓，停藥無反彈',
    usage: '每次2顆，每天2次，餐後食用',
    price: 4700,
  },
  {
    id: 'mag-glycinate',
    name: '優鎂加強錠',
    englishName: 'Mag Glycinate',
    category: '心血管代謝',
    tags: ['高血壓', '神經緊繃', '肌肉抽筋', '骨骼健康', '焦慮', '壓力', '心悸', '代謝', '睡眠', '偏頭痛'],
    description: '胺基酸螯合鎂100mg/顆，高吸收率，支持神經系統、肌肉放鬆、降低血壓',
    usage: '每次1顆，每天1-3次，餐後食用',
    price: 2120,
  },
  {
    id: 'herbulk',
    name: '優纖沖泡粉',
    englishName: 'Herbulk',
    category: '心血管代謝',
    tags: ['血糖控制', '血脂', '膽固醇', '便秘', '腸道蠕動', '體重管理', '飽足感', '排便不順'],
    description: '每匙膳食纖維7g，延緩胃排空、穩定血糖血脂、促進腸胃蠕動',
    usage: '每次1匙（240-350ml飲用水），餐後食用',
    price: 2440,
  },
  {
    id: 'fenugreek-plus',
    name: '葫蘆巴複合加強膠囊',
    englishName: 'Fenugreek Plus',
    category: '心血管代謝',
    tags: ['血糖偏高', '糖尿病前期', '胰島素阻抗', '控糖', '飯後血糖', '升糖指數'],
    description: '葫蘆巴籽、山苦瓜、武靴葉三效合一，延緩餐後血糖波動',
    usage: '每次2顆，餐前食用',
    price: 2220,
  },
  {
    id: 'metaberine-gt',
    name: '麗棠脂膠囊',
    englishName: 'Metaberine GT',
    category: '心血管代謝',
    tags: ['血糖', '心血管', '發炎', '抗菌', '黃連', '膽固醇', '三酸甘油酯', '代謝症候群'],
    description: '黃連萃取500mg + 綠茶萃取200mg，調整血糖、改善心血管健康',
    usage: '每次1顆，每天1-3次，餐後食用',
    price: 3380,
  },
  {
    id: 'chromium',
    name: '鉻元素錠',
    englishName: 'Chromium Picolinate',
    category: '心血管代謝',
    tags: ['胰島素阻抗', '血糖', '脂肪代謝', '增肌', '體重管理', '代謝'],
    description: '吡啶甲酸鉻，增加胰島素敏感性，促進脂肪代謝和肌肉組織生長',
    usage: '每次1顆，每天1-3次，餐後食用',
    price: 1340,
  },
  {
    id: 'tococare',
    name: '優利脂膠囊',
    englishName: 'TocoCare',
    category: '心血管代謝',
    tags: ['膽固醇偏高', '心血管', '體脂', '血管保護', '降血脂'],
    description: '生育三烯酚（Tocotrienols）抑制HMG-CoA還原酶，幫助降低膽固醇',
    usage: '每次1顆，每天1次，餐後食用',
    price: 2960,
  },
  {
    id: 'l-carnitine',
    name: 'L-肉酸膠囊',
    englishName: 'L-Carnitine',
    category: '心血管代謝',
    tags: ['體脂控管', '脂肪代謝', '運動表現', '肌肉痠痛', '空腹血糖', '膽固醇', '減重'],
    description: '每顆500mg左旋肉酸，幫助脂肪酸代謝轉換成能量，增進運動表現',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 1960,
  },
  {
    id: 'omega-epa1200',
    name: '優質魚油 EPA 1200',
    englishName: 'OmegaGenics EPA 1200',
    category: '心血管代謝',
    tags: ['三酸甘油酯', '心血管', '發炎', '血脂', '高EPA'],
    description: '每顆1200mg高純度EPA，調節血脂、維持心血管健康',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 4800,
  },
  {
    id: 'ultraflora-control',
    name: '活性益生菌輕盈膠囊',
    englishName: 'UltraFlora Control',
    category: '心血管代謝',
    tags: ['食慾控制', '體重管理', '減重', '瘦素', '醣類代謝', 'GLP-1'],
    description: '專利減重益生菌B420，刺激大腦分泌瘦素，增加GLP-1，協助食慾調控',
    usage: '每天1顆，餐後食用',
    price: 3280,
  },
  {
    id: 'coq10',
    name: 'CoQ-10 ST 膠囊',
    englishName: 'CoQ-10 ST',
    category: '心血管代謝',
    tags: ['疲勞', '代謝', '心血管', '抗氧化', '皮膚老化', '細胞能量', '慢性疲勞'],
    description: '每顆30mg Q10 + 60IU維生素E，提升代謝效率，保護細胞膜結構',
    usage: '每次1顆，每天3顆，餐後食用',
    price: 2120,
  },
  {
    id: 'd3',
    name: '維生素D3 錠/液',
    englishName: 'D3 Tablet / Liquid',
    category: '心血管代謝',
    tags: ['維生素D缺乏', '骨骼健康', '免疫', '代謝疾病', '神經退化', '發炎', '慢性病', '陽光不足'],
    description: '每顆800IU維生素D3，支持骨骼、免疫系統健康，緩解發炎反應',
    usage: '每天2-3顆或4-5滴，餐後食用',
    price: 1960,
  },
  {
    id: 'glycogenics',
    name: '優質B群加強錠',
    englishName: 'Glycogenics',
    category: '心血管代謝',
    tags: ['疲勞', '壓力', '神經傳導', '代謝', '同半胱胺酸', '能量不足', '情緒低落', '排毒'],
    description: '完整B群 + 膽鹼、肌醇，輔助代謝、壓力適應、神經傳導物質合成',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 2340,
  },
  {
    id: 'phytomulti',
    name: '活力草本360維他錠',
    englishName: 'PhytoMulti',
    category: '心血管代謝',
    tags: ['抗氧化', '全方位補充', '蔬果不足', '慢性病預防', '免疫', '老化防護'],
    description: '23種綜合營養素 + 15種草本，含葉黃素、茄紅素等，相當於5份蔬果抗氧化力',
    usage: '每天1顆，餐後食用',
    price: 760,
  },
  {
    id: 'omega-1000',
    name: '優質魚油1000',
    englishName: 'OmegaGenics 1000 TG',
    category: '抗發炎',
    tags: ['發炎', '心血管', '三酸甘油酯', '骨骼肌肉', '免疫', '代謝', '視神經', 'Omega-3'],
    description: 'rTG型式魚油1000mg，高EPA配方，促進心血管、代謝、骨骼肌肉健康',
    usage: '每次1顆，每天1-3次，餐後食用',
    price: 3000,
  },
  // ── 抗發炎 ──
  {
    id: 'inflavonoid',
    name: '紓活加強膠囊',
    englishName: 'Inflavonoid Intensive Care',
    category: '抗發炎',
    tags: ['發炎', '關節疼痛', '慢性發炎', '氧化壓力', '薑黃', '乳香', '關節炎', '疼痛'],
    description: '薑黃CurQfen® + 啤酒花XNT ProMatrix®雙專利，抑制發炎源頭訊號',
    usage: '每次2顆，每天1-2次，餐後食用',
    price: 4360,
  },
  {
    id: 'spm-active',
    name: '新SPM 勁舒能加強膠囊',
    englishName: 'SPM Active',
    category: '抗發炎',
    tags: ['慢性發炎', '免疫修復', '慢性疲勞', '氧化壓力', '細胞修復', '過敏', '自體免疫', '術後恢復'],
    description: '專利分餾深海魚油SPMs促修復介質，對抗慢性疲勞和免疫修復反應',
    usage: '每次2顆，每天1-2次，餐後食用',
    price: 7060,
  },
  {
    id: 'spm-one-daily',
    name: 'SPM勁舒能加強膠囊（One Daily）',
    englishName: 'SPM Active One Daily',
    category: '抗發炎',
    tags: ['慢性發炎', '免疫修復', '慢性疲勞', '氧化壓力', '細胞修復'],
    description: '濃縮版SPMs，每天一顆，方便使用',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 7060,
  },
  {
    id: 'rapidrelief',
    name: '利速解膠囊',
    englishName: 'RapidRelief',
    category: '抗發炎',
    tags: ['急性疼痛', '頭痛', '關節疼痛', '腰痛', '背痛', '經痛', '肌肉痠痛', '止痛', '速效'],
    description: 'Rhuleave-K專利薑黃乳香黑芝麻油，補充後30分鐘有感，持續6小時，無肝腎負擔',
    usage: '每次2顆（急性疼痛使用）',
    price: 1560,
  },
  {
    id: 'ultra-potent-c',
    name: 'C 1000加強錠',
    englishName: 'Ultra Potent-C 1000',
    category: '抗發炎',
    tags: ['免疫力低下', '反覆感冒', '抗氧化', '膠原蛋白', '壓力', '皮膚暗沉', '維生素C'],
    description: '酯化維生素C 1000mg + GSH + 柑橘生物類黃酮，高效抗氧化不刺激胃',
    usage: '每天1顆，餐後食用',
    price: 2340,
  },
  {
    id: 'ultrainflamx',
    name: '成人關懷配方360粉',
    englishName: 'UltraInflamX Plus 360',
    category: '抗發炎',
    tags: ['過敏', '濕疹', '乾癬', '類風溼性關節炎', '發炎性腸道疾病', '自體免疫', '全身性發炎', '免疫失調'],
    description: '薑黃CurQfen + 啤酒花XNT雙專利全營養配方，低敏豌豆米蛋白，調整全身性發炎',
    usage: '每次2匙，每天2次（240-350ml飲用水），隨餐食用',
    price: 5080,
  },
  // ── 減壓放鬆/神經 ──
  {
    id: 'adreset',
    name: '彩色好心情加強膠囊',
    englishName: 'Adreset',
    category: '壓力疲勞',
    tags: ['壓力', '慢性疲勞', '體力差', '免疫力', '腎上腺疲勞', 'HPA軸', '適應原', '冬蟲夏草', '人參'],
    description: '冬蟲夏草、亞洲蔘、紅景天三效適應原，促進HPA axis平衡，增強壓力適應',
    usage: '每次2顆，每天1-3次，餐後食用',
    price: 2800,
  },
  {
    id: 'licorice-plus',
    name: '植萃甘草複合錠',
    englishName: 'Licorice Plus',
    category: '壓力疲勞',
    tags: ['壓力荷爾蒙', '皮質醇過高', '腎上腺疲勞', '活力不足', '免疫', '甘草', '南非醉茄', '荷爾蒙'],
    description: '甘草、南非醉茄、地黃、山藥四效草本，有效幫助長期壓力荷爾蒙代謝',
    usage: '每天1顆，餐後食用',
    price: 4440,
  },
  {
    id: 'nusera',
    name: '舒夢靜錠',
    englishName: 'NuSera',
    category: '壓力疲勞',
    tags: ['壓力', '焦慮', '睡眠品質差', 'GABA', '放鬆', '情緒緊繃', '壓力荷爾蒙'],
    description: '專利Lactium®酪蛋白水解物，激活GABA，幫助放鬆、避免壓力荷爾蒙過高',
    usage: '每次1片，需要時食用',
    price: 2540,
  },
  {
    id: 'phosphatidylserine',
    name: '健知匯膠囊',
    englishName: 'Phosphatidylserine',
    category: '壓力疲勞',
    tags: ['記憶力差', '學習力', '專注力', '認知功能', '情緒', '壓力', '腦部健康', '神經傳導'],
    description: '每日300mg磷脂醯絲胺酸可通過血腦屏障，改善記憶、學習、專注及認知功能',
    usage: '每次1顆，每天2次，餐後食用',
    price: 6800,
  },
  {
    id: 'neuro-1000',
    name: '健智魚油1000',
    englishName: 'OmegaGenics Neuro 1000',
    category: '壓力疲勞',
    tags: ['大腦健康', '記憶力', '認知功能', '神經', 'DHA', '視神經', '心血管', '腦部退化'],
    description: '高DHA 750mg + EPA 250mg，提升腦細胞活性，維護認知功能與眼睛健康',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 3620,
  },
  {
    id: 'mega-mag-night',
    name: '夜態鎂錠',
    englishName: 'Mega Magnesium Night',
    category: '壓力疲勞',
    tags: ['睡眠障礙', '入睡困難', '失眠', '肌肉緊繃', '放鬆', 'GABA', '焦慮', '睡眠品質'],
    description: '每顆150mg鎂 + 西番蓮萃取273mg，促進GABA生成，幫助入睡與維持睡眠品質',
    usage: '每次2顆，睡前食用',
    price: 1940,
  },
  // ── 肌膚/美容 ──
  {
    id: 'zinc-ag',
    name: '螫合鋅加強錠',
    englishName: 'Zinc A.G.',
    category: '肌膚保健',
    tags: ['皮膚健康', '痘痘', '傷口癒合', '男性生殖', '精子品質', '眼睛黃斑', '老化', '免疫'],
    description: '精胺酸-甘胺酸螯合鋅20mg，高吸收率，維持皮膚代謝、支持男性生殖系統健康',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 2600,
  },
  {
    id: 'collagenics',
    name: '健沛原加強錠',
    englishName: 'Collagenics',
    category: '肌膚保健',
    tags: ['膠原蛋白', '皮膚', '毛髮', '指甲', '關節', '美容', '抗老化', '皮膚暗沉'],
    description: '完整膠原蛋白合成營養素（維生素C、B5、B6、MSM）+ 馬尾草萃取，支持皮膚毛髮指甲健康',
    usage: '每天3顆，餐後食用',
    price: 3920,
  },
  // ── 骨骼/關節 ──
  {
    id: 'cal-apatite-mag',
    name: '新鈣念佳鎂錠',
    englishName: 'Cal Apatite with Magnesium',
    category: '骨骼關節',
    tags: ['骨質疏鬆', '骨骼健康', '鈣', '鎂', '骨折預防', '骨質密度', '停經後骨鬆'],
    description: '紐西蘭野放小牛骨MCHC來源，每天提供620mg鈣、300mg鎂、350mg磷及600IU維生素D',
    usage: '每天3顆，餐後食用',
    price: 2180,
  },
  {
    id: 'cal-apatite-veg',
    name: '新素補鈣錠',
    englishName: 'Cal Apatite Vegetarian',
    category: '骨骼關節',
    tags: ['骨質疏鬆', '骨骼健康', '素食', '鈣', '鎂', '腸胃不適', '檸檬酸鈣'],
    description: '檸檬酸鈣200mg + 氧化鎂150mg，適合素食者及腸胃不良者，減少結石風險',
    usage: '每次1顆，每天2次，餐後食用',
    price: 1960,
  },
  {
    id: 'vitamin-k2',
    name: '維生素K2 180膠囊',
    englishName: 'Vitamin K2 180',
    category: '骨骼關節',
    tags: ['骨質疏鬆', '血管鈣化', '心血管', '骨密度', '鈣代謝', '動脈硬化'],
    description: '專利MK-7型式維生素K2 180mcg，預防血鈣沉積，降低血管鈣化風險',
    usage: '每天1顆，餐後食用',
    price: 1680,
  },
  {
    id: 'ultrameal-protein',
    name: '體態關懷機優粉',
    englishName: 'UltraMeal Advanced Protein',
    category: '骨骼關節',
    tags: ['肌少症', '肌肉流失', '老化', '肌肉', 'BCAA', '蛋白質不足', '術後復健', '體力衰退'],
    description: '肌少症專用，每份20g植物性蛋白（含10g必需胺基酸、5g BCAA），支持肌肉生長',
    usage: '每次2匙（240-350ml飲用水），每天1-2次，隨餐食用',
    price: 4880,
  },
  {
    id: 'chondrocare',
    name: '舒健能加強錠',
    englishName: 'ChondroCare',
    category: '骨骼關節',
    tags: ['關節退化', '退化性關節炎', '葡萄糖胺', '軟骨素', 'MSM', '關節活動', '關節疼痛', '關節卡關'],
    description: '葡萄糖胺500mg + 軟骨素400mg + MSM 333mg，支持關節膠原蛋白和滑囊液生成',
    usage: '每次2顆，每天2-3次，餐後食用',
    price: 6160,
  },
  {
    id: 'osteovantiv',
    name: '新捷健錠',
    englishName: 'OsteoVantiv',
    category: '骨骼關節',
    tags: ['關節發炎', '關節活動度', '退化性關節炎', 'UC-II膠原蛋白', '膝蓋', '關節靈活'],
    description: '啤酒花THIAA 400mg + UC-II第二型膠原蛋白40mg，改善關節活動靈活性',
    usage: '每次1顆，每天1-2次，餐後食用',
    price: 4120,
  },
]

// ─── 症狀選項（依類別分組）────────────────────────────────────────────────
const SYMPTOM_GROUPS = [
  {
    group: '消化系統',
    icon: '🫁',
    symptoms: ['消化不良', '脹氣', '排氣多', '腹痛', '腹部痙攣', '腸躁症', '便秘', '腹瀉', '胃食道逆流', '胃潰瘍', '腸漏症', '食物過敏', 'SIBO'],
  },
  {
    group: '心血管 & 代謝',
    icon: '❤️',
    symptoms: ['高血壓', '血糖偏高', '胰島素阻抗', '高膽固醇', '三酸甘油酯偏高', '代謝症候群', '心悸', '血管健康'],
  },
  {
    group: '體重 & 體脂',
    icon: '⚖️',
    symptoms: ['體重過重', '體脂率高', '食慾旺盛', '難以減重', '脂肪代謝差'],
  },
  {
    group: '壓力 & 情緒 & 睡眠',
    icon: '🧘',
    symptoms: ['壓力大', '焦慮', '情緒低落', '失眠', '入睡困難', '睡眠品質差', '腎上腺疲勞', '皮質醇過高'],
  },
  {
    group: '大腦 & 認知',
    icon: '🧠',
    symptoms: ['記憶力差', '專注力不足', '思考遲緩', '腦霧', '認知退化'],
  },
  {
    group: '免疫 & 發炎',
    icon: '🛡️',
    symptoms: ['反覆感冒', '免疫力低下', '慢性發炎', '過敏', '濕疹', '類風溼性關節炎', '自體免疫', '化療副作用'],
  },
  {
    group: '骨骼 & 關節',
    icon: '🦴',
    symptoms: ['骨質疏鬆', '關節疼痛', '關節退化', '關節活動受限', '肌少症', '肌肉流失', '急性疼痛'],
  },
  {
    group: '疲勞 & 能量',
    icon: '⚡',
    symptoms: ['慢性疲勞', '體力差', '容易疲累', '能量不足', '運動恢復慢'],
  },
  {
    group: '肌膚 & 美容',
    icon: '✨',
    symptoms: ['皮膚暗沉', '膠原蛋白流失', '毛髮稀疏', '指甲脆弱', '痘痘', '皮膚老化'],
  },
  {
    group: '荷爾蒙',
    icon: '🔬',
    symptoms: ['更年期症狀', '荷爾蒙失調', '月經不規律', '男性機能', '甲狀腺問題'],
  },
]

// ─── 推薦算法 ─────────────────────────────────────────────────────────────
function scoreProduct(product: typeof PRODUCTS[0], selected: string[], freeText: string): number {
  let score = 0
  const allInput = [...selected, freeText].join(' ').toLowerCase()

  product.tags.forEach(tag => {
    const tagLower = tag.toLowerCase()
    if (allInput.includes(tagLower)) score += 3

    // Fuzzy matching for symptom groups
    selected.forEach(sym => {
      const symLower = sym.toLowerCase()
      if (tagLower.includes(symLower) || symLower.includes(tagLower)) score += 2
    })
  })

  // Keyword-to-tag mappings for common Chinese symptom expressions
  const mappings: Record<string, string[]> = {
    '體重過重': ['減重', '體脂控管', '食慾控制'],
    '體脂率高': ['脂肪代謝', '體脂控管'],
    '食慾旺盛': ['食慾控制'],
    '難以減重': ['減重', '脂肪代謝'],
    '脂肪代謝差': ['脂肪代謝'],
    '高血壓': ['高血壓', '降血壓', '血壓管理'],
    '血糖偏高': ['血糖', '血糖控制', '控糖'],
    '胰島素阻抗': ['胰島素阻抗', '血糖'],
    '高膽固醇': ['膽固醇', '降血脂'],
    '三酸甘油酯偏高': ['三酸甘油酯'],
    '代謝症候群': ['代謝症候群', '代謝'],
    '記憶力差': ['記憶力差', '記憶力'],
    '腦霧': ['認知功能', '記憶力', '腦部健康'],
    '認知退化': ['認知功能', '腦部退化'],
    '壓力大': ['壓力', 'HPA軸'],
    '腎上腺疲勞': ['腎上腺疲勞', 'HPA軸'],
    '皮質醇過高': ['皮質醇過高', '壓力荷爾蒙'],
    '入睡困難': ['睡眠障礙', '失眠'],
    '睡眠品質差': ['睡眠品質差', '睡眠障礙'],
    '反覆感冒': ['反覆感染', '免疫力低下'],
    '免疫力低下': ['免疫低下', '免疫力低下'],
    '化療副作用': ['化療副作用', '癌症治療'],
    '骨質疏鬆': ['骨質疏鬆', '骨骼健康'],
    '關節退化': ['退化性關節炎', '關節退化'],
    '肌少症': ['肌少症', '肌肉流失'],
    '急性疼痛': ['急性疼痛', '止痛'],
    '皮膚暗沉': ['皮膚', '膠原蛋白'],
    '膠原蛋白流失': ['膠原蛋白', '皮膚'],
    '慢性疲勞': ['慢性疲勞', '疲勞'],
    '容易疲累': ['疲勞', '體力差'],
    '更年期症狀': ['荷爾蒙', '壓力荷爾蒙'],
    '荷爾蒙失調': ['荷爾蒙失調', '荷爾蒙'],
  }

  selected.forEach(sym => {
    const related = mappings[sym] || []
    related.forEach(rel => {
      if (product.tags.some(t => t.toLowerCase().includes(rel.toLowerCase()))) {
        score += 2
      }
    })
  })

  return score
}

function getTopRecommendations(selected: string[], freeText: string, n = 5) {
  if (selected.length === 0 && !freeText.trim()) return []
  return PRODUCTS
    .map(p => ({ ...p, score: scoreProduct(p, selected, freeText) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
}

const CATEGORY_COLORS: Record<string, string> = {
  '腸道調理': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  '心血管代謝': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  '抗發炎': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  '壓力疲勞': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  '肌膚保健': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  '骨骼關節': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

const RANK_STYLES = [
  'from-amber-500 to-yellow-400',
  'from-neutral-400 to-slate-300',
  'from-orange-700 to-amber-600',
  'from-slate-500 to-slate-400',
  'from-slate-400 to-slate-300',
]

export default function SupplementRecommenderPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [results, setResults] = useState<ReturnType<typeof getTopRecommendations>>([])
  const [submitted, setSubmitted] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  function toggleSymptom(sym: string) {
    setSelected(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
    setSubmitted(false)
  }

  function handleSubmit() {
    const recs = getTopRecommendations(selected, freeText)
    setResults(recs)
    setSubmitted(true)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  function handleReset() {
    setSelected([])
    setFreeText('')
    setResults([])
    setSubmitted(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          功能醫學專區
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          Metagenics 營養品推薦工具
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
          根據您的症狀與健康需求，由醫師整理的臨床參考推薦。請勾選符合的症狀，系統將依優先順序列出前五名建議營養品。
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          本工具僅供醫療專業人員與民眾參考，實際使用請諮詢醫師
        </div>
      </div>

      {/* Symptom Selector */}
      <div className="space-y-6 mb-8">
        {SYMPTOM_GROUPS.map(group => (
          <div key={group.group}>
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
              <span>{group.icon}</span>
              {group.group}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.symptoms.map(sym => {
                const isSelected = selected.includes(sym)
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {sym}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Free Text Input */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          📝 其他症狀或補充說明（選填）
        </label>
        <textarea
          value={freeText}
          onChange={e => { setFreeText(e.target.value); setSubmitted(false) }}
          placeholder="例如：更年期、甲狀腺低下、長期服用特定藥物、手術後恢復中..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none text-sm"
        />
      </div>

      {/* Selected count & Submit */}
      <div className="flex items-center gap-4 mb-10">
        {selected.length > 0 && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            已選 <strong className="text-neutral-800 dark:text-neutral-200">{selected.length}</strong> 項症狀
          </span>
        )}
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 && !freeText.trim()}
          className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
        >
          查詢推薦 →
        </button>
        {(selected.length > 0 || freeText) && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-sm hover:border-neutral-400 transition-colors"
          >
            重置
          </button>
        )}
      </div>

      {/* Results */}
      {submitted && (
        <div ref={resultRef}>
          {results.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-lg">找不到符合的推薦</p>
              <p className="text-sm mt-1">請嘗試選擇更多症狀或輸入關鍵字</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  🏆 推薦結果
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  依據您的症狀，以下為前 {results.length} 名建議營養品
                </p>
              </div>

              <div className="space-y-4 mb-12">
                {results.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 flex items-start">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${RANK_STYLES[idx]} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {idx + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                          {product.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[product.category] || 'bg-neutral-100 text-neutral-600'}`}>
                          {product.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
                        {product.englishName}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>📋 {product.usage}</span>
                        <span>💰 NT${product.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchase QR Code Section */}
              <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    🛒 如何購買 Metagenics 產品
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    掃描 QR Code，享受醫療專業人員推薦優惠
                  </p>
                </div>
                <div className="px-6 py-6 flex flex-col sm:flex-row items-center gap-8">
                  {/* QR Code */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="p-4 bg-white rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <QRCodeSVG
                        value="https://www.metagenics-prisma.com"
                        size={140}
                        bgColor="#ffffff"
                        fgColor="#111111"
                        level="H"
                      />
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">掃描加入會員</p>
                  </div>

                  {/* Instructions */}
                  <div className="flex-1">
                    <ol className="space-y-3">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">1</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">掃描右側 QR Code</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">或直接前往 www.metagenics-prisma.com</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">2</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">完成會員註冊</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">免費加入 Metagenics 會員</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">3</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">輸入專業人員推薦優惠碼</p>
                          <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                            <span className="text-base font-bold tracking-widest text-neutral-900 dark:text-neutral-100">YY103001</span>
                          </div>
                        </div>
                      </li>
                    </ol>
                    <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
                      由中華生醫科技股份有限公司負責台灣地區 Metagenics 產品代理與服務
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500 text-center leading-relaxed">
                ※ 本推薦結果僅供參考，實際用藥或補充品選擇，請務必諮詢您的醫師或功能醫學專科醫師。
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
