import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5"
      aria-label="BBONE — Trang chủ"
    >
      <img src="/favicon.svg" alt="" width="38" height="38" />
      {!compact && (
        <span className="text-2xl font-extrabold tracking-tight text-ink">
          BBONE<span className="ml-1 text-brand-600">2.0</span>
        </span>
      )}
    </Link>
  )
}
