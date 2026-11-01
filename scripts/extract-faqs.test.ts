import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import matter from 'gray-matter'
import { extractFAQsFromMDX } from '../lib/extract-faqs'
import { generateFAQSchema } from '../lib/schema'

test('topic headings do not crowd out genuine questions later in an article', () => {
  const topics = ['前言：什麼是疼痛？', '認識膝關節', '分期復健', '運動治療：基礎訓練', '追蹤安排', '研究限制']
    .map(heading => `## ${heading}\n\n這是足夠長的背景介紹，但它並不是要自動擷取成常見問題的段落。`).join('\n\n')
  const faqs = extractFAQsFromMDX(`${topics}\n\n## 何時需要重新評估？\n\n依原本的診斷與症狀反應決定，出現新的功能變化時應和醫療團隊討論。`)
  assert.deepEqual(faqs.map(faq => faq.question), ['何時需要重新評估？'])
})

test('answers keep every condition, nested list, subheading and subsequent qualification', () => {
  const [faq] = extractFAQsFromMDX(`## 哪些條件需要一起評估？

以下條件需要一起考慮，不能只看單一項目：

- 受傷經過與目前功能
- 可配合的治療安排
  - 工作與活動需求
  - 先前處置反應

### 仍需確認的情況

若症狀改變，原本的安排仍可能需要重新調整。
這段延續同一個段落的限制，不可只留下前面那句引言。

## 其他資訊

這是下一節，不屬於上面的問題。`)
  assert.ok(faq)
  for (const text of ['受傷經過與目前功能', '可配合的治療安排', '工作與活動需求', '先前處置反應', '仍需確認的情況', '不可只留下前面那句引言']) assert.ok(faq.answer.includes(text))
  assert.match(faq.answer, /\n  - 工作與活動需求/)
  assert.doesNotMatch(faq.answer, /這是下一節/)
  assert.equal(generateFAQSchema([faq])?.mainEntity[0].acceptedAnswer.text, faq.answer)
})

test('formatting, reference links, parenthesized URLs and entities retain readable text', () => {
  const [faq] = extractFAQsFromMDX(`## **How** is \`progress\` assessed?

Use [the published source](https://example.org/research(2026)) and [the follow-up guide][guide].
The value is &lt; 10, and a second observation is still necessary.

[guide]: https://example.org/guide
`)
  assert.equal(faq?.question, 'How is progress assessed?')
  assert.match(faq.answer, /the published source and the follow-up guide/)
  assert.match(faq.answer, /value is < 10/)
  assert.doesNotMatch(faq.answer, /https:|\[guide\]|\*\*/)
})

test('headings inside code or quotes never become questions and H1 ends an answer', () => {
  const source = '```md\n## Is this a question?\nThis code example must never become FAQ data.\n```\n\n' +
    '> ## Is this quoted heading a question?\n> Quoted examples are not article question headings.\n\n' +
    '## 如何觀察進展\n\n記錄重要活動的變化，並保留原先的適用條件，才能和醫療團隊討論下一步。\n\n' +
    '# 附錄\n\n這一段不屬於前面的答案，也不應出現在 FAQ。'
  const faqs = extractFAQsFromMDX(source)
  assert.equal(faqs.length, 1)
  assert.equal(faqs[0].question, '如何觀察進展')
  assert.doesNotMatch(faqs[0].answer, /附錄|不屬於/)
})

test('six-question limit applies only after filtering and duplicate questions are omitted', () => {
  const source = Array.from({ length: 8 }, (_, index) => `## Question ${index + 1}?

This is the complete answer with the necessary context for question ${index + 1}.`).join('\n\n')
  const duplicate = '## Question 1?\n\nThis duplicate should not consume another FAQ position.\n\n'
  const faqs = extractFAQsFromMDX(duplicate + source)
  assert.equal(faqs.length, 6)
  assert.deepEqual(faqs.map(faq => faq.question), Array.from({ length: 6 }, (_, index) => `Question ${index + 1}?`))
})

test('MDX expressions, components, images and code never yield partial or executable answers', () => {
  for (const body of [
    'This introductory sentence alone is not a complete answer.\n\n<ClinicalDecision />',
    'This answer depends on {globalThis.__faq_should_never_run = true}.',
    'This answer requires the following diagram.\n\n![Essential conditions](/diagram.png)',
    'This answer requires an example.\n\n```js\nthrow new Error("never run")\n```',
    'A rendered note <span hidden>hidden qualification</span> changes what readers see.',
  ]) assert.deepEqual(extractFAQsFromMDX(`## Can this be extracted?\n\n${body}`), [])
  assert.equal(Object.hasOwn(globalThis, '__faq_should_never_run'), false)
  assert.deepEqual(extractFAQsFromMDX('## Is this malformed?\n\n<Unclosed>'), [])
})

test('ordinary topic articles produce no artificial FAQ schema', () => {
  const faqs = extractFAQsFromMDX('## 前言\n\n這篇介紹一般背景與研究限制，並沒有以問答形式提供內容。\n\n## 治療原則：個別化安排\n\n這是主題式說明，冒號不應把它自動變成問句。')
  assert.deepEqual(faqs, [])
  assert.equal(generateFAQSchema(faqs), null)
})

test('English commands, topic phrases and introductory headings remain outside FAQ data', () => {
  for (const heading of ['Do not exercise during fever', 'What we know about rehabilitation', '前言——治療有效嗎？', '一、前言：如何安排復健？']) {
    assert.deepEqual(extractFAQsFromMDX(`## ${heading}\n\nThis paragraph is long enough to be extracted, but its heading is not an actual article question.`), [])
  }
})

test('PCL eligibility and return-to-sport answers retain their lists and qualifications', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'content/posts/partial-pcl-tear-nonoperative-treatment.mdx'), 'utf8')
  const faqs = extractFAQsFromMDX(matter(source).content)
  const eligibility = faqs.find(faq => faq.question.startsWith('哪些人適合'))
  assert.ok(eligibility)
  assert.match(eligibility.answer, /MRI|核磁/)
  assert.match(eligibility.answer, /支架/)
  assert.match(eligibility.answer, /復健/)
  const returnToSport = faqs.find(faq => faq.question.startsWith('何時可以回場'))
  assert.ok(returnToSport)
  assert.match(returnToSport.answer, /穩定度/)
  assert.match(returnToSport.answer, /力量/)
  assert.match(returnToSport.answer, /心理/)
  assert.ok(faqs.some(faq => faq.question.startsWith('為什麼不痛了')))
  assert.ok(faqs.every(faq => !faq.question.startsWith('前言')))
})
