/**
 * tables-to-lists.ts
 * 將 content/posts/ 中所有 perioperative-rehab 文章的
 * Markdown 表格轉換為 bullet list 清單格式。
 *
 * 2-column table:
 *   | 指標 | 目標 |  →  - **指標值**：目標值
 *
 * 3-column table:
 *   | 項目 | A | B |  →  - **項目值**：A_header：A值；B_header：B值
 *
 * 用法：ts-node scripts/tables-to-lists.ts
 */

import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');

// 解析表格行的每個儲存格（去掉首尾空 cell）
function parseCells(line: string): string[] {
  return line
    .split('|')
    .map(c => c.trim())
    .filter((_, i, arr) => i > 0 && i < arr.length - 1);
}

// 判斷是否為分隔線行（|---|---|）
function isSeparator(line: string): boolean {
  const cells = parseCells(line);
  return cells.length > 0 && cells.every(c => /^:?-{1,}:?$/.test(c));
}

// 將一個表格區塊（行陣列）轉為清單字串
function tableToList(tableLines: string[]): string {
  if (tableLines.length === 0) return '';

  const headers = parseCells(tableLines[0]);
  const items: string[] = [];

  for (let i = 1; i < tableLines.length; i++) {
    if (isSeparator(tableLines[i])) continue;
    const cells = parseCells(tableLines[i]);
    if (cells.length === 0) continue;

    if (headers.length === 2) {
      // 2-column: - **col0**：col1
      items.push(`- **${cells[0] ?? ''}**：${cells[1] ?? ''}`);
    } else if (headers.length >= 3) {
      // 3-column: - **col0**：header1：val1；header2：val2
      const rest = headers
        .slice(1)
        .map((h, idx) => `${h}：${cells[idx + 1] ?? ''}`)
        .join('；');
      items.push(`- **${cells[0] ?? ''}**：${rest}`);
    }
  }

  return items.join('\n');
}

// 處理單一 MDX 檔案
function processContent(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 偵測表格起始行
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|')
      ) {
        tableLines.push(lines[i]);
        i++;
      }

      const listStr = tableToList(tableLines);
      if (listStr) {
        // 確保清單前有空行
        if (out.length > 0 && out[out.length - 1] !== '') out.push('');
        out.push(listStr);
        // 確保清單後有空行
        if (i < lines.length && lines[i] !== '') out.push('');
      }
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join('\n');
}

// 主流程
function main() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .sort();

  const modified: string[] = [];

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const original = fs.readFileSync(filePath, 'utf-8');

    if (!original.includes('category: "perioperative-rehab"')) {
      console.log(`⏭  略過（非 perioperative-rehab）：${file}`);
      continue;
    }

    const updated = processContent(original);

    if (updated !== original) {
      fs.writeFileSync(filePath, updated, 'utf-8');
      modified.push(file);
      console.log(`✅ 已轉換：${file}`);
    } else {
      console.log(`✔  無表格：${file}`);
    }
  }

  console.log('\n─────────────────────────────────');
  if (modified.length === 0) {
    console.log('所有檔案均無表格，未做任何修改。');
  } else {
    console.log(`共修改 ${modified.length} 個檔案：`);
    modified.forEach(f => console.log(`  • ${f}`));
  }
}

main();
