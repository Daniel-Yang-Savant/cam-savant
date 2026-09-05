import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'CAM Savant 圖解運動專區'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const text = '圖解運動專區安全自我照護漸進運動CAM SAVANT'
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

export default async function Image() {
  const fontData = await loadFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 68px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #fafafa 58%, #e5e5e5 100%)',
          fontFamily: fontData ? 'NotoSansTC, sans-serif' : 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -160,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: '#0f766e',
            opacity: 0.13,
          }}
        />
        <div style={{ display: 'flex', color: '#0f766e', fontSize: 21, fontWeight: 700 }}>
          CAM SAVANT VISUAL EXERCISE GUIDES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ margin: 0, color: '#0a0a0a', fontSize: 76, lineHeight: 1.15, fontWeight: 800 }}>
            圖解運動專區
          </h1>
          <div style={{ display: 'flex', color: '#404040', fontSize: 30, fontWeight: 700 }}>
            5 組一般健康教育・66 組研究運動方案
          </div>
          <div style={{ width: 90, height: 7, borderRadius: 999, background: '#0f766e' }} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #d4d4d4',
            paddingTop: 26,
            color: '#525252',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <span>圖解步驟・劑量・降階方式</span>
          <span>紅黃綠燈・證據與適用對象</span>
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
