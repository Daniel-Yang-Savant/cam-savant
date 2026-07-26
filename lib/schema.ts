const BASE_URL = 'https://camsavant.com'

import { getAuthor, type Author } from './authors'

// ── Physician schema（E-E-A-T：含認證、服務機構、頭像、@id） ──────────────

export function generatePhysicianSchema(author: Author) {
  return {
    '@type': 'Physician',
    '@id': `${BASE_URL}/doctors/${author.slug}#physician`,
    name: author.name,
    alternateName: author.nameEn,
    jobTitle: author.title,
    image: `${BASE_URL}${author.photo}`,
    url: `${BASE_URL}/doctors/${author.slug}`,
    ...(author.affiliation
      ? {
          affiliation: {
            '@type': 'MedicalOrganization',
            name: author.affiliation,
          },
        }
      : {}),
    ...(author.credentials.length > 0
      ? {
          hasCredential: author.credentials.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c,
          })),
        }
      : {}),
    ...(author.specialties.length > 0 ? { knowsAbout: author.specialties } : {}),
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  }
}

// ── Category → MedicalSpecialty map ───────────────────────────────────────

const SPECIALTY_MAP: Record<string, string> = {
  'sports-medicine':        'SportsMedicine',
  'weekly-picks':           'SportsMedicine',
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
  const authorDetails = getAuthor(post.author)

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
    author: generatePhysicianSchema(authorDetails),
    reviewedBy: generatePhysicianSchema(authorDetails),
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
