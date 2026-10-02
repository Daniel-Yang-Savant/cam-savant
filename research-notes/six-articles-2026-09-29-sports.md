# 2026-09-29 運動醫學兩篇草稿：查證與交付記錄

> 2026-10-02 發布準備更新：使用者已明確確認可以發布，六篇 MDX 均改為 `draft: false`，首次發布日期設為 2026-10-02；正文與文獻沿用已交付版本，未代填具名醫師審閱欄位。下文草稿狀態為 2026-09-29 研究當時的歷史紀錄。
> 成效資料仍未取得；以正式上線日起的新頁資料建立基準，建議於 2026-10-30、2026-11-27、2026-12-25 檢視曝光、查詢、點擊及可取得的站內閱讀／看診資訊行為，未建立自動排程。

## 範圍與目的

- `content/posts/patellofemoral-pain-running-rehab.mdx`：回答跑步膝前痛如何調整跑量、選擇訓練及判斷是否適合回跑。
- `content/posts/patellar-tendinopathy-loading-return-sport.mdx`：回答跳躍膝反覆發作時如何安排總負荷、復健與額外治療，以及症狀改善和回場的差別。
- 兩篇均為 `draft: true`，日期 2026-09-29，未填寫醫師已審閱欄位；沒有部署、commit、push 或新增追蹤。
- 未取得 Search Console / GA4 帳號資料，因此沒有捏造查詢量、現有排名或流量基準。這次是使用者指定的新文章草擬，成效假設是改善患者判斷與站內閱讀路徑，尚無成效數據。若日後發布，應另記發布前 28 天資料及發布後 28、56、84 天的搜尋與站內行為表現。

## 站內背景

已讀 `AGENTS.md`、`CAM-SAVANT-SEO-CONTENT-WORKFLOW.md`、`文章題庫與撰寫規格.md`。已對照 `lib/exercise-guides.ts` 內 `patellofemoral-telehealth-rct`、`patellar-tendon-loading-rct`，並搜尋其他髕股疼痛圖解。已讀既有籃球防傷文、查看馬拉松與排球文段落及相關病名；新稿以患者疾病決策為主，不複製運動項目總覽。

已有圖解的適用人群較窄，文章未將圖解週數、劑量或回場疼痛門檻當作通用處方。正文對圖解採內部連結及適用條件提醒。

## 髕股疼痛：來源與主張對應

所有下列來源查閱日期：2026-09-29。文末書目已核對作者、標題、年份、期刊卷期頁碼、DOI 或官方發布單位。

**[1] Neal BS, Lack SD, Bartholomew C, Morrissey D. 2024 最佳實務指南。**

- DOI：https://doi.org/10.1136/bjsports-2024-108110
- PubMed：https://pubmed.ncbi.nlm.nih.gov/39401870/
- 大學典藏全文：https://repository.essex.ac.uk/39411/1/bjsports-2024-108110.full.pdf
- 核對層級：PubMed 書目與摘要、大學典藏期刊全文；BMJ 主站直接開啟受 403 限制，改核對作者機構典藏。
- 核對內容：65 項高品質 RCT、3,796 人；衛教＋膝部訓練為核心，視需要加入髖部訓練。貼紮、足部矯具、跑姿調整依個別評估。疼痛不與組織損傷一對一；不同介入的證據確定性與臨床推薦強度不同。
- 對應：開頭短答、訓練方向、輔助療法條件、避免把所有膝痛歸因姿勢或軟骨磨損。
- 限制：這是量化研究、患者訪談與專家推理的混合證據最佳實務指南，未寫成所有細節皆由高確定性 RCT 證實。

**[2] AAOS. Patellofemoral Pain Syndrome. OrthoInfo。**

- https://www.orthoinfo.org/diseases--conditions/patellofemoral-pain-syndrome/
- 核對層級：官方衛教全文。
- 對應：典型症狀、病史與身體檢查、影像協助排除其他問題或評估未改善症狀、肌力訓練方向。
- 限制：不同指引對 X 光使用描述不同，本文只寫依鑑別診斷與臨床反應決定，不寫一律需要或一律不需。

**[3] Bexley Musculoskeletal Service. Patellofemoral Pain Syndrome (PFPS). NHS。**

