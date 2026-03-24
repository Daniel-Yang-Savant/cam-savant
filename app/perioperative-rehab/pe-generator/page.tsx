'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function PEGeneratorPage() {
  const [soap, setSoap] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [html, setHtml] = useState('')

  const dataUrl = html
    ? `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`
    : ''

  async function handleGenerate() {
    if (!soap.trim()) return
    setError('')
    setLoading(true)
    setHtml('')
    try {
      const res = await fetch('/api/generate-pe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soap }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg || '生成失敗，請重試')
        return
      }
      const { html: generated } = await res.json()
      setHtml(generated)
    } catch {
      setError('網路錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    if (!html) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <div className="no-print min-h-screen bg-gray-900 text-gray-200 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-100">衛教單張生成器</h1>

          {/* SOAP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              SOAP 記錄 / 診斷內容
            </label>
            <textarea
              value={soap}
              onChange={(e) => setSoap(e.target.value)}
              placeholder="貼上 SOAP 記錄或診斷內容..."
              rows={12}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-y font-mono text-sm"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !soap.trim()}
            className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '生成中...' : '生成衛教單張'}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              正在呼叫 Claude，請稍候...
            </div>
          )}

          {/* Preview */}
          {html && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-300">預覽</h2>

              {/* A4 preview area */}
              <div
                className="bg-white text-black rounded shadow-xl overflow-auto"
                style={{ aspectRatio: '210 / 297', maxHeight: '80vh' }}
              >
                <iframe
                  srcDoc={html}
                  className="w-full h-full border-0"
                  title="衛教單張預覽"
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-start gap-8">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
                >
                  列印 / 儲存 PDF
                </button>

                {dataUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <QRCodeSVG
                      value={dataUrl}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="L"
                    />
                    <p className="text-xs text-gray-500">掃描以在手機開啟</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
