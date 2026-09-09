import 'server-only'

import type { PostopPlanPhase } from './opd-plan-phase-types'

/**
 * Phase structure checked against the original private OPD pages on 2026-09-09.
 * All seven fetched pages report native verification.state = unverified; their
 * complete returned content was read (no truncation/unknown-block warning).
 * This records provenance, not independent clinical validation or a UI badge.
 *
 * Oral: https://app.notion.com/p/2e7451a33b66809f810fff7b81e9d0df
 *   Last edited 2026-01-13; weeks 1–4, 4–8, 8–12.
 * Neck: https://app.notion.com/p/2e7451a33b6680e7879af3ad133a8163
 *   Last edited 2026-01-13; weeks 1–4, 4–8, 8–12.
 * Breast: https://app.notion.com/p/2e7451a33b66801dab79d12d76a71fb9
 *   Last edited 2026-03-15; weeks 1–2, 2–6, 6–12.
 * Esophageal: https://app.notion.com/p/2e7451a33b668019a312ebf8c076d130
 *   Last edited 2026-03-15; pre-op, days 1–7, weeks 2–6, months 2–6.
 * Lung: https://app.notion.com/p/2e7451a33b66806b89dbd3b3d4f331af
 *   Last edited 2026-03-27; pre-op, days 1–7, weeks 2–6, months 2–3.
 * AMI: https://app.notion.com/p/2e7451a33b668075904fc353333d16bf
 *   Last edited 2026-03-15; days 1–7, weeks 2–6, 6–12.
 * CABG: https://app.notion.com/p/2e7451a33b66802e87b4d540ccbb4fbe
 *   Last edited 2026-03-15; days 1–7, weeks 2–6, 6–12, months 3+.
 *
 * Reconciliation with the currently published lib/opd-prescriptions.ts:
 * - Keep its day/week-zero early phases, only after team clearance.
 * - Do not restore routine hourly incentive spirometry, fixed SpO2 targets,
 *   blanket ipsilateral BP/needle bans, or fixed CABG shoulder/lifting limits.
 * - Swallowing maneuvers, jaw devices, MLD and diet progression remain assessed
 *   individually rather than automatically prescribed from the original notes.
 * - Breast ROM/lifting follows the published surgeon/reconstruction-specific
 *   prescription, without restoring fixed limits from the original notes.
 * - Head/neck integrated and VATS phases only reorganize their published plans;
 *   no additional calendar dates or exercise doses have been introduced.
 *   Their existing external references remain in lib/opd-prescriptions.ts.
 *
 * The integration layer adds the procedure title, phase label, shared safety
 * and follow-up fields to each copy-ready plan. Bodies below are phase-specific.
 */
