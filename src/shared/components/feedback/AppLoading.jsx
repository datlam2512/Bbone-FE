export default function AppLoading() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center gap-3 text-sm text-brand-600"
    >
      <span className="size-5 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600 motion-reduce:animate-none" />
      Đang tải BBONE...
    </div>
  )
}
