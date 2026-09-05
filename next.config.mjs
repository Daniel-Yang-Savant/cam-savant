import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const postsDirectory = path.join(projectDirectory, 'content', 'posts')

function getProtectedPostRedirects() {
  if (!fs.existsSync(postsDirectory)) return []

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => /\.mdx?$/.test(fileName))
    .filter((fileName) => {
      const source = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8')
      return /^category:\s*["']?perioperative-rehab["']?\s*$/m.test(source)
    })
    .flatMap((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '')
      return [
        {
          source: `/posts/${slug}`,
          destination: `/perioperative-rehab/${slug}`,
          permanent: true,
        },
        {
          source: `/en/posts/${slug}`,
          destination: `/en/perioperative-rehab/${slug}`,
          permanent: true,
        },
      ]
    })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true, // Critters: inline critical CSS, defer rest → 修復 render-blocking
  },
  async redirects() {
    return [
      {
        source: '/contact',
        destination: '/locations',
        statusCode: 301,
      },
      {
        source: '/en/contact',
        destination: '/en/locations',
        statusCode: 301,
      },
      ...getProtectedPostRedirects(),
    ]
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'

    // Build CSP as an array then join for readability
    const csp = [
      "default-src 'self'",
      // Next.js inline scripts (dark-mode, SW registration, GA config) require 'unsafe-inline'
      // React Refresh requires unsafe-eval in local development only.
      // accounts.google.com required for Google Sign-In (GSI) used in FSM Studio
      `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://accounts.google.com https://oauth2.googleapis.com",
      // accounts.google.com needed for Google Sign-In button iframe
      "frame-src https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Redundant with X-Frame-Options but CSP-native
      "frame-ancestors 'none'",
      // Keep local HTTP development usable; production is HTTPS-only.
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join('; ')

    return [
      {
        // The service worker controls offline privacy rules, so clients must
        // always revalidate this file instead of keeping a stale version.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',    value: csp },
          // 2 years HSTS + preload (Vercel enforces HTTPS but explicit is better)
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // same-origin-allow-popups: allows Google OAuth popup to communicate back
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
      {
        // This route is opened by the cross-origin AK member portal. Keeping
        // unsafe-none here preserves window.opener so the signed Google
        // credential can be returned with a strict targetOrigin.
        source: '/ak-google-auth',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/admin-login',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/fsm/studio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
        ],
      },
      // 靜態資源長快取
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天快取
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
