import { Package } from 'lucide-react'
import CollectionPage from '@/shared/components/ui/CollectionPage'
import { catalogApi } from '../api/catalog.api'
import { formatMoney } from '@/shared/lib/format'

export default function ProductsPage() {
  return (
    <CollectionPage
      title="Sản phẩm chăm sóc sức khỏe"
      description="Khám phá các sản phẩm được công bố trên BBONE."
      load={catalogApi.products}
      renderItem={(product) => (
        <>
          <div className="mb-5 flex h-32 items-center justify-center rounded-xl bg-brand-50">
            <Package size={42} className="text-brand-500" />
          </div>
          <p className="text-xs font-semibold text-brand-600">
            {product.brand || product.category}
          </p>
          <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
          <p className="mt-4 font-bold text-brand-600">{formatMoney(product.price)}</p>
        </>
      )}
    />
  )
}
