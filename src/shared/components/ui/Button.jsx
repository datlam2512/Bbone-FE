import { cn } from '@/shared/lib/cn'

export default function Button({ className, variant = 'primary', children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
          : 'border border-slate-200 bg-white text-ink hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
