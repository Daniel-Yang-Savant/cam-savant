import fs from 'fs';
import path from 'path';

const TOPICS_PATH = path.join(__dirname, 'topics.json');
const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));

// 優先取清單中最舊（最前面）且 done 為 false 的 3 個
const todayTasks = topics.filter((t: any) => !t.done).slice(0, 3);

console.log("\n========================================");
console.log("📋 今日 OpenEvidence 查詢建議 (優先處理舊項)");
console.log("========================================");

if (todayTasks.length === 0) {
  console.log("✨ 恭喜！所有待辦主題皆已完成。");
} else {
  todayTasks.forEach((task: any, index: number) => {
    console.log(`\n【主題 ${index + 1}】${task.title}`);
    console.log(`👉 Prompt: "Please provide an evidence-based clinical rehabilitation protocol for ${task.query}. Focus on: Precautions, Phase-based progression, and LSI thresholds. Use citations [1], [2]."`);
    console.log(`💾 儲存路徑: drafts/raw/${task.slug}.txt`);
  });
}

console.log("\n========================================\n");
