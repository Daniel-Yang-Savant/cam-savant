import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TOPICS_PATH = path.join(__dirname, 'topics.json');
const READY_DIR   = path.join(__dirname, '../drafts/ready');
const POSTS_DIR   = path.join(__dirname, '../content/posts');

const slug = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1];
if (!slug) {
  console.error("❌ 需提供 --slug=xxx");
  process.exit(1);
}

const source = path.join(READY_DIR, `${slug}.mdx`);
const dest   = path.join(POSTS_DIR, `${slug}.mdx`);

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);

  // 將 topics.json 中對應項目標記為 done
  const topics  = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const updated = topics.map((t: any) => t.slug === slug ? { ...t, done: true } : t);
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(updated, null, 2));

  try {
    execSync(`git add ${dest} ${TOPICS_PATH}`);
    execSync(`git commit -m "feat: publish ${slug}"`);
    execSync(`git push`);
    console.log(`\n🚀 ${slug} 已成功發布並推送到 GitHub！`);
  } catch (e) {
    console.error("Git 失敗:", e);
  }
} else {
  console.error(`❌ 找不到草稿：drafts/ready/${slug}.mdx`);
}
