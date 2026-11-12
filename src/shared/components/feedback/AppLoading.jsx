import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

export default function AppLoading() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center gap-3 text-sm text-brand-700"
    >
      <LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" />
      {slow ? 'Đang tải trang, vui lòng đợi thêm chút...' : 'Đang tải BBONE...'}
    </main>
  )
}
