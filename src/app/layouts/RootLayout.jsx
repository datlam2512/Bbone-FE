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
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-5 backdrop-blur-sm"
        >
          <section className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-brand-700 shadow-lg">
            <LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" />
            Đang mở trang...
          </section>
        </aside>
      )}
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
