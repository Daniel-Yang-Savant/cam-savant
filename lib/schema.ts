const BASE_URL = 'https://cam-savant.vercel.app'

// ── MedicalWebPage schema ──────────────────────────────────────────────────

export function generateArticleSchema(post: {
  title: string
  excerpt: string
  date: string
  slug: string
  category: string
  coverImage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/posts/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'zh-TW',
    author: {
      '@type': 'Physician',
      name: '楊育愷',
      jobTitle: '復健科主治醫師',
      url: `${BASE_URL}/about`,
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'CAM Savant',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    image: post.coverImage
      ? `${BASE_URL}${post.coverImage}`
      : `${BASE_URL}/images/covers/${post.category}.jpg`,
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Clinician',
    },
    specialty: {
      '@type': 'MedicalSpecialty',
      name: 'PhysicalTherapy',
    },
  }
}

// ── BreadcrumbList schema ─────────────────────────────────────────────────

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
