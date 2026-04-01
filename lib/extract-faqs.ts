/**
 * Extract FAQ-like Q&A pairs from MDX content.
 *
 * Strategy: treat each H2 heading as a "question" and the first
 * non-empty paragraph after it as the "answer". This maps naturally
 * to the way our medical articles are structured (e.g. "什麼是 FSM？"
 * followed by an explanatory paragraph).
 *
 * Only headings that look like questions (contain ？, ：, or 嗎) or
 * are phrased as topic introductions are included, up to a maximum
 * of 6 FAQs per article to keep schema concise.
 */

interface FAQ {
  question: string
  answer: string
}

export function extractFAQsFromMDX(content: string): FAQ[] {
  const lines = content.split('\n')
  const faqs: FAQ[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Match H2 headings: ## Some heading text
    const h2Match = line.match(/^##\s+(.+)$/)
    if (!h2Match) continue

    const heading = h2Match[1]
      .replace(/\*\*/g, '')  // strip bold markers
      .trim()

    // Skip generic section titles that aren't useful as FAQ questions
    if (/^(結語|結論|參考文獻|References|延伸閱讀|附錄)$/i.test(heading)) continue

    // Collect the first paragraph after the heading
    let answer = ''
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim()

      // Skip empty lines and horizontal rules
      if (nextLine === '' || nextLine === '---') continue

      // Stop if we hit another heading
      if (/^#{1,3}\s/.test(nextLine)) break

      // Skip non-paragraph lines (lists, tables, blockquotes, code blocks)
      if (/^[-*>|`]/.test(nextLine) || /^\d+\./.test(nextLine)) {
        // If we already have some answer text, stop here
        if (answer) break
        continue
      }

      // Found a paragraph line
      answer = nextLine
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // strip bold
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // strip links
        .replace(/[`~]/g, '')  // strip code/strikethrough markers
        .trim()
      break
    }

    if (answer && answer.length >= 20) {
      faqs.push({ question: heading, answer })
    }

    // Limit to 6 FAQs per article
    if (faqs.length >= 6) break
  }

  return faqs
}
