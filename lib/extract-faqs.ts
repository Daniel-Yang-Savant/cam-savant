import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'

interface FAQ {
  question: string
  answer: string
}

type ContentNode = {
  type: string
  depth?: number
  value?: string
  ordered?: boolean
  start?: number | null
  children?: ContentNode[]
}

// Parse the same MDX syntax as article rendering, without compiling or running it.
const parser = unified().use(remarkParse).use(remarkMdx)
const GENERIC_HEADING = /^(?:前言|導言|引言|序言|背景|結語|結論|小結|總結|參考文獻|參考資料|延伸閱讀|附錄|introduction|background|conclusions?|summary|references|appendix)(?:$|[\s：:？?—–-])/i
const CHINESE_QUESTION = /^(?:什麼|甚麼|為什麼|為何|何時|如何|怎麼|怎樣|哪些|哪一|是否|多久|多少|能否|可否)/

function isQuestion(heading: string): boolean {
  const text = heading.replace(/^(?:\d+|[一二三四五六七八九十]+)[.、)]\s*/, '')
  // English topic/command headings can start with "What" or "Do" too;
  // require their question mark instead of inferring an interrogative sentence.
  return !GENERIC_HEADING.test(text) && (
    /[？?]/.test(text) || CHINESE_QUESTION.test(text)
  )
}

function requiresRendering(node: ContentNode): boolean {
  // Omitting part of a conditional or illustrated answer could change its meaning.
  // Leave such sections out of automatic schema instead of guessing their output.
  return node.type.startsWith('mdx') || ['html', 'code', 'image', 'imageReference'].includes(node.type) ||
    Boolean(node.children?.some(requiresRendering))
}

function plainText(node: ContentNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? ''
  if (node.type === 'break') return '\n'
  if (node.type === 'definition') return ''
  if (node.type === 'thematicBreak') return '\n\n'

  const children = node.children ?? []
  if (node.type === 'list') {
    return children.map((child, index) => {
      const marker = node.ordered ? `${(node.start ?? 1) + index}.` : '-'
      const text = plainText(child).trim().replace(/\n/g, `\n${' '.repeat(marker.length + 1)}`)
      return `${marker} ${text}`
    }).join('\n') + '\n\n'
  }
  const text = children.map(plainText).join('')
  if (['paragraph', 'heading', 'blockquote'].includes(node.type)) return `${text.trim()}\n\n`
  return text
}

/** Extract genuine H2 questions and their complete, static answer sections. */
export function extractFAQsFromMDX(content: string): FAQ[] {
  let nodes: ContentNode[]
  try {
    nodes = parser.parse(content).children as ContentNode[]
  } catch {
    // Invalid or unsupported MDX must never produce invented structured answers.
    return []
  }

  const faqs: FAQ[] = []
  const seen = new Set<string>()
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.type !== 'heading' || node.depth !== 2 || requiresRendering(node)) continue
    const question = plainText(node).trim()
    if (!isQuestion(question) || seen.has(question)) continue

    let end = index + 1
    while (end < nodes.length && !(nodes[end].type === 'heading' && (nodes[end].depth ?? 7) <= 2)) end++
    const section = nodes.slice(index + 1, end)
    if (section.some(requiresRendering)) continue

    // Keep paragraphs, subheadings and every list item: medical qualifications
    // often follow a short introductory sentence and must not be truncated.
    const answer = section.map(plainText).join('').replace(/\n{3,}/g, '\n\n').trim()
    if (answer.length < 20) continue
    faqs.push({ question, answer })
    seen.add(question)
    if (faqs.length === 6) break
  }
  return faqs
}
