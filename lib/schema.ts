const BASE_URL = 'https://cam-savant.vercel.app'

// ── Author map ─────────────────────────────────────────────────────────────

const AUTHOR_MAP: Record<string, { name: string; jobTitle: string }> = {
  '楊育愷醫師': { name: '楊育愷', jobTitle: '復健科主治醫師' },
  '楊育彰醫師': { name: '楊育彰', jobTitle: '家庭醫學科專科醫師' },
  '賴玟衛醫師': { name: '賴玟衛', jobTitle: '復健科醫師' },
  '黃雅琦醫師': { name: '黃雅琦', jobTitle: '復健科醫師' },
}

// ── Category → MedicalSpecialty map ───────────────────────────────────────

const SPECIALTY_MAP: Record<string, string> = {
  'sports-medicine':        'SportsMedicine',
  'rehabilitation-medicine': 'PhysicalMedicineAndRehabilitation',
  'functional-medicine':    'InternalMedicine',
  'fsm':                    'PhysicalTherapy',
  'perioperative-rehab':    'PhysicalMedicineAndRehabilitation',
}

// ── MedicalWebPage schema ──────────────────────────────────────────────────

export function generateArticleSchema(post: {
  title: string
  excerpt: string
  date: string
  slug: string
  category: string
  author?: string
  coverImage?: string
  lastModified?: string
}) {
  const authorDetails =
    (post.author ? AUTHOR_MAP[post.author] : undefined) ??
    { name: '楊育愷', jobTitle: '復健科主治醫師' }

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/posts/${post.slug}`,
    datePublished: post.date,
    dateModified: post.lastModified ?? post.date,
    lastReviewed: post.lastModified ?? post.date,
    inLanguage: 'zh-TW',
    author: {
      '@type': 'Physician',
      name: authorDetails.name,
      jobTitle: authorDetails.jobTitle,
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
      audienceType: 'Patient',
    },
    specialty: {
      '@type': 'MedicalSpecialty',
      name: SPECIALTY_MAP[post.category] ?? 'PhysicalMedicineAndRehabilitation',
    },
  }
}

// ── FAQPage schema ────────────────────────────────────────────────────────

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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

// ── CollectionPage schema (for category pages) ────────────────────────────

export function generateCollectionPageSchema(opts: {
  name: string
  description: string
  url: string
  specialty: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: 'zh-TW',
    isPartOf: {
      '@type': 'MedicalOrganization',
      name: 'CAM Savant',
      url: BASE_URL,
    },
    about: {
      '@type': 'MedicalSpecialty',
      name: opts.specialty,
    },
  }
}
