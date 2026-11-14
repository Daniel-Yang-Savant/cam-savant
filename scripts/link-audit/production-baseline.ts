import { z } from 'zod'

const repositoryUrl = 'https://api.github.com/repos/Daniel-Yang-Savant/cam-savant'
const sha = z.string().regex(/^[a-f0-9]{40}$/)
const statusError = '無法在 GitHub 確認本專案上次成功的 Vercel 正式部署。'
const creator = z.object({ login: z.string() }).nullable()
const deployment = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  sha,
  environment: z.string(),
  creator,
})
const status = z.object({ state: z.string(), environment: z.string(), environment_url: z.string().nullable(), creator })
const projectUrl = /^https:\/\/cam-savant-[a-z0-9]+-daniel-yang-savants-projects\.vercel\.app\/?$/

export async function readPublicGithubJson(path: string, request: typeof fetch = fetch, signal = AbortSignal.timeout(20_000)): Promise<unknown> {
  const url = new URL(repositoryUrl + path)
  if (!path.startsWith('/') || !url.href.startsWith(repositoryUrl + '/')) throw new Error('GitHub 查詢路徑不正確。')
  const response = await request(url.href, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'CAM-Savant-Link-Audit' },
    credentials: 'omit',
    redirect: 'error',
    signal,
  })
  if (!response.ok) throw new Error(`GitHub 資料回傳 HTTP ${response.status}。`)
  return response.json()
}

export async function findPreviousProductionCommit(head: string, request: typeof fetch = fetch): Promise<string> {
  sha.parse(head)
  const signal = AbortSignal.timeout(20_000)
  const candidates = z.array(deployment).max(20).parse(await readPublicGithubJson('/deployments?environment=Production&per_page=20', request, signal))
  // Check the newest deployment first and use only its latest status.
  for (const candidate of candidates.sort((first, second) => second.id - first.id)) {
    if (candidate.sha === head || candidate.environment !== 'Production' || candidate.creator?.login !== 'vercel[bot]') continue
    const statuses = z.array(status).max(1).parse(await readPublicGithubJson(`/deployments/${candidate.id}/statuses?per_page=1`, request, signal))
    const latest = statuses[0]
    if (latest?.state === 'success' && latest.creator?.login === 'vercel[bot]' && latest.environment === 'Production' &&
        latest.environment_url && projectUrl.test(latest.environment_url)) return candidate.sha
  }
  throw new Error(statusError)
}
