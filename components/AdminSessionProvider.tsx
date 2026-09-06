'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AdminSessionState {
  authenticated: boolean
  checked: boolean
}

const AdminSessionContext = createContext<AdminSessionState>({
  authenticated: false,
  checked: false,
})

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminSessionState>({
    authenticated: false,
    checked: false,
  })

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/admin/session', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        setState({ authenticated: response.ok, checked: true })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ authenticated: false, checked: true })
        }
      })

    return () => controller.abort()
  }, [])

  const value = useMemo(() => state, [state])

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  )
}

export function useAdminSession(): AdminSessionState {
  return useContext(AdminSessionContext)
}
