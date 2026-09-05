export interface PerioperativeRehabExercise {
  src: string
  title: string
  stage: string
  instruction: string
  alt: string
}

const imagePath = (slug: string, file: string) =>
  `/images/perioperative-rehab/${slug}/${file}.webp`

export const perioperativeRehabExercises: Record<
  string,
  PerioperativeRehabExercise[]
> = {
  'achilles-repair-rehab': [
    {
      src: imagePath('achilles-repair-rehab', 'protected-straight-leg-raise'),
      title: '護具保護下直腿抬高',
      stage: '早期保護期；須依醫囑配戴護具',
      instruction: '仰躺，膝蓋保持伸直，整條腿緩慢抬離床面；腳踝維持在護具設定角度，不主動拉小腿。',
      alt: '阿基里斯腱修補術後患者穿著行走靴仰躺做直腿抬高',
    },
    {
      src: imagePath('achilles-repair-rehab', 'gentle-ankle-pump'),
      title: '溫和腳踝幫浦',
      stage: '醫師允許移除護具活動後',
      instruction: '坐姿讓腳跟著地，在允許角度內緩慢把腳板上抬、再放回；早期不要硬扳超過中立角度。',
      alt: '阿基里斯腱修補術後患者坐姿做溫和腳踝幫浦',
    },
    {
      src: imagePath('achilles-repair-rehab', 'seated-heel-raise'),
      title: '坐姿提踵',
      stage: '約術後 4–8 週，經醫療團隊允許',
      instruction: '坐穩、前腳掌貼地，緩慢抬起腳跟再放下；動作後若腫痛增加，應減量並回到前一階段。',
      alt: '阿基里斯腱修補術後患者坐姿練習提踵',
    },
  ],
  'acl-meniscus-repair-rehab': [
    {
      src: imagePath('acl-meniscus-repair-rehab', 'quad-set'),
      title: '股四頭肌等長收縮',
      stage: '早期保護期',
      instruction: '仰躺伸直膝蓋，膝下墊毛巾捲，輕輕把膝窩往下壓；不要憋氣，也不要讓膝蓋轉動。',
      alt: 'ACL 合併半月板修復術後患者仰躺做股四頭肌等長收縮',
    },
    {
      src: imagePath('acl-meniscus-repair-rehab', 'braced-straight-leg-raise'),
      title: '支架鎖直的直腿抬高',
      stage: '早期保護期；確認無伸膝遲滯後',
      instruction: '依醫囑把支架鎖在伸直位，膝蓋保持筆直，整條腿緩慢抬高；若膝蓋會彎或明顯疼痛就停止。',
      alt: 'ACL 合併半月板修復術後患者戴膝支架做直腿抬高',
    },
    {
      src: imagePath('acl-meniscus-repair-rehab', 'supported-mini-squat'),
      title: '扶物淺蹲',
      stage: '可無痛負重且醫療團隊允許後',
      instruction: '雙手扶穩固桌面，臀部往後、膝蓋對準腳尖，只做淺蹲；依原計畫避免超過 60°，不可扭轉。',
      alt: 'ACL 合併半月板修復術後患者扶桌做不超過六十度的淺蹲',
    },
  ],
  'acl-reconstruction-rehab': [
    {
      src: imagePath('acl-reconstruction-rehab', 'quad-set'),
      title: '股四頭肌等長收縮',
      stage: '術後早期',
      instruction: '仰躺伸直膝蓋，膝下墊毛巾捲，輕輕把膝窩往下壓，讓大腿前側出力但保持呼吸。',
      alt: '前十字韌帶重建術後患者仰躺做股四頭肌等長收縮',
    },
    {
      src: imagePath('acl-reconstruction-rehab', 'braced-straight-leg-raise'),
      title: '支架保護下直腿抬高',
      stage: '術後早期；確認能主動鎖直膝蓋後',
      instruction: '膝蓋保持完全伸直，將整條腿緩慢抬離床面；若膝蓋下垂或彎曲，先停止並請治療師確認。',
      alt: '前十字韌帶重建術後患者戴膝支架做直腿抬高',
    },
    {
      src: imagePath('acl-reconstruction-rehab', 'supported-mini-squat'),
      title: '扶物淺蹲',
      stage: '進入閉鎖動力鏈訓練後',
      instruction: '雙腳與髖同寬，扶穩固桌面，臀部後移做淺蹲；膝蓋朝第二腳趾方向，不內夾、不急著蹲深。',
      alt: '前十字韌帶重建術後患者扶桌做淺蹲',
    },
  ],
  'ankle-fracture-rehab': [
    {
      src: imagePath('ankle-fracture-rehab', 'toe-mobility'),
      title: '腳趾活動',
      stage: '早期固定與消腫期',
      instruction: '在石膏、副木或行走靴保護下，輕柔張開、彎曲腳趾；不要牽扯傷口或自行拆除固定。',
      alt: '踝關節骨折術後患者在行走靴保護下輕柔活動腳趾',
    },
    {
      src: imagePath('ankle-fracture-rehab', 'ankle-pump'),
      title: '腳踝主動活動',
      stage: '傷口穩定且醫師允許移除護具後',
      instruction: '坐姿讓小腿放鬆，在無痛範圍內緩慢把腳板上抬、下壓；不要用另一隻腳或毛巾暴力扳動。',
      alt: '踝關節骨折術後患者坐姿做腳踝上下主動活動',
    },
    {
      src: imagePath('ankle-fracture-rehab', 'supported-heel-raise'),
      title: '扶物雙腳提踵',
      stage: '影像癒合穩定並進入肌力期後',
      instruction: '扶穩固桌面，雙腳平均受力，緩慢抬起腳跟再放下；若疼痛、腫脹或跛行加重就先停止。',
      alt: '踝關節骨折術後患者扶桌做雙腳提踵',
    },
  ],
  'breast-cancer-rehab': [
    {
      src: imagePath('breast-cancer-rehab', 'diaphragmatic-breathing'),
      title: '腹式呼吸',
      stage: '傷口與引流管保護期',
      instruction: '半躺或坐姿，一手輕放腹部，吸氣時讓腹部自然鼓起，吐氣時放鬆；不聳肩、不憋氣。',
      alt: '乳癌術後患者半躺做腹式呼吸',
    },
    {
      src: imagePath('breast-cancer-rehab', 'scapular-setting'),
      title: '肩胛骨輕夾',
      stage: '術後早期可耐受範圍',
      instruction: '坐直、雙臂放鬆，肩胛骨輕輕往後下方靠近；不要用力挺胸，也不要讓肩膀聳起。',
      alt: '乳癌術後患者坐姿做肩胛骨輕夾訓練',
    },
    {
      src: imagePath('breast-cancer-rehab', 'wall-climb'),
      title: '牆面爬手',
      stage: '傷口穩定且引流管或重建限制允許後',
      instruction: '面向牆站立，用手指慢慢往上走到有拉感但不痛的位置，再緩慢回來；不要忍痛硬拉。',
      alt: '乳癌術後患者面向牆做手指爬牆肩關節活動',
    },
  ],
  'cabg-ami-rehab': [
    {
      src: imagePath('cabg-ami-rehab', 'incentive-spirometer'),
      title: '誘發性肺量計',
      stage: '住院恢復期；依病房團隊指導',
      instruction: '坐直、肩頸放鬆，嘴唇密合含住吸嘴後緩慢深吸氣；次數與目標刻度依醫療團隊設定。',
      alt: 'CABG 心臟手術後患者坐姿使用誘發性肺量計',
    },
    {
      src: imagePath('cabg-ami-rehab', 'splinted-cough'),
      title: '枕頭固定下咳嗽',
      stage: '住院恢復期',
      instruction: '坐直，以枕頭輕抱胸前支撐胸骨切口，再依護理或治療師教法咳嗽；不要用手臂大力擠壓。',
      alt: 'CABG 心臟手術後患者抱枕支撐胸骨做咳嗽練習',
    },
    {
      src: imagePath('cabg-ami-rehab', 'sit-to-stand-no-arms'),
      title: '不用雙手撐起的坐站',
      stage: '胸骨保護期間；需有人在旁確保安全',
      instruction: '坐到椅面前緣、雙腳踩穩，身體微向前，以腿部力量站起；不要用雙手向下撐椅。',
      alt: 'CABG 心臟手術後患者遵守胸骨保護以腿力從椅子站起',
    },
  ],
  'cardiovascular-surgery': [
    {
      src: imagePath('cardiovascular-surgery', 'seated-knee-extension'),
      title: '坐姿膝伸直',
      stage: '住院早期；生命徵象穩定後',
      instruction: '坐穩、背部有支撐，慢慢把一側膝蓋伸直再放下；若頭暈、胸痛或喘到無法說話立即停止。',
      alt: '瓣膜手術或 TAVI 術後高齡患者坐姿練習膝伸直',
    },
    {
      src: imagePath('cardiovascular-surgery', 'chair-sit-to-stand'),
      title: '椅子坐站',
      stage: '返家早期；有人陪同並確保不頭暈',
      instruction: '雙腳踩穩、身體微向前，用腿部力量站起；開胸患者避免雙手大力推撐，必要時依治療師方式協助。',
      alt: '瓣膜手術或 TAVI 術後高齡患者從穩固椅子做坐站訓練',
    },
    {
      src: imagePath('cardiovascular-surgery', 'supported-heel-raise'),
      title: '扶物雙腳提踵',
      stage: '門診心臟復健或返家肌力期',
      instruction: '輕扶穩固桌面，雙腳同時慢慢抬起腳跟再放下；保持呼吸，不憋氣、不追求速度。',
      alt: '瓣膜手術或 TAVI 術後高齡患者扶桌做雙腳提踵',
    },
  ],
  'distal-radius-fracture-rehab': [
    {
      src: imagePath('distal-radius-fracture-rehab', 'finger-open-close'),
      title: '手指握放',
      stage: '固定與消腫期',
      instruction: '前臂抬高並有支撐，手指緩慢張開、再輕輕握拳；不要握到疼痛，也不要讓副木壓迫皮膚。',
      alt: '遠端橈骨骨折術後患者抬高手臂做手指握放',
    },
    {
      src: imagePath('distal-radius-fracture-rehab', 'wrist-flexion-extension'),
      title: '手腕主動彎伸',
      stage: '醫師允許移除護具活動後',
      instruction: '前臂平放桌面、手掌超出桌緣，手腕在無痛範圍內緩慢上抬、下放；另一手不要強壓。',
      alt: '遠端橈骨骨折術後患者以前臂支撐做手腕主動彎伸',
    },
    {
      src: imagePath('distal-radius-fracture-rehab', 'forearm-rotation'),
      title: '前臂旋前與旋後',
      stage: '醫師允許開始手腕活動後',
      instruction: '手肘貼近身體並彎成直角，慢慢把手掌轉向上、再轉向下；保持手肘不向外跑。',
      alt: '遠端橈骨骨折術後患者手肘彎曲做前臂旋轉',
    },
  ],
  'esophageal-cancer-rehab': [
    {
      src: imagePath('esophageal-cancer-rehab', 'inspiratory-muscle-trainer'),
      title: '吸氣肌訓練器練習',
      stage: '術前復健；阻力須由專業人員設定',
      instruction: '坐直、肩頸放鬆，嘴唇密合含住吸嘴，依設定阻力穩定吸氣；不要自行提高阻力或憋氣。',
      alt: '食道癌手術前患者坐姿使用吸氣肌訓練器',
    },
    {
      src: imagePath('esophageal-cancer-rehab', 'supported-huff-cough'),
      title: '切口支撐下哈氣咳嗽',
      stage: '術後急性恢復期；依病房團隊指導',
      instruction: '以枕頭輕扶胸腹部切口，吸氣後用張口「哈氣」方式呼出；胸管或傷口未穩定時不要自行練習。',
      alt: '食道癌術後患者以枕頭支撐胸腹部切口做哈氣咳嗽',
    },
    {
      src: imagePath('esophageal-cancer-rehab', 'seated-scapular-retraction'),
      title: '坐姿肩胛後收',
      stage: '術後姿勢恢復期',
      instruction: '坐直、下巴微收，雙臂自然垂放，肩胛骨輕輕向後靠近；不要過度挺胸或拉扯傷口。',
      alt: '食道癌術後患者坐姿做肩胛後收改善保護性駝背',
    },
  ],
  'gynecologic-cancer-rehab': [
    {
      src: imagePath('gynecologic-cancer-rehab', 'ankle-pump'),
      title: '腳踝幫浦',
      stage: '術後早期下床前後',
      instruction: '仰躺或半躺，雙腿放鬆，腳板緩慢上抬、下壓；每次活動都保持呼吸，不用力繃緊腹部。',
      alt: '婦癌術後患者半躺做雙側腳踝幫浦',
    },
    {
      src: imagePath('gynecologic-cancer-rehab', 'diaphragmatic-breathing'),
      title: '腹式呼吸',
      stage: '傷口保護期',
      instruction: '半躺、膝下有支撐，一手輕放腹部，吸氣時腹部自然鼓起，吐氣時放鬆；不要憋氣或用力壓傷口。',
      alt: '婦癌術後患者半躺做腹式呼吸',
    },
    {
      src: imagePath('gynecologic-cancer-rehab', 'supported-sit-to-stand'),
      title: '腹部輕扶下坐站',
      stage: '生命徵象穩定並可下床後',
      instruction: '雙腳踩穩，起身時以手或枕頭輕扶腹部，身體微向前後用腿站起；避免憋氣與突然用力。',
      alt: '婦癌腹部手術後患者輕扶腹部從椅子站起',
    },
  ],
  'hip-fracture-rehab': [
    {
      src: imagePath('hip-fracture-rehab', 'ankle-pump'),
      title: '腳踝幫浦',
      stage: '住院早期',
      instruction: '仰躺或半躺，膝蓋與髖部保持醫囑姿勢，腳板緩慢往上、往下活動，過程中持續呼吸。',
      alt: '髖部骨折術後高齡患者半躺做腳踝幫浦',
    },
    {
      src: imagePath('hip-fracture-rehab', 'walker-sit-to-stand'),
      title: '助行器前坐站',
      stage: '醫療團隊允許負重後；須有人在旁',
      instruction: '從有扶手的穩固椅子起身，先按治療師教法把手放好，站穩後再握助行器；不要直接拉助行器站起。',
      alt: '髖部骨折術後高齡患者在助行器前練習安全坐站',
    },
    {
      src: imagePath('hip-fracture-rehab', 'supported-hip-abduction'),
      title: '扶物站姿髖外展',
      stage: '可安全站立且醫療團隊允許後',
      instruction: '扶穩固桌面，身體直立，患側腿保持腳尖朝前、緩慢向側邊抬起；骨盆不要傾斜代償。',
      alt: '髖部骨折術後高齡患者扶桌做站姿髖外展',
    },
  ],
  'lumbar-discectomy-rehab': [
    {
      src: imagePath('lumbar-discectomy-rehab', 'log-roll'),
      title: '側身翻身下床',
      stage: '術後早期',
      instruction: '肩膀、骨盆與膝蓋一起翻向側邊，雙腿移到床緣，同時用手臂撐起；避免腰部單獨扭轉。',
      alt: '椎間盤手術後患者用原木翻身方式側身下床',
    },
    {
      src: imagePath('lumbar-discectomy-rehab', 'neutral-sit-to-stand'),
      title: '中立脊椎坐站',
      stage: '日常活動恢復期',
      instruction: '坐到椅面前緣、雙腳踩穩，軀幹保持自然中立並從髖部向前，利用腿力站起。',
      alt: '椎間盤手術後患者保持腰背中立從椅子站起',
    },
    {
      src: imagePath('lumbar-discectomy-rehab', 'hip-hinge-pickup'),
      title: '髖膝彎曲撿輕物',
      stage: '醫師允許恢復彎曲與拿物後',
      instruction: '靠近物品，髖膝一起彎曲、腰背維持中立，物品貼近身體再站起；不要邊彎腰邊扭轉。',
      alt: '椎間盤手術後患者以髖膝彎曲和中立脊椎撿起輕物',
    },
  ],
  'lumbar-fusion-rehab': [
    {
      src: imagePath('lumbar-fusion-rehab', 'log-roll'),
      title: '側身翻身下床',
      stage: '術後早期',
      instruction: '肩膀、骨盆與膝蓋像一個整體翻向側邊，雙腿移到床緣時用手臂撐起；不要讓腰部單獨旋轉。',
      alt: '腰椎融合術後患者使用原木翻身方式側身下床',
    },
    {
      src: imagePath('lumbar-fusion-rehab', 'abdominal-bracing'),
      title: '中立脊椎核心輕收縮',
      stage: '醫療團隊允許開始核心啟動後',
      instruction: '仰躺屈膝，腰背維持自然中立，像把下腹輕輕收緊，同時正常呼吸；不要把腰用力壓平。',
      alt: '腰椎融合術後患者仰躺屈膝做中立脊椎核心輕收縮',
    },
    {
      src: imagePath('lumbar-fusion-rehab', 'walker-sit-to-stand'),
      title: '護腰與助行器下坐站',
      stage: '依醫囑使用護腰與輔具時',
      instruction: '坐到椅面前緣、雙腳踩穩，以腿部力量站起；站穩後再握助行器，避免彎腰、扭轉或猛拉輔具。',
      alt: '腰椎融合術後患者戴護腰在助行器前做安全坐站',
    },
  ],
  'lung-cancer-rehab': [
    {
      src: imagePath('lung-cancer-rehab', 'diaphragmatic-breathing'),
      title: '橫膈膜呼吸',
      stage: '術前與術後依醫療團隊指導',
      instruction: '坐直，一手放上胸、一手放腹部，吸氣時讓腹部自然鼓起、上胸盡量放鬆，吐氣時緩慢回復。',
      alt: '肺癌手術前後患者坐姿做橫膈膜呼吸',
    },
    {
      src: imagePath('lung-cancer-rehab', 'incentive-spirometer'),
      title: '誘發性肺量計',
      stage: '術後急性恢復期；依病房團隊設定',
      instruction: '坐直、嘴唇密合吸嘴，緩慢且持續地吸氣；不要快速猛吸，目標刻度與次數依醫護指示。',
      alt: '肺癌術後患者坐姿使用誘發性肺量計',
    },
    {
      src: imagePath('lung-cancer-rehab', 'supported-huff-cough'),
      title: '切口支撐下哈氣咳嗽',
      stage: '術後急性恢復期；確認胸管固定後',
      instruction: '用枕頭或手掌輕扶手術側切口，吸氣後張口快速「哈」氣；若胸管拉扯、頭暈或疼痛增加就停止。',
      alt: '肺癌術後患者支撐胸側切口做哈氣咳嗽',
    },
  ],
  'oral-neck-cancer-rehab': [
    {
      src: imagePath('oral-neck-cancer-rehab', 'gentle-mouth-opening'),
      title: '輕柔主動張口',
      stage: '傷口與皮瓣穩定、醫療團隊允許後',
      instruction: '坐在鏡子前，緩慢張口到有拉感但不痛的位置，再放鬆；不要用手或器具強行撐開。',
      alt: '頭頸癌術後患者在鏡子前做輕柔主動張口訓練',
    },
    {
      src: imagePath('oral-neck-cancer-rehab', 'tongue-mobility'),
      title: '舌頭主動活動',
      stage: '語言治療師確認可開始後',
      instruction: '面對鏡子，舌頭緩慢向前伸出再收回，動作維持在舒適範圍；有皮瓣或傷口牽扯時先停止。',
      alt: '頭頸癌術後患者面對鏡子做舌頭主動伸出活動',
    },
    {
      src: imagePath('oral-neck-cancer-rehab', 'scapular-setting'),
      title: '肩胛骨設定',
      stage: '早期頸肩活動期',
      instruction: '坐直、下巴微收，肩膀輕輕向後下方帶，讓肩胛骨靠近；避免用力聳肩或拉扯頸部傷口。',
      alt: '頭頸癌術後患者坐姿做肩胛骨設定訓練',
    },
  ],
  'pcl-reconstruction': [
    {
      src: imagePath('pcl-reconstruction', 'quad-set'),
      title: '股四頭肌等長收縮',
      stage: '急性保護期',
      instruction: '仰躺伸直膝蓋，膝下墊毛巾捲，輕輕將膝窩往下壓；避免主動勾小腿或用大腿後側出力。',
      alt: 'PCL 重建術後患者仰躺做股四頭肌等長收縮',
    },
    {
      src: imagePath('pcl-reconstruction', 'supported-shallow-squat'),
      title: '扶物淺蹲',
      stage: '進入閉鏈運動且醫療團隊允許後',
      instruction: '雙手扶穩固桌面，臀部後移做小角度淺蹲，膝蓋對準腳尖；不要急著蹲深或讓脛骨明顯後移。',
      alt: 'PCL 重建術後患者扶桌做小角度淺蹲',
    },
    {
      src: imagePath('pcl-reconstruction', 'low-step-up'),
      title: '低階踏步',
      stage: '重建期；肌力與控制達標後',
      instruction: '扶著扶手，用患側踩上低台階，膝蓋保持朝腳尖方向，再慢慢退回；不要快速彈起或扭轉。',
      alt: 'PCL 重建術後患者扶手做低階踏步訓練',
    },
  ],
  'prostate-cancer-rehab': [
    {
      src: imagePath('prostate-cancer-rehab', 'diaphragmatic-breathing'),
      title: '腹式呼吸與骨盆底放鬆',
      stage: '導尿管期間可做呼吸；不要強收骨盆底',
      instruction: '仰躺屈膝，一手放腹部，吸氣時讓腹部與骨盆底放鬆，吐氣時自然回復；全程不憋氣。',
      alt: '攝護腺癌術後男性仰躺屈膝做腹式呼吸與骨盆底放鬆',
    },
    {
      src: imagePath('prostate-cancer-rehab', 'pelvic-floor-contraction'),
      title: '骨盆底肌輕收縮',
      stage: '導尿管移除且泌尿科醫師允許後',
      instruction: '仰躺或坐姿，像忍住排氣與縮住尿道般輕輕向上收，再完整放鬆；臀部、大腿與腹部不要代償。',
      alt: '男性骨盆底肌輕收縮的姿勢與骨盆底解剖示意',
    },
    {
      src: imagePath('prostate-cancer-rehab', 'precontract-sit-to-stand'),
      title: '預先收縮後站起',
      stage: '拔管後、已學會正確骨盆底收縮',
      instruction: '坐到椅面前緣，站起前先輕收骨盆底、吐氣，再用腿部力量起身；站穩後讓骨盆底放鬆。',
      alt: '攝護腺癌術後男性在站起前練習骨盆底預先收縮',
    },
  ],
  'rotator-cuff-slap-rehab': [
    {
      src: imagePath('rotator-cuff-slap-rehab', 'pendulum'),
      title: '肩關節鐘擺運動',
      stage: '最大保護期；依手術醫師允許',
      instruction: '健側手扶桌、身體從髖部微向前，手術側手臂完全放鬆下垂，以身體輕移帶動小範圍擺動。',
      alt: '旋轉肌袖合併 SLAP 修復術後患者做肩關節鐘擺運動',
    },
    {
      src: imagePath('rotator-cuff-slap-rehab', 'scapular-retraction'),
      title: '肩胛骨後收',
      stage: '最大保護期可耐受範圍',
      instruction: '坐直，手術側手臂依醫囑留在支架中，雙側肩胛骨輕輕向後靠近；不要主動彎手肘或抬手。',
      alt: '旋轉肌袖合併 SLAP 修復術後患者戴外展支架做肩胛後收',
    },
    {
      src: imagePath('rotator-cuff-slap-rehab', 'wand-assisted-flexion'),
      title: '棍棒輔助肩前舉',
      stage: '進入主動輔助活動期後',
      instruction: '仰躺，雙手握輕棍，由健側手帶動手術側緩慢前舉；角度與範圍依治療師設定，不自行拉到痛。',
      alt: '旋轉肌袖合併 SLAP 修復術後患者仰躺做棍棒輔助肩前舉',
    },
  ],
  'thr-rehab': [
    {
      src: imagePath('thr-rehab', 'heel-slide'),
      title: '仰躺腳跟滑動',
      stage: '急性保護期；依手術入路限制角度',
      instruction: '仰躺，腳跟沿床面慢慢滑向臀部再伸直；膝蓋與腳尖朝上，不超過醫師設定的髖屈角度。',
      alt: '全髖關節置換術後患者仰躺做腳跟滑動',
    },
    {
      src: imagePath('thr-rehab', 'supported-hip-abduction'),
      title: '扶物站姿髖外展',
      stage: '可安全站立並進入站姿肌力期後',
      instruction: '扶穩固桌面，身體保持直立，腿伸直並向側邊小幅抬起；腳尖朝前，骨盆不要傾斜。',
      alt: '全髖關節置換術後患者扶桌做站姿髖外展',
    },
    {
      src: imagePath('thr-rehab', 'high-chair-sit-to-stand'),
      title: '高椅坐站',
      stage: '功能性行走訓練期',
      instruction: '選擇較高且穩固的椅子，雙腳平行不交叉，身體微向前後用腿站起；避免髖部超過醫囑角度。',
      alt: '全髖關節置換術後患者從高椅做安全坐站',
    },
  ],
  'tkr-rehab': [
    {
      src: imagePath('tkr-rehab', 'quad-set'),
      title: '股四頭肌等長收縮',
      stage: '急性保護期',
      instruction: '仰躺伸直膝蓋，膝下放毛巾捲，將膝窩輕壓向下；腳跟保持放鬆，動作中不要憋氣。',
      alt: '全膝關節置換術後患者仰躺做股四頭肌等長收縮',
    },
    {
      src: imagePath('tkr-rehab', 'heel-slide'),
      title: '腳跟滑動屈膝',
      stage: '術後早期活動度訓練',
      instruction: '仰躺，腳跟沿床面緩慢滑向臀部，膝蓋保持朝上，再慢慢伸直；以拉感可接受、沒有尖銳痛為原則。',
      alt: '全膝關節置換術後患者仰躺做腳跟滑動屈膝',
    },
    {
      src: imagePath('tkr-rehab', 'straight-leg-raise'),
      title: '直腿抬高',
      stage: '能主動把膝蓋鎖直後',
      instruction: '健側膝蓋彎曲、手術側腿伸直，先收緊大腿前側，再將整條腿緩慢抬起；膝蓋不可下垂。',
      alt: '全膝關節置換術後患者仰躺做直腿抬高',
    },
  ],
}

export function getPerioperativeRehabExercises(slug: string) {
  return perioperativeRehabExercises[slug] ?? []
}
