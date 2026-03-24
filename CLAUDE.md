# CLAUDE.md — CAM Savant 專案規則

## 管理員功能：衛教單張生成器

### 路由
- `/perioperative-rehab/pe-generator` — 管理員專用 AI 衛教單張生成頁面
- `/admin-login` — 管理員登入頁（設定 HttpOnly cookie `admin_token`，有效期 30 天）

### 權限架構
- middleware.ts 在 `/perioperative-rehab/pe-generator` 路由上檢查 `admin_token` cookie
- cookie 值需與環境變數 `ADMIN_SECRET` 相符
- 未通過驗證回傳 404（不 redirect，讓頁面不存在）
- 此邏輯與現有 `periop_access` 邏輯完全獨立

### 相關環境變數（需手動加到 .env.local 和 Vercel）
- `ANTHROPIC_API_KEY` — Claude API 金鑰
- `ADMIN_SECRET` — 管理員密碼（同時作為 cookie 值）

### API
- `POST /api/generate-pe` — 驗證 admin_token 後呼叫 Claude（`claude-sonnet-4-20250514`）生成 HTML 衛教單張
- `POST /api/admin-login` — 驗證密碼並設定 admin_token cookie

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
