# camsavant.com → Cloudflare 註冊 → 綁定 Vercel　操作指南

> 你要親自操作的部分：建立帳號、付款購買、設定 2FA（基於帳號安全，這些無法代做）。
> 做完之後的 DNS 驗證、以及把網站程式裡的舊網址改成新網域，可以交給我。

---

## A. 在 Cloudflare 註冊 camsavant.com

1. 開 **https://dash.cloudflare.com** → 註冊或登入（免費帳號即可）。
2. 左側選單 → **Domain Registration** → **Register Domains**。
3. 搜尋 `camsavant.com` → 確認價格（.com 約 US$10/年、續約同價不漲）→ 加入購物車 → 填付款資料 → 完成購買。

> Cloudflare 預設就幫你做好的（不用另外找開關）：
> - ✅ **WHOIS 隱私保護**：免費、自動隱藏個資
> - ✅ **Registrar / Transfer Lock**：預設鎖定，防止網域被盜轉
> - ✅ **自動續約**：預設開啟（可在 Domain Registration → Manage 內確認 Auto-renew 為 On）

---

## B. 開啟帳號 2FA（務必做）

1. 右上角頭像 → **My Profile** → **Authentication** 分頁。
2. **Two-Factor Authentication** → Enable。
3. 用手機 App（Google Authenticator / Authy 等）掃 QR 綁定。
4. **把備援碼（backup codes）抄下來存好**，手機遺失時才進得去。

---

## C. 綁定到 Vercel

1. Vercel → 你的專案（cam-savant）→ **Settings** → **Domains**。
2. 輸入 `camsavant.com` → **Add**。
3. Vercel 會顯示需要設定的 DNS 記錄，通常為：
   - 主網域 `camsavant.com` → **A 記錄**，值 **76.76.21.21**
   - `www.camsavant.com` → **CNAME**，值 **cname.vercel-dns.com**
   - ⚠️ 以 Vercel 畫面實際顯示的值為準（IP 可能調整）。
4. 回 **Cloudflare** → 點進 camsavant.com → **DNS** → **Records** → **Add record**，把上面兩筆加進去。
   - **Proxy status 設成「DNS only」（灰色雲朵，不要橘色）**，讓 Vercel 自行簽發 SSL，避免雙層代理造成憑證或轉址錯誤。
5. 回 Vercel 的 Domains 頁面等候，狀態變成綠色 **Valid Configuration** 即完成。
   - DNS 生效通常幾分鐘～數小時。

---

## D. 收尾設定

1. Vercel → Domains → 把 `camsavant.com` 設為 **Primary**，舊的 vercel.app 會自動 301 轉址到新網域（保留 SEO 權重）。
2. 確認 `https://camsavant.com` 與 `https://www.camsavant.com` 都能開、且自動上 HTTPS。

---

## E. 網站程式內的網址更新（交給我）

網站多處寫死了 `https://cam-savant.vercel.app`，需要改成 `https://camsavant.com`，包含：
- `app/layout.tsx`（metadataBase、JSON-LD 的 url/logo/@id）
- `app/sitemap.ts`、`app/robots.ts`、`app/feed.xml`、`app/llms-full.txt`
- 各分類頁與文章頁的 `BASE_URL`

➡️ 網域上線後跟我說一聲，我會全站替換並驗證（typecheck），再給你 commit 指令。

---

## 資安檢查清單（完成後逐項確認）

- [ ] WHOIS 隱私保護：已啟用（Cloudflare 自動）
- [ ] 2FA：Cloudflare 帳號已開、備援碼已保存
- [ ] Transfer Lock：已鎖定（Cloudflare 預設）
- [ ] 自動續約：已開啟
- [ ] Vercel 已驗證網域、HTTPS 正常
- [ ] 舊網址 301 轉址到新網域正常
