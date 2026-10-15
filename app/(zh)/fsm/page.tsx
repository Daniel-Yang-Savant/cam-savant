import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import { getPagination, type PageParameter } from '@/lib/pagination'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE_URL = 'https://camsavant.com'

interface Props {
  searchParams: Promise<{ page?: PageParameter }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams
  const { canonicalPath } = getPagination({
    page,
    totalItems: getPostsByCategory('fsm').length,
    basePath: '/fsm',
  })

  return {
    alternates: { canonical: canonicalPath },
    title: 'FSM',
    description: CATEGORY_DESCRIPTIONS['fsm'],
  }
}

export default async function FSMPage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = getPostsByCategory('fsm')
  const { currentPage, totalPages, canonicalPath, startIndex, endIndex } = getPagination({
    page,
    totalItems: allPosts.length,
    basePath: '/fsm',
  })
  const posts = allPosts.slice(startIndex, endIndex)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCollectionPageSchema({
              name: 'FSM 頻率特異性微電流',
              description: CATEGORY_DESCRIPTIONS['fsm'],
              url: `${BASE_URL}${canonicalPath}`,
              specialty: 'PhysicalTherapy',
            })
          ),
        }}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '首頁', href: '/' },
          { label: 'FSM' },
        ]}
      />

      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Category
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">FSM</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xl">{CATEGORY_DESCRIPTIONS['fsm']}</p>
      </div>

      <section className="mb-12" aria-labelledby="fsm-tools-heading">
        <h2 id="fsm-tools-heading" className="text-xs font-semibold tracking-widest text-neutral-500 mb-4">
          音樂與頻率工具
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-700 dark:text-teal-300">
                <path d="M3 14v-3a9 9 0 0 1 18 0v3M3 13h3v7H5a2 2 0 0 1-2-2v-5ZM21 13h-3v7h1a2 2 0 0 0 2-2v-5Z" />
              </svg>
              <span className="text-xs tracking-widest text-neutral-500">LISTEN</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-950 dark:text-neutral-100">CAM Savant 原創音樂</h3>
            <p className="mt-2 mb-6 max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-400">
              以 FSM 頻率概念為靈感的音樂創作。選一首喜歡的作品，留一段時間安靜聆聽。
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <a
                href="https://www.youtube.com/@CAMsavant"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.6 7.2a2.9 2.9 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2A30.3 30.3 0 0 0 2 12a30.3 30.3 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2A30.3 30.3 0 0 0 22 12a30.3 30.3 0 0 0-.4-4.8ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z" /></svg>
                YouTube 聆聽 <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://open.spotify.com/artist/1mvVRIoRbi88KV0YVInKIV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 transition-colors hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954" className="shrink-0">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Spotify <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-teal-700 dark:text-teal-300">
                <path d="M4 9v6M8 5v14M12 2v20M16 6v12M20 9v6" />
              </svg>
              <span className="text-xs tracking-widest text-teal-700 dark:text-teal-400">EXPLORE</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-950 dark:text-neutral-100">FSM Studio</h3>
            <p className="mt-2 mb-6 max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-400">
              在手機或電腦設定雙聲道音訊與播放時間。協定管理、音樂創作與紀錄功能供授權使用者使用。
            </p>
            <a
              href="/fsm/studio/"
              className="mt-auto inline-flex min-h-11 w-fit items-center gap-4 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:bg-teal-300 dark:text-teal-950 dark:hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
            >
              開啟工作室 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <PostList posts={posts} activeCategory="fsm" />
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/fsm" />
    </div>
    </>
  )
}
