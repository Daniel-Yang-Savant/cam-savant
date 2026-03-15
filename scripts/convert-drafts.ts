import fs from 'fs';
import path from 'path';

const RAW_DIR   = path.join(__dirname, '../drafts/raw');
const READY_DIR = path.join(__dirname, '../drafts/ready');
const TOPICS_PATH = path.join(__dirname, 'topics.json');

const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));

const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.txt'));

files.forEach(file => {
  const slug  = file.replace('.txt', '');
  const topic = topics.find((t: any) => t.slug === slug);
  if (!topic) return;

  const rawContent = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8');

  const excerpt =
    rawContent
      .split('\n')
      .find(l => l.trim().length > 30)
      ?.substring(0, 120)
      .replace(/"/g, "'") || "";

  let finalContent = rawContent;
  if (rawContent.includes('[1]') && !rawContent.toLowerCase().includes('reference')) {
    finalContent += "\n\n## References\n*(請從 OpenEvidence 複製對應文獻連結至此)*";
  }

  const mdx = `---
title: "${topic.title}"
date: "${new Date().toISOString().split('T')[0]}"
category: "perioperative-rehab"
excerpt: "${excerpt}..."
---
> ⚠️ 草稿：以下內容來自 OpenEvidence，請醫師審閱後再發布

${finalContent}`;

  fs.writeFileSync(path.join(READY_DIR, `${slug}.mdx`), mdx);
  console.log(`✅ 已生成草稿：${slug}.mdx`);
});
