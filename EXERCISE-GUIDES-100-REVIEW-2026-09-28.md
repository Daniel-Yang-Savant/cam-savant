# 圖解運動專區：100 篇擴充與審閱紀錄

日期：2026-09-28。範圍：原有 72 篇，加上 28 個不同臨床試驗主題，共 100 篇內容。新增內容完成本機預覽與文獻核對後，使用者於同日明確回覆「可以上線」，已更新為網站內容負責人確認並納入正式發布；未宣稱由具名醫師審閱。

## 目標與資料基準

患者問題：依已確認的疾病、生活功能或運動需求，找到有來源可核對的運動方案，理解誰適用、研究實際比較什麼，以及哪些安排必須由醫療團隊決定。新增內容以有不同決策價值的試驗為單位，不以同一研究換標題湊數。

完成標準：100 個唯一網址與標題；新增 28 篇各有原始文獻、四項研究步驟、原創圖解、適用條件、調整與就醫提醒；待審草稿維持 noindex 並排除 sitemap，確認後開放索引並列入 sitemap；既有文章保留原更新與審閱日期。

已先檢查文章資料、搜尋分類、日期／審閱規則、sitemap、既有測試、2026-09-07 網站評估與 2026-09-24 薦髂關節炎交班。本次沒有 GSC、GA4 或 Vercel 後台匯出，未取得近期 28／56 天的曝光、點擊、閱讀或掛號基準，不能當成零。改善查找與閱讀是待驗證假設，並未宣稱增加流量或療效。

## 選文方式與品質界線

- 優先隨機分派、多中心或較大樣本，以及功能、跌倒、活動能力、生活品質等患者重要結果。
- 逐篇核對研究身份、納入對象、比較組、介入安排、主要結果與限制。使用原始期刊、PubMed／PMC 與可取得的研究方案；未取得全文的部分不補造細節。
- 同時納入無額外效益或安全結果不利的試驗，例如 AVERT、TEAM、DAPA。這些文章的用途是協助決策，不是鼓勵照抄介入。
- 多模式介入不能把全部效益歸功於單一運動；非劣性、優越性、第二期與群集試驗分開解讀。
- 經典研究仍可提供不同決策價值，並非只挑新年份或知名期刊。未做完整系統性回顧、正式 RoB 2 評分或 GRADE 分級，不宣稱 28 篇全部具有高度確定性。
- 本次對 28 篇新增內容做文獻核對，並未重新審閱原有 72 篇的所有文獻。

逐篇可核對來源、查閱日期、選入理由與限制記於：

- [肌骨與運動傷害 10 篇](research-notes/exercise-guides-2026-09-28-msk.md)
- [神經與高齡復健 9 篇](research-notes/exercise-guides-2026-09-28-neuro.md)
- [心肺、癌症與全身性狀況 9 篇](research-notes/exercise-guides-2026-09-28-cardio.md)

## 修改範圍

- `lib/exercise-guides-curated-msk.ts`、`lib/exercise-guides-curated-neuro.ts`、`lib/exercise-guides-curated-cardio.ts`：28 篇研究文章及完整引用，使用繁體中文、四項步驟及個別安全資訊。
- `public/images/exercise-guides/*.svg`：每篇一張原創四格研究方案示意；不是論文原圖，也不是完整動作處方。圖中文字取自相應步驟，完整劑量與限制留在可讀取的頁面文字。
- `scripts/generate-curated-exercise-diagrams.ts`：可重建原創向量圖；不擷取或改作期刊照片。
- `lib/exercise-guides.ts`：註冊 28 篇及明確的專業指導層級，避免心肺、神經、術後或重症文章誤用一般自行運動標籤。
- `components/ExerciseGuideDirectory.tsx`：補充全身／神經子分類對應；沿用既有症狀與別名搜尋。
- `components/ExerciseGuideModuleCard.tsx`：研究步驟明確標為「研究方案如何進行」及「研究安排／調整」，不稱為個人起步量；原創圖解不重疊顯示影像四角編號。
- `app/(zh)/exercise-guides/page.tsx`：實際篇數與待審數量、選文方式及圖像說明；日期跟隨內容，未修改全站或舊文章日期。
- `scripts/exercise-guide-expansion.test.ts`、`scripts/exercise-guide-related.test.ts`、`scripts/seo-contract.test.ts`、`package.json`：驗證篇數、來源唯一性、圖檔、確認後索引／sitemap／無虛構醫師審閱，以及研究劑量顯示；結腸癌頁優先推薦其他癌症運動研究。

## 醫療審閱與發布

