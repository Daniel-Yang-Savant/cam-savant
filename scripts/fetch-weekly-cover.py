#!/usr/bin/env python3
"""
每週論文精選封面抓取器（使用 Pexels，符合 16:9 / 1792x1024 規範）

用法（在專案根目錄執行）：
    python3 scripts/fetch-weekly-cover.py
    python3 scripts/fetch-weekly-cover.py --slug weekly-sports-medicine-2026-07-05 --query "sports medicine physiotherapy"

它會：
1. 讀取 .env 的 PEXELS_API_KEY
2. 依關鍵字搜尋橫向照片，取符合比例的高解析結果
3. 下載並裁切成 1792x1024 JPG，存到 public/images/covers/<slug>.jpg
4. 自動把 content/posts/<slug>.mdx 的 coverImage 指到該檔
5. 印出攝影師與 Pexels 出處（建議於頁面或頁尾標註）

不喜歡這張？換個 --query 或加 --page 2 再跑一次即可。
"""
import argparse, json, os, re, sys, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_key():
    for fn in (".env.local", ".env"):
        p = os.path.join(ROOT, fn)
        if os.path.exists(p):
            for line in open(p, encoding="utf-8"):
                if line.startswith("PEXELS_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("找不到 PEXELS_API_KEY（請確認 .env 有設定）")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="weekly-sports-medicine-2026-07-05")
    ap.add_argument("--query", default="sports medicine physiotherapy rehabilitation")
    ap.add_argument("--page", type=int, default=1)
    ap.add_argument("--pick", type=int, default=0, help="選第幾張（0 起算）")
    args = ap.parse_args()

    key = load_key()
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": args.query, "orientation": "landscape", "per_page": 15, "page": args.page}
    )
    req = urllib.request.Request(url, headers={"Authorization": key})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    photos = data.get("photos", [])
    if not photos:
        sys.exit(f"查無結果：{args.query}")

    # 優先挑寬度足夠（>=1792）的橫向照片
    cand = [p for p in photos if p.get("width", 0) >= 1792 and p.get("width", 0) >= p.get("height", 0)] or photos
    p = cand[min(args.pick, len(cand) - 1)]

    img_url = p["src"]["original"] + "?auto=compress&cs=tinysrgb&fit=crop&w=1792&h=1024&fm=jpg&q=90"
    covers = os.path.join(ROOT, "public", "images", "covers")
    os.makedirs(covers, exist_ok=True)
    out = os.path.join(covers, f"{args.slug}.jpg")
    urllib.request.urlretrieve(img_url, out)
    print(f"✓ 已下載封面：public/images/covers/{args.slug}.jpg  ({os.path.getsize(out)//1024} KB)")

    # 更新 MDX 的 coverImage
    mdx = os.path.join(ROOT, "content", "posts", f"{args.slug}.mdx")
    if os.path.exists(mdx):
        txt = open(mdx, encoding="utf-8").read()
        new = re.sub(r'coverImage:\s*"[^"]*"', f'coverImage: "/images/covers/{args.slug}.jpg"', txt, count=1)
        open(mdx, "w", encoding="utf-8").write(new)
        print(f"✓ 已更新 {os.path.relpath(mdx, ROOT)} 的 coverImage")

    print(f"\n出處（Pexels，建議標註）：{p.get('photographer')} — {p.get('url')}")

if __name__ == "__main__":
    main()
