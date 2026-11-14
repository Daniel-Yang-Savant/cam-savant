import assert from 'node:assert/strict'
import test from 'node:test'
import { findPreviousProductionCommit, readPublicGithubJson } from './production-baseline'

const repository = 'https://api.github.com/repos/Daniel-Yang-Savant/cam-savant'
const head = 'a'.repeat(40)
const failed = 'b'.repeat(40)
const previous = 'c'.repeat(40)
const other = 'd'.repeat(40)
const bot = { login: 'vercel[bot]' }
const deployment = (id: number, sha: string, creator = bot) => ({ id, sha, environment: 'Production', creator })
const status = (state: string, environment_url = 'https://cam-savant-kh87j0eyt-daniel-yang-savants-projects.vercel.app') =>
  ({ state, environment: 'Production', environment_url, creator: bot })

function githubFixture(records: Map<string, unknown>) {
  const called: string[] = []
  const request: typeof fetch = async (input, init) => {
    const url = String(input)
    assert.equal(init?.credentials, 'omit')
    assert.equal(init?.redirect, 'error')
    assert.ok(init?.signal)
    assert.ok(url.startsWith(repository + '/'))
    const path = url.slice(repository.length)
    called.push(path)
    if (!records.has(path)) return new Response(null, { status: 404 })
    return Response.json(records.get(path))
  }
  return { request, called }
}

const production = '/deployments?environment=Production&per_page=20'
const currentStatus = (id: number) => `/deployments/${id}/statuses?per_page=1`

test('finds the prior successful deployment without trusting the current, failed, or unrelated deployment', async () => {
  const { request, called } = githubFixture(new Map<string, unknown>([
    [production, [deployment(1, previous), deployment(4, other, { login: 'other-bot' }), deployment(5, head), deployment(2, other), deployment(3, failed)]],
    [currentStatus(3), [status('failure')]],
    [currentStatus(2), [status('success', 'https://cam-savant-kh87j0eyt-other-projects.vercel.app')]],
    [currentStatus(1), [status('success')]],
  ]))
  assert.equal(await findPreviousProductionCommit(head, request), previous)
  assert.deepEqual(called, [production, currentStatus(3), currentStatus(2), currentStatus(1)])
})

test('fails closed when no matching success is present or the GitHub API fails', async () => {
  const missing = githubFixture(new Map<string, unknown>([[production, [deployment(1, previous)]], [currentStatus(1), [status('inactive')]]]))
  await assert.rejects(findPreviousProductionCommit(head, missing.request), /上次成功/)
  await assert.rejects(findPreviousProductionCommit(head, githubFixture(new Map()).request), /HTTP 404/)
  await assert.rejects(readPublicGithubJson('/../../outside-repository', missing.request), /路徑/)
})
