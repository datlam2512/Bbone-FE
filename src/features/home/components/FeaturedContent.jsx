import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useResource } from '@/shared/hooks/use-resource'
import ResourceState from '@/shared/components/ui/ResourceState'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { clinicsApi } from '@/features/clinics/api/clinics.api'
import { knowledgeApi } from '@/features/knowledge/api/knowledge.api'
import ProductCardContent from '@/features/catalog/components/ProductCardContent'
import ClinicCardContent from '@/features/clinics/components/ClinicCardContent'
import ArticleCardContent from '@/features/knowledge/components/ArticleCardContent'

async function loadProducts(signal) {
  const [store, directory] = await Promise.all([
    catalogApi.products({ page: 1, size: 3, sort: 'price-desc' }, { signal }),
    catalogApi.directory({}, { signal }),
  ])
  return { items: [...store.items, ...directory].slice(0, 3) }
}

async function loadClinics(signal) {
  const [bookable, directory] = await Promise.all([
    clinicsApi.list({ page: 1, size: 3 }, { signal }),
    clinicsApi.directory({}, { signal }),
  ])
  return { items: [...bookable.items, ...directory].slice(0, 3) }
}
const loadArticles = (signal) => knowledgeApi.list({ page: 1, size: 3 }, { signal })

function FeaturedSection({ title, subtitle, to, load, children }) {
  const resource = useResource(load)
  const items = resource.data?.items ?? []
  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>
        <Link
          to={to}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
        >
          Xem tất cả
          <ArrowRight size={17} />
        </Link>
      </div>
      <ResourceState {...resource} empty={!items.length}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id || item.clinic.id} className="min-w-0">
              {children(item)}
            </article>
          ))}
        </div>
      </ResourceState>
    </section>
  )
}

export default function FeaturedContent() {
  return (
    <>
      <FeaturedSection
        title="Sản phẩm nổi bật"
        subtitle="Các sản phẩm và phụ kiện chăm sóc xương khớp."
        to="/san-pham"
        load={loadProducts}
      >
        {(product) => <ProductCardContent product={product} />}
      </FeaturedSection>
      <FeaturedSection
        title="Cơ sở khám xương khớp"
        subtitle="Tra cứu cơ sở và kênh liên hệ chính thức."
        to="/phong-kham"
        load={loadClinics}
      >
        {(item) => <ClinicCardContent item={item} />}
      </FeaturedSection>
      <FeaturedSection
        title="Thông tin hữu ích"
        subtitle="Nguồn đọc tin cậy về sức khỏe cơ xương khớp từ WHO và NIH."
        to="/kien-thuc"
        load={loadArticles}
      >
        {(article) => <ArticleCardContent article={article} />}
      </FeaturedSection>
    </>
  )
}