- https://msk-bexley.nhs.uk/conditions/knee-pain/patellofemoral-pain-syndrome-pfps
- 核對層級：官方衛教全文。
- 對應：負荷管理、分段活動、避免過度與過快加量、症狀穩定後恢復活動、橋式／髖外展／小幅蹲等動作例子、鞋墊與貼紮試用。
- 限制：未採用該頁的固定 10% 增量規則、單腳蹲膝蓋不可過腳尖等概括指示；保留個別化說法。

**[4] Esculier JF, Bouyer LJ, Dubois B, Frémont P, Moore L, McFadyen B, Roy JS. Br J Sports Med. 2018;52(10):659–666。**

- https://pubmed.ncbi.nlm.nih.gov/28476901/
- DOI：https://doi.org/10.1136/bjsports-2016-096988
- 核對層級：web 工具提供的 PubMed 原始記錄完整摘要與書目；再次直接開啟時頁面回傳空殼，未取得原期刊全文。
- 對應：69 名跑者、3 組介入、症狀與功能組間無明確差異；跑姿和肌力的針對性指標改善不等於症狀結果更佳。
- 限制：只引用摘要確實可核對的設計與結果。未由「加運動未勝過衛教」推論運動無效，亦未提供本文未核對之研究劑量細節。

**[5] Berkshire Healthcare NHS Foundation Trust. Return to running programme。**

- https://www.berkshirehealthcare.nhs.uk/advice/return-to-running-programme
- 核對層級：官方衛教全文。
- 對應：由日常活動及功能準備進到跑走交替、安排恢復日、監測疼痛與腫脹、逐步調整跑量。
- 限制：屬一般回跑衛教，不是 PFP 專屬回場驗證工具。文內已明示實務安排是一般原則整理，不採用固定週數與 10% 當保證。
- 已排除來源：`https://ruh.nhs.uk/patients/patient_information/PHY047_Return_to_running.pdf` 標題雖簡寫為 Return to Running，但全文其實針對產後；沒有留在最終稿。

**[6] NHS. Knee pain。**

- https://www.nhs.uk/symptoms/knee-pain/
- 核對層級：官方衛教全文。
- 對應：無法承重／移動、明顯腫脹或變形、鎖住、紅熱合併發燒等儘快評估警訊，以及症狀數週未改善的就診建議。
- 在地化：未複製英國 111 服務電話，採台灣讀者可理解的就醫敘述。

## 髕腱病變：來源與主張對應

所有下列來源查閱日期：2026-09-29。

**[1] Rosen AB, Wellsandt E, Nicola M, Tao MA. Clinical Management of Patellar Tendinopathy. J Athl Train. 2022;57(7):621–631。**

- https://pmc.ncbi.nlm.nih.gov/articles/PMC9528703/
- DOI：https://doi.org/10.4085/1062-6050-0049.21
- 核對層級：PMC 全文，包含臨床表現、鑑別診斷、影像、負荷管理與治療段落。
- 對應：局部負荷疼痛、熱身後暫緩、無症狀者也可能有影像改變、保守治療與整體負荷調整、跨醫療與教練協作、功能與專項需求評估。
- 限制：屬臨床概念回顧，不標成正式國際指引。未把範例時程和疼痛門檻作為所有人的處方。

**[2] Breda SJ, Oei EHG, Zwerver J, Visser E, Waarsing E, Krestin GP, de Vos RJ. Br J Sports Med. 2021;55(9):501–509。**

- https://pmc.ncbi.nlm.nih.gov/articles/PMC8070614/
- DOI：https://doi.org/10.1136/bjsports-2020-103403
- 核對層級：PMC 期刊全文，包含納排條件、介入方法、結果與討論。
- 入組條件：18–35 歲，每週運動至少 3 次，臨床與超音波確認；76 人、多數慢性病程（中位數 2 年）。並非所有患者都須症狀至少 3 個月才能納入，本文避免重述站內圖解中較保守的適用範圍為 RCT 原始納入標準。
- 對應：四階段 PTLE；24 週 VISA-P 調整後組間改善差 9 分（95% CI 1–16）；回到受傷前運動水準 43% vs 27%、p=0.13，未達統計顯著。
- 限制：不宣稱治癒率、不宣稱回場率顯著優越；不把 VAS ≤3 或最快四週轉成普遍安全線或恢復保證；不把整體方案結果歸功於某一個動作。

