import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { mediaUrl } from '@/shared/lib/media'
import { cn } from '@/shared/lib/cn'

export default function MediaImage({ src, alt, className, fit = 'cover', priority = false }) {
  const resolved = mediaUrl(src)
  const [failedSource, setFailedSource] = useState(null)
  if (!resolved || failedSource === resolved) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 rounded-md bg-slate-100 text-brand-700',
          className,
        )}
      >
        <ImageOff size={32} aria-hidden="true" />
        <span className="text-xs text-slate-500">Ảnh đang được cập nhật</span>
      </div>
    )
  }
  return (
    <img
      src={resolved}
      alt={alt}
      width={1254}
      height={1254}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      referrerPolicy="no-referrer"
      onError={() => setFailedSource(resolved)}
      className={cn(
        'block w-full rounded-md bg-slate-100',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
    />
  )
}
