import FavoriteButton from '@/shared/components/ui/FavoriteButton'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Minus, Phone, Plus, ShoppingBag } from 'lucide-react'
import MediaImage from '@/shared/components/ui/MediaImage'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useGuestCartStore } from '@/features/cart/stores/guest-cart.store'
import { formatMoney } from '@/shared/lib/format'
import { catalogApi } from '../api/catalog.api'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const [purchase, setPurchase] = useState({ productId, quantity: 1, added: false })
  const quantity = purchase.productId === productId ? purchase.quantity : 1
  const added = purchase.productId === productId && purchase.added
  const setCartQuantity = useGuestCartStore((state) => state.setQuantity)
  const loadProduct = useCallback(
    (signal) => catalogApi.product(productId, { signal }),
    [productId],
  )
  const resource = useResource(loadProduct)
  const product = resource.data
  const available = Number.isInteger(product?.sellableQuantity)
    ? Math.max(product.sellableQuantity, 0)
    : 0

  function addToCart() {
    if (!product || available < 1) return
    const currentQuantity =
      useGuestCartStore.getState().items.find((item) => item.productId === product.id)?.quantity ||
      0
    setCartQuantity(product.id, Math.min(currentQuantity + quantity, available, 1000))
    setPurchase({ productId, quantity, added: true })
  }

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-7 sm:py-10 lg:px-8 lg:py-12 2xl:px-10">
      <nav aria-label="Điều hướng đường dẫn" className="mb-7">
        <Link
          to="/san-pham"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-700"
        >
          <ArrowLeft size={17} />
          Sản phẩm
        </Link>
      </nav>

      <ResourceState {...resource} empty={!product}>
        {product && (
          <>
            <article className="grid gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
              <section aria-label="Hình ảnh sản phẩm" className="min-w-0">
                <div className="flex aspect-square items-center justify-center bg-[#f2f6f7] p-5 sm:p-10 lg:p-12">
                  <MediaImage
                    src={product.imageUrl}
                    alt={product.name}
                    fit="contain"
                    priority
                    className="aspect-square h-full max-h-[42rem] rounded-sm bg-transparent object-contain"
                  />
                </div>
              </section>

              <section className="flex flex-col py-1 lg:py-4">
                <FavoriteButton kind="Product" targetId={product.id} />
                <div className="flex flex-wrap items-center gap-2">
                  {product.brand && (
                    <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
                      {product.brand}
                    </span>
                  )}
                  {product.category && (
                    <>
                      {product.brand && <span className="text-slate-300">/</span>}
                      <span className="text-xs text-slate-500">{product.category}</span>
                    </>
                  )}
                </div>

                <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl xl:text-[2.75rem]">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                    {product.description}
                  </p>
                )}

                <div className="mt-7 border-y border-slate-200 py-5">
                  <p className="text-3xl font-semibold tracking-tight text-brand-700">
                    {formatMoney(product.price)}
                  </p>
                  <p
                    className={
                      available > 0
                        ? 'mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-700'
                        : 'mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-700'
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={
                        available > 0
                          ? 'size-2 rounded-full bg-emerald-600'
                          : 'size-2 rounded-full bg-amber-500'
                      }
                    />
                    {available > 0 ? 'Còn hàng' : 'Tạm hết hàng'}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <span className="text-sm font-medium text-ink">Số lượng</span>
                  <div className="inline-flex h-11 items-center border border-slate-300">
                    <button
                      type="button"
                      aria-label="Giảm số lượng"
                      onClick={() => {
                        setPurchase({
                          productId,
                          quantity: Math.max(1, quantity - 1),
                          added: false,
                        })
                      }}
                      disabled={quantity <= 1}
                      className="grid size-10 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-9 text-center text-sm font-semibold tabular-nums"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() => {
                        setPurchase({
                          productId,
                          quantity: Math.min(available, quantity + 1),
                          added: false,
                        })
                      }}
                      disabled={quantity >= available}
                      className="grid size-10 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  {available > 0 && (
                    <span className="text-xs text-slate-500">Tối đa {available} sản phẩm</span>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={available < 1}
                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                    {added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                  </button>
                  <Link
                    to="/lien-he"
                    className="inline-flex min-h-12 items-center justify-center gap-2 border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:text-brand-700"
                  >
                    <Phone size={17} />
                    Liên hệ tư vấn
                  </Link>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 min-h-5 text-sm text-emerald-700"
                >
                  {added ? 'Sản phẩm đã được cập nhật trong giỏ hàng của bạn.' : ''}
                </p>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <h2 className="text-sm font-semibold text-ink">Thông tin sản phẩm</h2>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    {product.brand && (
                      <>
                        <dt className="text-slate-500">Thương hiệu</dt>
                        <dd className="text-slate-700">{product.brand}</dd>
                      </>
                    )}
                    {product.category && (
                      <>
                        <dt className="text-slate-500">Danh mục</dt>
                        <dd className="text-slate-700">{product.category}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </section>
            </article>
          </>
        )}
      </ResourceState>
    </div>
  )
}
