# CLAUDE.md — CAM Savant 專案規則

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
