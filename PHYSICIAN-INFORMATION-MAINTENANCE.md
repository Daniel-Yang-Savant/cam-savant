# 醫師、門診與醫療審閱資料維護

本次實作：2026-09-07。對應患者問題：辨識正確醫師、院區、門診時間與官方掛號，並區分作者與實際醫療審閱。

## 資料來源

- `lib/authors.ts`：姓名、職稱、資格、簡介、官方介紹／學會名錄、著作。`profileSources` 同時用於可見連結與結構化資料的 `sameAs`。
- `lib/locations.ts`：醫院地址、電話、交通與一般院所資料。
- `lib/doctor-clinics.ts`：每筆「醫師 × 院區」的時段、官方掛號、來源、實際核對日期及備註。`checkedAt` 是門診來源查核日期，不是醫療文章審閱日期。
- `lib/content-review.ts`：一般中英文文章的獨立審閱欄位與驗證。
- `lib/exercise-guide-review.ts`：圖解運動既有發布、更新、審閱紀錄；姓名與職稱由醫師資料取得。日期沒有改成此次實作日期。

## 門診查核紀錄

2026-09-07 讀取五院官方復健科掛號頁，查核 2026-09-07 至 09-12 週表，分別建立楊育愷三院區、賴玟衛三院區，共六筆紀錄。各筆來源網址保存在資料檔並呈現於頁面。

- 楊醫師彰基：週一晚上、週三下午、週五上午；官方另列週二下午體系醫院掛號，附註須洽院方。
- 楊醫師南基：週一、週四上午；二基：週三上午。
- 賴醫師彰基：週一下午、週六上午；09-12 週六標示請假，已附註。原週四上午超音波約診未在本次官方週表確認，僅以待院方確認備註呈現。
- 賴醫師漢銘：週一、週三上午；員基：週五下午。

官方單次掛號連結包含特定日期，因此網站使用穩定的官方科別入口，並明確提示選擇哪位醫師。核對週表不代表未來各週皆開診，仍以院方最新安排為準。

醫師身份來源已核對楊醫師彰基／南基介紹、骨質疏鬆症學會專科名錄，楊育彰兩家院所介紹，以及賴醫師漢銘介紹。賴醫師的骨鬆資格依該院官方資料調整為「準會員」。未新增療效宣稱或變更醫療文章正文。

## 一般文章如何記錄審閱

僅在確有審閱紀錄時，於 MDX frontmatter 一起提供 `reviewedBy` 與 `lastReviewed`：

- `reviewedBy` 使用 `AUTHORS` 中的醫師鍵值，中英文文章均相同，例如 `楊育愷醫師`。
- `lastReviewed` 使用實際審閱日期，格式為有效的 `YYYY-MM-DD`。
- 未經核對不要補日期。沒有這兩個欄位時，頁面及 schema 都不推定醫療審閱日期。
- `date` 仍為發布日期，`lastModified` 仍為實質內容更新日期；不能當成審閱日期替代品。
- 更新醫療內容後應重新確認現有審閱紀錄是否仍適用，不要自動沿用或變更日期。

孤立的審閱欄位、未知審閱者與不存在的日曆日期會在文章驗證時失敗。既有文章未回填任何審閱者或審閱日期。英文舊有作者顯示字串會解析為同一份醫師資料，再呈現姓名及醫師頁連結。

## 修改檔案與作用

- `lib/authors.ts`：可見官方來源、核對後的資格、楊醫師簡介、個人門診錨點。
- `lib/locations.ts`：移除院區共用時段與醫師名單。
- `lib/doctor-clinics.ts`：建立六筆醫師院區關係。
- `components/DoctorClinicCards.tsx`：共用門診／掛號／查核來源卡片。
- `components/DoctorContactContent.tsx`：中英文看診頁共用內容。
- `app/(zh)/doctors/[slug]/page.tsx`、`app/(en)/en/doctors/[slug]/page.tsx`：院區與門診、官方來源；依使用者要求移除代表衛教文章區塊。
- `app/(zh)/locations/page.tsx`、`app/(en)/en/locations/page.tsx`：總覽逐位醫師呈現時段。
- `app/(zh)/locations/[slug]/page.tsx`、`app/(en)/en/locations/[slug]/page.tsx`：院區內分別呈現各醫師。
- `app/(zh)/contact/page.tsx`、`app/(en)/en/contact/page.tsx`、`app/(zh)/contact/wen-wei-lai/page.tsx`、`app/(en)/en/contact/wen-wei-lai/page.tsx`：移除重複的門診和醫師資料。
- `components/AuthorCard.tsx`：作者個人看診入口。
- `app/(zh)/about/page.tsx`、`app/(en)/en/about/page.tsx`：共用醫療團隊 schema。
- `app/(zh)/layout.tsx`、`app/(en)/layout.tsx`、`lib/schema.ts`：統一醫師身份、院所、官方來源與中英文 schema；取消推定審閱日期。
- `lib/content-review.ts`、`lib/posts.ts`、`lib/english-posts.ts`：獨立審閱欄位與驗證、英文作者解析。
- `components/ArticleReview.tsx`、`app/(zh)/posts/[slug]/page.tsx`、`app/(zh)/perioperative-rehab/[slug]/page.tsx`、`app/(en)/en/perioperative-rehab/[slug]/page.tsx`：只顯示明確的醫療審閱紀錄，區分作者與更新。
- `lib/exercise-guide-review.ts`、`app/(zh)/exercise-guides/page.tsx`、`components/ExerciseGuideModuleCard.tsx`：圖解運動共用醫師資料，可見發布／更新／審閱資訊。
- `lib/llms.ts`、`app/llms.txt/route.ts`、`app/llms-full.txt/route.ts`：由共用資料生成 AI 文字索引，取代 `public/llms.txt`；完整索引包含全部公開文章，排除受保護內容。
- `app/sitemap.ts`：此次有實質更新的醫師／院區頁固定更新日期，中英文一致；圖解 sitemap 使用內容更新日期。
- `scripts/content-review.test.ts`、`scripts/doctor-clinics.test.ts`、`scripts/seo-contract.test.ts`、`package.json`：將審閱、身份、公開文章邊界及醫師院區對應納入驗證。

## 驗證与後續

2026-09-07 通過 `git diff --check`、`npm run validate:posts`（118 篇中文、20 篇英文）、`npm run test:seo`（17 項）、`npm run lint`、`npm run build`（460 個靜態頁）。瀏覽器確認本機正式建置的中文醫師頁、個人門診錨點及英文彰基院區頁。

既有未提交的管理員／門診工具工作保留。本次沒有取得 GSC／GA4 基準，不能宣稱搜尋或掛號成效提升；部署後再以既有匿名院區與掛號點擊事件，於 28／56／84 天比較，無新增個資蒐集。

2026-09-07 版面調整：醫師頁門診區塊標題簡化為「院區與門診」，移除中英文代表衛教文章區塊與未使用的文章選取工具；衛教文章本身及學術著作保留。
