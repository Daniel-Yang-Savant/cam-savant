# CAM Savant

> 運動醫學・功能醫學・FSM — 整合醫學知識部落格

## 技術棧

| 項目 | 技術 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + @tailwindcss/typography |
| Content | MDX（next-mdx-remote）|
| Language | TypeScript |
| Deployment | Vercel |

---

## 快速開始

```bash
# 安裝依賴
npm install

# 本地開發
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可預覽。

---

## 撰寫新文章

### 步驟 1：新增 MDX 檔案

在 `content/posts/` 目錄建立新的 `.mdx` 檔案，檔名即為文章的 URL slug：

```
content/posts/my-new-article.mdx
→ 網址：/posts/my-new-article
```

### 步驟 2：填寫 frontmatter

```mdx
---
title: "文章標題"
date: "2024-03-15"
category: "sports-medicine"
excerpt: "文章摘要，顯示於卡片、列表與 SEO description（建議 80–120 字）"
coverImage: "/images/posts/your-image.jpg"
---

## 文章內容

在這裡以標準 Markdown 撰寫文章...
```

### 分類（`category`）對照

| 值 | 導覽列顯示名稱 | 對應頁面 |
|----|-------------|---------|
| `sports-medicine` | 運動醫學 | `/sports-medicine` |
| `functional-medicine` | 功能醫學 | `/functional-medicine` |
| `fsm` | FSM | `/fsm` |

### 步驟 3：上傳封面圖片

1. 將圖片（建議 1200×800px，JPG/WebP）放入 `public/images/posts/`
2. 在 frontmatter 的 `coverImage` 填入路徑：

```yaml
coverImage: "/images/posts/your-image.jpg"
```

> `coverImage` 為選填欄位。若未填寫，卡片與文章頁將顯示帶有分類名稱的佔位框。

---

## 專案結構

```
cam-savant/
├── app/                         # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx               # 根佈局（Navbar + Footer）
│   ├── page.tsx                 # 首頁（Hero + 最新文章）
│   ├── about/page.tsx           # 關於頁面
│   ├── posts/
│   │   ├── page.tsx             # 全部文章列表
│   │   └── [slug]/page.tsx      # 文章內頁
│   ├── fsm/page.tsx             # FSM 分類頁
│   ├── sports-medicine/         # 運動醫學分類頁
│   └── functional-medicine/     # 功能醫學分類頁
│
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx                 # 首頁大圖 Hero 區
│   ├── ArticleCard.tsx          # 文章卡片
│   └── PostList.tsx             # 文章列表 + 分類篩選
│
├── content/posts/               # ✏️  在此新增 .mdx 文章
│
├── lib/
│   └── posts.ts                 # 文章讀取工具函式
│
└── public/
    └── images/posts/            # 🖼️  在此放置封面圖片
```

---

## 部署到 Vercel

1. 將專案推送到 GitHub（公開或私有倉庫均可）
2. 前往 [vercel.com](https://vercel.com) 點擊 **Add New Project**
3. 匯入 GitHub 倉庫，框架會**自動偵測**為 Next.js
4. 點擊 **Deploy**，約 1–2 分鐘完成

每次 push 到 `main` 分支都會自動觸發重新部署。

---

## 更新文章內容後的注意事項

Vercel 採用靜態生成（SSG）。新增或修改文章後需重新部署：

```bash
git add content/posts/
git commit -m "add: new article"
git push
```

Vercel 會自動偵測並觸發重新建置。

---

## 公開文章檢查、隱私分析與段落導覽

2026-10-25 補強，本次新增範圍：

- 借鏡 [claude-seo](https://github.com/AgriciDaniel/claude-seo) 的分項稽核：`scripts/seo-audit/articles.ts` 檢查每篇已發布公開文章的建置 HTML、canonical、索引設定、H1、Article 網址／標題／日期與 sitemap。正式發布流程以 `npm run audit:articles` 獨立執行，報告寫入 `.seo-audit/public-articles.json`，避免連帶發布先前尚未上線的院區／schema 修改。原本本機 local-care 基準工具保持獨立，不將文章混入舊基準。
- 借鏡 [Plausible 的資料最小化](https://plausible.io/data-policy)與[自訂事件](https://plausible.io/docs/custom-event-goals)：沿用 GA4／Vercel Analytics，新增瀏覽器 DNT／GPC 停送與延後載入。事件名稱及六個屬性欄位由共用清單驗證，屬性只接受最多 120 字元的英數識別碼（必須以英文字母起首）及限定語系；拒絕自由文字、網址、email、純數字電話與編碼字串。這是格式防護，呼叫端仍只能傳公開內容識別碼，不能傳個資。未新增 Plausible 服務或設定。
- 借鏡 [Clarify 的文件閱讀與穩定連結](https://github.com/taicode-labs/clarify)：中英文文章使用共用的安全 MDX 標題處理，支援格式化標題與重複標題的唯一段落網址，每段提供原生 `#` 連結。目錄只收文章正文，支援分段載入、切換文章後更新、鍵盤焦點與減少動畫偏好；長目錄可獨立捲動，列印隱藏段落連結符號。保留 `SafeMdx`、`blockJS: true` 與 HTML 過濾。

**患者問題與假設**：讀者需要準確跳到、分享衛教段落，並在尊重隱私偏好的前提下完成看診資訊操作。這批屬 P2 結構補強，以發布檢查降低回歸風險，以手動閱讀驗證評估導覽可用性；未改醫療正文、日期、醫師資格或門診資訊，未新增臨床宣稱，亦未安裝三個上游專案。

**資料與量測**：已有 `output/seo-links-2026-10-20/gsc-baseline.json` 的 2026-09-20 至 10-17 搜尋背景資料（98 次點擊、2,942 次曝光，非本次修改後的成效）。尚未取得本次部署前最新 GA4／Vercel 資料。部署時保存最近 28／56 天搜尋與既有看診行動資料，於實際部署後 28／56／84 天比較；尊重退出追蹤後事件數可能降低，不將此變化直接解讀為就醫需求下降。未建立排程，未宣稱排名、流量或轉換改善。

**驗證紀錄**：`output/project-learning-2026-10-25/verification.json` 記錄本次檔案、測試、建置、來源與限制。上游來源查閱日期：2026-10-25。


---

*本站內容僅供醫療專業人員參考，不構成個別診療建議。*
