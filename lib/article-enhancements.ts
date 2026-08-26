const ZH_RED_FLAG_HEADINGS = [
  /紅旗/,
  /警訊/,
  /警示/,
  /不能只做復健/,
  /何時.*(?:就醫|停止|回診)/,
  /感冒或發燒時可以繼續運動/,
]

const EN_RED_FLAG_HEADINGS = [
  /red flags?/i,
  /warning signs?/i,
  /when to (?:seek|call|stop)/i,
  /stop (?:exercise|training)/i,
]

/** Insert the safety CTA after the first red-flag H2 section in an MDX article. */
export function injectContextualCareCTA(
  content: string,
  locale: 'zh' | 'en' = 'zh'
): string {
  if (content.includes('<ContextualCareCTA')) return content

  const headings = Array.from(content.matchAll(/^##\s+(.+?)\s*$/gm))
  const patterns = locale === 'en' ? EN_RED_FLAG_HEADINGS : ZH_RED_FLAG_HEADINGS
  const redFlagIndex = headings.findIndex((match) =>
    patterns.some((pattern) => pattern.test(match[1]))
  )

  if (redFlagIndex === -1) return content

  const insertionIndex = headings[redFlagIndex + 1]?.index ?? content.length
  const before = content.slice(0, insertionIndex).trimEnd()
  const after = content.slice(insertionIndex).trimStart()

  return `${before}\n\n<ContextualCareCTA />\n\n${after}`.trimEnd()
}
