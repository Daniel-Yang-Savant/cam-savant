# 慢性薦髂關節炎圖解運動：新增與審閱紀錄

修改日期：2026-09-24。狀態：使用者已於本任務回覆「可以部署」，確認本次呈現內容並授權正式發布；實際部署結果以本任務交付回報為準。

## 患者問題與驗證目標

協助已確診、症狀穩定並獲准運動的患者，在圖解運動專區找到溫和起步選項，理解動作、減量方式與就醫警訊。假設新增精確病名及常用別名可改善站內查找；尚無資料證實搜尋流量或就醫轉換會增加。

站內已有 `axspa-high-intensity-rct`，內容為高強度研究方案，缺乏本次低強度起步說明。已讀 2026-09-07 網站評估；沒有可用的 GSC、GA4 或 Vercel 後台資料，本次未取得最近 28／56 天的流量基準，不能以零代替未取得。新 URL 尚未上線，因此也沒有可比較的既有頁面成效。

## 實際修改

- `lib/exercise-guides-sacroiliitis.ts`：新增四項動作、起步量、適用對象、降階、紅黃綠燈與七筆來源；區分發炎性薦髂關節炎和機械性薦髂疼痛。
- `public/images/exercise-guides/chronic-sacroiliitis-gentle-exercise.webp`：新增原創四格合成教學圖，1254 × 1254，約 154 KiB。
- `lib/exercise-guides.ts`：註冊新模組、搜尋別名與「脊椎與軀幹」分類；新增衛教類型、待審狀態、個別日期與文字步驟欄位。
- `components/ExerciseGuideModuleCard.tsx`：新增可選的動作步驟卡；區分衛教與 RCT 提醒，顯示真正的待審狀態。
- `components/ExerciseGuideDirectory.tsx`：可搜尋新內容，衛教卡片有不同標籤；集合文案涵蓋指引與研究。
- `app/(zh)/exercise-guides/page.tsx`：傳遞類型／待審欄位，集合更新日反映新增內容，提醒逐頁查看審閱狀態。
- `app/(zh)/exercise-guides/[id]/page.tsx`：新頁標示運動衛教、canonical 正確、待審頁 noindex。
- `lib/schema.ts`：新頁使用個別日期，待審內容不繼承醫師 author、reviewedBy 或 lastReviewed。
- `app/sitemap.ts`：待審內容不加入 sitemap；既有運動頁面日期不變。
- `scripts/seo-contract.test.ts`：驗證待審標記、個別日期、schema、noindex、sitemap 與實際 HTML 呈現。

新路徑：`/exercise-guides/chronic-sacroiliitis-gentle-exercise`。沿用既有匿名事件，未新增分析事件、未傳送搜尋詞或健康資訊。

## 來源核對與宣稱界線

下列來源查閱日期皆為 2026-09-24；完整書目亦列在頁面的證據來源。

