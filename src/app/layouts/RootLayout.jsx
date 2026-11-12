import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

export default function RootLayout() {
  const navigation = useNavigation()
  return (
    <>
      {navigation.state !== 'idle' && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-brand-700 px-4 py-2 text-xs font-medium text-white shadow"
        >
          <LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" />
          Đang mở trang...
        </aside>
      )}
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
