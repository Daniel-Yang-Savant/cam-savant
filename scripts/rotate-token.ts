/**
 * scripts/rotate-token.ts
 *
 * 每月 token 輪換工具：
 *   1. 依當前年月產生新 token（格式：camSavant-YYYY-MM）
 *   2. 呼叫 Vercel API 更新 PERIOP_ACCESS_TOKEN 環境變數
 *   3. 觸發 Vercel redeploy
 *   4. 印出新的 QR Code 網址供列印
 *
 * 使用方式：npm run rotate-token
 *
 * 需要在 .env.local 設定：
 *   VERCEL_TOKEN        — Vercel Account Settings → Tokens
 *   VERCEL_PROJECT_ID   — Vercel Project Settings → General → Project ID
 *   VERCEL_TEAM_ID      — Team ID（個人帳號留空即可）
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import fetch from 'node-fetch'

// 載入 .env.local（優先）與 .env（從專案根目錄相對路徑載入）
const root = process.cwd()
dotenv.config({ path: path.resolve(root, '.env.local') })
dotenv.config({ path: path.resolve(root, '.env') })

// ── Config ──────────────────────────────────────────────────────────────────

const VERCEL_TOKEN      = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID    = process.env.VERCEL_TEAM_ID   // 選填

const SITE_BASE_URL = 'https://cam-savant.vercel.app'
const ENV_VAR_NAME  = 'PERIOP_ACCESS_TOKEN'

// ── Helper ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  const now  = new Date()
  const yyyy = now.getFullYear()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  return `camSavant-${yyyy}-${mm}`
}

function teamQuery(): string {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
}

async function vercelRequest(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  const url = `https://api.vercel.com${endpoint}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res as unknown as Response
}

// ── Step 1: 取得現有 env var 的 ID（若存在）────────────────────────────────

async function getEnvVarId(): Promise<string | null> {
  const res = await vercelRequest(
    'GET',
    `/v9/projects/${VERCEL_PROJECT_ID}/env${teamQuery()}`
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to list env vars: ${res.status} ${err}`)
  }
  const data = (await res.json()) as { envs: Array<{ id: string; key: string }> }
  const found = data.envs.find((e) => e.key === ENV_VAR_NAME)
  return found?.id ?? null
}

// ── Step 2a: 建立新 env var ──────────────────────────────────────────────────

async function createEnvVar(newToken: string): Promise<void> {
  const res = await vercelRequest(
    'POST',
    `/v10/projects/${VERCEL_PROJECT_ID}/env${teamQuery()}`,
    {
      key:    ENV_VAR_NAME,
      value:  newToken,
      type:   'encrypted',
      target: ['production', 'preview', 'development'],
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create env var: ${res.status} ${err}`)
  }
  console.log('  ✓ 新增 env var 成功')
}

// ── Step 2b: 更新既有 env var ────────────────────────────────────────────────

async function updateEnvVar(envId: string, newToken: string): Promise<void> {
  const res = await vercelRequest(
    'PATCH',
    `/v9/projects/${VERCEL_PROJECT_ID}/env/${envId}${teamQuery()}`,
    {
      value:  newToken,
      type:   'encrypted',
      target: ['production', 'preview', 'development'],
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update env var: ${res.status} ${err}`)
  }
  console.log('  ✓ 更新 env var 成功')
}

// ── Step 3: 觸發 Redeploy ────────────────────────────────────────────────────

async function triggerRedeploy(): Promise<string> {
  // 先取得最新一次 production deployment 的 ID
  const listRes = await vercelRequest(
    'GET',
    `/v6/deployments?projectId=${VERCEL_PROJECT_ID}&target=production&limit=1${
      VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : ''
    }`
  )
  if (!listRes.ok) {
    const err = await listRes.text()
    throw new Error(`Failed to list deployments: ${listRes.status} ${err}`)
  }
  const listData = (await listRes.json()) as {
    deployments: Array<{ uid: string; url: string }>
  }
  const latest = listData.deployments[0]
  if (!latest) throw new Error('找不到任何 production deployment')

  // 用原始部署 uid 觸發 redeploy
  const redeployRes = await vercelRequest(
    'POST',
    `/v13/deployments${teamQuery()}`,
    { deploymentId: latest.uid, name: 'cam-savant', target: 'production' }
  )
  if (!redeployRes.ok) {
    const err = await redeployRes.text()
    throw new Error(`Failed to trigger redeploy: ${redeployRes.status} ${err}`)
  }
  const redeployData = (await redeployRes.json()) as { url: string; id: string }
  return redeployData.url ?? redeployData.id
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // 前置檢查
  if (!VERCEL_TOKEN) {
    console.error('❌ 缺少 VERCEL_TOKEN，請在 .env.local 設定')
    process.exit(1)
  }
  if (!VERCEL_PROJECT_ID) {
    console.error('❌ 缺少 VERCEL_PROJECT_ID，請在 .env.local 設定')
    process.exit(1)
  }

  const newToken = generateToken()
  const accessUrl = `${SITE_BASE_URL}/perioperative-rehab/access?token=${newToken}`

  console.log('\n🔄 開始 Token 輪換...\n')
  console.log(`  新 Token：${newToken}`)

  // Step 1: 查找既有 env var
  console.log('\n[1/3] 查找 Vercel 環境變數...')
  const envId = await getEnvVarId()

  // Step 2: 建立或更新
  console.log('[2/3] 更新 Vercel 環境變數...')
  if (envId) {
    await updateEnvVar(envId, newToken)
  } else {
    console.log('  （env var 不存在，改為新增）')
    await createEnvVar(newToken)
  }

  // Step 3: 觸發 redeploy
  console.log('[3/3] 觸發 Vercel Redeploy...')
  const deployUrl = await triggerRedeploy()
  console.log(`  ✓ Redeploy 已觸發：https://${deployUrl}`)

  // 最終輸出
  console.log('\n' + '═'.repeat(60))
  console.log('✅ Token 輪換完成！')
  console.log('═'.repeat(60))
  console.log(`\n📅 月份：${newToken.replace('camSavant-', '')}`)
  console.log(`\n🔗 新的 QR Code 網址（複製後產生 QR Code）：`)
  console.log(`\n   ${accessUrl}\n`)
  console.log('📋 下一步：')
  console.log('   1. 複製上方網址')
  console.log('   2. 前往 https://qr.io 或任意 QR Code 產生器')
  console.log('   3. 貼上網址 → 產生 → 下載 → 印出')
  console.log('   4. 更換診間 QR Code 告示牌\n')
  console.log('⏱  Redeploy 約需 1–2 分鐘，完成後新 token 正式生效。\n')
}

main().catch((err) => {
  console.error('\n❌ 發生錯誤：', err.message)
  process.exit(1)
})
