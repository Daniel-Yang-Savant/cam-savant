import { safeJsonLd } from '@/lib/safe-json'
import type { Metadata } from 'next'
import { bilingualAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: {
    absolute: 'CAM Savant 官方網站｜復健醫學・運動醫學・功能醫學',
  },
  alternates: bilingualAlternates('/'),
}

import CoverImage from '@/components/CoverImage'
import styles from '@/components/HomeSurface.module.css'
import { CATEGORY_LABELS, getPublicPosts } from '@/lib/posts'
import { getReadingTime } from '@/lib/reading-time'
import Link from 'next/link'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://camsavant.com/#website',
  url: 'https://camsavant.com/',
  name: 'CAM Savant',
  alternateName: ['CAMsavant', 'CAM SAVANT', 'camsavant.com'],
  publisher: {
    '@id': 'https://camsavant.com/#organization',
  },
}

export default function HomePage() {
  const allPosts = getPublicPosts()
  const focusedPosts = allPosts.filter((post) =>
    ['rehabilitation-medicine', 'sports-medicine'].includes(post.frontmatter.category)
  )

  const latestPosts = focusedPosts.slice(0, 2)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
      />

      <div className={styles.surface}>
        <div className={`${styles.container} ${styles.contentEnd}`}>
          <section className={styles.intro} aria-labelledby="home-intro-title">
            <div>
              <p className={styles.kicker}>CAM SAVANT · 醫師團隊</p>
              <h1 id="home-intro-title" className={styles.headline}>
                陪你理解身體，認識復健與運動健康
              </h1>
              <p className={styles.description}>
                CAM Savant 由復健科與家庭醫學科醫師共同分享醫療知識，聚焦運動傷害、肌肉骨骼疼痛與術後復健。我們將臨床知識整理成衛教文章，幫助你了解身體狀況、復健過程與就醫時可以討論的問題。
              </p>
              <ul className={styles.specialties} aria-label="核心領域">
                <li>復健醫學</li><li>運動傷害</li><li>術後復健</li>
              </ul>
            </div>
            <aside className={styles.introAside} aria-label="醫師與看診資訊">
              <p className={styles.locations}>中部看診資訊<span>彰化・員林・二林・南投</span></p>
              <div className={styles.actions}>
                <Link href="/about" className={`${styles.action} ${styles.primaryAction}`}>
                  認識醫師團隊 <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/locations" className={styles.action}>
                  依地區查看看診資訊 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </section>

          <section className={styles.latest} aria-labelledby="home-latest-title">
            <div className={styles.sectionHeader}>
              <h2 id="home-latest-title">最新復健與運動傷害文章</h2>
              <Link href="/posts">所有文章 <span aria-hidden="true">→</span></Link>
            </div>
            <div className={styles.articles}>
              {latestPosts.map(({ slug, frontmatter, content }, index) => (
                <article key={slug} className={styles.article}>
                  <Link href={`/posts/${slug}`}>
                    <div className={styles.cover}>
                      {frontmatter.coverImage && (
                        <CoverImage
                          src={frontmatter.coverImage}
                          alt={frontmatter.title}
                          categoryLabel={CATEGORY_LABELS[frontmatter.category]}
                          priority={index === 0}
                          imageClassName="object-cover"
                          sizes="(max-width: 720px) calc(100vw - 48px), (max-width: 1100px) calc((100vw - 124px) / 2), 440px"
                        />
                      )}
                    </div>
                    <div className={styles.articleBody}>
                      <div className={styles.articleMeta}>
                        <span className={styles.category}>{CATEGORY_LABELS[frontmatter.category]}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={frontmatter.date}>{frontmatter.date.replaceAll('-', '.')}</time>
                        <span aria-hidden="true">·</span>
                        <span>約 {getReadingTime(content)} 分鐘</span>
                      </div>
                      <h3 className={styles.articleTitle}>{frontmatter.title}</h3>
                      <p className={styles.excerpt}>{frontmatter.excerpt}</p>
                      <span className={styles.readMore}>閱讀全文 <span aria-hidden="true">↗</span></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            {latestPosts.length === 0 && <p className={styles.description}>尚無文章。</p>}
          </section>

          <section className={styles.exercise} aria-labelledby="exercise-guides-promo-title">
            <div>
              <p className={styles.kicker}>DAILY MOVEMENT · VISUAL GUIDES</p>
              <h2 id="exercise-guides-promo-title">圖解運動專區</h2>
              <p>從想放鬆的部位開始，跟著圖解輕輕活動。</p>
            </div>
            <Link href="/exercise-guides" className={styles.action}>
              進入圖解運動專區 <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>

    </>
  )
}
