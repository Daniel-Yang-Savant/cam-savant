'use client'

import { useState } from 'react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Use a document navigation so RootLayout mounts again after the
        // HttpOnly admin cookie is stored. A client-side transition preserves
        // the QR button's pre-login (unauthenticated) state.
        window.location.replace('/perioperative-rehab')
      } else if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? 0)
        const minutes = Math.max(1, Math.ceil(retryAfter / 60))
        setError(`嘗試次數過多，請約 ${minutes} 分鐘後再試`)
      } else if (res.status === 503) {
        setError('正式環境尚未設定管理員密碼')
      } else {
        setError('密碼錯誤')
      }
    } catch {
      setError('發生錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-gray-200 text-xl font-semibold mb-6 text-center">
          管理員登入
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入管理員密碼"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
            required
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '驗證中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
