# 每月 Token 輪換 SOP

> 目的：更新舊式 `/perioperative-rehab` 連結的隨機兌換碼。兌換碼更新只會使舊連結失效，不會撤銷已簽發的三十天 cookie。日常優先使用管理員工具產生十分鐘有效的短效 QR。

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

   https://camsavant.com/perioperative-rehab/access?token=<隨機兌換碼>

📋 下一步：
   1. 複製上方網址
   2. 使用離線或院內可信的 QR Code 工具
   3. 產生 → 下載 → 印出；不把完整存取網址上傳到第三方
   4. 更換診間 QR Code 告示牌
```

---

## Token 格式

```
32 bytes 安全亂數的 base64url（43 字元）
```

每次執行都產生新碼，不使用可推算的年月字串。

---

## 流程說明

```
npm run rotate-token
      │
      ├─ [1/3] 查找 Vercel 上的 PERIOP_ACCESS_TOKEN env var
      │
      ├─ [2/3] PATCH 更新為新的安全隨機兌換碼
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
- 新版患者 cookie 使用獨立私有密鑰簽章，最長有效三十天；輪替兌換碼不會撤銷它。
- 如需使全部患者 cookie／短效 QR 立即失效，輪替 `PERIOP_SIGNING_SECRET`。未設定專用密鑰時改用 `ADMIN_SECRET`，更換它也會使管理員 session 失效。
- 請確認正式環境有 `PERIOP_SIGNING_SECRET` 或 `ADMIN_SECRET`，且不與兌換碼相同。此工具不應執行於測試流程；會更新正式環境並觸發部署。
