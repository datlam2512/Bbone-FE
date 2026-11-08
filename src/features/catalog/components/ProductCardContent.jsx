import MediaImage from '@/shared/components/ui/MediaImage'
import { formatMoney } from '@/shared/lib/format'
import { Link } from 'react-router-dom'

export default function ProductCardContent({ product }) {
  return (
    <Link
      to={'/san-pham/' + encodeURIComponent(product.id)}
      aria-label={'Xem chi tiết ' + product.name}
      className="group block focus-visible:outline-offset-4"
    >
      <div className="relative mb-5">
        <MediaImage
          src={product.imageUrl}
          alt={'Ảnh minh họa ' + product.name}
          fit="contain"
          className="aspect-square transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {product.sellableQuantity === 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
            Hết hàng
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-brand-700">{product.brand || product.category}</p>
      <h2 className="mt-2 text-lg font-semibold text-ink group-hover:text-brand-700">
        {product.name}
      </h2>
      <p className="mt-4 font-bold text-brand-700">{formatMoney(product.price)}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-brand-700 underline-offset-4 group-hover:underline">
        Xem chi tiết
      </span>
    </Link>
  )
}
