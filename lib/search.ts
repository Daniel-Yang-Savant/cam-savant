import { getPublicPosts, CATEGORY_LABELS, type Post } from '@/lib/posts'
import { createPublicArticleSummaries } from '@/lib/article-discovery'
import { TEAM, type Author } from '@/lib/authors'
import { CLINIC_LOCATIONS, type ClinicLocation } from '@/lib/locations'
import { EXERCISE_GUIDE_MODULES, getExerciseGuideDates, type ExerciseGuideModule } from '@/lib/exercise-guides'
import type { SearchItem } from './search-types'

export type { SearchItem } from './search-types'

interface SearchSources {
  posts: readonly Post[]
  guides: readonly ExerciseGuideModule[]
  doctors: readonly Author[]
  clinics: readonly ClinicLocation[]
}

export function createSearchIndex({ posts, guides, doctors, clinics }: SearchSources): SearchItem[] {
  const articles: SearchItem[] = createPublicArticleSummaries(posts).map((post) => ({
    id: `article:${post.slug}`,
    type: 'article',
    typeLabel: '衛教文章',
    href: `/posts/${post.slug}`,
    slug: post.slug,
    title: post.frontmatter.title,
    excerpt: post.frontmatter.excerpt,
    category: post.frontmatter.category,
    categoryLabel:
      CATEGORY_LABELS[post.frontmatter.category] ?? post.frontmatter.category,
    tags: post.frontmatter.tags ?? [],
    date: post.frontmatter.date,
    coverImage: post.frontmatter.coverImage,
  }))
  // Match the public exercise directory. A noindex/pending-review guide is still
  // public; carry its review notice rather than treating SEO status as access control.
  const exercises: SearchItem[] = guides.map((guide) => ({
    id: `exercise:${guide.id}`,
    type: 'exercise',
    typeLabel: guide.reviewStatus === 'pending' ? '圖解運動・待醫療審閱' : '圖解運動',
    href: `/exercise-guides/${guide.id}`,
    slug: guide.id,
    title: guide.title,
    excerpt: guide.summary,
    category: 'exercise-guides',
    categoryLabel: guide.kind === 'relaxation' ? '放鬆運動' : '運動指引與研究',
    tags: [guide.selectionLabel, ...(guide.bodyRegion ? [guide.bodyRegion] : []), ...(guide.searchAliases ?? []), ...(guide.kind === 'relaxation' ? [`${guide.selectionLabel}放鬆`, `${guide.selectionLabel}伸展`] : [])],
    date: getExerciseGuideDates(guide).publishedDate,
  }))
  const physicianItems: SearchItem[] = doctors.map((doctor) => ({
    id: `doctor:${doctor.slug}`,
    type: 'doctor',
    typeLabel: '醫師',
    href: `/doctors/${doctor.slug}`,
    slug: doctor.slug,
    title: `${doctor.name}醫師`,
    excerpt: `${doctor.title}・${doctor.location}`,
    category: 'doctors',
    categoryLabel: '醫師團隊',
    tags: [doctor.nameEn, ...doctor.specialties],
    date: '',
  }))
  const locationItems: SearchItem[] = clinics.map((clinic) => ({
    id: `location:${clinic.slug}`,
    type: 'location',
    typeLabel: '院區／看診',
    href: `/locations/${clinic.slug}`,
    slug: clinic.slug,
    title: clinic.hospital,
    excerpt: `${clinic.department}・${clinic.address}`,
    category: 'locations',
    categoryLabel: '看診資訊',
    tags: [
      clinic.shortName, clinic.hospitalEn, clinic.addressRegion, clinic.addressLocality,
      ...[clinic.hospital, clinic.shortName, clinic.addressRegion.replace(/[縣市]$/u, ''), clinic.addressLocality.replace(/[鄉鎮市區]$/u, '')]
        .flatMap((place) => ['看診', '門診', '掛號', '交通', '地圖'].map((action) => `${place}${action}`)),
    ],
    date: '',
  }))
  const directories: SearchItem[] = [
    { slug: 'locations', title: '看診資訊與官方掛號', excerpt: '依院區查看醫師、門診時段、交通與院方掛號入口。', tags: ['看診', '掛號', '預約', '門診', '交通', '地圖'], href: '/locations' },
    { slug: 'exercise-guides', title: '圖解運動專區', excerpt: '依身體部位、症狀或已確認的診斷查找圖解。', tags: ['運動', '伸展', '放鬆', '動作'], href: '/exercise-guides' },
    { slug: 'about', title: '醫師團隊介紹', excerpt: '認識 CAM Savant 醫療團隊與各醫師的專業背景。', tags: ['醫師', '團隊', '關於我們'], href: '/about' },
    { slug: 'posts', title: '全部衛教文章', excerpt: '瀏覽復健醫學、運動醫學及其他公開衛教文章。', tags: ['文章', '衛教'], href: '/posts' },
  ].map((item) => ({ ...item, id: `directory:${item.slug}`, type: 'directory', typeLabel: '專區入口', category: item.slug, categoryLabel: '網站專區', date: '' }))

  return [...articles, ...exercises, ...physicianItems, ...locationItems, ...directories]
}

export function buildSearchIndex(): SearchItem[] {
  return createSearchIndex({ posts: getPublicPosts(), guides: EXERCISE_GUIDE_MODULES, doctors: TEAM, clinics: CLINIC_LOCATIONS })
}
