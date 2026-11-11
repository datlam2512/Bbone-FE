import CollectionPage from '@/shared/components/ui/CollectionPage'
import ProductCardContent from '../components/ProductCardContent'
import { catalogApi } from '../api/catalog.api'

const hiddenProductNames = new Set(['Băng đầu gối FUTURO Comfort', 'Băng cổ chân FUTURO Comfort'])

async function loadProducts(filters, options) {
  const result = await catalogApi.products(filters, options)
  return {
    ...result,
    pageItemCount: result.items.length,
    pageItemKeys: result.items.map((product) => product.id),
    items: result.items.filter((product) => !hiddenProductNames.has(product.name)),
  }
}

async function loadReferences(filters, options) {
  const products = await catalogApi.directory(filters, options)
  return {
    items: products.filter((product) => !hiddenProductNames.has(product.name)),
    pageItemCount: products.length,
    pageItemKeys: products.map((product) => product.id),
  }
}

const categoryFilter = {
  key: 'category',
  label: 'Danh mục sản phẩm',
  allLabel: 'Tất cả danh mục',
  local: true,
  optionsFromItems: true,
}

export default function ProductsPage() {
  return (
    <CollectionPage
      title="Sản phẩm chăm sóc sức khỏe"
      description="Sản phẩm và phụ kiện dành cho nhu cầu chăm sóc hằng ngày."
      load={loadProducts}
      filter={categoryFilter}
      loadReferences={loadReferences}
      pageSize={10}
      fetchAllPages
      renderItem={(item) => <ProductCardContent product={item} />}
    />
  )
}
