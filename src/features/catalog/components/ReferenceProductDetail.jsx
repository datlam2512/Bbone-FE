import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '@/shared/components/ui/Workflow'

export default function ReferenceProductDetail({ product, children }) {
  const [selectedSize, setSelectedSize] = useState('')
  const sizes = product.sizes ?? []
  const selected = sizes.length === 1 ? sizes[0] : sizes.find(({ size }) => size === selectedSize)

  return (
    <Page title={product.name} description={product.brand}>
      <Link to="/san-pham" className="w-fit text-sm font-semibold text-brand-700 hover:underline">
        ← Danh mục sản phẩm
      </Link>
      <section className="w-full max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        {sizes.length > 1 && (
          <fieldset className="space-y-3">
            <legend className="font-semibold text-ink">Chọn size</legend>
            <ul className="flex flex-wrap gap-3">
              {sizes.map(({ size, productId }) => (
                <li key={size}>
                  <label className="flex min-w-16 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-checked:border-brand-600 has-checked:bg-brand-50">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      disabled={!productId}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                      className="accent-brand-600"
                    />
                    {size}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
        {selected && <p className="text-sm text-slate-600">Mã sản phẩm {selected.sku}</p>}
        <p className="text-sm text-slate-600">Giá và đơn hàng mô phỏng dành cho bản portfolio.</p>
        {!selected?.productId && (
          <p className="text-sm text-slate-600">
            {sizes.length > 1 ? 'Chọn size để xem giá và thêm vào giỏ.' : 'Sản phẩm chưa mở bán.'}
          </p>
        )}
      </section>
      {selected?.productId && children(selected.productId)}
    </Page>
  )
}
