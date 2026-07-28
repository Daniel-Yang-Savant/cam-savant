'use client'

import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type QrAccess = {
  url: string
  expiresAt: string
}

function secondsUntil(expiresAt: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
  )
}

export default function AdminPeriopQrButton() {
  const [authenticated, setAuthenticated] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrAccess, setQrAccess] = useState<QrAccess | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/admin/session', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) setAuthenticated(true)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  const generateQr = useCallback(async () => {
    setLoading(true)
    setError('')
    setCopied(false)

    try {
      const response = await fetch('/api/admin/periop-qr', {
        method: 'POST',
        cache: 'no-store',
      })
      const data = (await response.json()) as Partial<QrAccess> & {
        error?: string
      }

      if (!response.ok || !data.url || !data.expiresAt) {
        throw new Error(data.error || '無法產生 QR Code')
      }

      const nextQr = {
        url: data.url,
        expiresAt: data.expiresAt,
      }
      setQrAccess(nextQr)
      setRemainingSeconds(secondsUntil(nextQr.expiresAt))
    } catch (qrError) {
      setQrAccess(null)
      setError(
        qrError instanceof Error ? qrError.message : '無法產生 QR Code'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!qrAccess) return

    const updateRemaining = () => {
      setRemainingSeconds(secondsUntil(qrAccess.expiresAt))
    }
    updateRemaining()
    const timer = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timer)
  }, [qrAccess])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function openQrDialog() {
    setOpen(true)
    if (!qrAccess || secondsUntil(qrAccess.expiresAt) === 0) {
      await generateQr()
    }
  }

  async function copyAccessLink() {
    if (!qrAccess) return
    await navigator.clipboard.writeText(qrAccess.url)
    setCopied(true)
  }

  if (!authenticated) return null

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const countdown = `${minutes}:${String(seconds).padStart(2, '0')}`
  const expired = Boolean(qrAccess && remainingSeconds === 0)

  return (
    <>
      <button
        type="button"
        onClick={openQrDialog}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-bold text-neutral-950 shadow-lg transition-all hover:scale-105 hover:bg-amber-400"
        aria-label="產生術後復健病患 QR Code"
      >
        <span aria-hidden="true">▦</span>
        病患 QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="periop-qr-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                  Admin Access
                </p>
                <h2
                  id="periop-qr-title"
                  className="mt-1 text-xl font-bold text-neutral-950 dark:text-neutral-100"
                >
                  術後復健病患 QR
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                aria-label="關閉 QR Code 視窗"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-left text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              請病患在倒數結束前掃描。完成授權後，這台裝置可閱讀術後復健內容 30 天。
            </p>

            <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-800">
              {loading && (
                <p className="text-sm text-neutral-500">正在產生安全連結…</p>
              )}

              {!loading && error && (
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={generateQr}
                    className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    重新嘗試
                  </button>
                </div>
              )}

              {!loading && qrAccess && (
                <div className={expired ? 'opacity-25' : ''}>
                  <QRCodeSVG
                    value={qrAccess.url}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    level="M"
                    marginSize={2}
                    title="術後復健病患授權 QR Code"
                  />
                </div>
              )}
            </div>

            {qrAccess && !loading && (
              <div className="mt-4" aria-live="polite">
                <p
                  className={`font-mono text-sm font-semibold ${
                    expired ? 'text-red-600' : 'text-amber-600'
                  }`}
                >
                  {expired ? 'QR Code 已過期' : `有效時間 ${countdown}`}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={generateQr}
                    className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-950"
                  >
                    重新產生
                  </button>
                  <button
                    type="button"
                    onClick={copyAccessLink}
                    disabled={expired}
                    className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    {copied ? '已複製' : '複製連結'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
