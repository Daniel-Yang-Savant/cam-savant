import fs from 'fs';
import path from 'path';
import { checkArticleBeforePublish } from './publish-git';

const TOPICS_PATH = path.join(__dirname, 'topics.json');
const READY_DIR   = path.join(__dirname, '../drafts/ready');
const POSTS_DIR   = path.join(__dirname, '../content/posts');

const slug = process.argv.find(a => a.startsWith('--slug='))?.slice('--slug='.length);
if (!slug || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(slug)) {
  console.error("❌ 需提供 --slug=xxx");
  process.exit(1);
}

const source = path.join(READY_DIR, `${slug}.mdx`);
const dest   = path.join(POSTS_DIR, `${slug}.mdx`);

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);

  try {
    const publish = checkArticleBeforePublish(dest);

    // 將 topics.json 中對應項目標記為 done
    const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
    const updated = topics.map((t: { slug: string }) => t.slug === slug ? { ...t, done: true } : t);
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(updated, null, 2));

    publish(`feat: publish ${slug}`, [TOPICS_PATH]);
    console.log(`\n🚀 ${slug} 已成功發布並推送到 GitHub！`);
  } catch (error) {
    console.error('發布中止：', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
} else {
  console.error(`❌ 找不到草稿：drafts/ready/${slug}.mdx`);
  process.exitCode = 1;
}