新增 28 篇原先為 `reviewStatus: 'pending'`，並以本機預覽與此紀錄提供確認。使用者於 2026-09-28 回覆「可以上線」後，統一改為 `reviewStatus: 'approved'`、`approvalDate: '2026-09-28'`；頁面明確標示「內容確認：網站內容負責人」，開放索引並列入 sitemap。沒有填入具名醫師的 `reviewedBy` 或 `lastReviewed`。

依專案 [CAM-SAVANT-SEO-CONTENT-WORKFLOW.md §13](CAM-SAVANT-SEO-CONTENT-WORKFLOW.md)，「以下內容可由 AI 協助研究與草擬，但發布前需要醫師或具資格的內容負責人確認」，包含研究結論解讀、運動劑量、禁忌及紅旗。本次先完成可供確認的內容、圖解與技術驗證，再依使用者授權發布；確認日期與原有文章日期分開保存。文獻交叉核對包含術後／心肺／重症的條件、陰性試驗的表述與圖文一致性，並不冒用具名醫師的審閱身份。

## 成效追蹤

沿用匿名 `article_engaged`、既有看診資訊及掛號事件，未新增搜尋詞、個資或健康內容的追蹤。

以實際發布日為 D，發布前補取 D−28 至 D−1 及 D−56 至 D−1 的專區與既有相近主題資料。新 URL 沒有發布前流量基準，需分開比較。於 D+28、D+56、D+84 查看 GSC 的曝光／點擊／查詢意圖，以及閱讀與看診資訊到達；同時觀察讀者誤解、無效來源、圖片及頁面錯誤。若 2026-09-28 發布，對應日期為 2026-10-26、2026-11-23、2026-12-21；本次未建立自動排程。

## 逐篇正式網址

下列為 28 篇文章的正式網址；沿用既有 GitHub main → Vercel 流程發布，正式站狀態以部署後檢查為準。

