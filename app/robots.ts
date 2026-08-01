import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // perioperative-rehab is access-protected — exclude from indexing
        // (no trailing slash: robots.txt prefix-matches, covers /perioperative-rehab and all sub-paths)
        disallow: [
          '/perioperative-rehab',
          '/en/perioperative-rehab',
          '/admin',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://camsavant.com/sitemap.xml',
  }
}
