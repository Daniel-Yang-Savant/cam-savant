import { TEAM } from './authors'
import { getDoctorClinics } from './doctor-clinics'
import { getClinicLocation } from './locations'
import { getPublicPosts, CATEGORY_LABELS } from './posts'

const BASE_URL = 'https://camsavant.com'

/** Public text indexes share the physician and clinic data used by pages. */
export function generateLlmsText(full = false) {
  const posts = getPublicPosts()
  const team = TEAM.map((author) => {
    const lines = [
      `### ${author.name}醫師 (${author.nameEn})`,
      `- 職稱：${author.title}`,
      `- 醫師介紹：${BASE_URL}/doctors/${author.slug}`,
      `- 地區：${author.location}`,
    ]
    if (author.specialties.length) lines.push(`- 專長：${author.specialties.join('、')}`)
    for (const source of author.profileSources ?? []) lines.push(`- ${source.label}：${source.url}`)
    for (const visit of getDoctorClinics(author.slug)) {
      const clinic = getClinicLocation(visit.clinicSlug)
      if (!clinic) continue
      lines.push(`- ${author.name}醫師｜${clinic.hospital}：${BASE_URL}/doctors/${author.slug}#clinics`)
      lines.push(`  - 官方掛號：${visit.bookingUrl}`)
      lines.push(`  - 時段${visit.verificationStatus === 'pending' ? '（待確認）' : ''}：${visit.schedule.join('、') || '請查閱院方最新掛號公告'}`)
      if (visit.checkedAt) lines.push(`  - 資料核對日期：${visit.checkedAt}${visit.verificationStatus === 'pending' ? '（尚未確認全部時段）' : ''}`)
      lines.push(`  - 來源：${visit.sourceLabel} ${visit.sourceUrl}`)
      if (visit.note) lines.push(`  - 說明：${visit.note}`)
    }
    return lines.join('\n')
  }).join('\n\n')

  const categories = [...new Set(posts.map((post) => post.frontmatter.category))]
  const articles = categories.map((category) => {
    const categoryPosts = posts.filter((post) => post.frontmatter.category === category)
    return `### ${CATEGORY_LABELS[category]}\n\n` + (full ? categoryPosts : categoryPosts.slice(0, 3)).map((post) => {
      const lines = [`- [${post.frontmatter.title}](${BASE_URL}/posts/${post.slug})`]
      if (full) {
        lines.push(`  - 作者：${post.frontmatter.author}`, `  - 發布日期：${post.frontmatter.date}`)
        if (post.frontmatter.lastModified) lines.push(`  - 內容更新：${post.frontmatter.lastModified}`)
        if (post.frontmatter.reviewedBy && post.frontmatter.lastReviewed) lines.push(`  - 醫療審閱：${post.frontmatter.reviewedBy}，${post.frontmatter.lastReviewed}`)
        lines.push(`  - 摘要：${post.frontmatter.excerpt}`)
      }
      return lines.join('\n')
    }).join('\n')
  }).join('\n\n')

  return `# CAM Savant${full ? ' — 完整公開文章索引' : ''}

> 由醫師團隊主筆的醫療衛教知識平台，涵蓋復健醫學、運動醫學與家庭醫學。醫師、院區與時段以各筆資料及官方掛號系統為準。

## 醫師與看診資訊

${team}

## ${full ? '完整公開文章' : '各分類近期文章'}

${articles}

## 其他公開資料

- 看診資訊：${BASE_URL}/locations
- 醫師團隊：${BASE_URL}/about
- 圖解運動專區：${BASE_URL}/exercise-guides
- 完整文章索引：${BASE_URL}/llms-full.txt
- RSS：${BASE_URL}/feed.xml
- Sitemap：${BASE_URL}/sitemap.xml

## 引用與日期

本站內容供醫療衛教參考，不構成個別診療建議。引用時請附上原文連結及作者姓名。未經書面授權禁止轉載、複製或商業使用。
文章發布、更新與醫療審閱日期各自記錄；未列醫療審閱者及日期者，不推定審閱日期。此索引不包含受保護的術後文章。
`
}
