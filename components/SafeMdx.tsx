import { MDXRemote } from 'next-mdx-remote/rsc'
import { stripActiveMdx } from '@/lib/mdx-security'
import { addArticleHeadingIds } from '@/lib/article-headings'
import { Children, isValidElement, type ReactNode } from 'react'

type Props = Pick<Parameters<typeof MDXRemote>[0], 'source' | 'components'> & { locale?: 'zh' | 'en' }

function textContent(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child)
    return isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : ''
  }).join('')
}

export default async function SafeMdx({ source, components, locale = 'zh' }: Props) {
  const heading = (Tag: 'h2' | 'h3') => function ArticleHeading({ id, children }: { id?: string; children?: ReactNode }) {
    return (
      <Tag id={id} tabIndex={id ? -1 : undefined} className="group scroll-mt-24">
        <span data-heading-text>{children}</span>
        {id && (
          <a
            href={`#${id}`}
            className="ArticleHeadingLink ml-2 inline-block rounded px-1 text-sm font-normal text-neutral-400 no-underline hover:text-accent-700 focus-visible:text-accent-700 dark:hover:text-accent-400"
            aria-label={locale === 'en' ? `Link to section: ${textContent(children)}` : `連到此段落：${textContent(children)}`}
            title={locale === 'en' ? 'Link to this section' : '此段落連結'}
          ><span aria-hidden="true">#</span></a>
        )}
      </Tag>
    )
  }
  return MDXRemote({
    source,
    components: { h2: heading('h2'), h3: heading('h3'), ...components },
    options: { blockJS: true, mdxOptions: { remarkPlugins: [stripActiveMdx, addArticleHeadingIds] } },
  })
}
