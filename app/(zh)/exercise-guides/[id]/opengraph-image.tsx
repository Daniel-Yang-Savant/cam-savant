import { ImageResponse } from 'next/og'
import { EXERCISE_GUIDE_MODULES, getExerciseGuideById } from '@/lib/exercise-guides'

export const runtime = 'nodejs'
export const alt = 'CAM Savant 圖解運動'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return EXERCISE_GUIDE_MODULES.map((guide) => ({ id: guide.id }))
}

const ACCENT = {
  orange: '#ea580c',
  teal: '#0f766e',
  violet: '#7e22ce',
  blue: '#1d4ed8',
  green: '#047857',
} as const

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
    }).then((response) => response.text())
    const match = css.match(/url\((.+?)\)\s+format\('woff2'\)/)
    return match ? fetch(match[1]).then((response) => response.arrayBuffer()) : null
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guide = getExerciseGuideById(id)
  const title = guide?.title ?? '圖解運動專區'
  const category = guide?.kind === 'condition' ? '研究運動方案' : '一般健康教育'
  const label = guide?.selectionLabel ?? '安全自我照護'
  const accent = guide ? ACCENT[guide.theme] : ACCENT.teal
  const fontData = await loadFont(`${title}${category}${label}圖解運動CAM SAVANT`)
  const titleSize = title.length > 30 ? 48 : title.length > 20 ? 56 : 64

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '58px 68px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 58%, #e5e5e5 100%)',
          fontFamily: fontData ? 'NotoSansTC, sans-serif' : 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -110,
            top: -140,
            width: 510,
            height: 510,
            borderRadius: '50%',
            background: accent,
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 70,
            bottom: 78,
            width: 18,
            height: 280,
            borderRadius: 999,
            background: accent,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              borderRadius: 999,
              padding: '9px 20px',
              background: accent,
              color: 'white',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {category}
          </div>
          <span style={{ color: '#525252', fontSize: 18, fontWeight: 700 }}>{label}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960, gap: 20 }}>
          <h1
            style={{
              margin: 0,
              color: '#0a0a0a',
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <div style={{ width: 86, height: 6, borderRadius: 999, background: accent }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #e5e5e5',
            paddingTop: 25,
          }}
        >
          <span style={{ color: '#171717', fontSize: 24, fontWeight: 800, letterSpacing: '0.16em' }}>
            CAM SAVANT
          </span>
          <span style={{ color: '#737373', fontSize: 16, fontWeight: 700 }}>
            圖解步驟・劑量・降階・停止警訊
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? { fonts: [{ name: 'NotoSansTC', data: fontData, weight: 700 as const }] }
        : {}),
    }
  )
}
