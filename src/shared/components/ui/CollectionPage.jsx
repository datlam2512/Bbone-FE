import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import { useResource } from '@/shared/hooks/use-resource'
import PageHeading from './PageHeading'
import ResourceState from './ResourceState'
import { Button } from '@astryxdesign/core/Button'
import { Field } from './Workflow'

export default function CollectionPage({
  title,
  description,
  load,
  renderItem,
  itemKey = (item) => item.id,
  loadReferences,
  filter,
  pageSize = 12,
  fetchAllPages = false,
}) {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterValue, setFilterValue] = useState('')
  const filterKey = filter?.key
  const isLocalFilter = fetchAllPages && filter?.local
  const requestFilterValue = isLocalFilter ? '' : filterValue
  const requestPage = fetchAllPages ? 1 : page
  const loadPage = useCallback(
    async (signal) => {
      const filters = {
        search,
        page: requestPage,
        size: pageSize,
        ...(filterKey && !isLocalFilter && { [filterKey]: requestFilterValue }),
      }
      if (fetchAllPages) {
        const [items, references] = await Promise.all([
          loadAllPages(load, filters, signal, pageSize),
          loadReferences ? loadAllPages(loadReferences, filters, signal, pageSize) : [],
        ])
        return { allItems: [...items, ...references] }
      }
      const [results, references] = await Promise.all([
        load(filters, { signal }),
        loadReferences?.(filters, { signal }) ?? [],
      ])
      return { ...results, references }
    },
    [
      load,
      loadReferences,
      search,
      requestPage,
      filterKey,
      requestFilterValue,
      pageSize,
      fetchAllPages,
      isLocalFilter,
    ],
  )
  const resource = useResource(loadPage)
  const allItems = resource.data?.allItems
  const offset = (page - 1) * pageSize
  const filteredItems =
    isLocalFilter && filterValue
      ? (allItems ?? []).filter((item) => String(item[filterKey] ?? '') === filterValue)
      : allItems
  const items = fetchAllPages
    ? (filteredItems ?? []).slice(offset, offset + pageSize)
    : (resource.data?.items ?? [])
  const matchingReferences = fetchAllPages ? [] : (resource.data?.references ?? [])
  const totalItems = fetchAllPages ? (filteredItems?.length ?? 0) : (resource.data?.total ?? 0)
  const referenceOffset = Math.max(0, offset + items.length - totalItems)
  const referenceLimit = Math.max(0, pageSize - items.length)
  const matches = fetchAllPages
    ? []
    : matchingReferences.slice(referenceOffset, referenceOffset + referenceLimit)
  const totalCount = fetchAllPages ? totalItems : totalItems + matchingReferences.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const visiblePages = [
    ...new Set(
      [1, page - 1, page, page + 1, totalPages].filter((value) => value > 0 && value <= totalPages),
    ),
  ].sort((a, b) => a - b)
  const firstItem = totalCount ? offset + 1 : 0
  const lastItem = Math.min(page * pageSize, totalCount)
  const filterOptions = filter?.optionsFromItems
    ? [...new Set((allItems ?? []).map((item) => item[filter.key]).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b), 'vi'),
      )
    : (filter?.options ?? [])
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
      {filter && (
        <section className="mb-6 flex flex-wrap items-end gap-3">
          <Field
            label={filter.label}
            type="select"
            value={filterValue}
            onChange={(event) => {
              setFilterValue(event.target.value)
              setSearch(input.trim())
              setPage(1)
            }}
          >
            <option value="">{filter.allLabel}</option>
            {filterOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </Field>
        </section>
      )}
      <ResourceState
        {...resource}
        empty={!items.length && !matches.length}
        emptyTitle={filterValue || search ? 'Không tìm thấy kết quả phù hợp' : undefined}
        emptyDescription={
          filterValue || search ? 'Hãy đổi bộ lọc hoặc từ khóa tìm kiếm.' : undefined
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {[...items, ...matches].map((item) => (
            <article
              key={itemKey(item)}
              className="rounded-xl border border-slate-200/80 bg-white p-4"
            >
              {renderItem(item)}
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Hiển thị {firstItem}–{lastItem} / {totalCount} kết quả.
        </p>
      </ResourceState>
      {totalCount > pageSize && (
        <nav aria-label="Phân trang" className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button label="Trang trước" isDisabled={page === 1} onClick={() => setPage(page - 1)} />
          {visiblePages.map((pageNumber, index) => (
            <span key={pageNumber} className="contents">
              {index > 0 && pageNumber - visiblePages[index - 1] > 1 && (
                <span aria-hidden="true" className="px-1 text-slate-500">
                  …
                </span>
              )}
              <Button
                label={String(pageNumber)}
                size="sm"
                variant={pageNumber === page ? 'primary' : 'ghost'}
                aria-current={pageNumber === page ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
              />
            </span>
          ))}
          <Button
            label="Trang sau"
            isDisabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          />
        </nav>
      )}
    </div>
  )
}

async function loadAllPages(loader, filters, signal, pageSize) {
  const items = []
  const seen = new Set()
  const seenPages = new Set()
  for (let page = 1; ; page += 1) {
    const result = await loader({ ...filters, page }, { signal })
    const batch = Array.isArray(result) ? result : result?.items
    if (!Array.isArray(batch)) {
      throw new TypeError('Danh sách trả về từ máy chủ không hợp lệ.')
    }

    let added = 0
    for (const item of batch) {
      const key = item.id ?? item.clinic?.id ?? JSON.stringify(item)
      if (!seen.has(key)) {
        seen.add(key)
        items.push(item)
        added += 1
      }
    }

    const total = result.total ?? result.totalCount
    const totalPages = result.totalPages
    const rawBatchLength = result.pageItemCount ?? batch.length
    const pageKeys = result.pageItemKeys ?? batch.map((item) => item.id ?? item.clinic?.id)
    const pageSignature = JSON.stringify(pageKeys)
    if (pageKeys.length && seenPages.has(pageSignature)) return items
    seenPages.add(pageSignature)
    const hasMore = Number.isFinite(totalPages)
      ? page < totalPages
      : Number.isFinite(total)
        ? items.length < total
        : rawBatchLength === pageSize
    if (!hasMore || !rawBatchLength || (batch.length > 0 && !added)) return items
  }
}
