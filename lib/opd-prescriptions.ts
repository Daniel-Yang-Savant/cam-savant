import 'server-only'

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
  category: PostopPrescriptionCategory
  hint: string
  plan: string
  safety: string
  origin: '現有 Notion' | '循證補充'
  reviewStatus: '待醫師確認'
  sources: PostopPrescriptionSource[]
}

const NOTION_POSTOP_ROOT =
  'https://app.notion.com/p/2e3451a33b66809aa660f4b286c5bec7'

const COMMON_POSTOP_SAFETY =
  '實際負重、護具、活動角度與進階時程以手術醫師、術式、固定方式及組織癒合狀況為準；若出現傷口感染徵象、無法控制的疼痛或腫脹、新發神經血管異常、呼吸困難或其他急性惡化，應停止並儘速評估。'

const basePostopPrescriptions: PostopPrescription[] = [
  {
    id: 'acl-reconstruction',
    title: 'ACL 重建術後',
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
      '若合併半月板修補、軟骨處置或其他韌帶重建，不可直接沿用單純 ACL 時程。' +
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
      'root／radial 修補或複雜撕裂的限制可能更嚴格，須以手術紀錄與個別醫囑為準。' +
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
      'PCL graft 對後向剪力敏感；合併 PLC／多韌帶損傷時限制不同。' +
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
      '大範圍／massive tear、組織品質差或額外 subscapularis 修補，ROM 與負荷時程通常需更保守。' +
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
      '脫臼預防並非所有入路都相同，須確認手術醫師的個別限制。' +
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
      '皮瓣、氣道、瘻管、感染、出血及吸入風險須優先；吞嚥手法與飲食質地需依個別檢查結果，不能以通用模板取代評估。' +
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
      '早期不可過度牽拉切口或皮瓣；明顯肩無力需評估副神經功能，淋巴水腫治療前須排除感染、血栓及其他禁忌。' +
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
    category: '癌症術後',
    hint: '肩活動、腋網症候群、疤痕、漸進阻力與淋巴水腫風險管理。',
    plan: `手術／側別／ALND or SLNB／reconstruction：＿＿；post-op week：＿＿
Week 0–2：依外科／整形外科與引流管限制做 distal ROM、ball squeeze、呼吸、步行與輕柔 shoulder AAROM；提重與重複高舉依醫囑。
Week 2–6：傷口與引流狀況允許後漸進完整 shoulder AROM、wall slide、scapular exercise；評估 scar、axillary web syndrome、疼痛與腫脹。
Week 6–12+：由低負荷開始漸進 resistance（高次數、低重量起步）、功能與有氧訓練；放療期間持續胸肩伸展與姿勢活動。
Lymphedema：衛教皮膚照護與早期症狀；若有持續腫脹／沉重／緊繃，轉介合格淋巴水腫專業人員評估。血壓、抽血與注射依院內風險評估及可行性個別決定。
Follow-up：＿＿`,
    safety:
      '重建方式、組織擴張器與傷口狀況會改變肩 ROM／提重限制；不以「一律禁止患側量血壓或穿刺」取代個別風險評估。' +
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
    category: '癌症術後',
    hint: '術前預復健、術後早期活動、呼吸／排痰與營養配合。',
    plan: `術式／post-op day or week：＿＿
Prehabilitation（術前如時間允許）：aerobic 30 min、每週 3–5 日，合併低至中強度 resistance；高風險者考慮 inspiratory muscle training。呼吸／huff cough 衛教、戒菸與營養評估。
Post-op day 0–7：生命徵象與疼痛控制穩定後，依團隊許可在 24 小時內開始坐起、站立與步行；deep breathing／thoracic expansion、supported huff／cough、shoulder／neck ROM。誘發性肺量計僅依院內路徑或個別適應症使用。
Week 2–6：分段步行並逐步增加時間，配合 posture、pacing 與 ADL；飲食／管灌與餐後姿勢依外科及營養團隊。
Month 2–6：漸進 aerobic、resistance、flexibility 與回歸生活／工作；持續癌症治療相關副作用與營養監測。
Follow-up／referral：＿＿`,
    safety:
      '需留意吻合口、呼吸、感染、吞嚥／吸入、營養及心律等術後併發症；運動不能延誤外科評估。' +
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
    category: '癌症術後',
    hint: '既有肺癌流程，涵蓋預復健、早期活動、呼吸與長期體能。',
    plan: `術式／approach／post-op day or week：＿＿
Prehabilitation（術前如時間允許）：aerobic、resistance；高風險者評估 inspiratory muscle training。練習 diaphragmatic／thoracic expansion、huff cough，並配合戒菸與營養評估。
Post-op day 0–7：生命徵象穩定後依團隊許可在 24 小時內離床活動；upright positioning、分段步行、deep breathing／thoracic expansion、supported huff／cough、患側 shoulder AAROM 與 trunk mobility。誘發性肺量計不列為常規必做，僅依院內路徑或個別適應症。
Week 2–6：由 15–20 分鐘分段步行起，依症狀漸進；加入 chest-wall expansion、side-bending、posture、shoulder ROM 與傷口穩定後的 scar care。
Month 2–3+：漸進 aerobic interval、全身 resistance 與 ADL／工作活動；追蹤呼吸症狀、運動耐受與後續放化療影響。
Follow-up／pulmonary rehab referral：＿＿`,
    safety:
      '氧療、胸管、漏氣及活動界線依胸腔團隊；SpO₂ 目標應個別化，不固定套用單一數值。' +
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
    category: '心肺術後',
    hint: '既有 AMI 流程；依醫療穩定度、運動測試與心臟復健團隊進階。',
    plan: `Diagnosis／intervention／risk：AMI；PCI／＿＿；post-event day or week：＿＿
Day 1–7：醫療穩定且團隊放行後早期坐起、站立與短距離步行；監測症狀、ECG／HR／BP／SpO₂（依場域）。強度約 RPE <11 或 resting HR + <20 bpm 起步，須個別化。
Week 2–6：正式心臟復健；walking／cycle 15–30 min、每週 3–5 日，常由 HRR 40–60% 或 RPE 11–13 起步；低負荷 resistance，避免憋氣／Valsalva。
Week 6–12+：依運動測試與風險分層漸進 30–60 min aerobic；需要時進展至 HRR 60–80%，合併 resistance、危險因子與生活型態管理。
Education：藥物遵從、症狀辨識、戒菸、睡眠、營養與回歸工作／性生活。
Follow-up／cardiac rehab referral：＿＿`,
    safety:
      '運動進階須依缺血、心律、心衰竭、血壓反應與介入後狀況；新發胸痛、明顯呼吸困難、暈厥或不穩定生命徵象應立即停止並處理。',
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
    category: '心肺術後',
    hint: '早期活動、胸骨保護、呼吸排痰與門診心臟復健。',
    plan: `術式／取 graft 部位／post-op day or week：CABG；＿＿
Day 0–7：醫療穩定後早期坐起、站立與步行；supported cough／deep breathing，誘發性肺量計依院內路徑。採 move-in-the-tube 原則，日常動作讓上臂靠近軀幹，避免疼痛性用力拉推。
Week 2–6：walking／cycle 20–30 min，常以 RPE 11–13 或 resting HR + <20 bpm 起步；gentle shoulder／thoracic AROM、gait 與 ADL。監測胸骨、傷口、取 graft 肢體腫脹與心律。
Week 6–12+：胸骨穩定且外科放行後漸進上肢 resistance 與提重；依運動測試進展 aerobic，合併危險因子管理與回歸工作。
Education：move-in-the-tube、傷口照護、藥物遵從、症狀辨識、戒菸與生活型態。
Follow-up／cardiac rehab referral：＿＿`,
    safety:
      '胸骨限制宜以疼痛、胸骨穩定與個別外科指示取代僵化的單一重量／角度；若有 clicking、傷口異常、胸痛、呼吸困難、暈厥或不穩定心律應停止並評估。',
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
      '此為跨專業處方草稿。氣道受阻、皮瓣顏色／溫度／毛細回填急變、活動性出血、頸部快速腫脹、發燒／感染、瘻管、吸入或神經功能惡化，需立即回報外科團隊；治療不得壓迫 pedicle 或延誤皮瓣監測。',
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
      '新發或加劇的呼吸困難、無法恢復的血氧下降、胸痛、暈厥、心悸、發燒、咳血、傷口／胸管異常、單側小腿腫痛或急性功能下降，應停止活動並緊急評估。',
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

export const postopPrescriptions: PostopPrescription[] =
  basePostopPrescriptions.map((prescription) => ({
    ...prescription,
    sources:
      prescription.origin === '現有 Notion'
        ? [
            ...prescription.sources,
            { label: 'Notion：術後索引', url: NOTION_POSTOP_ROOT },
          ]
        : prescription.sources,
  }))
