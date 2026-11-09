import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import { useResource } from '@/shared/hooks/use-resource'
import PageHeading from './PageHeading'
import ResourceState from './ResourceState'
import { Button } from '@astryxdesign/core/Button'

export default function CollectionPage({
  title,
  description,
  load,
  renderItem,
  itemKey = (item) => item.id,
}) {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const loadPage = useCallback(
    (signal) => load({ search, page, size: 12 }, { signal }),
    [load, search, page],
  )
  const resource = useResource(loadPage)
  const items = resource.data?.items || []
  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 lg:px-8 2xl:px-10">
      <PageHeading title={title} description={description} />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(input.trim())
          setPage(1)
        }}
        className="mb-8 flex max-w-2xl items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100"
      >
        <label className="relative flex-1">
          <span className="sr-only">Tìm kiếm</span>
          <Search size={18} className="absolute top-3.5 left-4 text-slate-400" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={120}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="h-11 w-full border-0 bg-transparent pr-3 pl-11 text-sm outline-none"
          />
        </label>
        <Button type="submit" label="Tìm kiếm" variant="primary" size="lg" />
      </form>
      <ResourceState {...resource} empty={!items.length}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={itemKey(item)}
              className="rounded-xl border border-slate-200/80 bg-white p-4"
            >
              {renderItem(item)}
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Hiển thị {items.length} / {resource.data?.total || 0} kết quả.
        </p>
      </ResourceState>
      {(resource.data?.total || 0) > 12 && (
        <nav aria-label="Phân trang" className="mt-6 flex items-center justify-end gap-3">
          <Button label="Trang trước" isDisabled={page === 1} onClick={() => setPage(page - 1)} />
          <p className="text-sm">Trang {page}</p>
          <Button
            label="Trang sau"
            isDisabled={page * 12 >= resource.data.total}
            onClick={() => setPage(page + 1)}
          />
        </nav>
      )}
    </div>
  )
}
