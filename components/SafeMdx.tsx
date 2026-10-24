import { MDXRemote } from 'next-mdx-remote/rsc'
import { stripActiveMdx } from '@/lib/mdx-security'

type Props = Pick<Parameters<typeof MDXRemote>[0], 'source' | 'components'>

export default async function SafeMdx({ source, components }: Props) {
  return MDXRemote({
    source,
    components,
    options: { blockJS: true, mdxOptions: { remarkPlugins: [stripActiveMdx] } },
  })
}
