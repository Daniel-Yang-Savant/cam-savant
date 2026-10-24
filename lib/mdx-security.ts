type MdxNode = {
  type: string
  name?: string
  url?: string
  children?: MdxNode[]
  attributes?: { type: string; name?: string; value?: unknown }[]
}

const DOCUMENT_ELEMENTS = new Set(('a abbr address article aside b bdi bdo blockquote br caption cite code col colgroup dd del details dfn div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i img ins kbd li main mark nav ol p picture pre q rp rt ruby s samp section small source span strong sub summary sup table tbody td tfoot th thead time tr u ul var wbr').split(' '))
const DOCUMENT_COMPONENTS = new Set(['ContextualCareCTA'])
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'xlinkhref'])

function safeUrl(value: string): boolean {
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, '').toLowerCase()
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(normalized)?.[1]
  return !scheme || ['http', 'https', 'mailto', 'tel'].includes(scheme)
}

/** Article MDX is document content, never an executable HTML or JavaScript source. */
export function stripActiveMdx() {
  return function transform(tree: unknown) {
    function visit(node: MdxNode) {
      if (!node.children) return
      node.children = node.children.filter(child => {
        if (child.type === 'image' && child.url && !safeUrl(child.url)) return false
        if (child.type !== 'mdxJsxFlowElement' && child.type !== 'mdxJsxTextElement') return true
        return !child.name || DOCUMENT_ELEMENTS.has(child.name) || DOCUMENT_COMPONENTS.has(child.name)
      })
      for (const child of node.children) {
        if ((child.type === 'link' || child.type === 'definition') && child.url && !safeUrl(child.url)) child.url = '#'
        if (child.attributes) {
          child.attributes = child.attributes.filter(attribute => {
            if (attribute.type !== 'mdxJsxAttribute' || !attribute.name) return false
            const name = attribute.name.toLowerCase()
            if (name.startsWith('on') || name === 'dangerouslysetinnerhtml' || name === 'srcdoc') return false
            // MDX expression attributes and spreads are code, including style objects.
            if (attribute.value !== null && typeof attribute.value !== 'string') return false
            if (URL_ATTRIBUTES.has(name) && typeof attribute.value === 'string') {
              if (!safeUrl(attribute.value)) return false
            }
            return true
          })
        }
        visit(child)
      }
    }
    visit(tree as MdxNode)
  }
}
