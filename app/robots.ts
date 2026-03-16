import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // perioperative-rehab is access-protected — exclude from indexing
        disallow: ['/perioperative-rehab/', '/perioperative-rehab/locked'],
      },
    ],
    sitemap: 'https://cam-savant.vercel.app/sitemap.xml',
  }
}
