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
│   ├── page.tsx                 # 首頁（Hero + 最新文章 + 精選閱讀）
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
│   ├── FeaturedReadingList.tsx  # 精選閱讀清單
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

*本站內容僅供醫療專業人員參考，不構成個別診療建議。*