export const nonOrthopedicPlanPhases: Record<string, PostopPlanPhase[]> = {
  'oral-cancer-postop': [
    {
      id: 'weeks-0-4',
      label: '術後第 0–4 週｜皮瓣保護與口腔初期活動',
      plan: `本期運動：依外科團隊放行進行良好擺位、坐起、站立與步行；可開始時做輕柔 tongue／lip AROM。
吞嚥與溝通：轉介 SLP 進行吞嚥篩檢、溝通評估及擺位衛教；NPO／飲食質地依外科與 SLP 指示。
本期注意事項：優先監測皮瓣、傷口、氣道與分泌物；活動不得牽扯切口或重建部位，donor-site 活動／負重依重建團隊限制。吞嚥安全未確認前不自行試吃。
進階條件：依手術部位癒合、皮瓣穩定及後續放療安排調整，經團隊同意再進展口顎與軟組織治療。`,
    },
    {
      id: 'weeks-4-8',
      label: '術後第 4–8 週｜疤痕活動與個別吞嚥訓練',
      plan: `本期運動：傷口穩定且外科放行後進行 scar／soft tissue mobility；持續已放行的 tongue／lip AROM 與日常活動。
吞嚥訓練：由 SLP 依個別檢查選擇吞嚥手法及飲食質地進階；吞嚥手法（如 Mendelsohn maneuver）僅在評估適用且完成指導後使用。
本期注意事項：避免對未癒合傷口、皮瓣或放療受損組織強力牽拉；仍依吞嚥安全結果決定進食，不因達到本期週數自動解除 NPO。
進階條件：傷口及皮瓣穩定，依口顎活動、吞嚥與構音評估安排下一期。`,
    },
    {
      id: 'weeks-8-12-plus',
      label: '術後第 8–12 週以上｜張口、構音與吞嚥功能',
      plan: `本期運動：持續 jaw ROM／trismus prevention、tongue mobility、articulation drills／speech resonance 與個別化吞嚥功能訓練。
張口訓練：依切除、重建與放療狀況調整伸展；TheraBite 或壓舌板等被動張口器材僅在團隊評估適用並指導後使用。
整合評估：追蹤頸肩活動、頭頸淋巴水腫與放療相關緊繃；依需求轉介 SLP、牙科、營養或淋巴水腫治療。
本期注意事項：伸展不得以持續加劇疼痛或傷口牽扯換取角度；飲食與吞嚥訓練仍依個別評估，持續監測皮瓣與放療影響。`,
    },
  ],
  'neck-cancer-postop': [
    {
      id: 'weeks-0-4',
      label: '術後第 0–4 週｜頸肩保護與姿勢活動',
      plan: `本期運動：依傷口、皮瓣與引流管狀況進行 gentle cervical AROM、scapular setting、姿勢與擺位練習。
腫脹照護：以合適擺位配合團隊照護，追蹤頭頸腫脹；監測肩下垂、scapular winging 與神經症狀。
本期注意事項：避免過度伸展、牽扯切口或皮瓣；依重建限制調整頸部方向與活動範圍。明顯肩無力需評估 CN XI 功能。
進階條件：傷口與引流狀況穩定且團隊同意後，再進展肩部 AAROM／AROM 與軟組織治療。`,
    },
    {
      id: 'weeks-4-8',
      label: '術後第 4–8 週｜肩部活動與軟組織恢復',
      plan: `本期運動：傷口穩定且團隊同意後進展 shoulder AAROM／AROM，持續 gentle cervical AROM、scapular setting 與姿勢訓練。
軟組織：在已癒合範圍進行 scar／soft tissue mobility；由受訓專業人員評估是否需要 manual lymphatic drainage／lymphedema therapy。
本期注意事項：淋巴水腫治療前須排除感染、血栓及其他禁忌；避免過度牽拉切口或皮瓣，追蹤肩下垂、winging 與副神經相關無力。
進階條件：依傷口、疼痛、頸肩控制與放療反應漸進，不以週數單獨決定負荷。`,
    },
    {
      id: 'weeks-8-12-plus',
      label: '術後第 8–12 週以上｜肩胛肌力與生活功能',
      plan: `本期運動：漸進 scapular stabilizer、upper trapezius、rotator cuff 與 upper-quarter endurance；持續頸肩活動、姿勢與呼吸練習。
功能訓練：依 neck-dissection shoulder syndrome、放療後頸部緊繃，以及日常活動／工作需求調整動作與負荷。
本期注意事項：伸展與阻力依疼痛、皮膚及組織耐受度進展，避免強拉放療或手術部位；持續監測副神經功能與明顯淋巴水腫。
轉介：依功能缺損安排 PT／OT；有吞嚥、聲音或淋巴水腫問題時安排 SLP／受訓淋巴水腫治療師。`,
    },
  ],
  'breast-cancer-postop': [
    {
      id: 'weeks-0-2',
      label: '術後第 0–2 週｜引流保護與初期肩臂活動',
      plan: `本期運動：elbow／wrist／hand AROM、soft-ball squeeze、呼吸練習、步行及輕柔 shoulder AAROM；維持直立舒適姿勢。
ROM／提重：肩部活動範圍、提重與重複高舉依外科／整形外科、重建方式與引流管醫囑；不以固定角度或重量取代個別限制。
本期注意事項：避免牽扯引流管與傷口，觀察腫脹、沉重感及緊繃。血壓、抽血與注射依院內風險評估及可行性個別決定。
進階條件：傷口與引流狀況允許且團隊同意後，才漸進肩部角度與功能。`,
    },
    {
      id: 'weeks-2-6',
      label: '術後第 2–6 週｜肩活動、疤痕與功能恢復',
      plan: `本期運動：傷口及引流限制允許後漸進完整 shoulder AROM；wall slide／wall climbing、pendulum、scapular retraction／stabilization 與輕有氧步行。
軟組織：傷口癒合後進行 gentle scar mobility；評估 axillary web syndrome（cording）、疼痛與腫脹，必要時安排個別軟組織治療。
淋巴水腫照護：衛教皮膚照護及早期腫脹症狀；持續腫脹、沉重或緊繃時轉介受訓專業人員，壓力袖套由評估後決定。
本期注意事項：肩 ROM 與提重仍須符合重建、組織擴張器及傷口醫囑；未解除的早期限制繼續遵守。`,
    },
    {
      id: 'weeks-6-12-plus',
      label: '術後第 6–12 週以上｜漸進肌力與體能',
      plan: `本期運動：從低負荷、高次數開始 progressive resistance，逐步增加 shoulder girdle／core、日常功能及有氧訓練；高舉活動依重建限制與耐受度漸進。
放療期間：持續胸肩伸展與姿勢活動，依皮膚、胸壁及腋下緊繃反應調整。
監測：追蹤患肢腫脹／圍度（有需要時）、疼痛與肩功能，評估晚發性淋巴水腫或肩部症狀。
本期注意事項：阻力與提重不得只按週數自動增加；若腫脹、沉重、緊繃持續或加劇，調整負荷並安排淋巴水腫評估。`,
    },
  ],
  'esophageal-cancer-postop': [
    {
      id: 'prehabilitation',
      label: '術前｜心肺預復健與營養準備',
      plan: `本期運動：時間與病況允許時，aerobic（walking／cycling）約 30 分鐘、每週 3–5 日，配合低至中強度全身 resistance。
呼吸訓練：練習 deep breathing、有效 huff／cough；高風險者評估 inspiratory muscle training，阻力及劑量由團隊個別設定。
整合照護：戒菸衛教與營養評估，配合肌少、體重下降及後續手術安排調整訓練。
本期注意事項：依既有心肺疾病、疲倦、吞嚥及營養狀況調整；誘發性肺量計不等同阻力型吸氣肌訓練。`,
    },
    {
      id: 'days-0-7',
      label: '術後第 0–7 天｜早期離床與呼吸照護',
      plan: `本期運動：生命徵象及疼痛控制穩定後，依團隊許可在 24 小時內開始坐起、站立及步行；活動中監測症狀、HR 與 SpO₂／氧氣設定。
呼吸照護：deep breathing／thoracic expansion、supported huff／cough；誘發性肺量計僅依院內路徑或個別適應症使用。
ROM／擺位：在切口與吻合口限制內進行 shoulder／neck AAROM／ROM；抬高床頭及進食姿勢依外科、吞嚥與營養團隊指示。
本期注意事項：確認止痛、傷口、引流管與氧療安全；吞嚥、飲食／管灌及活動界線依外科醫囑，留意吸入、呼吸、感染與心律問題。`,
    },
    {
      id: 'weeks-2-6',
      label: '術後第 2–6 週｜分段步行與返家活動',
      plan: `本期運動：以分段步行逐步增加時間，疲倦明顯時採 interval activity；配合姿勢、肩帶與日常活動訓練。
活動安排：pacing／energy conservation，將運動與休息分段，依疲倦和呼吸反應調整。
營養配合：飲食、管灌及餐後姿勢依外科與營養團隊；活動安排配合早飽、餐後不適及個別進食計畫。
本期注意事項：持續留意吞嚥／吸入、體重與營養變化、傷口及心肺症狀；不因進入返家期自動解除外科限制。`,
    },
    {
      id: 'months-2-6',
      label: '術後第 2–6 個月｜體能與生活工作恢復',
      plan: `本期運動：漸進 aerobic、全身 resistance 與 flexibility，配合軀幹、肩帶活動及生活／工作需求訓練。
軟組織：傷口癒合且團隊允許後，再依胸腹疤痕與軀幹旋轉限制安排溫和活動及伸展。
監測：持續追蹤放化療相關副作用、營養、體重及運動耐受度；吞嚥惡化或進食受限時回報外科與營養團隊。
本期注意事項：依體能與治療進程調整負荷；呼吸、吻合口或其他外科疑慮應先評估，再繼續運動進階。`,
    },
  ],
  'lung-cancer-postop': [
    {
      id: 'prehabilitation',
      label: '術前｜肺部預復健與呼吸練習',
      plan: `本期運動：依病況安排 aerobic（walking／cycling）及 resistance；高風險者評估 inspiratory muscle training，器材、阻力與劑量個別設定。
呼吸練習：diaphragmatic breathing／thoracic expansion、huff cough 與分泌物清除衛教。
整合照護：配合戒菸與營養評估，記錄運動耐受及呼吸症狀。
本期注意事項：訓練依術前體能、心肺共病與手術安排調整；不將單一 IMT 劑量或血氧目標套用於所有個案。`,
    },
    {
      id: 'days-0-7',
      label: '術後第 0–7 天｜早期活動與呼吸排痰',
      plan: `本期運動：生命徵象穩定後，依團隊許可在 24 小時內離床；upright positioning、坐起、站立及分段步行。
呼吸照護：deep breathing／thoracic expansion、supported huff／cough；誘發性肺量計不列為常規必做，僅依院內路徑或個別適應症使用。
ROM：在不牽扯切口或胸管的範圍進行患側 shoulder AAROM 及 trunk mobility。
本期注意事項：確認止痛、胸管、氧療與漏氣相關限制；活動中監測呼吸、HR、SpO₂ 及症狀，血氧目標依胸腔團隊個別設定。`,
    },
    {
      id: 'weeks-2-6',
      label: '術後第 2–6 週｜步行耐力與胸肩活動',
      plan: `本期運動：由約 15–20 分鐘的分段步行起，依呼吸、疲倦及疼痛反應漸進距離與時間。
胸肩活動：chest-wall expansion、side-bending、posture correction 與 shoulder ROM，減少保護性駝背或聳肩。
傷口照護：傷口完全癒合後，依團隊許可進行 gentle scar mobility。
本期注意事項：氧療、胸管及提重界線仍依胸腔團隊；若症狀或運動耐受惡化，先評估原因再增加負荷。`,
    },
    {
      id: 'months-2-3-plus',
      label: '術後第 2–3 個月以上｜全身肌力與耐力',
      plan: `本期運動：漸進 aerobic interval 與全身 resistance（輕重量／彈力帶），依耐受度恢復 ADL、工作及輕休閒活動。
進階方式：依呼吸症狀、疲倦與功能表現調整強度；活動時易喘者先採分段訓練。
監測：追蹤呼吸症狀、運動耐受、後續放化療反應與生活功能；需要時轉介 pulmonary rehabilitation。
本期注意事項：新發呼吸症狀或耐受度下降不可單以體能不足解釋，應先與胸腔／癌症團隊評估。`,
    },
  ],
  'ami-rehabilitation': [
    {
      id: 'days-1-7',
      label: '事件後第 1–7 天｜住院早期活動',
      plan: `本期運動：血流動力學穩定 24 小時且醫療團隊放行後進行坐起、站立與床邊／短距離步行；實際啟動由心臟團隊依病況決定。
強度：常由 RPE <11 或較 resting HR 增加 <20 bpm 起步，依風險與藥物反應個別化。
監測：依照護場域及風險監測症狀、ECG／HR／BP／SpO₂；留意缺血、心律與心衰竭表現。
本期注意事項：依 PCI 穿刺部位或合併手術要求保護傷口；衛教心絞痛、呼吸困難等警訊，出現不穩定症狀時停止活動並處理。`,
    },
    {
      id: 'weeks-2-6',
      label: '事件後第 2–6 週｜門診心臟復健',
      plan: `本期運動：在正式心臟復健安排下進行 walking／stationary cycle 15–30 分鐘、每週 3–5 日；耐受不足時採 interval training。
強度：常由 HRR 40–60% 或 RPE 11–13 起步，依風險、藥物與運動反應調整。
肌力：低負荷、節律性全身 resistance；避免重負荷、憋氣與 Valsalva。
本期注意事項：依風險安排監督及 ECG 監測，評估運動誘發缺血、心律不整和血壓反應；持續藥物遵從、症狀辨識及生活型態衛教。`,
    },
    {
      id: 'weeks-6-12-plus',
      label: '事件後第 6–12 週以上｜耐力與危險因子管理',
      plan: `本期運動：依運動測試與風險分層漸進至 aerobic 30–60 分鐘；需要且適合時進展至 HRR 60–80%。
肌力與恢復：漸進全身 resistance、flexibility 與 cool-down，依心肺及肌肉骨骼耐受度調整。
衛教：藥物遵從、戒菸、睡眠、壓力、營養、血壓與血脂管理；工作／性生活回歸依個別心臟評估。
本期注意事項：負荷進展以運動測試、缺血、心律、心衰竭及血壓反應為準，不能只按時間或目標心率提高強度。`,
    },
  ],
  'cabg-rehabilitation': [
    {
      id: 'days-0-7',
      label: '術後第 0–7 天｜呼吸與胸骨保護活動',
      plan: `本期運動：醫療穩定後早期坐起、站立與受監督步行；逐步增加短距離活動。
呼吸照護：deep breathing、以胸枕或合適方式支撐的 supported cough；誘發性肺量計依院內路徑使用。
胸骨保護：採 move-in-the-tube，日常動作讓上臂靠近軀幹，避免疼痛性用力拉推；活動與轉位依胸骨穩定及外科指示。
本期注意事項：監測 AF／其他心律異常、胸骨不穩及傷口；出現 clicking 或胸骨疼痛時停止相關動作並評估。`,
    },
    {
      id: 'weeks-2-6',
      label: '術後第 2–6 週｜門診有氧與日常功能',
      plan: `本期運動：walking／stationary cycle 約 20–30 分鐘，常以 RPE 11–13 或較 resting HR 增加 <20 bpm 起步，依心臟復健團隊個別化。
ROM／功能：在疼痛可接受範圍進行 gentle shoulder／neck／thoracic AROM、gait 與 ADL；轉位和上肢動作持續採 move-in-the-tube。
本期注意事項：避免過度胸部牽拉及疼痛性重拉推；上肢負荷、提重與轉位方式依胸骨穩定和外科醫囑。
監測：胸骨、胸部與 graft donor-site 傷口、取 graft 肢體腫脹、心律及運動症狀。`,
    },
    {
      id: 'weeks-6-12',
      label: '術後第 6–12 週｜胸骨癒合後肌力進階',
      plan: `本期運動：胸骨穩定且外科放行後，由低負荷開始漸進上肢與全身 resistance 及提重。
有氧：依術後運動測試與風險分層增加 aerobic 時間和強度，配合功能與工作需求。
本期注意事項：避免引起胸骨 clicking 或疼痛的動作；不以固定重量、肩部角度或單一週數取代個別胸骨限制。
衛教：持續 move-in-the-tube、傷口照護、藥物遵從、症狀辨識與心血管危險因子管理。`,
    },
    {
      id: 'months-3-plus',
      label: '術後第 3 個月以上｜居家與社區維持',
      plan: `本期運動：在胸骨穩定與醫療團隊放行後，轉銜居家／社區 aerobic 與漸進 resistance，依個別體能和功能持續訓練。
生活回歸：休閒運動、工作與提重按心臟功能、胸骨穩定及醫囑漸進，持續追蹤活動後反應。
長期照護：藥物遵從、飲食、戒菸、壓力及心血管危險因子管理。
本期注意事項：胸骨疼痛／clicking、傷口異常或新發心肺症狀需停止相關活動並評估；未解除的外科限制繼續遵守。`,
    },
  ],
  'head-neck-cancer-integrated': [
    {
      id: 'acute-protection',
      label: '急性期｜氣道、皮瓣與早期活動',
      plan: `本期運動：生命徵象、氣道、傷口與皮瓣穩定後，依外科團隊放行早期坐起、站立及步行；配合疼痛、譫妄、VTE 與壓瘡預防。
吞嚥／溝通：NPO／diet texture 由外科與 SLP 決定；轉介 SLP 評估吞嚥、構音、語音及替代溝通需求。
本期注意事項：所有牽涉 flap pedicle、頸部、donor site 與 weight bearing 的活動遵守重建限制；不壓迫 pedicle，吞嚥安全未確認前不自行試吃。
進階條件：以外科對氣道、皮瓣及傷口穩定的評估決定活動進展，沒有固定通用週數。`,
    },
    {
      id: 'wound-stable-mobility',
      label: '傷口穩定期｜頸肩與口顎活動',
      plan: `本期運動：傷口允許後，由 gentle cervical ROM、scapular setting、shoulder AAROM／AROM 漸進；依切除與重建範圍進行 tongue／lip／jaw ROM。
張口訓練：有 trismus 風險者建立規律張口練習，強度及器材由團隊評估。
功能評估：記錄肩下垂、scapular winging、疼痛與 CN XI 相關無力；持續個別化吞嚥及溝通訓練。
本期注意事項：頸肩、口顎及 donor-site 活動仍須符合皮瓣／切口限制，不壓迫 pedicle；未確認吞嚥安全前維持既定飲食限制。`,
    },
    {
      id: 'functional-recovery',
      label: '功能恢復期｜肩胛耐力與長期整合照護',
      plan: `本期運動：依傷口、疼痛與動作控制逐步加入 scapular stabilizer 及 rotator cuff endurance；持續已放行的頸肩、tongue／lip／jaw ROM 和張口練習。
吞嚥／溝通：依 SLP 評估持續吞嚥、構音及溝通訓練，飲食質地與進階由外科／SLP 決定。
淋巴水腫／疤痕：傷口穩定後評估 head-and-neck lymphedema、fibrosis 與 scar，有適應症時轉介受訓治療師。
本期注意事項：依重建範圍及後續治療調整，不以單一時程解除皮瓣或 donor-site 限制；整合 PT／OT／SLP、營養及牙科追蹤。`,
    },
  ],
  'vats-lung-resection-integrated': [
    {
      id: 'days-0-1',
      label: '術後第 0–1 天｜首次離床與呼吸照護',
      plan: `本期運動：生命徵象與疼痛控制穩定後，依胸腔團隊許可在 24 小時內坐起、站立並開始短距離步行。
監測：每次活動前後記錄症狀、HR、BP、SpO₂／oxygen setting，確認胸管及跌倒安全。
呼吸照護：upright positioning、deep breathing／thoracic expansion、supported huff／cough；分泌物、肺容積下降或高風險者由治療師個別處置。
本期注意事項：確保適當止痛並遵守胸管、氧療與傷口限制；誘發性肺量計僅依院內路徑或個別適應症使用。`,
    },
    {
      id: 'inpatient-recovery',
      label: '住院恢復期｜頻繁步行與肩胸廓活動',
      plan: `本期運動：短而頻繁地步行，逐步增加距離與 ADL，配合 adequate analgesia、胸管及跌倒安全。
肩／軀幹：每日練習患側 shoulder flexion／abduction AAROM-to-AROM、scapular movement、胸椎伸展與側彎。
呼吸照護：持續 upright positioning、深呼吸／thoracic expansion、supported huff／cough；依分泌物、肺容積及風險調整。
本期注意事項：活動不得牽扯傷口／胸管，疼痛須可接受；活動前後監測症狀、HR、BP、SpO₂／氧氣設定。誘發性肺量計不列為所有人的常規必做。`,
    },
    {
      id: 'discharge-weeks-1-6',
      label: '出院後約第 1–6 週｜步行與全身功能',
      plan: `本期運動：分段步行逐日漸進，以 talk test／RPE 約 3–4/10 控制中等強度；症狀穩定後加入 sit-to-stand、heel raise 與輕阻力全身訓練。
肩胸廓：持續患側 shoulder AAROM-to-AROM、scapular movement、胸椎伸展與側彎，在不牽扯傷口且疼痛可接受下練習。
本期注意事項：提重、開車、泡水、工作與飛行依外科傷口／胸管指示；依呼吸、疲倦、疼痛及活動後恢復反應調整負荷。
進階條件：症狀穩定且功能、體能允許後再增加有氧及阻力，持續必要的胸腔團隊追蹤。`,
    },
    {
      id: 'weeks-6-plus',
      label: '術後第 6 週以上｜有氧肌力與肺復健',
      plan: `本期運動：依呼吸症狀、體能與後續癌症治療，漸進 aerobic + resistance，恢復日常及工作功能。
轉介：功能未恢復或屬高風險者，安排 pulmonary rehabilitation 評估。
本期注意事項：持續以活動耐受及恢復反應調整，不因達到第 6 週自動解除傷口、胸管或生活活動限制；提重、開車、工作及飛行仍依外科指示。`,
    },
  ],
}
