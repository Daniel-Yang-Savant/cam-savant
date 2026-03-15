import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import PostList from '@/components/PostList'

export const metadata: Metadata = {
  title: 'FSM',
  description: CATEGORY_DESCRIPTIONS['fsm'],
}

export default function FSMPage() {
  const posts = getPostsByCategory('fsm')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          Category
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950">FSM</h1>
        <p className="mt-2 text-neutral-500 max-w-xl">{CATEGORY_DESCRIPTIONS['fsm']}</p>
      </div>

      {/* Spotify artist link */}
      <a
        href="https://open.spotify.com/artist/1mvVRIoRbi88KV0YVInKIV"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:border-[#1DB954] hover:bg-green-50 transition-colors group mb-12"
      >
        {/* Spotify icon */}
        <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954" aria-label="Spotify">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>

        <span className="text-sm font-medium text-neutral-700 group-hover:text-[#1DB954] transition-colors">
          在 Spotify 聆聽 FSM 相關音樂
        </span>

        {/* External link arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400 group-hover:text-[#1DB954] transition-colors"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>

      <PostList posts={posts} activeCategory="fsm" />
    </div>
  )
}