**[3] Challoumas D, Pedret C, Biddle M, et al. BMJ Open Sport Exerc Med. 2021;7(4):e001110。**

- https://researchonline.gcu.ac.uk/ws/portalfiles/portal/58502601/e001110.full.pdf
- DOI：https://doi.org/10.1136/bmjsem-2021-001110
- 核對層級：Glasgow Caledonian University 典藏期刊全文 PDF；PMC / BMJ 主站有間歇性存取限制。
- 對應：衝擊波加離心訓練與假衝擊波加離心訓練的兩項 RCT，短期疼痛及功能未顯示額外優勢；等長與動態訓練立即止痛比較不足以支持等長必勝。
- 限制：清楚交代比較組也有運動訓練，不寫成所有衝擊波療程都無效；不將 NMA 排名轉成最佳療法保證。

**[4] Liu Y, Li C, Yang F. BMC Sports Sci Med Rehabil. 2026;18(1):296。**

- https://pubmed.ncbi.nlm.nih.gov/42192475/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC13308153/
- DOI：https://doi.org/10.1186/s13102-026-01743-4
- 核對層級：web 工具提供的 PubMed 原始記錄完整摘要及書目，以及 PMC 正文的研究方法、結果、結論段落；直接開啟 PMC 曾遇 reCAPTCHA，未宣稱已逐項重作或查核其統合分析。
- 核對數目：17 項研究納入質性整合；14 項／456 人為較廣敏感性架構；最終主要連通網絡為 10 項／313 人。文內引用主要網絡，不混稱總研究人數。
- 對應：尚無清楚證據支持某運動介入優於 HSR，網絡稀疏、估計不精確，排名不等於臨床優越；無顯著差異不是等效性試驗。
- 限制：截至查閱日可得的新回顧，只做保守結論，不用來推出精確劑量或新的回場門檻。

**[5] Scott A, LaPrade RF, Harmon KG, et al. Am J Sports Med. 2019;47(7):1654–1661。**

- https://pubmed.ncbi.nlm.nih.gov/31038979/
- DOI：https://doi.org/10.1177/0363546519837954
- 核對層級：web 工具提供的 PubMed 原始完整摘要及書目；直接頁面曾回傳空殼，未取得期刊全文。
- 對應：57 人、症狀至少 6 個月、單次 LR-PRP／LP-PRP／生理食鹽水，三組共同接受復健；12 週主要結局及其餘到一年追蹤的組間差異未顯著。
- 限制：不擴張為所有 PRP 配方、注射次數皆無效，不把對照注射本身寫成常規治療建議。

**[6] AAOS. Patellar Tendon Tear. OrthoInfo。**

- https://www.orthoinfo.org/diseases--conditions/patellar-tendon-tear/
- 核對層級：官方衛教全文。
- 對應：突然撕裂／爆裂感、腫脹與無法伸膝的肌腱撕裂警訊；類固醇注射與肌腱弱化、斷裂風險。
- 部位核對：官方原文為醫師通常避免注射 `in or around the patellar tendon`，因此正文「髕腱內或周圍」沒有擴大解讀成其他關節注射。

**[7] NHS. Knee pain。**

- https://www.nhs.uk/symptoms/knee-pain/
- 核對層級：官方衛教全文。
- 對應：急性承重困難、鎖住、感染警訊；同 PFP 文之 [6]。

## 交付檢查與未解事項

- 兩篇各 6 個正文 H2，加參考文獻共 7 個；正文約 1,567／1,625 個漢字（不計 frontmatter 與參考文獻，數字與英文另計）。
- 無 Markdown 表格，無原始小於號，5 個 takeaways，引用皆有完整參考文獻及網址。
- 站內連結之文章檔案與 exercise-guide IDs 已核對存在；互相連結的兩篇均屬本次草稿。
- 封面由主代理製作；整體 validate、lint、build 由主代理在六篇與圖片齊備後執行，避免平行建置互相干擾。
- 發布前仍需醫師審閱診斷、警訊、治療、回場及研究解讀；未代填 `reviewedBy` 或 `lastReviewed`。
- 既有籃球文章可見部分機轉／用字可能值得未來獨立醫療審查，例如把 valgus 翻作內翻、將籃球寫為非接觸運動及無條件每週增量 10%。此次未改該文，也未以其敘述作為新稿醫療證據。
