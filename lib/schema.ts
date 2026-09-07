const BASE_URL = 'https://camsavant.com'

import { getAuthor, TEAM, type Author } from './authors'
import { getContentReview, type ContentReviewMetadata } from './content-review'
import { getDoctorClinics } from './doctor-clinics'
import { getClinicLocation } from './locations'
import { EXERCISE_GUIDE_REVIEW } from './exercise-guide-review'
import {
  getExerciseGuideFollowUp,
  type ExerciseGuideModule,
} from './exercise-guides'

// ── Physician schema（E-E-A-T：含認證、服務機構、頭像、@id） ──────────────

export function generatePhysicianSchema(author: Author, locale: 'zh' | 'en' = 'zh') {
  const english = locale === 'en'
  const clinics = getDoctorClinics(author.slug).flatMap((entry) => {
    const clinic = getClinicLocation(entry.clinicSlug)
    return clinic ? [clinic] : []
  })
  const credentials = english ? author.credentialsEn : author.credentials
  const specialties = english ? author.specialtiesEn : author.specialties
  const sources = author.profileSources?.map((source) => source.url) ?? []
  return {
    '@type': 'Physician',
    '@id': `${BASE_URL}/doctors/${author.slug}#physician`,
    name: english ? author.nameEn : author.name,
    alternateName: english ? author.name : author.nameEn,
    jobTitle: english ? author.titleEn : author.title,
    image: `${BASE_URL}${author.photo}`,
    url: `${BASE_URL}${english ? '/en' : ''}/doctors/${author.slug}`,
    ...(clinics.length
      ? {
          affiliation: clinics.map((clinic) => ({
            '@type': 'Hospital',
            '@id': `${clinic.officialUrl}#hospital`,
            name: english ? clinic.hospitalEn : clinic.hospital,
            url: clinic.officialUrl,
          })),
          areaServed: [...new Set(clinics.map((clinic) => clinic.addressRegion))],
        }
      : author.affiliation
      ? {
          affiliation: {
            '@type': 'MedicalOrganization',
            name: author.affiliation,
          },
        }
      : {}),
    ...(credentials.length > 0
      ? {
          hasCredential: credentials.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c,
          })),
        }
      : {}),
    ...(specialties.length > 0 ? { knowsAbout: specialties } : {}),
    ...(sources.length ? { sameAs: sources } : {}),
  }
}

export function generateOrganizationSchema(locale: 'zh' | 'en' = 'zh') {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': `${BASE_URL}/#organization`,
    name: 'CAM Savant',
    alternateName: ['CAMsavant', 'CAM SAVANT'],
    description: locale === 'en'
      ? 'A physician-led medical education platform covering rehabilitation medicine, sports medicine, and family medicine.'
      : '由醫師團隊主筆的醫療衛教知識平台，涵蓋復健醫學、運動醫學與家庭醫學。',
    url: `${BASE_URL}${locale === 'en' ? '/en' : ''}`,
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo.png` },
    member: TEAM.map((author) => generatePhysicianSchema(author, locale)),
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

export function generateArticleSchema(post: ContentReviewMetadata & {
  title: string
  excerpt: string
  date: string
  slug: string
  category: string
  author: string
  coverImage?: string
  lastModified?: string
}) {
  const authorDetails = getAuthor(post.author)
  const articleUrl = `${BASE_URL}/posts/${post.slug}`
  const review = getContentReview(post)

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalWebPage', 'Article'],
    '@id': `${articleUrl}#article`,
    name: post.title,
    headline: post.title,
    description: post.excerpt,
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    datePublished: post.date,
    dateModified: post.lastModified ?? post.date,
    ...(review ? {
      lastReviewed: review.date,
      reviewedBy: generatePhysicianSchema(review.reviewer),
    } : {}),
    inLanguage: 'zh-TW',
    author: generatePhysicianSchema(authorDetails),
    publisher: {
      '@type': 'MedicalOrganization',
      '@id': `${BASE_URL}/#organization`,
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

// ── Exercise guide MedicalWebPage + ExercisePlan schema ──────────────────

function parseStepDuration(step: string): string | undefined {
  const seconds = step.match(/^(\d+)\s*秒$/)
  if (seconds) return `PT${seconds[1]}S`

  const minutes = step.match(/^(\d+)\s*分鐘$/)
  return minutes ? `PT${minutes[1]}M` : undefined
}

export function generateExerciseGuideSchema(guide: ExerciseGuideModule) {
  const pageUrl = `${BASE_URL}/exercise-guides/${guide.id}`
  const reviewer = generatePhysicianSchema(getAuthor(EXERCISE_GUIDE_REVIEW.reviewerKey))
  const stepDurations = guide.images.map((image) => parseStepDuration(image.step))
  const totalSeconds = stepDurations.every(Boolean)
    ? stepDurations.reduce((sum, duration) => {
        const match = duration?.match(/^PT(?:(\d+)M)?(?:(\d+)S)?$/)
        return sum + Number(match?.[1] ?? 0) * 60 + Number(match?.[2] ?? 0)
      }, 0)
    : 0
  const activityDuration = totalSeconds > 0 ? `PT${totalSeconds}S` : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${pageUrl}#webpage`,
        name: guide.title,
        description: guide.summary,
        url: pageUrl,
        inLanguage: 'zh-TW',
        datePublished: EXERCISE_GUIDE_REVIEW.publishedDate,
        dateModified: EXERCISE_GUIDE_REVIEW.modifiedDate,
        lastReviewed: EXERCISE_GUIDE_REVIEW.date,
        reviewedBy: reviewer,
        author: reviewer,
        publisher: {
          '@type': 'MedicalOrganization',
          '@id': `${BASE_URL}/#organization`,
          name: 'CAM Savant',
          url: BASE_URL,
        },
        about: {
          '@type': 'Thing',
          name: guide.kind === 'condition'
            ? guide.selectionLabel
            : `${guide.selectionLabel}放鬆運動`,
        },
        medicalAudience: {
          '@type': 'MedicalAudience',
          audienceType: 'Patient',
        },
        primaryImageOfPage: `${BASE_URL}${guide.images[0].src}`,
        citation: guide.sources.map((source) => source.href),
        mainEntity: { '@id': `${pageUrl}#exercise-plan` },
      },
      {
        '@type': 'ExercisePlan',
        '@id': `${pageUrl}#exercise-plan`,
        name: guide.title,
        description: guide.summary,
        exerciseType: guide.kind === 'condition'
          ? guide.selectionLabel
          : `${guide.selectionLabel}放鬆運動`,
        activityFrequency: guide.dosage,
        ...(activityDuration ? { activityDuration } : {}),
        intensity: guide.cue,
        additionalVariable: `降階方式：${guide.regression}；重新評估：${getExerciseGuideFollowUp(guide)}`,
        audience: {
          '@type': 'MedicalAudience',
          audienceType: 'Patient',
        },
        citation: guide.sources.map((source) => source.href),
        image: guide.images.map((image) => ({
          '@type': 'ImageObject',
          url: `${BASE_URL}${image.src}`,
          width: image.width ?? 418,
          height: image.height ?? 941,
          caption: image.alt,
        })),
        hasPart: guide.images.map((image, index) => ({
          '@type': 'CreativeWork',
          position: index + 1,
          name: image.caption,
          description: `${image.step}：${image.caption}`,
          url: `${pageUrl}#step-${index + 1}`,
          image: {
            '@type': 'ImageObject',
            url: `${BASE_URL}${image.src}`,
            width: image.width ?? 418,
            height: image.height ?? 941,
            caption: image.alt,
          },
        })),
      },
    ],
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
