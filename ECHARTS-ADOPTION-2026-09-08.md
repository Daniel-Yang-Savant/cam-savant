# ECharts 評估與文章列表改善

日期：2026-09-08。

## 最終範圍

依使用者決定，本次不採用或部署主題分布長條圖，也不安裝 ECharts、zrender、CDN 或其他新依賴。保留公開文章摘要減量、分類專頁入口、既有標籤篩選與無障礙小修。

目標是讓文章列表只取得必要資料，維持讀者尋文操作與鍵盤可用性。這是技術與使用體驗改善，沒有足夠資料聲稱會提升 SEO、流量或患者轉換；未取得 GSC、GA4 或 Vercel 最近 28／56 天成效基準。

## 保留的修改

- `lib/article-discovery.ts`：建立公開文章摘要，排除草稿、受保護與未列入公開白名單的分類。
- `app/(zh)/posts/page.tsx`：在伺服器呼叫 `getPublicPosts()`，將卡片摘要傳給瀏覽器。
- `components/ArticleCard.tsx`：接受摘要及預先計算的閱讀時間，兼容其他頁面原有的完整文章資料。
- `components/PostsClient.tsx`：保留分類專頁與標籤篩選，補上每週論文精選入口；改善標籤展開狀態、鍵盤焦點、結果通知與分頁按鈕名稱。
- `scripts/article-discovery.test.ts`：只保留公開資料邊界及摘要欄位兩項測試。
- `package.json`：保留 `test:discovery` 並納入 `prebuild`，不變更套件依賴。

摘要僅包含文章卡片需要的 slug、標題、日期、分類、摘要、封面、標籤與閱讀時間，不傳正文及未使用的 frontmatter。伺服器的公開資料篩選仍是存取邊界。

沒有新增 API、瀏覽器儲存、分析事件、密鑰或權限設定。沒有新增或修改醫療正文、臨床宣稱、文獻、看診 CTA、審閱日期、metadata、canonical、schema 或 sitemap。

## ECharts 研究結論

ECharts 的資料與呈現分離、互動操作和無障礙設計值得學習；若未來有大量時間序列或多圖分析需求，再重新評估完整套件。目前文章列表不需引入繪圖引擎。

原始摘要的「未偵測 SECURITY.md」不足以判定缺少安全政策；官方 Security 頁已提供安全通報方式。6.1.0 release 也記錄 tooltip XSS 修補，故熱門度、維護評分及自行編寫程式都不能作為沒有漏洞的保證。

官方來源（查閱日期：2026-09-08）：

- [Apache ECharts repository](https://github.com/apache/echarts)
- [Dataset：資料與呈現分離](https://echarts.apache.org/handbook/en/concepts/dataset/)
- [ARIA 與非顏色識別](https://echarts.apache.org/handbook/en/best-practices/aria/)
- [安全政策](https://github.com/apache/echarts/security)
- [安全指南](https://echarts.apache.org/handbook/en/best-practices/security/)
- [6.1.0 release](https://github.com/apache/echarts/releases/tag/6.1.0)

## 驗證狀態

最終範圍調整後，`git diff --check`、`npm run lint`、`npm run build` 均通過。prebuild 重新驗證 118 篇中文、20 篇英文文章，17 項既有測試與 2 項公開摘要測試全數通過，正式建置產生 460 個靜態頁面。

本機瀏覽器確認：長條圖已移除；鍵盤 Space 勾選標籤後正確篩出 21 篇，第二頁可切換，清除標籤後恢復 98 篇並回第一頁。未重做完整手機／輔助科技測試，也未量測正式環境效能。

本文件不沿用已取消圖表版本的測試與建置結果。使用者已授權部署，沿用既有 GitHub main → Vercel 流程；部署與正式環境驗證狀態以本次最終交付紀錄為準。未設定新分析事件或自動監控。
