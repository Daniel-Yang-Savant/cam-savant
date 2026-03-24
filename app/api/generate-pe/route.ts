import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是一位專業的復健科醫師助理，負責根據醫師提供的 SOAP 記錄生成中文病患衛教單張。
規範：
 · 完全去識別化（No PII）
 · 內容僅基於實證醫學（EBM），需附簡短參考依據
 · 語言：繁體中文，白話易懂，避免艱深術語
 · 格式：HTML，A4 單頁可列印
 · 結構：診斷說明 → 注意事項 → 居家運動（如適用）→ 回診提醒 → 參考來源
 · 輸出：只輸出完整 HTML 字串，不要任何說明文字`

export async function POST(request: NextRequest) {
  const adminCookie = request.cookies.get('admin_token')
  const secret = process.env.ADMIN_SECRET
  if (!secret || adminCookie?.value !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { soap } = await request.json()
  if (!soap?.trim()) {
    return NextResponse.json({ error: 'Missing SOAP content' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: soap }],
  })

  const html = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  return NextResponse.json({ html })
}
