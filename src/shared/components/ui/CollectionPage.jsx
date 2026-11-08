import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import { useResource } from '@/shared/hooks/use-resource'
import PageHeading from './PageHeading'
import ResourceState from './ResourceState'
import Button from './Button'

export default function CollectionPage({
  title,
  description,
  load,
  renderItem,
  itemKey = (item) => item.id,
}) {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const loadPage = useCallback(
    (signal) => load({ search, page: 1, size: 12 }, { signal }),
    [load, search],
  )
  const resource = useResource(loadPage)
  const items = resource.data?.items || []
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <PageHeading eyebrow="Khám phá cùng BBONE" title={title} description={description} />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(input.trim())
        }}
        className="mb-8 flex max-w-xl gap-3"
      >
        <label className="relative flex-1">
          <span className="sr-only">Tìm kiếm</span>
          <Search size={18} className="absolute top-3.5 left-4 text-slate-400" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={120}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-11 text-sm"
          />
        </label>
        <Button type="submit">Tìm kiếm</Button>
      </form>
      <ResourceState {...resource} empty={!items.length}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={itemKey(item)}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
            >
              {renderItem(item)}
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Hiển thị {items.length} / {resource.data?.total || 0} kết quả.
        </p>
      </ResourceState>
    </div>
  )
}
