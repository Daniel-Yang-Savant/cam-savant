'use client'

import { useEffect, useRef, useState } from 'react'

type GoogleCredentialResponse = { credential?: string }
type GoogleIdentity = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; ux_mode: 'popup' }) => void
  renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string; shape: string }) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } }
  }
}

export function GoogleAuthBridge({ clientId, state, targetOrigin }: { clientId: string; state: string; targetOrigin: string }) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('正在載入 Google 登入…')

  useEffect(() => {
    if (!state || !/^[a-f0-9-]{20,80}$/i.test(state)) {
      setMessage('登入連結已失效，請關閉視窗後重新操作。')
      return
    }

    function initialize() {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'popup',
        callback: ({ credential }) => {
          if (!credential || !window.opener) {
            setMessage('無法返回會員專區，請關閉視窗後重試。')
            return
          }
          setMessage('驗證完成，正在返回會員專區…')
          window.opener.postMessage({ type: 'AK_GOOGLE_CREDENTIAL', credential, state }, targetOrigin)
          window.setTimeout(() => window.close(), 700)
        },
      })
      buttonRef.current.replaceChildren()
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'filled_black', size: 'large', width: 320, text: 'continue_with', shape: 'rectangular' })
      setMessage('請選擇要用於會員專區的 Google 帳號')
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-ak-google-identity]')
    if (existing) {
      if (window.google) initialize()
      else existing.addEventListener('load', initialize, { once: true })
      return () => existing.removeEventListener('load', initialize)
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.akGoogleIdentity = 'true'
    script.addEventListener('load', initialize, { once: true })
    script.addEventListener('error', () => setMessage('Google 登入模組載入失敗，請稍後再試。'), { once: true })
    document.head.appendChild(script)
    return () => script.removeEventListener('load', initialize)
  }, [clientId, state, targetOrigin])

  return <div className="mt-7"><div ref={buttonRef} className="min-h-11 flex justify-center" /><p className="mt-3 text-center text-xs text-neutral-500" role="status">{message}</p></div>
}
