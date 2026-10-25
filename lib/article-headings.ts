type HeadingNode = {
  type: string
  depth?: number
  value?: string
  alt?: string
  children?: HeadingNode[]
  data?: { hProperties?: Record<string, unknown> }
}

function headingText(node: HeadingNode): string {
  // Expressions and JSX attributes are never evaluated to construct an anchor.
  if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') return ''
  return node.children?.map(headingText).join('') ?? node.alt ?? node.value ?? ''
}

/** Preserve existing plain-text anchors while making formatted/repeated headings usable. */
export function addArticleHeadingIds() {
  return function transform(tree: unknown) {
    const used = new Set<string>()
    function visit(node: HeadingNode) {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        const base = headingText(node).toLowerCase().replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]/g, '') || 'section'
        let id = base
        for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`
        used.add(id)
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
      }
      node.children?.forEach(visit)
    }
    visit(tree as HeadingNode)
  }
}