- [Ramiro et al., ASAS–EULAR 2022 update, Ann Rheum Dis. 2023;82:19–34](https://doi.org/10.1136/ard-2022-223296)：第 4 建議支持規律、個別化運動與物理治療；未建立本頁四動作為最佳方案。[已查閱發表全文](https://www.uco.es/pasic/archivos/documentos/articulos-publicados/2022/ASAS-EULAR-recommendations-for-the-management-of-axial-spondyloarthritis.pdf)。
- [Wei et al., Taiwan Rheumatology Association consensus, Int J Rheum Dis. 2020;23(1):7–23](https://pubmed.ncbi.nlm.nih.gov/31777200/)；DOI 10.1111/1756-185X.13752：支持個別化、多模式運動、呼吸及平地步行。線上發表於 2019，卷期年為 2020。
- [NASS 2018 患者手冊](https://nass.co.uk/wp-content/uploads/resources/81955-NASS-Guidebook-for-Patients.pdf)：印刷頁 18–19 的骨盆傾斜作為動作原型，並要求依個別能力調整。
- [AAOS / OrthoInfo Spine Conditioning Program](https://www.orthoinfo.org/recovery/spine-conditioning-program/)：第 9 項橋式是一般脊柱訓練；不是發炎性薦髂關節炎的特定療效試驗。網頁未列發布年，不補造年份。
- [NASS Exercising during a flare, 2022-05-11](https://nass.co.uk/wp-content/uploads/2022/05/Exercising-during-a-flare.pdf)：發作時減量、少量活動、個別調整與必要時聯絡團隊。
- [NHS Back pain, reviewed 2026-03-05](https://www.nhs.uk/conditions/back-pain/)：停止警訊與急診症狀；雙腿新麻木「或」無力，並非需兩者同時發生。
- [Mayo Clinic Sacroiliitis — Symptoms and causes, 2026-08-11](https://www.mayoclinic.org/diseases-conditions/sacroiliitis/symptoms-causes/syc-20350747)：薦髂關節炎有不同成因，不能只靠痛的位置診斷。

呼吸為活動前準備；低幅橋式、3–5 次／分鐘等數值標為本頁保守示例，不當成病種專屬試驗劑量。不保證消炎、復位或改善幅度，不將肌腱復健的疼痛分數與 24 小時規則套用到本病。已完成第二位 AI 的獨立證據 QA，依其建議修正新神經症狀的就醫時效；此程序不是醫師審閱。

## 發布與後續量測

依專案 `CAM-SAVANT-SEO-CONTENT-WORKFLOW.md` 第 13 節，運動劑量、禁忌、紅旗與指引解讀在發布前需醫師或合格內容負責人確認。第一輪交付提供四格圖、完整頁面與來源，並標為待審；使用者接著於 2026-09-24 回覆「可以部署」，本次依此前後文作為內容確認與發布授權。

發布版本採 `reviewStatus: approved`、`approvalDate: 2026-09-24`，可見資訊為「內容確認：網站內容負責人」。不新增具名醫師審閱聲明，不將使用者授權捏造成某位醫師的簽名，也不借用既有 2026-09-05 的全域醫師審閱紀錄；新頁 schema 不輸出舊醫師的 author、reviewedBy 或 lastReviewed。解除 noindex 並納入 sitemap，既有運動頁的審閱紀錄不變。

正式發布日設為 T0，取得 T0 前 28／56 天專區資料，發布後 T0+28、+56、+84 天比較專區／新頁曝光、自然搜尋點擊、匿名頁面互動與看診資訊到達。不據此推論治療成效。以 2026-09-24 發布計，檢查日為 2026-10-22、11-19、12-17。未建立自動追蹤或提醒。

## 圖像製作

使用內建 image_gen，原創合成教學影像；轉存 WebP 以符合既有圖解專區格式（不是文章封面 JPG）。檢視四格動作，骨盆傾斜臀部留地、橋式兩腳踩地、步行小步幅，無外加治療或極端活動範圍。影像已放進專案，頁面不依賴生成暫存路徑。

最終英文提示詞：

> Use case: scientific-educational. Create one square 2048x2048 medical patient education exercise photo collage with precisely four equal square panels in a clean 2x2 grid separated by narrow white gutters. Intended for a Taiwanese rehabilitation website explaining gentle exercise options for adults with stable chronic sacroiliitis after professional assessment. Photorealistic professional rehabilitation-clinic photography, bright natural window light, understated teal and warm neutral palette, clear entire body positions, no motion blur. The same Asian woman around age 45 with tied-back dark hair, modest teal short-sleeved T-shirt, dark gray athletic trousers and white trainers appears separately in each panel. Panel upper left: side view of woman lying on her back on a padded exercise mat, head supported by a thin pillow, knees bent and both feet flat hip-width apart, hands resting gently on lower ribs, calm relaxed breathing, hips resting on mat. Panel upper right: side view lying supine with knees bent, feet planted, arms relaxed at sides, demonstrating a gentle posterior pelvic tilt with pelvis kept on mat and lower back subtly flattening; NOT lifting hips, not a sit-up. One small unobtrusive teal curved arrow near the pelvis may indicate gentle rotation, do not obscure body. Panel lower left: side view of a LOW double-leg bridge, feet and shoulders on mat, knees bent, BOTH feet flat and hip-width apart, pelvis lifted ONLY a few centimeters, no high arch of lower back, hands at sides, head resting on thin pillow, relaxed neck. Panel lower right: full-body side-three-quarter view of same woman walking at relaxed pace with a short comfortable stride on a flat clear indoor clinic walkway, gaze forward, arms moving naturally, no running, no stairs or slopes. Each panel is a distinct complete scene with no limbs or objects crossing gutters. Keep each body comfortably within panel with generous safe margins; avoid exaggerated joint ranges, twisting, strong stretch, red pain glows, skeleton overlays, therapists manipulating joints. No embedded text, no labels, no numbers, no watermarks, no branding. Realistic anatomy, correct hands and feet, clinically clear and non-dramatic.

實際生成尺寸為 1254 × 1254，以實際檔案尺寸寫入頁面。

## 技術驗證

- `git diff --check` 通過。
- `npm run lint` 通過，無警告。
- `npm run build` 通過；prebuild 內文章驗證、SEO、站內發現、FSM、門診計畫與權限測試共 92 項通過，121 篇文章通過驗證；成功產生 469 個靜態頁面。
- 初次沙箱執行因 tsx 本機 IPC 權限受限中止，取得執行權限後原命令完整通過；未跳過檢查。
- 本機正式建置預覽：新 URL、標題、四格圖、四項文字步驟、待審狀態及來源可讀；圖片放大／關閉正常。
- 手機 390 × 844：步驟卡單欄可讀，頁面寬度 390，沒有水平溢出；圖片成功載入。桌面版亦檢视圖片與排版。
- 專區搜尋「薦髂」及「骶髂」均找到新模組，點擊可到詳情頁；搜尋詞沒有加入 URL。
- 瀏覽器未記錄 JavaScript 錯誤。測試用 viewport override 已復原。

### 核准發布後的檢查

- approved 狀態新增合約測試：可索引、納入 sitemap、顯示確認日期、不繼承舊醫師審閱／作者、不顯示待審；21 項 SEO 合約測試通過。
- 再次執行 `npm run lint`、`git diff --check`、`npm run build` 均通過；prebuild 合計 93 項測試、121 篇文章驗證，469 個靜態頁面建置成功。
- 發布沿用本專案既有 GitHub main → Vercel 正式站流程；只納入本任務檔案，不包含其他本機草稿、壓縮檔或 output 目錄。
- 正式網址：`https://camsavant.com/exercise-guides/chronic-sacroiliitis-gentle-exercise`。
