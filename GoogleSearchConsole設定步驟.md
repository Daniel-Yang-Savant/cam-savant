# Google Search Console 設定步驟（camsavant.com）

> 目的：讓 Google 盡快收錄新網域、並能監看搜尋成效與索引狀況。
> 你的 DNS 在 Cloudflare，所以用「網域 (Domain) 資源」＋ DNS TXT 驗證最完整（一次涵蓋 http/https/www/所有子網域）。

---

## 1. 新增資源
1. 開 **https://search.google.com/search-console**，用你的 Google 帳號登入。
2. 左上角資源下拉 → **新增資源 (Add property)**。
3. 選左邊的 **「網域 (Domain)」** 類型 → 輸入 `camsavant.com` → 繼續。

## 2. 用 DNS 驗證（在 Cloudflare 加一筆 TXT）
4. Google 會給你一段 TXT 記錄值，形如：
   `google-site-verification=xxxxxxxxxxxxxxxxxxxx`　→ 複製它。
5. 到 **Cloudflare → camsavant.com → DNS → Records → Add record**：
   - **Type**：`TXT`
   - **Name**：`@`
   - **Content**：貼上剛複製的 `google-site-verification=...` 整串
   - **TTL**：Auto
   - （TXT 沒有 Proxy 選項，正常）
   - Save
6. 回 Search Console 按 **驗證 (Verify)**。
   - DNS 傳播通常幾分鐘；若顯示尚未生效，等幾分鐘再按一次。

## 3. 提交 Sitemap
7. 驗證通過後 → 左側 **Sitemaps（網站地圖）**。
8. 在欄位輸入 `sitemap.xml`（完整為 `https://camsavant.com/sitemap.xml`）→ **提交**。
   - 顯示「成功」即可，Google 會逐步抓取你的 70 篇文章。

## 4. 加速首頁收錄（選做）
9. 上方 **網址審查 (URL Inspection)** → 貼 `https://camsavant.com/` → 按 **要求建立索引 (Request Indexing)**。
   - 重要分類頁也可各做一次（/sports-medicine、/rehabilitation-medicine 等）。

---

## 補充

- **舊網域權重轉移**：`cam-savant.vercel.app` 已 308 轉址到 camsavant.com、且全站 canonical 指向新網域，Google 會自動把權重併到新網域，不用另外做「變更網址」工具（那是給可驗證的舊網域用，vercel.app 無法驗證）。
- **既有驗證碼**：程式裡已有一段 `google-site-verification` meta（`euJh5...`），那是「網址前綴」資源用的。本指南用的是更完整的「網域」資源 + DNS TXT，兩者可並存，建議以「網域」資源為主。
- **成效資料**：Search Console 的點擊／曝光資料約 1–3 天後開始累積，索引涵蓋率報告也要幾天才完整，初期看不到數據是正常的。
- **Bing 也建議做**：到 Bing Webmaster Tools 可直接「從 Google Search Console 匯入」，幾分鐘完成，多一個搜尋引擎來源。
