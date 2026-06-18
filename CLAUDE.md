# CLAUDE.md — CAM Savant 專案規則

## 管理員功能：文章編輯器

> 註：原「衛教單張生成器」(`/perioperative-rehab/pe-generator` + `/api/generate-pe`) 已移除，
> 正式環境不再需要 `ANTHROPIC_API_KEY`（僅本機 `scripts/publish-from-pdf.ts` 會用）。

### 路由
- `/admin/editor` — 管理員專用文章編輯器
- `/admin-login` — 管理員登入頁（設定 HttpOnly cookie `admin_token`，有效期 30 天）

### 權限架構
- middleware.ts 對 `/admin/**` 與 `/api/admin/**` 檢查 `admin_token` cookie
- cookie 值需與環境變數 `ADMIN_SECRET` 相符
- 未通過驗證：頁面回傳 404、API 回傳 401
- 此邏輯與現有 `periop_access` 邏輯完全獨立

### 相關環境變數（需手動加到 .env.local 和 Vercel）
- `ADMIN_SECRET` — 管理員密碼（同時作為 cookie 值）；建議在 Vercel 標記為 Sensitive
- `PERIOP_ACCESS_TOKEN` — 術後復健頁存取碼

### API
- `POST /api/admin-login` — 驗證密碼並設定 admin_token cookie
- `GET/POST /api/admin/articles` — 文章管理（需 admin_token）

---

## 封面圖片風格規範（運動醫學 & 復健醫學）

適用文章類別：`sports-medicine`、`rehabilitation`、以及所有運動傷害防治、復健科相關文章。

### 整體視覺風格
- **攝影等級**：達商業廣告 / 醫學期刊封面水準，photorealistic
- **色調**：以暖金色（golden hour）為基調，或電影感冷藍色（醫療/解剖題材）；避免過度飽和的卡通色彩
- **構圖**：橫幅 16:9，主體清晰、背景適度虛化（淺景深）
- **格式**：輸出 JPG，命名與文章 slug 完全一致，存放於 `/public/images/covers/`

### 三種核心圖像類型（各文章選擇最合適的一種）

**① 戲劇性運動攝影**（適合運動項目傷害防治、訓練相關文章）
- 運動員在真實場景中的高張力動作瞬間
- 黃金時刻側光或逆光，戲劇感強
- 例：足球大力射門、馬拉松人群、攀岩粉筆特寫
- 提示詞關鍵字：`cinematic sports photography, golden hour lighting, motion blur, shallow depth of field, photorealistic`

**② 臨床醫療場景**（適合治療、復健、評估相關文章）
- 醫師或物理治療師與患者互動的真實診間/治療室場景
- 明亮自然採光，乾淨專業環境
- 例：貼紮、衝擊波治療、手法治療
- 提示詞關鍵字：`sports medicine clinic, natural window light, professional medical photography, Asian doctor, photorealistic`

**③ 解剖 3D 渲染**（適合生理機制、症候群、免疫/神經相關文章）
- 透明/半透明人體，可見骨骼、肌肉、器官或免疫細胞
- 深色背景（深褐或深海軍藍），發光效果突顯重點結構
- 例：過度訓練（肌肉發光）、免疫力（免疫細胞巡邏）
- 提示詞關鍵字：`3D medical illustration render, transparent human body, glowing anatomy, dark navy background, cinematic`

### 差異化原則（同批文章之間）
- 同一批次的圖片，三種類型應均勻分配，避免連續多張同類型
- 主角性別、年齡、族裔應多元輪替（女性、男性、中高齡、不同族裔）
- 主色調輪替：暖金 → 冷藍 → 暗棕 → 戶外自然綠
- 景別輪替：全身動作 → 局部特寫 → 靜物平鋪 → 環境場景

### 生成工具建議
- 使用 **Google Gemini**（AI Studio）生成，解析度 1792×1024（16:9）
- 生成後以 PIL 轉為 JPG（quality=90）並依 slug 命名
- 提示詞一律用**英文**撰寫

---

## MDX 內容規則

**RULE: Never use Markdown tables (`|` syntax) in MDX files.**
Always use bold headings + paragraph format instead.

❌ 錯誤（禁止）：
```
| 面向 | 通過標準 |
|------|----------|
| Pain | VAS ≤ 1/10 |
```

✅ 正確（使用此格式）：
```
**P — Pain（疼痛）**
運動中無疼痛，VAS ≤ 1/10

**A — Ankle Impairments（關節狀態）**
活動度與健側對稱，肌力 ≥ 健側 90%
```
