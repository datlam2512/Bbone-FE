import { useEffect } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { useAuthStore } from '../stores/auth.store'
import { restoreSession } from '../services/session.service'
import { listenForSessionChanges } from '@/shared/lib/browser-session'

export default function SessionBootstrap({ children }) {
  const status = useAuthStore((state) => state.status),
    error = useAuthStore((state) => state.restoreError)
  useEffect(() => {
    void restoreSession()
    return listenForSessionChanges((type) => {
      useAuthStore.getState().clearSession()
      if (type === 'login') void restoreSession(true)
    })
  }, [])
  if (['initializing', 'restoring'].includes(status))
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-sm text-slate-600"
      >
        Đang khôi phục phiên đăng nhập…
      </main>
    )
  if (status === 'error')
    return (
      <main className="mx-auto max-w-lg space-y-5 px-6 py-24">
        <h1 className="text-xl font-bold">Chưa kết nối được máy chủ</h1>
        <p role="alert" className="text-sm leading-7 text-slate-600">
          {error?.message} Phiên đăng nhập chưa bị xóa. Vui lòng thử lại.
        </p>
        <Button label="Kết nối lại" variant="primary" onClick={() => restoreSession(true)} />
      </main>
    )
  return children
}
