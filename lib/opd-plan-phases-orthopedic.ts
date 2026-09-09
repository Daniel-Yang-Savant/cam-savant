import 'server-only'
import type { PostopPlanPhase } from './opd-plan-phase-types'

// Restructured from the owner's Notion OPD / 術後 pages, fetched 2026-09-09.
// Source IDs correspond to the sources retained in opd-prescriptions.ts:
// ACL 2e7451a33b66808490a8d2bddcef8498; ACL + meniscus 2e7451a33b6680da82b0d26de3168923
// PCL 324451a33b66803aa5f1ea779d02b80d; cuff + SLAP 2e7451a33b6680f092aec9a8e501d353
// TKR 2e7451a33b66804f9249e01cc97f8cd8; THR 2e7451a33b6680fc9f46d066bd12fba6
// Keep the source phase boundaries. Do not turn a calendar milestone into
// automatic clearance or omit graft/repair/approach-specific restrictions.
// ACL progression cross-check: Aspetar CPG (2023), accessed 2026-09-09:
// https://www.aspetar.com/en/professionals/aspetar-clinical-guidelines/recommendations-on-rehabilitation-after-aclr
export const orthopedicPlanPhases: Record<string, PostopPlanPhase[]> = {
  'acl-reconstruction': [
    {
      id: 'week-1',
      label: '第 1 週｜保護與肌肉啟動',
      plan: `負重／護具：依手術醫囑 WBAT，使用雙拐及鎖伸直護具，練習平地步態。
ROM：優先恢復完全伸直；屈曲逐步朝 0–90°，配合 patellar mobilization。
運動：ankle pump、quadriceps／gluteal isometric set；hamstring isometric 依 graft 及醫囑。需要時使用 NMES；SLR 配合護具，須無 extension lag。
注意事項：依疼痛、積水、傷口與股四頭肌控制調整；合併半月板、軟骨或其他韌帶處置時套用較嚴格限制。`,
    },
    {
      id: 'weeks-2-4',
      label: '第 2–4 週｜步態與早期肌力',
      plan: `負重／護具：依股四頭肌控制及步態由雙拐減至單拐，再至無輔具；原流程約第 4 週評估 FWB，護具逐步解鎖。
ROM：屈曲由約 90°漸進至 120°；持續 patellar mobilization，傷口癒合後才做 scar mobility；低阻力 stationary bike 作 ROM。
運動：依負重許可與耐受加入 mini-squat 0–30°、leg press 0–60°及 calf raise；依控制練習有護具的 single-leg stance、balance board 及前後向步行。
注意事項：不跑、不跳、不做超過 60°的深蹲；OKC knee extension 依原流程第 4 週後才開始。Hamstring graft 的額外負重須依手術醫囑。`,
    },
    {
      id: 'weeks-4-8',
      label: '第 4–8 週｜移植物保護與漸進肌力',
      plan: `負重／步態：步態正常且股四頭肌控制足夠後減少拐杖，依醫囑 FWB。
ROM：朝完整 AROM 前進，持續強調 terminal knee extension。
運動：CKC squat／leg press 維持 0–60°，逐步增加 resistance；lunge、calf raise、低衝擊腳踏車及平衡訓練。
OKC：第 4 週後經許可由 knee extension 90–45°保護角度開始；依前膝疼痛與積水反應調整。
注意事項：Hamstring graft 依醫囑暫緩額外 hamstring 負重；未達功能條件前不自行跑跳或 pivot。`,
    },
    {
      id: 'weeks-8-12',
      label: '第 8–12 週｜中期肌力與平衡',
      plan: `護具：原流程於第 8–12 週依穩定度、步態與醫囑漸退。
運動：漸進 CKC resistance 與 core stability；hamstring strengthening 需符合 graft-specific 限制並經放行。
平衡：進展多方向 balance board、single-leg stance，原訓練目標為能控制站立超過 60 秒。
體能：stationary cycling 漸加阻力及 treadmill walking。
注意事項：追蹤疼痛、積水、完整伸直與動作品質；月份與護具停用不等於跑跳放行。`,
    },
    {
      id: 'month-3',
      label: '第 3 個月｜進階肌力',
      plan: `運動：持續 CKC strengthening、core stability 與單腳控制，改善雙側肌肉量與力量差異。
體能：傷口已癒合且經團隊同意後可依原流程安排游泳（避免蛙式）及戶外腳踏車；需兼顧上下車與跌倒風險。
評估／進階：single-leg squat 至 60°時控制良好，運動後無關節積水；追蹤肌力與動作品質。
注意事項：依此原流程暫不安排 running、jumping 或 pivot；跑步進階仍須通過個別功能評估與醫療團隊許可。`,
    },
    {
      id: 'months-4-6',
      label: '第 4–6 個月｜跑步與動態訓練',
      plan: `進階前確認：完整 ROM、無明顯疼痛／積水、肌力與單腳控制達團隊要求。
運動：經放行後由 light straight-line jogging 漸進；依動作品質安排 agility drill 與 plyometric，分階段增加負荷。
評估：追蹤 strength／hop tests 的 limb symmetry，原流程目標 >90%，並整合絕對肌力、落地控制與運動需求。
注意事項：單一 LSI 或術後月份不能單獨決定回場；急停轉向、接觸及高需求運動須另經團隊確認。
後續：持續 supervised 或 home-based rehabilitation 至約術後 9–12 個月，依功能與運動需求調整。`,
    },
  ],
  'acl-meniscus-repair': [
    {
      id: 'weeks-0-4',
      label: '第 0–4 週｜半月板保護',
      plan: `負重／護具：依 repair-specific 醫囑 toe-touch WB、雙拐及鎖伸直護具。
ROM：屈曲限制於 0–90°，以手術醫師對修補位置的限制為準。
運動：quad set、ankle pump、鎖伸直護具下 SLR。
注意事項：不做負重屈膝、深蹲或扭轉；posterior horn 修補者依醫囑避免 active hamstring。Root／radial／複雜撕裂不可直接套用此進程。`,
    },
    {
      id: 'weeks-4-8',
      label: '第 4–8 週｜負重轉換',
      plan: `負重：經許可由 PWB 漸進 FWB，原流程約第 6–8 週依無痛步態減少拐杖。
ROM：第 4 週後才依醫囑逐步超過 90°，約第 8 週朝完整 ROM；不強行追趕角度。
運動：達 FWB 且無痛後才開始 mini-squat 0–45°與 CKC；持續股四頭肌控制及步態訓練。
注意事項：避免超過 60°的深蹲、pivot／twist；如關節線疼痛或積水增加，調降負荷並重新評估。`,
    },
    {
      id: 'months-2-3',
      label: '第 2–3 個月｜肌力與本體感覺',
      plan: `護具：股四頭肌控制足夠、步態正常且經醫囑許可後漸退日常護具。
運動：CKC squat／leg press 維持 0–60°，加入 proprioception、balance drill；ROM 足夠後可用低阻力 stationary bike。
注意事項：避免反覆衝擊、跳躍、深屈膝末端負荷及 pivot；半月板與 graft 限制持續依原手術紀錄。`,
    },
    {
      id: 'months-4-6',
      label: '第 4–6 個月起｜動態訓練與回場評估',
      plan: `運動：依功能漸進 dynamic strengthening、lunge pattern 與 functional agility。
跑步：直線慢跑依修補條件及團隊放行，原流程可能延後至第 5–6 個月。
進階條件：無關節線壓痛或積水，肌力及動作控制符合要求後才增加負荷。
注意事項：回場常需至術後 9–12 個月並通過功能測試；不可僅依月份放行深蹲、跳躍或轉向運動。`,
    },
  ],
  'pcl-reconstruction': [
    {
      id: 'weeks-0-6',
      label: '第 0–6 週｜後十字韌帶保護',
      plan: `負重／護具：依醫囑 NWB 至 PWB，護具鎖伸直約 6–8 週或依個別限制。
ROM：支撐脛骨的 passive ROM，採 prone passive flexion 或 supine bolster-supported flexion；約第 4–6 週朝 90°。
運動：quad set、patellar mobilization、護具鎖伸直下 SLR。
注意事項：避免 posterior tibial translation／sag；不做 active hamstring，原流程依個案延後 6–24 週，須由手術醫師決定。
進階條件：傷口癒合、疼痛與積水受控，ROM 約達 90°。`,
    },
    {
      id: 'weeks-6-12',
      label: '第 6–12 週｜負重與活動度',
      plan: `負重／護具：依醫囑漸進 FWB；臨床穩定且積水輕微時評估漸退護具。
ROM：持續保護脛骨位置，約第 12 週朝屈曲 120°。
運動：quad-dominant CKC、mini-squat 0–45°與步態訓練。
注意事項：避免 isolated resisted hamstring curl，不能因進入此階段即解除 posterior-shear 限制。
進階條件：ROM 約達 120°、步態正常、膝關節穩定。`,
    },
    {
      id: 'months-3-6',
      label: '第 3–6 個月｜功能肌力與耐力',
      plan: `運動：漸進 CKC squat／leg press；co-contraction 需符合 hamstring 解禁醫囑。
神經肌肉：proprioception、balance 及 motor-control drills。
評估：追蹤肌力 LSI（原流程目標 ≥90%）、功能動作品質及負重時疼痛。
注意事項：依後向穩定度、積水與疼痛調整；hamstring、跑步或衝擊訓練須個別放行。`,
    },
    {
      id: 'months-6-12',
      label: '第 6–12 個月｜跑跳與回場',
      plan: `運動：經醫療團隊放行後進展 plyometric、agility 與運動專項訓練。
回場評估：完整 ROM、無積水，strength／single-leg hop LSI >90%，並整合 IKDC、Lysholm、膝穩定度與運動需求。
注意事項：原流程多於約第 9–12 個月評估回場；月份或單一對稱性指標不是自動放行條件。`,
    },
  ],
  'rotator-cuff-slap': [
    {
      id: 'weeks-0-6',
      label: '第 0–6 週｜修補保護',
      plan: `護具：abduction sling 約 6 週，配戴及移除時機依手術醫囑。
ROM：shoulder PROM only，初期 ER 約 0–30°、elevation 約 90°，依 tear size、修補張力與術式調整。
運動：pendulum、wrist／hand AROM、scapular setting／retraction。
注意事項：SLAP 修補避免主動 elbow flexion、forearm supination 及 biceps anchor 牽拉；不可主動提肩或提重。`,
    },
    {
      id: 'weeks-6-10',
      label: '第 6–10 週｜輔助至主動活動',
      plan: `護具：依外科醫囑漸退 sling。
ROM／運動：wand／pulley AAROM 漸進 AROM，依修補限制朝完整 PROM；可於許可後做中立位 submaximal deltoid／rotator-cuff isometric。
注意事項：避免快速 overhead motion、提重、重拉重提；仍不做 resisted biceps。優先恢復無代償的動作品質。`,
    },
    {
      id: 'weeks-10-16',
      label: '第 10–16 週｜早期阻力訓練',
      plan: `運動：由輕阻力 Theraband ER／IR 與 scapular stabilizer 開始，練習各平面 AROM、eccentric control。
活動度：依修補範圍與團隊指示安排伸展，避免強拉修補組織。
SLAP：light resisted biceps 與 overhead reaching 須經醫囑放行後漸進。
注意事項：僅逐步恢復輕量日常活動，避免 heavy lifting 或 sudden jerking；疼痛或代償增加時退階。`,
    },
    {
      id: 'months-4-6',
      label: '第 4–6 個月起｜進階肌力與工作運動',
      plan: `運動：漸進 dumbbell resistance、PNF pattern、肩胛與 rotator-cuff endurance。
功能：依疼痛、功能 ROM、肌力與控制結果，在團隊許可下開始 light toss／catch、輕量 plyometric 及工作／運動專項。
注意事項：重複高負荷 overhead 活動通常至少延至第 6 個月且須外科放行；持續監測疼痛與動態穩定。`,
    },
  ],
  'total-knee-replacement': [
    {
      id: 'week-1',
      label: '第 1 週｜腫脹控制與早期活動',
      plan: `負重／步態：依醫囑 WBAT，walker／crutches 協助安全步行。
ROM：伸直優先，active-assisted flexion 逐步朝約 0–90°。
運動：ankle pump、quad／gluteal set、heel slide、seated knee flexion／extension；SLR 依肌肉控制。
注意事項：冰敷、抬高及傷口照護；疼痛、腫脹及步態決定當日負荷，避免強行追求角度。`,
    },
    {
      id: 'weeks-2-4',
      label: '第 2–4 週｜活動度與功能步態',
      plan: `步態：平衡及步態改善後由 walker 漸轉 cane 或無輔具。
ROM：依個別狀況朝約 0–110°以上；stationary bike 從半圈逐步至全圈。
運動：SLR、sit-to-stand、mini-squat 0–45°、扶欄 step-up。
注意事項：持續 patellar mobilization；scar／soft tissue mobility 需傷口癒合後才進行。依疼痛積水反應調整。`,
    },
    {
      id: 'weeks-4-8',
      label: '第 4–8 週｜肌力與耐力',
      plan: `運動：resisted CKC leg press、wall slide、sit-to-stand，逐步增加阻力。
平衡：single-leg stance、tandem gait 及 reaching tasks，依跌倒風險提供支撐。
體能：漸加 stationary bike 阻力，依耐受安排 treadmill／平地步行。
進階條件：步態更對稱，能以較少協助上下樓梯。
注意事項：持續監測腫脹、伸直及功能；負荷後症狀增加時退階。`,
    },
    {
      id: 'month-3',
      label: '第 3 個月｜社區與進階功能',
      plan: `運動：依能力安排 lunge、side-step、高一階阻力帶及功能 CKC。
活動：逐步增加社區步行、日常活動及樓梯耐受；HEP 維持 quad／hip strength。
ROM／目標：可朝約 0–120°功能 ROM 與獨立行動進展，須考慮術前基線。
注意事項：依疼痛、腫脹與平衡調整距離和負荷，運動選擇以醫囑及低衝擊活動為主。`,
    },
    {
      id: 'months-4-6',
      label: '第 4–6 個月起｜長期維持',
      plan: `運動：持續 quad／hip strengthening、balance 及 home exercise program。
活動：依許可選擇 walking、cycling、傷口完全癒合後的 swimming 等低衝擊運動。
衛教／注意事項：避免未經醫囑的跑跳或高衝擊負荷；追蹤晚發疼痛、不穩及功能退步，維持關節保護與體重管理。`,
    },
  ],
  'total-hip-replacement': [
    {
      id: 'week-1',
      label: '第 1 週｜入路保護與移位',
      plan: `入路／限制：確認 anterior／posterior approach 及手術醫師的個別 hip precautions。
負重：依醫囑 WBAT，walker／crutches。
運動：ankle pump、quad／gluteal set、限制角度內 supine heel slide。
功能：練習 bed／chair／toilet transfer、安全步態與擺位；外展枕依醫囑。
注意事項：posterior 入路常需避免過度 flexion／adduction／IR；anterior 入路常需避免過度 extension／ER，確切組合和期限依個別醫囑。`,
    },
    {
      id: 'weeks-2-4',
      label: '第 2–4 週｜步態與日常功能',
      plan: `步態：依平衡由 walker 漸轉 cane，改善 Trendelenburg 與步態對稱。
ROM：在 approach-specific 限制內漸進 active／passive ROM。
運動：許可角度內無阻力 standing hip abduction／extension、mini-squat、terminal knee extension、sit-to-stand。
注意事項：延續各入路限制；監測傷口、疼痛及腫脹，避免將 hip extension 訓練用於尚未放行的 anterior 入路。`,
    },
    {
      id: 'weeks-4-8',
      label: '第 4–8 週｜髖肌力與平衡',
      plan: `步態：平衡與力量足夠後漸至獨立行走。
運動：hip abductor／extensor 輕阻力、Theraband；step-up／down、sit-to-stand、side-step。
平衡：有安全支撐下 single-leg stance、weight shift。
注意事項：活動方向仍須符合入路與外科限制，不以術後週數自動解除；監測不穩與跛行。`,
    },
    {
      id: 'month-3',
      label: '第 3 個月｜體能與工作功能',
      plan: `體能：漸增 walking 時間及強度，低衝擊 stationary cycling。
運動：CKC lunge／leg press、core 及 pelvic stability，改善雙側肌力與功能。
工作：依職務需求、肌力與醫囑漸進輕至中度工作。
注意事項：避免尚未放行的 heavy lifting 或 repetitive impact；持續觀察步態、疼痛與不穩。`,
    },
    {
      id: 'months-4-6',
      label: '第 4–6 個月起｜長期維持',
      plan: `運動：持續 gluteal／hip strength 與 HEP，維持 pelvic stability。
活動：依醫囑選擇 walking、cycling、傷口癒合後 swimming 等低衝擊運動。
評估：leg-length concern、gait symmetry、肌力與日常功能。
注意事項：避免未經醫囑的 running／contact sports／高衝擊活動；晚發疼痛、跛行或不穩須重新評估。`,
    },
  ],
}
