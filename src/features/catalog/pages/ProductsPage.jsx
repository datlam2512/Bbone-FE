import CollectionPage from '@/shared/components/ui/CollectionPage'
import ProductCardContent from '../components/ProductCardContent'
import { catalogApi } from '../api/catalog.api'
export default function ProductsPage() {
  return (
    <CollectionPage
      title="Sản phẩm chăm sóc sức khỏe"
      description="Sản phẩm và phụ kiện dành cho nhu cầu chăm sóc hằng ngày."
      load={catalogApi.products}
      renderItem={(item) => <ProductCardContent product={item} />}
    />
  )
}
