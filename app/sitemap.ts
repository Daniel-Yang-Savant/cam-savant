import {
  getPublicPosts,
  getIndexableTags,
  getPostsByTag,
  getPostsByCategory,
} from '@/lib/posts'
import { TEAM } from '@/lib/authors'
import { CLINIC_LOCATIONS } from '@/lib/locations'
import { MetadataRoute } from 'next'

const BASE_URL = 'https://camsavant.com'

/** 內容幾乎不變的頁面用固定日期（避免每次部署都宣稱有更新，Google 會不信任 lastmod） */
const STATIC_PAGE_DATE = new Date('2026-07-18')
const TEAM_PAGE_DATE = new Date('2026-07-26')
const ENGLISH_SITE_DATE = new Date('2026-08-01')

function languageAlternates(zhPath: string, enPath = `/en${zhPath === '/' ? '' : zhPath}`) {
  return {
    languages: {
      'zh-TW': `${BASE_URL}${zhPath === '/' ? '' : zhPath}`,
      en: `${BASE_URL}${enPath}`,
      'x-default': `${BASE_URL}${zhPath === '/' ? '' : zhPath}`,
    },
  }
}

/** 取一組文章中最新的日期（lastModified 優先，其次 date） */
function latestDate(posts: { frontmatter: { date: string; lastModified?: string } }[]): Date {
  const times = posts.map((p) =>
    new Date(p.frontmatter.lastModified ?? p.frontmatter.date).getTime()
  )
  return times.length > 0 ? new Date(Math.max(...times)) : STATIC_PAGE_DATE
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublicPosts()
  const tags = getIndexableTags()
  const homepagePosts = posts.filter((post) =>
    ['rehabilitation-medicine', 'sports-medicine'].includes(post.frontmatter.category)
  )

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.frontmatter.lastModified ?? post.frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 標籤頁：以該標籤下最新文章的日期為準
  const tagEntries: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: latestDate(getPostsByTag(tag)),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // 分類頁：以該分類下最新文章的日期為準
  const categoryPage = (path: string, category: string): MetadataRoute.Sitemap[number] => ({
    url: `${BASE_URL}/${path}`,
    lastModified: latestDate(getPostsByCategory(category)),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  })

  const doctorEntries: MetadataRoute.Sitemap = TEAM.flatMap((doctor) => {
    const zhPath = `/doctors/${doctor.slug}`
    const enPath = `/en/doctors/${doctor.slug}`
    const alternates = languageAlternates(zhPath, enPath)
    return [
      { url: `${BASE_URL}${zhPath}`, lastModified: TEAM_PAGE_DATE, changeFrequency: 'monthly' as const, priority: 0.7, alternates },
      { url: `${BASE_URL}${enPath}`, lastModified: ENGLISH_SITE_DATE, changeFrequency: 'monthly' as const, priority: 0.7, alternates },
    ]
  })

  const locationEntries: MetadataRoute.Sitemap = CLINIC_LOCATIONS.flatMap((location) => {
    const zhPath = `/locations/${location.slug}`
    const enPath = `/en/locations/${location.slug}`
    const alternates = languageAlternates(zhPath, enPath)
    return [
      { url: `${BASE_URL}${zhPath}`, lastModified: TEAM_PAGE_DATE, changeFrequency: 'monthly' as const, priority: 0.8, alternates },
      { url: `${BASE_URL}${enPath}`, lastModified: ENGLISH_SITE_DATE, changeFrequency: 'monthly' as const, priority: 0.8, alternates },
    ]
  })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: latestDate(homepagePosts), // 首頁隨復健與運動傷害最新文章更新
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternates: languageAlternates('/'),
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: ENGLISH_SITE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      alternates: languageAlternates('/'),
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: TEAM_PAGE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/about'),
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: ENGLISH_SITE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/about'),
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: TEAM_PAGE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: languageAlternates('/locations'),
    },
    {
      url: `${BASE_URL}/en/locations`,
      lastModified: ENGLISH_SITE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: languageAlternates('/locations'),
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: TEAM_PAGE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/contact'),
    },
    {
      url: `${BASE_URL}/en/contact`,
      lastModified: ENGLISH_SITE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/contact'),
    },
    {
      url: `${BASE_URL}/contact/wen-wei-lai`,
      lastModified: TEAM_PAGE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/contact/wen-wei-lai'),
    },
    {
      url: `${BASE_URL}/en/contact/wen-wei-lai`,
      lastModified: ENGLISH_SITE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates('/contact/wen-wei-lai'),
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: latestDate(posts),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    categoryPage('sports-medicine', 'sports-medicine'),
    categoryPage('weekly-picks', 'weekly-picks'),
    categoryPage('rehabilitation-medicine', 'rehabilitation-medicine'),
    categoryPage('functional-medicine', 'functional-medicine'),
    {
      url: `${BASE_URL}/functional-medicine/supplement-recommender`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    categoryPage('fsm', 'fsm'),
    // /perioperative-rehab 為存取保護頁（middleware 會 redirect），不列入 sitemap
  ]

  return [...staticPages, ...locationEntries, ...doctorEntries, ...postEntries, ...tagEntries]
}
