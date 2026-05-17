import { ImageResponse } from 'next/og'
import { getPostBySlug, getAllSlugs, CATEGORY_LABELS } from '@/lib/posts'

export const runtime = 'nodejs'
export const alt = 'CAM Savant'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllSlugs()
}

// Category → accent colour
const ACCENT: Record<string, string> = {
  'sports-medicine':        '#f97316',
  'rehabilitation-medicine':'#3b82f6',
  'functional-medicine':    '#10b981',
  'fsm':                    '#8b5cf6',
  'perioperative-rehab':    '#f59e0b',
}

// Fetch Google Font subset for CJK characters at render time
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=` +
      encodeURIComponent(text)
    const css = await fetch(cssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    }).then((r) => r.text())
    const match = css.match(/url\((.+?)\)\s+format\('woff2'\)/)
    if (!match) return null
    return fetch(match[1]).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const title = post?.frontmatter.title ?? 'CAM Savant'
  const category = post?.frontmatter.category ?? ''
  const categoryLabel = CATEGORY_LABELS[category] ?? ''
  const accent = ACCENT[category] ?? '#0f766e'

  const fontText = title + categoryLabel + 'CAM SAVANT 復健醫學 運動醫學 功能醫學整合醫學'
  const fontData = await loadFont(fontText)

  const titleSize = title.length > 28 ? 52 : title.length > 18 ? 60 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #080808 0%, #111111 50%, #0d0d0d 100%)',
          padding: '56px 64px',
          fontFamily: fontData ? 'NotoSansTC, sans-serif' : 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Accent glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: accent,
            opacity: 0.07,
            filter: 'blur(80px)',
          }}
        />

        {/* Top: category badge */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          {categoryLabel ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
                borderRadius: '100px',
                padding: '8px 20px',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: accent,
                }}
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: '0.08em',
                }}
              >
                {categoryLabel}
              </span>
            </div>
          ) : null}
        </div>

        {/* Middle: article title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
          <h1
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: '#f5f5f5',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.01em',
              maxWidth: 1000,
            }}
          >
            {title}
          </h1>
          {/* Accent underline */}
          <div
            style={{
              width: 64,
              height: 4,
              background: accent,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Bottom: branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 28,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#404040',
              letterSpacing: '0.18em',
            }}
          >
            CAM SAVANT
          </span>
          <span style={{ fontSize: 14, color: '#333333', letterSpacing: '0.04em' }}>
            復健醫學・運動醫學・功能醫學
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? { fonts: [{ name: 'NotoSansTC', data: fontData, weight: 700 }] }
        : {}),
    }
  )
}