- [腰椎狹窄走不遠：個別化復健如何安排](https://camsavant.com/exercise-guides/lumbar-stenosis-individualized-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/30646197/)
- [慢性下背痛不敢動：RESTORE 的認知功能治療](https://camsavant.com/exercise-guides/low-back-restore-cft-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/37146623/)
- [五十肩：結構化復健與手術如何選擇](https://camsavant.com/exercise-guides/frozen-shoulder-uk-frost-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/33010843/)
- [肩峰下疼痛：旋轉肌袖與肩胛肌的漸進負荷](https://camsavant.com/exercise-guides/subacromial-specific-exercise-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/22349588/)
- [前十字韌帶斷裂：復健優先與重建的共同決策](https://camsavant.com/exercise-guides/acl-kanon-rehabilitation-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/20660401/)
- [年輕成人半月板撕裂：先復健的研究與限制](https://camsavant.com/exercise-guides/young-meniscus-dream-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/38319181/)
- [學生膝前痛：把肌力練習與疼痛教育放進日常](https://camsavant.com/exercise-guides/adolescent-pfp-school-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/25388552/)
- [腳踝扭傷恢復後：8 週平衡訓練降低再扭傷](https://camsavant.com/exercise-guides/ankle-recurrence-balance-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/19589822/)
- [Nordic 腿後肌訓練：漸進導入足球防傷](https://camsavant.com/exercise-guides/nordic-hamstring-prevention-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/21825112/)
- [青少年女子足球：把肌力與落地控制放進暖身](https://camsavant.com/exercise-guides/football-11plus-youth-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/19066253/)
- [高齡行走能力：LIFE 的步行、肌力與平衡組合](https://camsavant.com/exercise-guides/life-mobility-disability-rct) · [原始研究](https://jamanetwork.com/journals/jama/fullarticle/1875328)
- [衰弱合併肌少症：運動與營養支持如何保留行動能力](https://camsavant.com/exercise-guides/sprintt-frailty-mobility-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC9092831/)
- [高跌倒風險長者：治療性太極的重心與轉向練習](https://camsavant.com/exercise-guides/taijiquan-falls-prevention-rct) · [原始研究](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2701631)
- [失智症：體能訓練不能保證減緩認知退化](https://camsavant.com/exercise-guides/dapa-dementia-exercise-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC5953238/)
- [中風後走路：減重跑步機未優於治療師帶領的居家運動](https://camsavant.com/exercise-guides/leaps-stroke-walking-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC3175688/)
- [急性中風：更早、更多下床活動不一定更好](https://camsavant.com/exercise-guides/avert-early-stroke-mobilisation-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/25892679/)
- [中風上肢：任務導向課程沒有顯示比通常職能治療更好](https://camsavant.com/exercise-guides/icare-stroke-arm-training-rct) · [原始研究](https://jamanetwork.com/journals/jama/fullarticle/2488308)
- [早期巴金森氏症：高強度跑步機的初步證據與限制](https://camsavant.com/exercise-guides/sparx-parkinson-treadmill-rct) · [原始研究](https://jamanetwork.com/journals/jamaneurology/fullarticle/2664948)
- [輕度巴金森氏症：有遠距支持的居家固定車訓練](https://camsavant.com/exercise-guides/park-in-shape-cycling-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/31521532/)
- [穩定心衰竭：HF-ACTION 的監督有氧與居家銜接](https://camsavant.com/exercise-guides/hf-action-aerobic-training-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC2916661/)
- [心衰竭住院後：REHAB-HF 的四面向功能復健](https://camsavant.com/exercise-guides/rehab-hf-multidomain-rehabilitation-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/33999544/)
- [穩定肺阻塞：有專業追蹤的居家肺復健](https://camsavant.com/exercise-guides/copd-home-pulmonary-rehabilitation-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC5329049/)
- [呼吸器治療中的早期活動：TEAM 提醒不是越多越好](https://camsavant.com/exercise-guides/icu-team-early-mobilization-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/36286256/)
- [結腸癌輔助化療後：CHALLENGE 的長期運動支持](https://camsavant.com/exercise-guides/colon-cancer-challenge-exercise-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/40450658/)
- [穩定乳癌相關淋巴水腫：慢慢增加的阻力訓練](https://camsavant.com/exercise-guides/breast-cancer-lymphedema-resistance-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/19675330/)
- [第二型糖尿病：DARE 的有氧與阻力組合](https://camsavant.com/exercise-guides/diabetes-dare-combined-exercise-rct) · [原始研究](https://pubmed.ncbi.nlm.nih.gov/17876019/)
- [年長女性漏尿：先學正確收縮，再選團體或個別課程](https://camsavant.com/exercise-guides/urinary-incontinence-group-pelvic-floor-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC7400216/)
- [纖維肌痛：太極與有氧如何選擇？](https://camsavant.com/exercise-guides/fibromyalgia-tai-chi-comparison-rct) · [原始研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC5861462/)

## 發布前驗證紀錄

- `git diff --check`：通過。
- `npm run validate:posts`：通過（122 篇中文與 20 篇英文）。最初受本機沙箱的 tsx 通訊限制，先用相同執行環境驗證，之後正式 prebuild 中原指令亦通過。
- `npm run lint`：通過，無錯誤或警告。
- `npm run build`：最後版本通過 TypeScript、正式建置及 527 個靜態頁面生成；建置前六組檢查共 97 tests 通過（SEO 25、discovery 2、FSM 51、OPD 9、periop 10；文章格式另計）。
- 專區契約：100 個唯一 ID／標題、28 個不同主要研究連結、28 張圖均存在；每篇四步、個別指導層級、無虛構醫師審閱日期。初版驗證待審 noindex／排除 sitemap；發布版另驗證 28 篇已確認、開放索引並列入 sitemap。
- 圖像檢查：28 張 SVG 合計約 184 KiB，均可渲染；分批檢視接觸表並檢查修正後單張圖。同步修正固定式腳踏車、下肢肌力、側躺髖外展、肩部活動、單腳支撐、平衡板與跑步機支撐示意，避免圖文不一致。
- 瀏覽器預覽：確認集合頁顯示 100 篇／28 待審，放鬆 5 組與症狀／診斷 95 組；搜尋 CHALLENGE 得到正確文章，頁面四格圖、研究安排、待審提醒及放大對話框正常。
- 文獻交叉檢查：另一次唯讀查核對 AVERT／DAPA／LEAPS／ICARE 及肌骨 10 篇，未發現重大書目或研究結果錯配；不取代醫師資格的正式醫療審閱。
- 建置僅有既有 Browserslist 資料較舊的提示，未為此變更依賴。未修改或提交工作樹原有的其他報告、輸出或另一工作新增的每週論文文章。

## 已確認發布版本驗證（2026-09-28）

- 使用者在完整本機預覽與研究紀錄交付後回覆「可以上線」，28 篇均改為已確認，確認日期為 2026-09-28。
- 從既有已追蹤來源加上本次 44 個檔案建立獨立發布版本，排除工作目錄其他報告、輸出及尚未提交的每週文章；未改動那些檔案。
- `npm run lint`、`git diff --check`、文章格式檢查及 97 個測試均通過；正式建置通過 TypeScript 並生成 525 個頁面（發布版本為 121 篇中文、20 篇英文文章，圖解運動另計 100 篇）。
- 新增 28 篇均可索引、列入 sitemap，顯示網站內容負責人與確認日期；不產生具名醫師審閱資料。
- 建置有既有 Browserslist 資料提示及少數既有頁面的動態字型下載失敗提示，建置仍完成；部署後另確認正式頁面與圖解資產回應。
