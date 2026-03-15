# 每月 Token 輪換 SOP

> 目的：每月自動更換 `/perioperative-rehab` 的存取 token，確保 QR Code 連結每月失效，只有持有當月 QR Code 的患者可進入。

---

## 首次設定（只需做一次）

在專案根目錄建立 `.env.local`（**不會被 git 追蹤**），填入：

```
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_TEAM_ID=                        # 個人帳號留空，team 帳號填入
```

### 如何取得這些值

| 變數 | 取得位置 |
|------|---------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create Token |
| `VERCEL_PROJECT_ID` | Vercel → 專案 → Settings → General → **Project ID** |
| `VERCEL_TEAM_ID` | Vercel → Team Settings → General → **Team ID**（個人帳號不需要）|

---

## 每月一日執行

```bash
cd ~/Desktop/cam-savant
npm run rotate-token
```

執行後 terminal 會印出：

```
═══════════════════════════════════════════════════════════
✅ Token 輪換完成！
═══════════════════════════════════════════════════════════

📅 月份：2026-04

🔗 新的 QR Code 網址（複製後產生 QR Code）：

   https://cam-savant.vercel.app/perioperative-rehab/access?token=camSavant-2026-04

📋 下一步：
   1. 複製上方網址
   2. 前往 https://qr.io 或任意 QR Code 產生器
   3. 貼上網址 → 產生 → 下載 → 印出
   4. 更換診間 QR Code 告示牌
```

---

## Token 格式

```
camSavant-YYYY-MM
```

例如：
- 2026 年 4 月 → `camSavant-2026-04`
- 2026 年 12 月 → `camSavant-2026-12`

---

## 流程說明

```
npm run rotate-token
      │
      ├─ [1/3] 查找 Vercel 上的 PERIOP_ACCESS_TOKEN env var
      │
      ├─ [2/3] PATCH 更新為本月 token（camSavant-YYYY-MM）
      │
      ├─ [3/3] 觸發 Vercel production redeploy
      │
      └─ 印出新的 QR Code 網址 → 手動產生 QR Code → 印出換貼
```

Redeploy 約需 **1–2 分鐘**，完成後新 token 正式生效，舊 QR Code 連結即失效。

---

## 注意事項

- `.env.local` 含有高權限的 `VERCEL_TOKEN`，**請勿 commit 到 git**（`.gitignore` 已排除）
- 若 Redeploy 失敗，可手動到 Vercel Dashboard → Deployments → Redeploy
- 患者瀏覽器中的舊 cookie（`periop_access`）在 redeploy 後仍有效（30 天），cookie 本身不含 token 內容，無資安疑慮
